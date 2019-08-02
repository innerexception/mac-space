import { Scene, GameObjects, Physics, } from "phaser";
import Projectile from '../../client/components/util/display/Projectile'
import ServerShipSprite from './ServerShipSprite'
import WebsocketClient from "./WebsocketClient";
import * as Ships from '../../client/data/Ships'
import { v4 } from 'uuid'
import { PlayerEvents } from "../../enum";

export default class ServerStarSystem extends Scene {

    ships: Map<string,ServerShipSprite>
    planets: Array<GameObjects.Sprite>
    asteroids: Map<string, Physics.Arcade.Sprite>
    deadAsteroids: Array<DeadEntityUpdate>
    resources: Map<string, Physics.Arcade.Sprite>
    deadResources: Array<DeadEntityUpdate>
    projectiles: Physics.Arcade.Group
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
        this.deadAsteroids = []
        this.ships = new Map()
        this.resources = new Map()
        this.deadResources = []
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
        this.physics.world.setBounds(0,0,3200,3200)
        this.physics.world.setBoundsCollision();

        this.projectiles = this.physics.add.group({ classType: Projectile  })
        this.projectiles.runChildUpdate = true
        
        this.addAsteroids()
        this.addPlanets()
        
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
                    ship.firePrimary()
                    break
                case PlayerEvents.ROTATE_L: 
                    ship.rotateLeft()
                    break
                case PlayerEvents.ROTATE_R: 
                    ship.rotateRight()
                    break
                case PlayerEvents.THRUST: 
                    ship.thrust()
                    break
                case PlayerEvents.THRUST_OFF: 
                    ship.thrustOff()
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
        
        let temp = []
        asteroids.forEach(roid=>temp.push(roid))
        this.physics.add.overlap(this.projectiles, temp, this.playerShotAsteroid);
        this.asteroids = asteroids
    }

    spawnAsteroid = (id:string, type:string) => {
        //Position will be set shortly
        let state = {
            type,
            hp: 3,
            id
        } as AsteroidData
        return this.physics.add.sprite(0,0,type)
            .setData('state', state)
            .setScale(Phaser.Math.FloatBetween(0.8,0.1))
            .setRotation(Phaser.Math.FloatBetween(3,0.1))
    }

    spawnShip = (config:ShipData, spawnPoint:PlayerSpawnPoint) => {
        let shipData = {...Ships[config.name], ...config} as ShipData
        let sprite = new ServerShipSprite(this.scene.scene, spawnPoint.x, spawnPoint.y, shipData.asset, this.projectiles, shipData)
        sprite.rotation = spawnPoint.rotation
        if(spawnPoint.xVelocity){
            //TODO: set starting edge coords based on previous system coords, right now defaults to top left corner
            sprite.setVelocity(config.jumpVector.x*500, config.jumpVector.y*-500)
        }
        this.ships.set(shipData.id, sprite)
        sprite.setCollideWorldBounds(true)
        let rez = []
        this.resources.forEach(res=>rez.push(res))
        this.physics.add.overlap(rez, sprite, this.playerGotResource);
    }

    playerGotResource = (resource:Physics.Arcade.Sprite, ship:ServerShipSprite) =>
    {
        console.log('you hit it:')
        if(ship.shipData.cargoSpace >= resource.getData('state').weight){
            //TODO: pick up resource and add to cargo
            ship.shipData.cargoSpace -= resource.getData('state').weight
            ship.shipData.cargo.push({
                weight: resource.getData('state').weight,
                name: resource.getData('state').type,
                asset: resource.getData('state').type
            })
            console.log('you get it: '+ship.shipData.cargo)
            this.destroyResource(resource)
        }
    }

    destroyResource = (resource:Physics.Arcade.Sprite) => {
        this.deadResources.push({ id: resource.getData('state').id })
        this.resources.delete(resource.getData('state').id)
        resource.destroy()
    }

    playerShotAsteroid = (asteroid:Physics.Arcade.Sprite, projectile:any) =>
    {
        if(asteroid.getData('state').hp > 0){
            projectile.destroy();
            asteroid.getData('state').hp-=1
            console.log('damaged asteroid: '+asteroid.getData('state').hp)
            if(asteroid.getData('state').hp <= 0){
                this.spawnResource(asteroid)
                this.destroyAsteroid(asteroid)
            }
        }
    }

    destroyAsteroid = (asteroid:Physics.Arcade.Sprite) =>{ 
        this.deadAsteroids.push({ id: asteroid.getData('state').id })
        this.asteroids.delete(asteroid.getData('state').id)
        asteroid.destroy()
    }

    spawnResource = (resource) => {
        let id = v4()
        let rez = this.physics.add.sprite(resource.x,resource.y, 'planet')
            .setData('state', {
                id,
                weight: 1,
                type: 'Iron'
            } as ResourceData)
            .setScale(0.1)
            .setRotation(Phaser.Math.FloatBetween(3,0.1))
        this.resources.set(id, rez)
        let ships = []
        this.ships.forEach(ship=>ships.push(ship))
        this.physics.add.overlap(rez, ships, this.playerGotResource)
    }

    playerBoardedShip = (player:Physics.Arcade.Sprite, targetShip:Physics.Arcade.Sprite) => {
        //TODO: send boarding action message with 2 participant ships ids
    }

    shipDamaged = (ship:Physics.Arcade.Sprite) => {
        //TODO: send ship damaged message with id
        //TODO: potentially send ship destroyed message
    }
}