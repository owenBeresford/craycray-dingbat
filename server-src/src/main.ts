import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService, ConfigModule } from '@nestjs/config';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fastify from 'fastify';
import type { FastifyInstance, FastifyServerOptions,  FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import fastifyStatic from '@fastify/static';

import fs from "node:fs";
import path from "node:path";
import type { ServerOptions, SecureServerOptions, Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import type {SecureVersion, TLSSocket } from 'node:tls';
import http2 from 'node:http2';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ShoppingModule } from "../shopping/shopping-module";
import type { LogLevel } from '@nestjs/common';
import { getGlobals } from 'common-es';

const { __dirname, __filename } = getGlobals(import.meta.url);
 
// At runtime the values are forced to be int or string
// so for example bash functions get mashed into strings, and the Node process will crash.
interface ControlledEnv {
	SPort:number;
	SIpAddr: string;
	SSLkey: string;
	SSLcert: string;
	passphrase: string;
};

// lookup local IP
function extractEnv(env:NodeJS.ProcessEnv ):ControlledEnv {
	if(!env) { throw new Error("Must have an env"); }

	let out={
		SPort : 3001,
		SIpAddr : "192.168.1.218",
		SSLkey: "/tmp/",
		SSLcert: "/tmp/",
		passphrase: "enter a password",
		
	};

  if (env.SHOPPING_PORT) {
    out.SPort = parseInt( env.SHOPPING_PORT, 10);
  }
  if ( env.SHOPPING_IPADDR) {
    out.SIpAddr =  ""+env.SHOPPING_IPADDR;
  }
  if ( env.SHOPPING_KEY) {
    out.SSLkey = ""+env.SHOPPING_KEY;
  }
  if(env.SHOPPING_PASSPHRASE) {
	out.passphrase= ""+env.SHOPPING_PASSPHRASE;
  }
  if (env.SHOPPING_CERT) {
    out.SSLcert = ""+env.SHOPPING_CERT;
  }
  if (out.SSLkey==="/tmp/" || out.SSLcert==="/tmp/" || out.passphrase==="enter a password") {
    throw new Error("For production, you must specify both the CA and the cert... $SHOPPING_KEY, $SHOPPING_CERT  ");
  }
  return out;
}	

function createSocket(httpsOptions:SecureServerOptions):Http2SecureServer {
	const server:Http2SecureServer = http2.createSecureServer(httpsOptions);
  server.on('error', function (e:Error):void {
    console.warn("ERROR:", e.message);
  });
  server.on('clientError', (e:Error, socket ):void => {
    console.warn("Have a client error (think malformed HTTP request)", e.message);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('tlsClientError', (e:Error, socket):void => {
    console.warn("Have a client HTTPS/SSL error ", e.message);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('secureConnection', (tlsSocket:TLSSocket):void => {
// in practice this CB only means anything if you are unable to inject env.NODE_DEBUG 
// this CB is only triggered if there are no cert issues, which is what the below is looking at.
  console.debug('VVVVV Protocol:', tlsSocket.getProtocol());
  console.debug('Cipher:', tlsSocket.getCipher());
  console.debug('ALPN:', tlsSocket.alpnProtocol);
});


server.on('upgrade', (req:Request, socket, head:Headers):void => {
  console.debug("VVVVVV Running upgrade CB");
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');
  socket.pipe(socket);  
});

	return server;
}

function createstaticAssets( httpsOptions:SecureServerOptions ) {
	const fast=new FastifyAdapter({
  http2: true,
  http2SessionTimeout:10_000,
  https: httpsOptions,
	logger: true,
					} as FastifyServerOptions );
	const inst:FastifyInstance=fast.getInstance();
	inst.get('/', (request: FastifyRequest, reply: FastifyReply) => {
 	  reply.type('text/html; charset=utf8').sendFile( 'index.html');	
	});
	inst.register(fastifyStatic, {
		root: path.join(__dirname, "public"),
	  	prefix: '/asset/',   
	});
	inst.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction):void => {
 	 console.log('Incoming:', {
    method: request.method,
    url: request.url,
    httpVersion: request.raw.httpVersion,
    headers: request.headers,
 	 });
  	done();
	});

	return fast;
}


export async function bootstrapHTTPS(vars:ControlledEnv):Promise<void> {
const httpsOptions:SecureServerOptions = {
  key: fs.readFileSync( vars.SSLkey as string, 'utf8'),
  cert: fs.readFileSync( vars.SSLcert as string, 'utf8'),
  passphrase: vars.passphrase as string,
  allowHTTP1: true,  // the bot is really keen on this.  I would like not have it
};

ConfigModule.forRoot({ isGlobal: true });
const fast=createstaticAssets( httpsOptions );

const app:NestFastifyApplication = await NestFactory.create<NestFastifyApplication>(
		ShoppingModule, 
		fast , // FastifyHttp2SecureOptions
			);
 app.enableCors({ credentials: true, });
 app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

 await app.init();

 // https://dev.to/axiom_agent/nodejs-graceful-shutdown-the-right-way-sigterm-connection-draining-and-kubernetes-fp8
 const DYING=async function():Promise<void> { 
      console.log("Closing service on " + vars.SIpAddr + ":" + vars.SPort );
	  try {
      	await server.close();
	  } catch(e:unknown) {
		console.warn("Unable to close server socket cleanly", (e as Error).message);
	  }
	  process.exit(127);
  };

process.on('uncaughtException', async function( err:Error ):Promise<void> {
    console.error("Unexpected exception, panic!!", err.message, err.stack);
	await DYING();
 });
  process.on('SIGTERM', DYING );
  process.on('SIGINT', DYING );

 await app.listen( vars.SPort, vars.SIpAddr);
// await server.listen(vars.SPort, vars.SIpAddr);
// return nil at present
}



// assert(this is node) && assert(we have process)
// this is an API module, so should be safe
if (process.argv[1] === import.meta.filename) {
 	await bootstrapHTTPS( extractEnv(process.env));
}


