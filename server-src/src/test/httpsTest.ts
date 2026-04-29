import http2 from "node:http2";
import type {
  ServerOptions,
  SecureServerOptions,
  Http2SecureServer,
  Http2ServerRequest,
  Http2ServerResponse,
} from "node:http2";
import type { SecureVersion } from "node:tls";

import fs from "fs";
import path from "path";
import { getGlobals } from "common-es";

const { __dirname, __filename } = getGlobals(import.meta.url);

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head><title>Secure Node.js Server</title></head>
<body>
    <h1>Hello from a Secure HTTPS Server! 🔒</h1>
    <p>Your connection is encrypted and secure.</p>
</body>
</html>
`;

/*  to decrypt if necessary   https://stackoverflow.com/questions/37198831/how-to-load-encrypted-private-key-in-node-js
var hash = CRYPTO.privateDecrypt({
    'key': privateKey,
    'passphrase': 'passphrase',
    'cipher': 'aes-256-cbc',
    'padding': CRYPTO.constants.RSA_PKCS1_PADDING
}, buffer).toString();
*/

const httpsOptions: SecureServerOptions = {
  //  keyPair:{ },
  key: fs.readFileSync(path.resolve(process.env.SHOPPING_KEY ?? "/tmp/"), "utf8"),
  cert: fs.readFileSync(path.resolve(process.env.SHOPPING_CERT ?? "/tmp/"), "utf8"),

  passphrase: process.env.SHOPPING_PASSPHRASE ?? "password",
  //  keyType: 'ec',
  //  curve: 'P-256',
  maxVersion: "TLSv1.3" as SecureVersion,
  minVersion: "TLSv1.2" as SecureVersion,
  allowHTTP1: true,
};

console.log("Testing values arrived correctly ", httpsOptions);
const server: Http2SecureServer = http2.createSecureServer(
  httpsOptions,
  (req: Http2ServerRequest, res: Http2ServerResponse): void => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Welcome to Our Secure Express App!</h1><p>All data here is protected by TLS encryption.</p>");
  },
);
// server.addContext(SIpAddr,  ZXX) )

server.on("error", function (e: Error): void {
  console.log("ERROR:", e.message);
});

server.on("clientError", (e: Error, socket): void => {
  console.log("Have a client error (think malformed HTTP request)", e.message);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.on("tlsClientError", (e: Error, socket): void => {
  console.log("Have a client HTTPS/SSL error ", e.message);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.on("upgrade", (req: Request, socket, head: Headers): void => {
  console.log("VVVVVV Running upgrade CB");
  socket.write("HTTP/1.1 101 Web Socket Protocol Handshake\r\n" + "Connection: Upgrade\r\n" + "\r\n");
  socket.pipe(socket);
});

process.on("uncaughtException", function (err: Error): void {
  console.error(err.message, err.stack);
});

server.on("secureConnection", (tlsSocket) => {
  // in practice this CB only means anything if you are unable to inject env.NODE_DEBUG
  // this CB is only triggered if there are no cert issues, which is what the below is looking at.
  console.log("VVVVV Protocol:", tlsSocket.getProtocol());
  console.log("Cipher:", tlsSocket.getCipher());
  console.log("ALPN:", tlsSocket.alpnProtocol);
});

await server.listen(3001, "app.hiss");
console.log("Opening port " + "app.hiss" + ":" + 3001 + " for clients.", server);
