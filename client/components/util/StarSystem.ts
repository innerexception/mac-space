import { Scene, Cameras, GameObjects, Physics, } from "phaser";
import { Arcturus, Rigel } from "../../data/StarSystems";
import Projectile from "./display/Projectile";
import ShipSprite from "./display/ShipSprite";
import { store } from "../../App";

export default class StarSystem extends Scene {

    minimap: Cameras.Scene2D.BaseCamera
    player: Player
    activeShip: Ship
    planet: GameObjects.Sprite
    asteroids: Array<Physics.Arcade.Sprite>
    resources: GameObjects.Group
    explosions: GameObjects.Group
    projectiles: GameObjects.Group
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    currentSystem: SystemState
    selectedSystem: SystemState
    name: string
    jumpVector: Tuple
    assetList: Array<Asset>

    constructor(config, assetList:Array<Asset>, jumpVector?:Tuple){
        super(config)
        this.jumpVector = jumpVector
        this.assetList = assetList
        console.log('star system '+config.name+' was booted.')
    }

    onReduxUpdate = () => {
        //TODO: rebuild ship sprites if needed
        this.player = store.getState().currentUser
        store.subscribe(this.onReduxUpdate)
    }
    
    preload = () =>
    {
        this.assetList.forEach(asset=>{
            (this.load[asset.type] as any)(asset.key, asset.resource, asset.data)
        })
    }
    
    create = () =>
    {
        this.onReduxUpdate()
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBoundsCollision();
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        this.minimap = this.cameras.add(0, 0, 100, 100).setZoom(0.1).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 400;
        
        this.selectedSystem = Arcturus
        this.currentSystem = Rigel

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 23, first: 23 }),
            frameRate: 20
        });

        this.explosions = this.add.group()

        this.projectiles = this.physics.add.group({ classType: Projectile  })
        this.projectiles.runChildUpdate = true

        //  Add a player ship
        this.activeShip = this.player.ships.find(ship=>ship.id===this.player.activeShipId)
        this.activeShip.sprite = new ShipSprite(this.scene.scene, 1600, 400, this.activeShip.asset, this.projectiles, true, this.activeShip);

        this.createStarfield();
        this.addAsteroids();
        this.planet = this.add.sprite(500,550,'planet')
        
        this.physics.add.collider(this.projectiles, this.asteroids, this.playerShotAsteroid);

        if(this.jumpVector){
            this.activeShip.sprite.setVelocity(this.jumpVector.x*500, this.jumpVector.y*-500)
            this.activeShip.sprite.rotation = this.jumpVector.rotation
        } 
    
        this.input.keyboard.on('keydown-L', (event) => {
            //TODO cycle available sites
            //this.planets.getNext().setSelected()
            this.activeShip.sprite.startLandingSequence(this.planet)
        });
        this.input.keyboard.on('keydown-J', (event) => {
            this.activeShip.sprite.startJumpSequence(this.selectedSystem)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.activeShip.sprite.firePrimary()
        });
    }
    
    update = () =>
    {
        //  Position the center of the camera on the player
        //  we want the center of the camera on the player, not the left-hand side of it
        this.cameras.main.scrollX = this.activeShip.sprite.x - 200;
        this.cameras.main.scrollY = this.activeShip.sprite.y - 200;
        this.minimap.scrollX = Phaser.Math.Clamp(this.activeShip.sprite.x, 0, 3000);
        this.minimap.scrollY = Phaser.Math.Clamp(this.activeShip.sprite.y, 0, 3000);
    }
    
    createStarfield ()
    {
        //  Starfield background
    
        //  Note the scrollFactor values which give them their 'parallax' effect
    
        var group = this.add.group();
    
        group.createMultiple([
            { key: 'bigStar', frameQuantity: 64, setScale: {x: 0.02, y:0.02} }, 
            { key: 'star', frameQuantity: 256, setScale: {x: 0.02, y:0.02} }
        ]);
    
        var rect = new Phaser.Geom.Rectangle(0, 0, 3200, 3200);
    
        Phaser.Actions.RandomRectangle(group.getChildren(), rect);
    
        group.children.iterate((child, index) => {
    
            var sf = Math.max(0.3, Math.random());
            this.minimap.ignore(child);
            
            
        }, this);
    }

    addAsteroids ()
    {
        this.resources = this.add.group()
        this.physics.add.collider(this.resources, this.activeShip.sprite, this.playerGotResource);

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
        this.asteroids = asteroids
    }

    playerGotResource = (player:Physics.Arcade.Sprite, resource:GameObjects.Sprite) =>
    {
        resource.destroy();
        //TODO
        //onAddCargo(resource.data.values.type, resource.data.values.weight)
    }

    playerShotAsteroid = (asteroid:Physics.Arcade.Sprite, projectile:Projectile) =>
    {
        projectile.destroy();
        asteroid.data.values.hp-=1

        if(asteroid.data.values.hp <= 0){
            this.explosions.get(asteroid.x, asteroid.y, 'boom').play('explode')
            asteroid.destroy()
            //TODO: spawn resources
            this.resources.get(asteroid.x, asteroid.y, asteroid.data.values.assetKey)
        }
    }

    playerTouchedResource = (resource:Physics.Arcade.Sprite, player:Physics.Arcade.Sprite) =>
    {
        resource.destroy()
        player.data.values.resources++
    }
}

