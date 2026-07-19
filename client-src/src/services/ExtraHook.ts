import { CBHookType } from '../types/Actionables';
import { activity } from '../test/SameSiteCORStest';
// This file needs to import all the extra function files, to ensure code present at the right time.
// Otherwise it will be too late.

// This is called "hook" as marketing people for SPA frameworks like this word,
// it's a function really.
// this is staic loading, as JS tree shaking was fighting me.
// this will be disabled in most builds
var list:Array<CBHookType>=[activity];

/**
 * registerHook
 * 
 
 * @param {CBHookType} cb
 * @public
 * @returns {void}
 */
export function registerHook(cb:CBHookType):void {
    list.push(cb);
}

/**
 * ExtraHook
 * Execute the registered functions
 
 * @public
 * @returns {void}
 */
export function ExtraHook():void {
     for(let i=0; i<list.length; i++) {
        try {
            list[i]();
        } catch(e:unknown) { 
            console.log("Hook emitted an error ", (e as Error).message);
        }
    }
}

