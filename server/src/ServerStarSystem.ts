import { Scene, GameObjects, Physics, } from "phaser";
import Projectile from '../../client/components/util/display/Projectile'
import ShipSprite from './ServerShipSprite'
import WebsocketClient from "./WebsocketClient";
import * as Ships from '../../client/data/Ships'
import { v4 } from 'uuid'
import { PlayerEvents } from "../../enum";

export default class ServerStarSystem extends Scene {

    ships: Map<string,Ship>
    planets: Array<GameObjects.Sprite>
    asteroids: Map<string, Physics.Arcade.Sprite>
    projectiles: GameObjects.Group
    name: string
    server: WebsocketClient
    jumpVector: JumpVector
    state:SystemState

    constructor(config, state:SystemState, server:WebsocketClient){
        super(config)
        this.state = state
        this.name = config.key
        this.server = server
        this.planets = []
        this.asteroids = new Map()
        this.ships = new Map()
    }

    preload = () =>
    {
        this.state.assetList.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
        console.log('star system '+this.name+' was booted.')
    }
    
    create = () =>
    {
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBoundsCollision();

        this.projectiles = this.physics.add.group({ classType: Projectile  })
        this.projectiles.runChildUpdate = true
        
        this.addAsteroids()
        this.addPlanets()
        
        let temp = []
        this.asteroids.forEach(roid=>temp.push(roid))
        this.physics.add.collider(this.projectiles, temp, this.playerShotAsteroid);
    }
    
    update = (time, delta) =>
    {
        
    }

    onApplyPlayerUpdate = (update:ShipUpdate) => {
        //perform change on entity
        let ship = this.ships.get(update.shipData.id)
        if(ship){
            switch(update.type){
                case PlayerEvents.FIRE_PRIMARY: 
                    ship.sprite.firePrimary()
                    break
                case PlayerEvents.ROTATE_L: 
                    ship.sprite.rotateLeft()
                    break
                case PlayerEvents.ROTATE_R: 
                    ship.sprite.rotateRight()
                    break
                case PlayerEvents.THRUST: 
                    ship.sprite.thrust()
                    break
                case PlayerEvents.THRUST_OFF: 
                    ship.sprite.thrustOff()
                    break
            }
        }
        else if(update.type === PlayerEvents.PLAYER_SPAWNED){
            console.log('ship spawned at '+update.shipData.x+','+update.shipData.y)
            this.spawnShip(update.shipData, {x: update.shipData.x, y: update.shipData.y, rotation: update.shipData.rotation })
        }
    }

    addPlanets = () => {
        let planets = []
        this.state.stellarObjects.forEach(obj=>{
            planets.push(this.add.sprite(obj.x, obj.y, obj.asset))
        })
        this.planets = planets
    }

    addAsteroids()
    {
        let asteroids = new Map()
        let roidRay = []
        this.state.asteroidConfig.forEach(aConfig=> {
            for(var i=0; i< aConfig.density*20; i++){
                let id = v4()
                asteroids.set(id, this.spawnAsteroid(id, aConfig.type))
            }
            
            let arr = []
            asteroids.forEach(roid=>arr.push(roid))

            if(aConfig.isBelt)
                Phaser.Actions.RandomEllipse(arr, new Phaser.Geom.Ellipse(1600, 1600, 1000, 1000));
            else
                Phaser.Actions.RandomRectangle(arr, new Phaser.Geom.Rectangle(0, 0, 3200, 3200));
                    
            asteroids.forEach((sprite:Physics.Arcade.Sprite)=>{
                let d=Phaser.Math.Between(700,1000)
                let r=Phaser.Math.FloatBetween(-0.01,0.1)
                this.time.addEvent({
                    delay: 1, 
                    callback: ()=>{
                        sprite.rotation+=r
                        Phaser.Actions.RotateAroundDistance([sprite], { x: 1600, y: 1600 }, 0.001, d)
                    },
                    loop: true 
                });
                roidRay.push(sprite)
            })              
        })
        this.asteroids = asteroids
    }

    spawnAsteroid = (id:string, type:string) => {
        //Position will be set shortly
        return this.physics.add.sprite(0,0,type)
            .setData('hp', 3)
            .setData('id', id)
            .setData('type', type)
            .setScale(Phaser.Math.FloatBetween(0.8,0.1))
            .setRotation(Phaser.Math.FloatBetween(3,0.1))
    }

    spawnShip = (ship:ShipDataOnly, spawnPoint:PlayerSpawnPoint) => {
        let thisShip = {...Ships[ship.name], ...ship}
        thisShip.sprite = new ShipSprite(this.scene.scene, spawnPoint.x, spawnPoint.y, ship.asset, this.projectiles, thisShip)
        
        //Can spawn from a planet or some edge if jumping in
        //thisShip.sprite.setVelocity(spawnPoint.xVelocity*ship.maxSpeed, spawnPoint.yVelocity*-ship.maxSpeed)
        thisShip.sprite.rotation = spawnPoint.rotation
        this.ships.set(ship.id, thisShip)
    }

    playerLeft = (player:Player) => {
        //TODO send player left system message with player id and exit vector
    }

    playerGotResource = (player:any, resource:any) =>
    {
        resource.destroy();
        //TODO: send player picked up resource message with id of resource to destroy
        //onAddCargo(resource.data.values.type, resource.data.values.weight)
    }

    playerShotAsteroid = (asteroid:any, projectile:any) =>
    {
        if(asteroid.data.values.hp > 0){
            projectile.destroy();
            asteroid.data.values.hp-=1
        }
        else{
            //asteroid.destroy()
            // this.resources.get(asteroid.x, asteroid.y, asteroid.data.values.assetKey)
            //TODO: send spawn resources message with id of asteroid to destroy also
        }
    }

    playerBoardedShip = (player:Physics.Arcade.Sprite, targetShip:Physics.Arcade.Sprite) => {
        //TODO: send boarding action message with 2 participant ships ids
    }

    playerFiredPrimary = (player:Player) => {
        //TODO: send projectile fired message with projectile type and fire vector
    }

    shipDamaged = (ship:Physics.Arcade.Sprite) => {
        //TODO: send ship damaged message with id
        //TODO: potentially send ship destroyed message
    }
}

