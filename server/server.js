const ServerMessages = require('./src/ServerMessages.js')
const path = require('path');
const jsdom = require('jsdom');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const Datauri = require('datauri');

const datauri = new Datauri();
const { JSDOM } = jsdom;

//Eventually should be served from S3 bucket
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, 'index.html'), {
    // To run the scripts in the html file
    runScripts: "dangerously",
    // Also load supported external resources
    resources: "usable",
    // So requestAnimatinFrame events fire
    pretendToBeVisual: true
  }).then((dom) => {
    dom.window.URL.createObjectURL = (blob) => {
      if (blob){
        return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
      }
    };
    dom.window.URL.revokeObjectURL = (objectURL) => {};
    dom.window.gameLoaded = () => {
      server.listen(8082, function () {
        console.log(`Listening on ${server.address().port}`);
      });
    };
  }).catch((error) => {
    console.log(error.message);
  });
}

setupAuthoritativePhaser();

var WebSocketServer = require('websocket').server;
var Constants = {
  PLAYER_AVAILABLE: 'ma',
  MATCH_UPDATE: 'mu',
  PLAYER_REPLACE: 'prp',
  PLAYER_MAP_REPLACE: 'pmp',
  MATCH_TICK: 'mt'
}

/**
 * WebSocket server
 */

var sockets = {}
var socketIds = []
var session = {
  players: []
}

var wsServer = new WebSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket request is just
  // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server,
  maxReceivedFrameSize: 131072,
  maxReceivedMessageSize: 10 * 1024 * 1024,
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  // accept connection - you should check 'request.origin' to make sure that
  // client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin);
  var socketId = Date.now()+''+Math.random()
  connection.id = socketId
  sockets[socketId] = connection
  socketIds.push(socketId)
  console.log((new Date()) + ' Connection accepted.');

  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
        var obj = JSON.parse(message.utf8Data)
        switch(obj.type){
          case ServerMessages.HEADLESS_CONNECT: 
            console.log('Headless client connected.')
            session.serverSocketId = socketId
            break
          case ServerMessages.PLAYER_EVENT:
            publishToServer(obj.event, obj.system)
            break
          case ServerMessages.SERVER_UPDATE:
            publishToPlayers(obj.event, obj.system)
            break
        }
    }
  });

  // user disconnected
  connection.on('close', (code) => {
      console.log((new Date()) + "A Peer disconnected: "+code);
      socketIds = socketIds.filter(id=>id!==socketId)
      delete sockets[socketId]
  });
});


const publishToPlayers = (event, system) => {
  for(var i=0; i<socketIds.length; i++){
    var socketId = socketIds[i]
    if(socketId !== session.serverSocketId){
      var message = getPlayerUpdateMessage(event, system)
      var json = JSON.stringify({ type:'message', data: message });
      sockets[socketId].sendUTF(json);
    }
  }
}

const publishToServer = (playerEvent, system) => {
  var message = getPlayerEventMessage(playerEvent, system)
  // broadcast player's message to the headless phaser server
  var json = JSON.stringify({ type:'message', data: message });
  sockets[session.serverSocketId].sendUTF(json);
}

//An event a player claims to have done: 
//rotate, fire, thrust, land, jump, or any non-physics transaction
//Server needs to ACK these with the sequence timestamp
const getPlayerEventMessage = (event, system) => {
  return JSON.stringify({
    type: ServerMessages.PLAYER_EVENT,
    event,
    system
  })
}

//Ack an event a player previously send with resulting state snapshot
//PlayerEvent object has sequence timestamp so that the client can DROP older ACKs if they come in out of order
const getPlayerEventAckMessage = (event) => {
  return JSON.stringify({
    type: ServerMessages.PLAYER_EVENT_ACK,
    event
  })
}

//The 100ms state update for each player. 
//Contains entire star system snapshot: stellar objects, ships, projectiles
//Clients will validate against these, and potentially be corrected.
const getPlayerUpdateMessage = (event, system) => {
  return JSON.stringify({
    type: ServerMessages.SERVER_UPDATE,
    event,
    system
  })
}
