import { assert, describe, it, expect } from "vitest";
import { reactive, isReactive } from 'vue';

import { useLog, LogService } from '../../services/LogStack';
import { LOGGING_ENABLED } from "../../Constants";

import type { Loggable } from "../../types/Loggable";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";

describe("I can use the logStack class", () => {
  it("multi instance, same object?", ():void => {
      let STACK:Array<Loggable> = [ useLog() ];
      STACK.push( useLog());
      expect( STACK[0] ).toEqual( STACK[1]);
      expect( STACK[0] ).toBe( STACK[1]);
      STACK[0].addRaw("A fixed literal string", "info");
      expect( STACK[0] ).toEqual( STACK[1]);

  });

  it(" options on addRaw", ():void => {
      let STACK:Array<Loggable> = [ useLog() ];

      expect( LOGGING_ENABLED ).toEqual(true);  // otherwise test doesn't make sense
      STACK[0].addRaw("A fixed literal string", "info");
      let cache= STACK[0].readWhole();
      for(let i=0; i<cache.length; i++) {
        expect( cache[i] ).toMatch( /A fixed literal string/ );
        expect( cache[i] ).toMatch( /INFO.*A fixed literal string/ );
      }
       for(let i=0; i< 100; i++) {
        STACK[0].addRaw("A fixed literal string", "info");
      }
      expect( STACK[0].readWhole().length ).toEqual( 103 ); // initial entry x2 and the log marker

      STACK.push( useLog() );
      expect( STACK[1].readWhole().length ).toEqual( 103 );
  });

  it(" check reactive-ness", ():void => {
      let STACK:Array<LogService> = [ useLog() as LogService ];

      expect( isReactive( STACK[0].readWhole() ) ).toBe( true );
      expect( STACK[0].readWhole().length ).toEqual( 103 ); // initial entry x2 and the log marker
  });


});
