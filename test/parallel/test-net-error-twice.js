'use strict';
const common = require('../common');
const assert = require('assert');
const net = require('net');

const buf = new Buffer(10 * 1024 * 1024);

buf.fill(0x62);

const errs = [];
var clientSocket;
var serverSocket;

function ready() {
  if (clientSocket && serverSocket) {
    clientSocket.destroy();
    serverSocket.write(buf);
  }
}

var srv = net.createServer(function onConnection(conn) {
  conn.on('error', function(err) {
    errs.push(err);
    if (errs.length > 1 && errs[0] === errs[1])
      assert(false, 'We should not be emitting the same error twice');
  });
  conn.on('close', function() {
    srv.unref();
  });
  serverSocket = conn;
  ready();
}).listen(common.PORT, function() {
  var client = net.connect({ port: common.PORT });

  client.on('connect', function() {
    clientSocket = client;
    ready();
  });
});

process.on('exit', function() {
  console.log(errs);
  assert.equal(errs.length, 1);
});
