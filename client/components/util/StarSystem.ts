import { Scene, Cameras, GameObjects, Physics, } from "phaser";
import { Arcturus, Rigel, StarSystems } from "../../data/StarSystems";
import Projectile from "./display/Projectile";
import ShipSprite from "./display/ShipSprite";
import * as Ships from '../../data/Ships'
import WebsocketClient from "../../WebsocketClient";
import { store } from "../../App";
import { onToggleMapMenu, onConnectionError, onConnected } from "../uiManager/Thunks";
import { PlayerEvents, ReducerActions, ServerMessages } from "../../../enum";

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
    selectedSystem: SystemState
    selectedPlanetIndex: number
    name: string
    jumpedIn: boolean
    state:SystemState
    server: WebsocketClient
    unsubscribeRedux: Function
    loginName: string
    loginPassword: string

    constructor(config, jumpedIn?:boolean){
        super(config)
        this.jumpedIn = jumpedIn
        this.state = config.initialState
        this.name = config.key
        this.server = config.server
        this.ships = new Map()
        this.asteroids = new Map()
        this.planets = []
        this.resources = new Map()
        this.selectedPlanetIndex = 0
        this.unsubscribeRedux = store.subscribe(this.onReduxUpdate)
        this.loginName = config.loginName
        this.loginPassword = config.loginPassword
        this.player = config.player
    }

    onReduxUpdate = () => {
        if(this.activeShip) {
            this.activeShip.shipData = this.player.ships.find(ship=>ship.id === this.player.activeShipId)
            let playerEvent = store.getState().playerEvent
            switch(playerEvent){
                case PlayerEvents.SELECT_SYSTEM:
                    let name = store.getState().systemName
                    console.log(store.getState())
                    this.selectedSystem = StarSystems.find(system=>system.name===name)
                    break
                default:
                    this.activeShip.addShipUpdate(this.activeShip, playerEvent)
            }
        }
    }

    onConnected = () => {
        onConnected()
        console.log('star system '+this.name+' connected!')
    }

    onConnectionError = () => {
        onConnectionError()
        console.log('star system '+this.name+' FAILED to connect.')
    }

    onServerUpdate = (payload:ServerMessage) => {
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
                    if(update.shipData.transientData.targetSystemName){
                        //We jumped somewhere else, change the scene over
                        const system = StarSystems.find(system=>system.name === update.shipData.transientData.targetSystemName)
                        if(ship.isPlayerControlled){
                            this.scene.add(system.name, new StarSystem({key:system.name, server:this.server, initialState: system, player:this.player}, true), false)
                            this.scene.start(system.name)
                            this.unsubscribeRedux()
                            this.scene.remove()
                        }
                        else{
                            //Somebody else left...
                            this.ships.delete(ship.shipData.id)
                            console.log('destryed ship with id: '+ship.shipData.id)
                            ship.destroy()
                        }
                    }
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
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBounds(0,0,3200,3200)
        this.physics.world.setBoundsCollision();
        this.minimap = this.cameras.add(0, 0, 100, 100).setZoom(0.1).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 400;

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

        //we need to wait until the server gives us a ship to focus on
        this.time.addEvent({ delay: 100, callback: this.checkForActiveShip, loop: true });
        
        this.input.keyboard.on('keydown-L', (event) => {
            this.selectedPlanetIndex = (this.selectedPlanetIndex + 1) % this.planets.length
            this.activeShip.startLandingSequence(this.planets[this.selectedPlanetIndex])
        });
        this.input.keyboard.on('keydown-J', (event) => {
            if(this.selectedSystem) this.activeShip.startJumpSequence(this.selectedSystem)
            else console.log('no system selected...')
        })
        this.input.keyboard.on('keydown-SPACE', (event) => {
            this.activeShip.firePrimary()
        });
        this.input.keyboard.on('keydown-M', (event) => {
            onToggleMapMenu(true, this.activeShip.shipData)
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.server.setListeners(this.onWSMessage, this.onConnected, this.onConnectionError)
    }
    
    onWSMessage = (data:any) => {
        const payload = JSON.parse(data.data) as ServerMessage
        switch(payload.type){
            case ServerMessages.SERVER_UPDATE: 
                this.onServerUpdate(payload)
                break
            case ServerMessages.PLAYER_DATA_UPDATED:
                this.onReplacePlayer(payload)
                break
        }
    }

    onReplacePlayer = (payload:ServerMessage) => {
        this.player = (payload.event as Player)
    }

    checkForActiveShip = () => {
        let activeShipData = this.player.ships.find(shipData=>shipData.id===this.player.activeShipId)
        this.activeShip = this.ships.get(activeShipData.id)
        if(this.activeShip){
            //means the server already spawned it for us
            this.activeShip.shipData.systemName = this.name
            this.activeShip.isPlayerControlled = true
            this.time.removeAllEvents()
            if(this.jumpedIn){
                console.log('jumped in...')
                this.cameras.main.flash(500)
            }
            else{
                this.activeShip.takeOff()
                // //run take-off tween
            }
        }
        else {
            //We should spawn it
            //This is our starting sector so we spawn ourselves
            let activeShipData = this.player.ships.find(shipData=>shipData.id===this.player.activeShipId)
            this.activeShip = new ShipSprite(this.scene.scene, this.planets[0].x, this.planets[0].y, activeShipData.asset, this.projectiles, true, activeShipData, this.server);
            this.ships.set(this.activeShip.shipData.id, this.activeShip)
            activeShipData.systemName = this.name
            //Add player ship notification
            this.activeShip.sendSpawnUpdate()
            this.activeShip.takeOff()
            //run take-off tween
        }
    }

    update = () =>
    {
        if(this.activeShip){
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
            //  Position the center of the camera on the player
            //  we want the center of the camera on the player, not the left-hand side of it
            this.cameras.main.scrollX = this.activeShip.x - 200;
            this.cameras.main.scrollY = this.activeShip.y - 200;
            this.minimap.scrollX = this.activeShip.x;
            this.minimap.scrollY = this.activeShip.y;
        }
    }
    
    spawnShip = (config:ShipData, spawnPoint:PlayerSpawnPoint) => {
        let shipData = {...Ships[config.name], ...config}
        shipData.systemName = this.name
        let ship = new ShipSprite(this.scene.scene, spawnPoint.x, spawnPoint.y, shipData.asset, this.projectiles, false, shipData, this.server)
        ship.rotation = spawnPoint.rotation
        if(spawnPoint.xVelocity){
            //TODO: set starting edge coords based on previous system coords, right now defaults to top left corner
            ship.setVelocity(spawnPoint.xVelocity*500, spawnPoint.yVelocity*-500)
        }
        this.ships.set(shipData.id, ship)
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
            planets.push(this.add.sprite(obj.x, obj.y, obj.asset).setData('state', {...obj}))
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
            // var sf = Math.max(0.3, Math.random());
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
        this.asteroids.set(update.id, rez)
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
        console.log('destryed ship with id: '+ship.shipData.id)
        ship.destroy()
    }

    destroyResource = (resource:Physics.Arcade.Sprite) => {
        this.resources.delete(resource.getData('state').id)
        resource.destroy()
    }
}