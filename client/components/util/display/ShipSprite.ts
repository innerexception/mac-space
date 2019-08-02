import { GameObjects, Physics, Scene, } from "phaser";
import System from "../StarSystem";
import { onTogglePlanetMenu } from "../../uiManager/Thunks";
import WebsocketClient from "../../../WebsocketClient";
import { PlayerEvents, ServerMessages } from "../../../../enum";
import StarSystem from "../StarSystem";

export default class ShipSprite extends Physics.Arcade.Sprite {

    thruster: GameObjects.Particles.ParticleEmitter
    projectiles: GameObjects.Group
    jumpSequence: boolean
    isPlayerControlled: boolean
    shipData: ShipData
    lastAckSequence: number
    bufferedInputs: Array<ShipUpdate>
    server:WebsocketClient

    constructor(scene:Scene, x:number, y:number, texture:string, projectiles:GameObjects.Group, isPlayerControlled:boolean, ship:ShipData, server:WebsocketClient){
        super(scene, x, y, texture)
        this.server=server
        this.bufferedInputs = []
        this.scene.add.existing(this)
        this.scene.physics.world.enable(this);
        this.shipData = ship
        this.scaleX = 0.3
        this.scaleY = 0.3
        this.setMaxVelocity(ship.maxSpeed).setFriction(400, 400);
        this.thruster = this.scene.add.particles('proton').createEmitter({
            x: this.x,
            y: this.y,
            angle: this.angle,
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 150,
            on: false
        });
        this.thruster.setSpeed(100)
        this.depth = 3
        this.projectiles = projectiles
        this.isPlayerControlled = isPlayerControlled
        
    }

    takeOff = () => {
        this.setScale(0,0)
        this.scene.tweens.add({
            targets: this,
            duration: 1500,
            scaleX: 0.3,
            scaleY: 0.3
        })
    }

    landing = () => {
        this.scene.tweens.add({
            targets: this,
            duration: 1500,
            scaleX: 0,
            scaleY: 0
        })
    }

    sendSpawnUpdate = () => {
        this.addShipUpdate(this, PlayerEvents.PLAYER_SPAWNED)
    }

    startLandingSequence = (target:GameObjects.Sprite) => {
        //landing sequence
        this.shipData.landingTargetId = 'teehee'
        this.addShipUpdate(this, PlayerEvents.START_LANDING)
    }

    stopLandingSequence = () => {
        //done on server...
    }

    startJumpSequence = (targetSystem:SystemState) => {
        //jump sequence, pass to next system.
        this.shipData.targetSystemName = targetSystem.name
        this.addShipUpdate(this, PlayerEvents.START_JUMP)
    }

    firePrimary = () => {
        const projectile = this.projectiles.get().setActive(true).setVisible(true)
        if(projectile){
            projectile.fire(this)
            if(this.isPlayerControlled)
                this.addShipUpdate(this, PlayerEvents.FIRE_PRIMARY)
        }
    }

    fireSecondary = () => {

    }

    rotateLeft = () => {
        if(this.shipData.landingTargetId) this.addShipUpdate(this, PlayerEvents.STOP_LANDING)
        this.rotation -= this.shipData.turn
        this.addShipUpdate(this, PlayerEvents.ROTATE_L)
    }
    rotateRight = () => {
        if(this.shipData.landingTargetId) this.addShipUpdate(this, PlayerEvents.STOP_LANDING)
        this.rotation += this.shipData.turn
        this.addShipUpdate(this, PlayerEvents.ROTATE_R)
    }

    thrust = () => {
        if(this.shipData.landingTargetId) this.addShipUpdate(this, PlayerEvents.STOP_LANDING)
        let vector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        this.setAcceleration(vector.x*this.shipData.maxSpeed, vector.y*-this.shipData.maxSpeed); //negative b/c y is inverted in crazyland
        this.thruster.emitParticle(16);
        this.addShipUpdate(this, PlayerEvents.THRUST)
    }

    thrustOff = () => {
        this.thruster.stop()
        this.setAcceleration(0,0)
        this.addShipUpdate(this, PlayerEvents.THRUST_OFF)
    }

    //Custom sprite needs this magical named method
    preUpdate = (time, delta) =>
    {
        //Align thruster nozzle
        let vector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        this.thruster.setPosition(this.x + vector.x, this.y +vector.y);
        this.thruster.setAngle(this.angle+45)
    }

    applyUpdate = (update:ShipUpdate) => {
        this.lastAckSequence = update.sequence
        //Here we need to re-apply any inputs the server hasn't yet applied in the update, 
        //Else our ship will jump backwards on most connections
        for(let i=0; i<this.bufferedInputs.length; i++){
            let bupdate = this.bufferedInputs[i]
            if(bupdate.sequence <= this.lastAckSequence)
                this.bufferedInputs.splice(i, 1)
            else {
                this.applyState(bupdate.shipData)
            }
        }
        this.applyState(update.shipData, true)
    }

    applyState = (update:ShipData, doTween?:boolean) => {
        if(doTween){
            this.scene.add.tween({
                targets: this,
                x: update.x,
                y: update.y,
                rotation: update.rotation, //TODO: clamp to shortest rotation distance
                duration: 50
            })
        }
        else{
            this.setPosition(update.x, update.y)
            this.rotation = update.rotation
        }
        this.setVelocity(update.velocity.x, update.velocity.y)
        if(update.firePrimary && !this.isPlayerControlled) this.firePrimary()
    }

    addShipUpdate = (ship:ShipSprite, event:PlayerEvents) => {
        let update = {
            id: ship.shipData.id,
            sequence: Date.now(),
            type: event,
            shipData: {
                ...ship.shipData, 
                fighters: [] ,
                x: ship.x,
                y: ship.y,
                rotation: ship.rotation,
                velocity: ship.body.velocity,
                firePrimary: event === PlayerEvents.FIRE_PRIMARY
            }
        }
        this.server.publishMessage({
            type: ServerMessages.PLAYER_EVENT, 
            event: update,
            system: (this.scene as StarSystem).name
        })
        this.bufferedInputs.push(update)
    }
}