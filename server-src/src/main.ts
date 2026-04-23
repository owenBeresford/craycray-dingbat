import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express, Request as ExpRequest, Response as ExpResponse } from 'express';
import fs from "node:fs";
import path from "node:path";
import https, { type ServerOptions } from 'node:https';
import { getGlobals } from 'common-es';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { LogLevel } from '@nestjs/common';

import { ShoppingModule } from "./shopping/shopping-module";

const { __dirname, __filename } = getGlobals(import.meta.url);

interface ShoppingSSLOpts {
  key: Buffer;
  cert: Buffer;
}

let SPort = 3001;
let SIpAddr = "192.168.1.218";
let SSLkey = "";
let SSLcert = "";
let serverOptions = {} as { httpsOptions: ShoppingSSLOpts, logger:Array<LogLevel> };
if (process.env) {
  if (process.env.SHOPPING_PORT) {
    SPort = parseInt(process.env.SHOPPING_PORT, 10);
  }
  if (process.env.SHOPPING_IPADDR) {
    SIpAddr = process.env.SHOPPING_IPADDR;
  }
  if (process.env.SHOPPING_KEY) {
    SSLkey = process.env.SHOPPING_KEY;
  }
  if (process.env.SHOPPING_CERT) {
    SSLcert = process.env.SHOPPING_CERT;
  }
  if ((!SSLkey && SSLcert) || (!SSLcert && SSLkey)) {
    throw new Error("For production, you must specify both the CA and the cert... $SHOPPING_KEY, $SHOPPING_CERT  ");
  }
}

/**
 * bootstrap
 * Function that create the server socket and Nest resources

 * @public
 * @returns {Promise<void>}
 */
async function bootstrap():Promise<void> {
  if (SSLkey) {
    const httpsOptions:ServerOptions = {
      key: fs.readFileSync( path.resolve(SSLkey), 'utf8' ),
      cert: fs.readFileSync( path.resolve(SSLcert), 'utf8' ),
    };
    const serverOptions = {
      httpsOptions,
  //  logger: new BetterLogger(new ClsService(new AsyncLocalStorage())),
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    };
  }

  const exp: Express = express();
  exp.use(
    "/",
  express.static(
           path.join(__dirname, "public" ),
          { dotfiles: "ignore", immutable: false }
              ),
        );
   exp.get('/', (req:ExpRequest, res:ExpResponse):void => {
     res.sendFile(path.resolve('public/index.html'));
  });

  const app = await NestFactory.create<NestExpressApplication>(
    ShoppingModule,
    new ExpressAdapter(exp),
    { logger:serverOptions.logger }
        );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

 //  app.useStaticAssets( path.join(__dirname, "..", "..", "dist". "public") )
  app.enableCors({ credentials: true, });
  await app.init();

  const server = https.createServer(serverOptions.httpsOptions, exp);
  await server.listen(SPort, SIpAddr);
  console.log("Opening port " + SIpAddr + ":" + SPort + " for clients.");

}
bootstrap();
