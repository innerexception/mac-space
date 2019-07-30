import { Scene, GameObjects, Physics, } from "phaser";
import Projectile from '../../client/components/util/display/Projectile'
import ShipSprite from './ServerShipSprite'
import WebsocketClient from "./WebsocketClient";
import v4 from 'uuid'

export default class ServerStarSystem extends Scene {

    ships: Map<string,Ship>
    shipArray: Array<Ship>
    planets: Array<GameObjects.Sprite>
    asteroids: Map<string, Physics.Arcade.Sprite>
    asteroidArray: Array<Physics.Arcade.Sprite>
    resources: GameObjects.Group
    projectiles: GameObjects.Group
    name: string
    server: WebsocketClient
    jumpVector: JumpVector
    state:SystemState

    constructor(config, server:WebsocketClient){
        super(config)
        this.state = config.state
        this.name = config.key
        this.server = server
        console.log('star system '+this.name+' is booting.')
    }

    preload = () =>
    {
        this.state.assetList.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
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
        //perform change on entity TODO: maybe also send acks if needed
        let ship = this.ships.get(update.id)
        if(ship)
            switch(update.type){
                case PlayerEvents.FIRE_PRIMARY: 
                    ship.sprite.firePrimary()
                case PlayerEvents.ROTATE_L: 
                    ship.sprite.rotateLeft()
                case PlayerEvents.ROTATE_R: 
                    ship.sprite.rotateRight()
                case PlayerEvents.THRUST: 
                    ship.sprite.thrust()
                case PlayerEvents.THRUST_OFF: 
                    ship.sprite.thrustOff()
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
        this.asteroidArray = roidRay
    }

    spawnAsteroid = (id:string, type:string) => {
        //Position will be set shortly
        this.physics.add.sprite(0,0,type)
            .setData('hp', 3)
            .setData('id', id)
            .setScale(Phaser.Math.FloatBetween(0.8,0.1))
            .setRotation(Phaser.Math.FloatBetween(3,0.1))
    }

    playerEntered = (player:Player, spawnPoint:PlayerSpawnPoint) => {
        player.ships.forEach(ship=>{
            this.spawnShip(ship, spawnPoint)
        })
    }

    spawnShip = (ship:Ship, spawnPoint:PlayerSpawnPoint) => {
        ship.sprite = new ShipSprite(this.scene.scene, spawnPoint.x, spawnPoint.y, ship.asset, this.projectiles, ship);
        //Can spawn from a planet or some edge if jumping in
        ship.sprite.setVelocity(spawnPoint.xVelocity*ship.maxSpeed, spawnPoint.yVelocity*-ship.maxSpeed)
        ship.sprite.rotation = spawnPoint.rotation
        this.ships.set(ship.id, ship)
        this.shipArray.push(ship)
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

    playerShotAsteroid = (projectile:any, asteroid:any) =>
    {
        projectile.destroy();
        asteroid.data.values.hp-=1
        //TODO: send asteroid hp reduction message with id of projectile to destroy also

        if(asteroid.data.values.hp <= 0){
            asteroid.destroy()
            this.resources.get(asteroid.x, asteroid.y, asteroid.data.values.assetKey)
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

