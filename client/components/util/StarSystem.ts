import { Scene, Cameras, GameObjects, Physics, } from "phaser";
import { Arcturus, Rigel } from "../../data/StarSystems";
import Projectile from "./display/Projectile";
import ShipSprite from "./display/ShipSprite";
import * as Ships from '../../data/Ships'
import WebsocketClient from "../../WebsocketClient";
import { store } from "../../App";

export default class StarSystem extends Scene {

    minimap: Cameras.Scene2D.BaseCamera
    player: Player
    activeShip: ShipSprite
    ships: Map<string,ShipSprite>
    planets: Array<GameObjects.Sprite>
    asteroids: Map<string, Physics.Arcade.Sprite>
    explosions: GameObjects.Group
    resources: Map<string, Physics.Arcade.Sprite>
    projectiles: Physics.Arcade.Group
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    currentSystem: SystemState
    selectedSystem: SystemState
    name: string
    jumpVector: JumpVector
    state:SystemState
    server: WebsocketClient

    constructor(config, jumpVector?:JumpVector){
        super(config)
        this.jumpVector = jumpVector
        this.state = config.initialState
        this.name = config.key
        this.server = config.server
        this.ships = new Map()
        this.asteroids = new Map()
        this.planets = []
        this.resources = new Map()
    }

    onReduxUpdate = () => {
        //TODO: rebuild ship sprites if needed (you bought a new ship or upgrade, etc)
        this.player = store.getState().currentUser
        // store.subscribe(this.onReduxUpdate)
    }

    onConnected = () => {
        console.log('star system '+this.name+' connected!')
    }

    onConnectionError = () => {
        console.log('star system '+this.name+' FAILED to connect.')
    }

