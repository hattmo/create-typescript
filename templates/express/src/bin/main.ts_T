#!/usr/bin/env node

import http from "http";
import app from "../lib/index";
import { AddressInfo } from "net";

const port = parseInt(process.env.PORT ?? "8080");
if (Number.isNaN(port)) {
  console.error(`${process.env.PORT} is not a valid port number`);
  process.exit(1);
}

const server = http.createServer(app);

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      process.stderr.write(`Port ${port} requires elevated privileges\n`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      process.stderr.write(`Port ${port} is already in use\n`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address() as AddressInfo;
  process.stdout.write(`Listening on port ${addr.port}\n`);
};

server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
