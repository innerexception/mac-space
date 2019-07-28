import { Scene } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import StarSystem from './ServerStarSystem'
import WS from './WebsocketClient'
const ServerMessages = require('./ServerMessages.js')

export default class GalaxyScene extends Scene {

    constructor(config,){
      super(config)
    }

    preload() {

    }
      
    create() {
        
        //TODO: load up all the systems in the galaxy. In future, we want 1 server per system probs
        StarSystems.forEach((system)=>{
          this.scene.add(system.name, new StarSystem({key:system.name}, system.assetList), true)
        })


        // this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
        // this.physics.add.collider(this.players);
      
        // this.physics.add.overlap(this.players, this.star, function (star, player) {
        //   if (players[player.playerId].team === 'red') {
        //     self.scores.red += 10;
        //   } else {
        //     self.scores.blue += 10;
        //   }
        //   self.star.setPosition(randomPosition(700), randomPosition(500));
        //   io.emit('updateScore', self.scores);
        //   io.emit('starLocation', { x: self.star.x, y: self.star.y });
        // });
      
        // io.on('connection', function (socket) {
        //   console.log('a user connected');
        //   // create a new player and add it to our players object
        //   players[socket.id] = {
        //     rotation: 0,
        //     x: Math.floor(Math.random() * 700) + 50,
        //     y: Math.floor(Math.random() * 500) + 50,
        //     playerId: socket.id,
        //     team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
        //     input: {
        //       left: false,
        //       right: false,
        //       up: false
        //     }
        //   };
        //   // add player to server
        //   addPlayer(self, players[socket.id]);
        //   // send the players object to the new player
        //   socket.emit('currentPlayers', players);
        //   // update all other players of the new player
        //   socket.broadcast.emit('newPlayer', players[socket.id]);
        //   // send the star object to the new player
        //   socket.emit('starLocation', { x: self.star.x, y: self.star.y });
        //   // send the current scores
        //   socket.emit('updateScore', self.scores);
      
        //   socket.on('disconnect', function () {
        //     console.log('user disconnected');
        //     // remove player from server
        //     removePlayer(self, socket.id);
        //     // remove this player from our players object
        //     delete players[socket.id];
        //     // emit a message to all players to remove this player
        //     io.emit('disconnect', socket.id);
        //   });
      
        //   // when a player moves, update the player data
        //   socket.on('playerInput', function (inputData) {
        //     handlePlayerInput(self, socket.id, inputData);
        //   });
        // });
      }
      
    update() {
      //TODO: a delta is applied here such that message broadcast only happens once every 100ms


      //However the physics simulation still runs at 60fps
      //   this.players.getChildren().forEach((player) => {
      //     const input = players[player.playerId].input;
      //     if (input.left) {
      //       player.setAngularVelocity(-300);
      //     } else if (input.right) {
      //       player.setAngularVelocity(300);
      //     } else {
      //       player.setAngularVelocity(0);
      //     }
      
      //     if (input.up) {
      //       this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
      //     } else {
      //       player.setAcceleration(0);
      //     }
      
      //     players[player.playerId].x = player.x;
      //     players[player.playerId].y = player.y;
      //     players[player.playerId].rotation = player.rotation;
      //   });
      //   this.physics.world.wrap(this.players, 5);
      //TODO: when publishing messages, send server timestamp for client resolution
      //   io.emit('playerUpdates', players);
    }
      
      //Player sent input command
    handlePlayerInput(self, playerId, input) {
        self.players.getChildren().forEach((player) => {
          if (playerId === player.playerId) {
            //players[player.playerId].input = input;
          }
        });
      }
      
      //Player sent entered event
    addPlayer(self, playerInfo) {
        const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        player.setDrag(100);
        player.setAngularDrag(100);
        player.setMaxVelocity(200);
        player.playerId = playerInfo.playerId;
        self.players.add(player);
      }
      //Player sent leave event
    removePlayer(self, playerId) {
        self.players.getChildren().forEach((player) => {
          if (playerId === player.playerId) {
            player.destroy();
          }
        });
      }
}

export const onWSMessage = (data) => {
    const payload = JSON.parse(data.data)
    console.log('mmmmmm')
}
export const onConnected = () => {
    //TODO: connect to wss instance from the headless browser
    server.publishMessage({type: ServerMessages.HEADLESS_CONNECT})
}
export const onConnectionError = () => {
    //TODO: connect to wss instance from the headless browser
    console.log('wtf----')
}

export const server = new WS()
