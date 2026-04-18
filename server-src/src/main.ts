import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ShoppingModule } from "./shopping/shopping-module";
import fs from "fs";

interface ShoppingSSLOpts {
  key: Buffer;
  cert: Buffer;
}

let SPort = 3001;
let SIpAddr = "192.168.1.218";
let SSLkey = "";
let SSLcert = "";
let serverOptions = {} as { httpsOptions: ShoppingSSLOpts };
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
 * @returns {void}
 */
async function bootstrap() {
  console.log("Opening port " + SIpAddr + ":" + SPort + " for clients.");
  if (SSLkey) {
    const httpsOptions = {
      key: fs.readFileSync(SSLkey),
      cert: fs.readFileSync(SSLcert),
    } as ShoppingSSLOpts;
    serverOptions = { httpsOptions };
  }

  const app = await NestFactory.create(ShoppingModule, serverOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  await app.listen(SPort, SIpAddr);
}
bootstrap();
