import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { TEST_ONLY } from "../../../../common/cURL";

const fixture1=[
    'HTTP/2 200 \r\n' +
    'date: Tue, 09 Jun 2026 08:59:17 GMT\r\n' +
    'content-type: application/json; charset=utf-8\r\n' +
    'cache-control: public, max-age=60, s-maxage=60\r\n' +
    'vary: Accept,Accept-Encoding, Accept, X-Requested-With\r\n' +
    'etag: W/"e0583f9057c4a99787b983f8562ec1021e9c08c7a99d9c5ac4752353a87fd93b"\r\n' +
    'last-modified: Fri, 22 May 2026 11:38:32 GMT\r\n' +
    'x-github-media-type: github.v3; format=json\r\n' +
    'x-github-api-version-selected: 2022-11-28\r\n' +
    'access-control-expose-headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset, Warning\r\n' +
    'access-control-allow-origin: *\r\n' +
    'strict-transport-security: max-age=31536000; includeSubdomains; preload\r\n' +
    'x-frame-options: deny\r\n' +
    'x-content-type-options: nosniff\r\n' +
    'x-xss-protection: 0\r\n' +
    'referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin\r\n' +
    "content-security-policy: default-src 'none'\r\n" +
    'server: github.com\r\n' +
    'accept-ranges: bytes\r\n' +
    'x-ratelimit-limit: 60\r\n' +
    'x-ratelimit-remaining: 59\r\n' +
    'x-ratelimit-used: 1\r\n' +
    'x-ratelimit-resource: core\r\n' +
    'x-ratelimit-reset: 1780999157\r\n' +
    'content-length: 1350\r\n' +
    'x-github-request-id: CD4E:0B77:481462:554CAE:6A27D5E5\r\n',   
];
const fixture2=[  
   'HEAD /api/shared-state HTTP/\r\n'+
  'Host: app.hiss:3001\r\n'+ 
  'accept: */*\r\n'+
  'accept-language: en-GB,en;q=0.9,nl;q=0.8,de-DE;q=0.7,de;q=0.6\r\n'+
  'cache-control: no-cache\r\n'+
  'content-type: application/json\r\n'+
  'pragma: no-cache\r\n'+
  'priority: u=1, i\r\n'+
  'referer: https://app.hiss:3001/list/3\r\n'+
  'sec-ch-ua: "Chromium";v="149", "Not)A;Brand";v="24"\r\n'+
  'sec-ch-ua-mobile: ?0\r\n'+
  'sec-ch-ua-platform: "Linux"\r\n'+
  'sec-fetch-dest: empty\r\n'+
  'sec-fetch-mode: same-origin\r\n'+
  'sec-fetch-site: same-origin\r\n'+
  'user-agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36\r\n',

];


describe("test on cURL wrapper", () => {
    const { parseHeader2, parseHeader, runExecProcessOnUrl }=TEST_ONLY;
  it("Can parse headers2 response", () => {
    const SECT=fixture1[0].split("\r\n");

    let tmp=parseHeader2( SECT[0] );
    expect( tmp[1]).toBe( '200' );
    expect( tmp[0]).toBe( 'status');

  });

  it("Can parse headers2 request", () => {
    const SECT=fixture2[0].split("\r\n");

    let tmp=parseHeader2( SECT[0] );
    expect( tmp[1]).toBe( 'HEAD' );
    expect( tmp[0]).toBe( 'method');

  });

  // may want to add further afterwards

  
});
