import { Scene, Physics } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import StarSystem from './ServerStarSystem'
import ServerStarSystem from "./ServerStarSystem";
import WebsocketClient from "./WebsocketClient";
import { ServerMessages, PlayerEvents } from "../../enum";

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
        this.time.addEvent({ delay: 50, callback: this.step, loop: true });
    }
      
    step= () => {
      for(var i=0; i<this.scenes.length; i++){
        let scene = this.scene.get(this.scenes[i]) as ServerStarSystem
        for(var j=0; j<this.playerUpdates.length; j++){
          scene.onApplyPlayerUpdate(this.playerUpdates[j])
        }
        this.playerUpdates = []
        this.server.publishMessage({
          type: ServerMessages.SERVER_UPDATE,
          system: scene.name,
          event: {
              ships: getShipUpdates(scene.ships),
              asteroids: getAsteroidUpdates(scene.asteroids, scene.deadAsteroids),
              resources: getResourceUpdates(scene.resources, scene.deadResources)
          }
        })
        scene.deadAsteroids = []
        scene.deadResources = []
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
    ship.firePrimary = false
  })
  return updates
}

const getAsteroidUpdates = (asteroids:Map<string, Physics.Arcade.Sprite>, deadAsteroids:Array<DeadEntityUpdate>) => {
  let updates = new Array<AsteroidUpdate>()
  asteroids.forEach(asteroid=>{
    if(asteroid.data){
      updates.push({
        x: asteroid.x,
        y: asteroid.y,
        hp: asteroid.data.values.hp,
        id: asteroid.data.values.id,
        type: asteroid.data.values.type,
        dead: asteroid.data.values.dead
      })
    }
  })
  deadAsteroids.forEach(roid=>{
    console.log('asteroid gc')
    updates.push({
      x: -1,
      y: -1,
      hp: -1,
      id: roid.id,
      dead: true
    })
  })
  return updates
}

const getResourceUpdates = (resources:Map<string, Physics.Arcade.Sprite>, deadResources: Array<DeadEntityUpdate>) => {
  let updates = new Array<ResourceUpdate>()
  resources.forEach(resource=>{
      if(resource.data){
        updates.push({
          x: resource.x,
          y: resource.y,
          weight: resource.data.values.weight,
          id: resource.data.values.id,
          type: resource.data.values.type,
          dead: false
        })
      }
  })
  //These have been removed from the normal update loop to be sent out one last time so clients can GC them
  deadResources.forEach(resource=>{
    console.log('resource gc')
    updates.push({
        x: -1,
        y: -1,
        weight: -1,
        id: resource.id,
        dead: true
    })
  })
  return updates
}