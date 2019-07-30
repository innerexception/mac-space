import { Scene } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import StarSystem from './ServerStarSystem'
import ServerStarSystem from "./ServerStarSystem";
import WebsocketClient from "./WebsocketClient";

export default class GalaxyScene extends Scene {

    server: WebsocketClient
    scenes: Array<string>
    playerUpdates: Array<ShipUpdate>

    constructor(config, server:WebsocketClient){
      super(config)
      this.scenes = StarSystems.map(system=>system.name)
      this.server = new WebsocketClient(this.onWSMessage, this.onConnected, this.onConnectionError)
    }

    preload() {

    }
      
    create() {
        
        //TODO: load up all the systems in the galaxy. In future, we want 1 server per system probs
        StarSystems.forEach((system)=>{
          this.scene.add(system.name, new StarSystem({key:system.name, system}, this.server), true)
        })
      }
      
    update(time, delta) {
      //TODO: use delta to fire position updates at 100ms interval for client reconciliation
      if(time%100===0){
        for(var i=0; i<this.scenes.length; i++){
          let scene = this.scene.get(this.scenes[i]) as ServerStarSystem
          for(var i=0; i<this.playerUpdates.length; i++){
            scene.onApplyPlayerUpdate(this.playerUpdates[i])
          }
          this.server.publishMessage({
            type: ServerMessages.SERVER_UPDATE,
            event: {
                ships: scene.shipUpdates,
                asteroids: scene.asteroidUpdates
            }
          })
        }
        this.playerUpdates = []
      }
    }

    onRecievePlayerUpdate = (update:ShipUpdate) => {
        this.playerUpdates.push(update)
    }

    onWSMessage = (data) => {
        const payload = JSON.parse(data.data) as ServerMessage
        console.log("I got it: "+payload)
        this.onRecievePlayerUpdate(payload.event as ShipUpdate)
    }

    onConnected = () => {
      this.server.publishMessage({type: ServerMessages.HEADLESS_CONNECT, event: null})
    }
    onConnectionError = () => {
        console.log('wtf----')
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
