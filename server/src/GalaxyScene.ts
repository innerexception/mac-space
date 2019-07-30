import { Scene, Physics } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import StarSystem from './ServerStarSystem'
import ServerStarSystem from "./ServerStarSystem";
import WebsocketClient from "./WebsocketClient";
import { ServerMessages } from "../../enum";

export default class GalaxyScene extends Scene {

    server: WebsocketClient
    scenes: Array<string>
    playerUpdates: Array<ShipUpdate>
    frameLengthMs: number

    constructor(config, server:WebsocketClient){
      super(config)
      this.scenes = StarSystems.map(system=>system.name)
      this.server = new WebsocketClient(this.onWSMessage, this.onConnected, this.onConnectionError)
      this.frameLengthMs = 100
      this.playerUpdates = []
    }

    create() {
        //TODO: load up all the systems in the galaxy. In future, we want 1 server per system probs
        StarSystems.forEach((system)=>{
          this.scene.add(system.name, new StarSystem({key:system.name}, system, this.server), true)
        })
        this.time.addEvent({ delay: 100, callback: this.step, loop: true });
    }
      
    step= () => {
      for(var i=0; i<this.scenes.length; i++){
        let scene = this.scene.get(this.scenes[i]) as ServerStarSystem
        for(var j=0; j<this.playerUpdates.length; j++){
          console.log('recieved player update with keys: ')
          Object.keys(this.playerUpdates[j]).forEach(key=>console.log(key))
          scene.onApplyPlayerUpdate(this.playerUpdates[j])
        }
        this.playerUpdates = []
        this.server.publishMessage({
          type: ServerMessages.SERVER_UPDATE,
          system: scene.name,
          event: {
              ships: getShipUpdates(scene.ships),
              asteroids: getAsteroidUpdates(scene.asteroids)
          }
        })
      }
    }

    onRecievePlayerUpdate = (update:ShipUpdate) => {
        this.playerUpdates.push(update)
    }

    onWSMessage = (data) => {
        const payload = JSON.parse(data.data) as ServerMessage
        this.onRecievePlayerUpdate(payload.event as ShipUpdate)
    }

    onConnected = () => {
      this.server.publishMessage({type: ServerMessages.HEADLESS_CONNECT, event: null, system: '-Server-'})
    }

    onConnectionError = () => {
        console.log('wtf----')
    }
}

const getShipUpdates = (ships:Map<string,Ship>) => {
  let updates = new Array<ShipUpdate>()
  ships.forEach(ship=>{
    updates.push({
      type: PlayerEvents.SERVER_STATE,
      sequence: Date.now(),
      shipData: {
        ...ship,
        x: ship.sprite.x,
        y: ship.sprite.y,
        rotation: ship.sprite.rotation,
        acceleration : (ship.sprite.body as any).acceleration,
        jumpVector: null,
        fighters: []
      }
    })
  })
  return updates
}

const getAsteroidUpdates = (asteroids:Map<string, Physics.Arcade.Sprite>) => {
  let updates = new Array<AsteroidUpdate>()
  asteroids.forEach(asteroid=>{
    updates.push({
      x: asteroid.x,
      y: asteroid.y,
      hp: asteroid.data.values.hp,
      id: asteroid.data.values.id,
      type: asteroid.data.values.type,
    })
  })
  return updates
}