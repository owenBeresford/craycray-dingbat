import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";
import { request } from 'supertest';
import { GoneException } from '@nestjs/common/exceptions';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {  ShoppingBE } from '../shopping/ShoppingBE';
import { ShoppingService } from '../shopping/ShoppingService';
import { SaveStruct } from '../../common/types/SaveStruct';
// import type { TestDataSchema } from "../../client-src/src/types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { fixture1, fixture2 } from "../../../common/fixture-lists";

describe("I can use API module", () => {
  let OBJ: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [],
      controllers: [ ShoppingBE  ],
      providers: [ShoppingService],
    }).compile();

    OBJ = moduleFixture.createNestApplication();
    await OBJ.init();
  });

 afterAll(async () => {
    await OBJ.close();
  });

  it("can GET the API", async () => {
    request(OBJ.getHttpServer(), { http2: true })
      .set('Accept', 'application/json')
      .get('/shared-state')
      .expect('Content-Type', /json/)
        .end(function(err:Error|null, res:Response):void {
            if (err) throw err;
            expect(res.ok);
            try {
                let obj=JSON.parse(new String(res.body).trim());
                assertType<Array<SaveStruct>>(obj );
                assert( obj.length).greaterThan(1 ); 
            } catch(e) {
                expect(false).toBe(true);
            }
       })    
      .expect(200 ); 
  });

  it("can POST the API", async () => {
    // made data from fixture...
    request(OBJ.getHttpServer(), { http2: true })
      .set('Accept', 'application/json')
      .post('/shared-state')
       .send( fixture1() )
      .expect('Content-Type', /json/)
        .end(function(err:Error|null, res:Response):void {
            if (err) throw err;
            expect(res.ok);
            try {
                let obj=JSON.parse(new String(res.body).trim());
                expect(obj.statusCode).toBe(204);
            } catch(e) {
                expect(false).toBe(true);
            }
         })    
      .expect(201 );  // i think, yes doesnt match above, yes, this is great.   "1scriptingLang to rule them", but they chose JS. #leSigh
  });  

});  