import { Scene, Physics } from "phaser";
import { StarSystems } from '../../client/data/StarSystems'
import ServerStarSystem from "./ServerStarSystem";
import WebsocketClient from "./WebsocketClient";
import { ServerMessages, PlayerEvents } from "../../enum";
import ServerShipSprite from "./ServerShipSprite";

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
          this.scene.add(system.name, new ServerStarSystem({key:system.name}, system, this.server), true)
        })
        this.time.addEvent({ delay: 50, callback: this.step, loop: true });
    }
      
    step= () => {
      for(var i=0; i<this.scenes.length; i++){
        let scene = this.scene.get(this.scenes[i]) as ServerStarSystem
        for(var j=0; j<this.playerUpdates.length; j++){
          const update = this.playerUpdates[j]
          if(scene.name === update.shipData.systemName)
              scene.onApplyPlayerUpdate(update)
        }
        this.server.publishMessage({
          type: ServerMessages.SERVER_UPDATE,
          system: scene.name,
          event: {
              ships: getShipUpdates(scene.ships, scene.jumpingShips),
              asteroids: getAsteroidUpdates(scene.asteroids, scene.deadAsteroids),
              resources: getResourceUpdates(scene.resources, scene.deadResources)
          }
        })
        scene.deadAsteroids = []
        scene.deadResources = []
        scene.jumpingShips = []
      }
      this.playerUpdates = []
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

const getShipUpdates = (ships:Map<string,ServerShipSprite>, jumpingShips: Array<ServerShipSprite>) => {
  let updates = new Array<ShipUpdate>()
  ships.forEach(ship=>{
    updates.push({
      type: PlayerEvents.SERVER_STATE,
      sequence: Date.now(),
      shipData: {
        ...ship.shipData,
        x: ship.x,
        y: ship.y,
        rotation: ship.rotation,
        velocity : ship.body.velocity,
        fighters: []
      }
    })
    ship.shipData.firePrimary = false
    ship.shipData.landedAt = null
    ship.shipData.takeOff = false
  })
  jumpingShips.forEach(ship=>{
    console.log('send jump for: '+ship.shipData.targetSystemName + ' new system: '+ship.shipData.systemName)
    updates.push({
      type: PlayerEvents.SERVER_STATE,
      sequence: Date.now(),
      shipData: {
        ...ship.shipData
      }
    })
    ship.shipData.targetSystemName = null
  })
  return updates
}

const getAsteroidUpdates = (asteroids:Map<string, Physics.Arcade.Sprite>, deadAsteroids:Array<DeadEntityUpdate>) => {
  let updates = new Array<AsteroidData>()
  asteroids.forEach(asteroid=>{
    if(asteroid.data){
      updates.push({
        x: asteroid.x,
        y: asteroid.y,
        hp: asteroid.getData('state').hp,
        id: asteroid.getData('state').id,
        type: asteroid.getData('state').type,
        dead: asteroid.getData('state').dead
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
  let updates = new Array<ResourceData>()
  resources.forEach(resource=>{
      if(resource.data){
        updates.push({
          x: resource.x,
          y: resource.y,
          weight: resource.getData('state').weight,
          id: resource.getData('state').id,
          type: resource.getData('state').type,
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