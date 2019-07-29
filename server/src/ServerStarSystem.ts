import { Scene, GameObjects, Physics, } from "phaser";
import Projectile from '../../client/components/util/display/Projectile'
import ShipSprite from './ServerShipSprite'

export default class ServerStarSystem extends Scene {

    ships: Array<Physics.Arcade.Sprite>
    planets: Array<GameObjects.Sprite>
    asteroids: Array<Physics.Arcade.Sprite>
    resources: GameObjects.Group
    projectiles: GameObjects.Group
    name: string
    assetList: Array<Asset>

    constructor(config, assetList:Array<Asset>){
        super(config)
        this.assetList = assetList
        this.name = config.key
        console.log('star system '+this.name+' is booting.')
    }

    preload = () =>
    {
        this.assetList.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
    }
    
    create = () =>
    {
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBoundsCollision();

        this.projectiles = this.physics.add.group({ classType: Projectile  })
        this.projectiles.runChildUpdate = true

        this.asteroids = this.addAsteroids();
        this.planets = [this.add.sprite(500,550,'planet')]
        
        this.physics.add.collider(this.projectiles, this.asteroids, this.playerShotAsteroid);
    }
    
    update = (time, delta) =>
    {
        //TODO: use delta to fire position updates at 100ms interval for client reconciliation
    }

    addAsteroids ()
    {
        this.resources = this.add.group()
        this.physics.add.collider(this.resources, this.ships, this.playerGotResource);

        let asteroids = []
        for(var i=0; i< 24; i++){
            asteroids.push(this.physics.add.sprite(0,0,'asteroid1')
                .setScale(Phaser.Math.FloatBetween(0.8,0.1))
                .setRotation(Phaser.Math.FloatBetween(3,0.1)))
        }
        for(var i=0; i< 48; i++){
            asteroids.push(this.physics.add.sprite(0,0,'asteroid2')
                .setScale(Phaser.Math.FloatBetween(0.8,0.1))
                .setRotation(Phaser.Math.FloatBetween(3,0.1)))
        }

        var rect = new Phaser.Geom.Ellipse(1600, 1600, 1000, 1000);
        Phaser.Actions.RandomEllipse(asteroids, rect);

        asteroids.forEach((sprite:Physics.Arcade.Sprite)=>{
            let d=Phaser.Math.Between(700,1000)
            let r=Phaser.Math.FloatBetween(-0.01,0.1)
            sprite.setData('hp', 3)
            this.time.addEvent({
                delay: 1, 
                callback: ()=>{
                    sprite.rotation+=r
                    Phaser.Actions.RotateAroundDistance([sprite], { x: 1600, y: 1600 }, 0.001, d)
                },
                loop: true 
            });
        })
        return asteroids
    }

    playerRotateLeft = (player:Player) => {
        //TODO: message
    }

    playerRotateRight = (player:Player) => {
        //TODO: message
    }

    playerThrust = (player:Player) => {
        //TODO: message
    }

    playerEntered = (player:Player, jumpVector:Tuple) => {
        //TODO: send player entered system message with player id and entry vector
        //  Add ships that exist
        const activeShip = player.ships.find(ship=>ship.id===player.activeShipId)
        activeShip.sprite = new ShipSprite(this.scene.scene, 1600, 400, activeShip.asset, this.projectiles, activeShip);
        activeShip.sprite.setVelocity(jumpVector.x*500, jumpVector.y*-500)
        activeShip.sprite.rotation = jumpVector.rotation
        this.ships.push(activeShip.sprite)
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

