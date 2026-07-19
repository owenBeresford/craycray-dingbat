import { registerHook } from '../services/ExtraHook';
import { TEST_LOCATION_URL } from '../Constants';

export async function activity() {
    let RET=await window.fetch("/asset/shopping.es.min.mjs");
    console.assert(RET.ok, "Asset '/asset/shopping.es.min.mjs' can be d/l from client of the server"); 
    console.assert(
        RET.headers.get('access-control-allow-origin'), 
        "Asset '/asset/shopping.es.min.mjs' has Access-Control-Allow-Origin:  = "+RET.headers.get('Access-Control-Allow-Origin')
                    );    
    console.assert(
        !RET.headers.get('access-control-request-method'), 
        "Asset '/asset/shopping.es.min.mjs' has Access-Control-Request-Method:  = "+RET.headers.get('Access-Control-Request-Method')
                    );  
    console.assert(
        !RET.headers.get('access-control-allow-headers'), 
        "Asset '/asset/shopping.es.min.mjs' Access-Control-Allow-Headers:  = "+RET.headers.get('Access-Control-Allow-Headers')
                    );    
    

    RET=await window.fetch( TEST_LOCATION_URL+"/asset/shopping.es.min.mjs");
    console.assert(RET.ok, "Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' can be d/l from client of the server");    
    console.assert(
        RET.headers.get('access-control-allow-origin'), 
         "Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' has Access-Control-Allow-Origin = "+RET.headers.get('Access-Control-Allow-Origin')
                    );    
    console.assert(
        !RET.headers.get('access-control-request-method'), 
        "Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' has Access-Control-Request-Method = "+RET.headers.get('Access-Control-Request-Method')
                    );  
    console.assert(
        !RET.headers.get('access-control-allow-headers'), 
        "Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' Access-Control-Allow-Headers = "+RET.headers.get('Access-Control-Allow-Headers')
                    );    

}

// this code wasn't executed if I import 1 token, 
// so I changed the loading to import activity()
//if(location.search["cors-test"]==="1" ) {
//    resgisterHook(activity);
//}

/**
 * Status       200
Version         HTTP/2
Transferred     255.60 kB (255.24 kB size)
Referrer Policy strict-origin-when-cross-origin
DNS Resolution  System

accept-ranges  	                  bytes
access-control-allow-credentials  true
access-control-allow-origin       *
cache-control                     public, max-age=0
content-length                    255243
content-type                      application/javascript; charset=utf-8
date                              Sat, 18 Jul 2026 16:39:16 GMT
etag                              W/"3e50b-19f7615bb1e"
last-modified                     Sat, 18 Jul 2026 16:36:03 GMT
X-Firefox-Spdy                    h2
 * 
 */
