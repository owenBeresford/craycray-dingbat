import { Module } from "@nestjs/common";
import { ShoppingBE } from "./ShoppingBE";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ShoppingService } from "./ShoppingService";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * setHeaders
 * Util to inject relevant headers to the response
 * THIS IS TO MATCH A FRAMEWORK I DIDN'T SET THE TYPES
 
 * @param { any} res
 * @param {string} path
 * @param {any} stat
 * @public
 * @returns {void}
 */
const setHeaders = (res: any, path: string, stat: any): void => {
  let done = false;
  if (path.indexOf(".css") > 0) {
    done = true;
    res.setHeader("Content-Type", "text/css");
  }
  if (path.indexOf(".json") > 0) {
    done = true;
    res.setHeader("Content-Type", "application/json");
  }
  if (path.indexOf(".js") === path.length - 3) {
    done = true;
    res.setHeader("Content-Type", "text/javascript");
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    //Add Cross-Origin-Opener-Policy: same-origin;  Cross-Origin-Embedder-Policy: require-corp
    // SECURITY: limit access to postMessages made by this app to this app.
    //           Other apps in browser could be anything
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  }
  if (path.indexOf(".html") > 0) {
    done = true;
    res.setHeader("Content-Type", "text/html");
  }
  // SECURITY: anybody who can access the LAN only IP can talk to this server
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (process.env && "production" === process.env.NODE_ENV) {
    res.setHeader("Last-Modified", "Wed, 01 April 2026 00:00:00 GMT");
    res.setHeader("Cache-Control", "max-age=533280");
    // IOIO TODO add library for ETag
  }
  if (!done) {
    stat = null;
  }
};

@Module({
  imports: [
    /*
    ServeStaticModule.forRoot({
      //		serveRoot: join( __dirname, '..', '..', "public"),
      rootPath: join(__dirname, "public"),
      serveStaticOptions: {
        //		exclude: ['/api*'],
        //		immutable: true,
        setHeaders: setHeaders,
        fallthrough: false,
      },
    }),
    */
  ],
  controllers: [ShoppingBE],
  providers: [ShoppingService],
})
// NOTE cannot add docs on that *Decorator*, or add semis
export class ShoppingModule {}

