import { Scene } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import StarSystem from './ServerStarSystem'
import WS from './WebsocketClient'

export default class GalaxyScene extends Scene {

    constructor(config,){
      super(config)
    }

    preload() {

    }
      
    create() {
        
        //TODO: load up all the systems in the galaxy. In future, we want 1 server per system probs
        StarSystems.forEach((system)=>{
          this.scene.add(system.name, new StarSystem({key:system.name}, system, server), true)
        })


      }
      
    update(time, delta) {
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
    // handlePlayerInput(self, playerId, input) {
    //     self.players.getChildren().forEach((player) => {
    //       if (playerId === player.playerId) {
    //         //players[player.playerId].input = input;
    //       }
    //     });
    //   }
      
    //   //Player sent entered event
    // addPlayer(self, playerInfo) {
    //     const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    //     player.setDrag(100);
    //     player.setAngularDrag(100);
    //     player.setMaxVelocity(200);
    //     player.playerId = playerInfo.playerId;
    //     self.players.add(player);
    //   }
    //   //Player sent leave event
    // removePlayer(self, playerId) {
    //     self.players.getChildren().forEach((player) => {
    //       if (playerId === player.playerId) {
    //         player.destroy();
    //       }
    //     });
    //   }
}

export const onWSMessage = (data) => {
    const payload = JSON.parse(data.data)
    console.log("I got it: "+payload)
    processEvent(payload)
}
export const onConnected = () => {
    //TODO: connect to wss instance from the headless browser
    server.publishMessage({type: ServerMessages.HEADLESS_CONNECT, event: null})
}
export const onConnectionError = () => {
    //TODO: connect to wss instance from the headless browser
    console.log('wtf----')
}

export const server = new WS()