    onServerUpdate = (data:any) => {
        const payload = JSON.parse(data.data) as ServerMessage
        if(payload.system === this.name){
            const state = payload.event as ServerSystemUpdate
            let initRoids = this.asteroids.size === 0
            state.asteroids.forEach(update=> {
                let asteroid = this.asteroids.get(update.id)
                if(asteroid){
                    if(update.dead){
                        this.destroyAsteroid(asteroid)
                    }
                    else {
                        this.tweens.add({
                            targets: asteroid,
                            x: update.x,
                            y: update.y,
                            duration: 100
                        })
                        asteroid.getData('state').hp = update.hp
                    }
                }
                else {
                    console.log('spawning new asteroid at '+update.x+','+update.y)
                    this.spawnAsteroid(update)
                }
            })
            if(initRoids){
                let roids = []
                this.asteroids.forEach(aster=>roids.push(aster))
                this.physics.add.overlap(this.projectiles, roids, this.playerShotAsteroid)
                console.log('asteroid physics init completed.')
            }
            
            state.ships.forEach(update=> {
                let ship = this.ships.get(update.shipData.id)
                if(ship){
                    if(update.shipData.hull <= 0){
                        this.destroyShip(ship)
                    }
                    else {
                        ship.applyUpdate(update)
                    }
                }
                else {
                    console.log('spawning new ship at '+update.shipData.x+','+update.shipData.y)
                    this.spawnShip(update.shipData, { x: this.planets[0].x, y: this.planets[0].y, rotation: 0 })
                }
            })

            state.resources.forEach(update => {
                let resource = this.resources.get(update.id)
                if(resource){
                    if(update.dead){
                        this.destroyResource(resource)
                    }
                    this.tweens.add({
                        targets: resource,
                        x: update.x,
                        y: update.y,
                        duration: 100
                    })
                }
                else {
                    console.log('spawned resource at '+update.x+','+update.y)
                    this.spawnResource(update)
                }
            })
        }
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
        this.player = store.getState().currentUser
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBounds(0,0,3200,3200)
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
        
        this.createStarfield()
        this.addPlanets()

        //  Add player ship
        let activeShipData = this.player.ships.find(shipData=>shipData.id===this.player.activeShipId)
        this.activeShip = new ShipSprite(this.scene.scene, this.planets[0].x, this.planets[0].y, activeShipData.asset, this.projectiles, true, activeShipData, this.server);
        this.ships.set(this.activeShip.shipData.id, this.activeShip)
        this.activeShip.sendSpawnUpdate()
        
        this.input.keyboard.on('keydown-L', (event) => {
            //TODO cycle available sites
            this.activeShip.startLandingSequence(this.planets[0])
        });
        this.input.keyboard.on('keydown-J', (event) => {
            this.activeShip.startJumpSequence(this.selectedSystem)
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.activeShip.firePrimary()
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.server.setListeners(this.onServerUpdate, this.onConnected, this.onConnectionError)
    }
    
    update = () =>
    {
        if(!this.activeShip.landingSequence){
            if (this.cursors.left.isDown)
            {
                this.activeShip.rotateLeft()
            }
            else if (this.cursors.right.isDown)
            {
                this.activeShip.rotateRight()
            }
            if (this.cursors.up.isDown)
            {
                this.activeShip.thrust()
            }
            else if((this.activeShip.body as any).acceleration.x !== 0 || (this.activeShip.body as any).acceleration.y !== 0) {
                this.activeShip.thrustOff()
            }
        }
        //  Position the center of the camera on the player
        //  we want the center of the camera on the player, not the left-hand side of it
        this.cameras.main.scrollX = this.activeShip.x - 200;
        this.cameras.main.scrollY = this.activeShip.y - 200;
        this.minimap.scrollX = this.activeShip.x;
        this.minimap.scrollY = this.activeShip.y;
    }
    
    spawnShip = (config:ShipData, spawnPoint:PlayerSpawnPoint) => {
        let shipData = {...Ships[config.name], ...config}
        let ship = new ShipSprite(this.scene.scene, spawnPoint.x, spawnPoint.y, shipData.asset, this.projectiles, false, shipData, this.server)
        ship.rotation = spawnPoint.rotation
        if(spawnPoint.xVelocity){
            //TODO: set starting edge coords based on previous system coords, right now defaults to top left corner
            ship.setVelocity(config.jumpVector.x*500, config.jumpVector.y*-500)
        }
        this.ships.set(shipData.id, ship)
        ship.setCollideWorldBounds(true)
    }

    spawnResource = (update:ResourceData) => {
        let rez = this.physics.add.sprite(update.x,update.y, update.type)
                .setData('state', {
                    id: update.id,
                    weight: 1,
                    type: update.type
                } as ResourceData)
                .setScale(0.1)
                .setRotation(Phaser.Math.FloatBetween(3,0.1))
        this.resources.set(update.id, rez)
        let ships = []
        this.ships.forEach(ship=>ships.push(ship))
        this.physics.add.overlap(ships, rez, this.playerGotResource)
    }

    addPlanets = () => {
        let planets = []
        this.state.stellarObjects.forEach(obj=>{
            planets.push(this.add.sprite(obj.x, obj.y, obj.asset))
        })
        this.planets = planets
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

    spawnAsteroid = (update:AsteroidData) => {
        let state = {
            type: update.type,
            hp: 3,
            id: update.id
        } as AsteroidData

        let rez = this.physics.add.sprite(update.x,update.y, update.type)
                .setData('state', state)
                .setScale(Phaser.Math.FloatBetween(0.8,0.1))
                .setRotation(Phaser.Math.FloatBetween(3,0.1))
        let ships = []
        this.asteroids.set(update.id, rez)
        this.ships.forEach(ship=>ships.push(ship))
        this.physics.add.overlap(ships, rez, this.playerGotResource)
    }

    playerGotResource = (player:ShipSprite, resource:Physics.Arcade.Sprite) =>
    {
        console.log('destroyed resource')
        //you'll get ur cargo if the server agrees
    }

    playerShotAsteroid = (asteroid:Physics.Arcade.Sprite, projectile:Projectile) =>
    {
        projectile.destroy();
    }

    destroyAsteroid = (asteroid:Physics.Arcade.Sprite) => {
        this.explosions.get(asteroid.x, asteroid.y, 'boom').play('explode')
        // this.asteroids.delete(asteroid.getData('state').id)
        this.asteroids.delete(asteroid.getData('state').id)
        asteroid.destroy()
    }

    destroyShip = (ship:ShipSprite) => {
        this.explosions.get(ship.x, ship.y, 'boom').play('explode')
        this.ships.delete(ship.shipData.id)
        ship.destroy()
    }

    destroyResource = (resource:Physics.Arcade.Sprite) => {
        this.resources.delete(resource.getData('state').id)
        resource.destroy()
    }
}