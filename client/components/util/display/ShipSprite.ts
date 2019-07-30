import { GameObjects, Physics, Scene, } from "phaser";
import System from "../StarSystem";
import { onTogglePlanetMenu } from "../../uiManager/Thunks";
import { server } from "../../../App";

export default class ShipSprite extends Physics.Arcade.Sprite {

    thruster: GameObjects.Particles.ParticleEmitter
    projectiles: GameObjects.Group
    landingSequence: boolean
    jumpSequence: boolean
    landingTarget: GameObjects.Sprite
    isPlayerControlled: boolean
    shipData: Ship
    lastAckSequence: number
    bufferedInputs: Array<ShipUpdate>

    constructor(scene:Scene, x:number, y:number, texture:string, projectiles:GameObjects.Group, isPlayerControlled:boolean, ship:Ship){
        super(scene, x, y, texture)
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

    startLandingSequence = (target:GameObjects.Sprite) => {
        //landing sequence
        let planetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
        this.setMaxVelocity(this.shipData.maxSpeed/2)
        this.scene.tweens.add({
            targets: this,
            rotation: planetAngle+(Math.PI/2),
            duration: 1500,
            onComplete: ()=>{
                this.landingSequence = true
                this.landingTarget = target
            }
        })
    }

    startJumpSequence = (targetSystem:SystemState) => {
        //jump sequence, pass to next system.
        let systemAngle = Phaser.Math.Angle.Between(this.x, this.y, targetSystem.x, targetSystem.y)
        const rotation = systemAngle+(Math.PI/2)
        let systemVector = { x: Math.sin(rotation), y: Math.cos(rotation), rotation}
        let targetScene = this.scene.scene.get(targetSystem.name)
        if(!targetScene)
            this.scene.scene.add(
                targetSystem.name, 
                new System({ key: targetSystem.name, active: false, visible:false }, targetSystem, systemVector), 
                false
            )
        this.scene.physics.world.setBoundsCollision(false, false, false, false)
        this.scene.tweens.add({
            targets: this,
            rotation: systemAngle+(Math.PI/2),
            duration: 1500,
            onComplete: ()=>{
                this.jumpSequence = true
                this.scene.tweens.add({
                    targets: this,
                    x: targetSystem.x,
                    y: targetSystem.y,
                    duration: 2000,
                    onComplete: ()=> {
                        if(this.isPlayerControlled){
                            this.scene.cameras.main.flash(500)
                            this.scene.scene.switch(targetSystem.name)
                            this.setPosition(1600, 400)
                            this.jumpSequence = false
                            this.scene.physics.world.setBoundsCollision()
                        }
                    }
                })
            }
        })
    }

    firePrimary = () => {
        const projectile = this.projectiles.get().setActive(true).setVisible(true)
        if(projectile){
            projectile.fire(this)
            this.addShipUpdate(this.shipData, PlayerEvents.FIRE_PRIMARY)
        }
    }

    fireSecondary = () => {

    }

    rotate = (rotate:number) => {
        this.rotation += rotate
        this.addShipUpdate(this.shipData, PlayerEvents.ROTATE)
    }

    thrust = () => {
        let vector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        this.setAcceleration(vector.x*this.shipData.maxSpeed, vector.y*-this.shipData.maxSpeed); //negative b/c y is inverted in crazyland
        this.thruster.emitParticle(16);
        this.addShipUpdate(this.shipData, PlayerEvents.THRUST)
        
    }

    thrustOff = () => {
        this.thruster.stop()
        this.setAcceleration(0,0)
        this.addShipUpdate(this.shipData, PlayerEvents.THRUST_OFF)
    }

    //Custom sprite needs this magical named method
    preUpdate = (time, delta) =>
    {
        if(this.landingSequence){
            let distance = Phaser.Math.Distance.Between(this.x, this.y, this.landingTarget.x, this.landingTarget.y)
            let planetAngle = Phaser.Math.Angle.Between(this.x, this.y, this.landingTarget.x, this.landingTarget.y)
            this.rotation = planetAngle+(Math.PI/2)
            let planetVector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
            
            if(distance > 250){
                this.setAcceleration(planetVector.x*(this.shipData.maxSpeed/2), planetVector.y*-(this.shipData.maxSpeed/2))
            }
            else if(distance <=250){
                this.scene.tweens.add({
                    targets: this,
                    x: this.landingTarget.x,
                    y: this.landingTarget.y,
                    duration: 2000,
                    onComplete: ()=>{
                        this.setVelocity(0,0)
                        this.setMaxVelocity(this.shipData.maxSpeed)
                        if(this.isPlayerControlled) onTogglePlanetMenu(true)
                    }
                })
                this.landingSequence = false
            }
        }
        
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
                this.applyState(bupdate)
            }
        }
    }

    applyState = (update:ShipUpdate) => {
        switch(update.type){
            case PlayerEvents.THRUST:
                this.setAcceleration(update.shipData.acceleration.x, update.shipData.acceleration.y)
                break
            case PlayerEvents.THRUST_OFF:
                this.setAcceleration(0,0)
                break
            case PlayerEvents.FIRE_PRIMARY:
                break
            case PlayerEvents.ROTATE:
                this.rotation = update.shipData.rotation
                break
        }
    }

    addShipUpdate = (ship:Ship, event:PlayerEvents) => {
        let update = {
            id: ship.id,
            sequence: Date.now(),
            type: event,
            shipData: {
                ...ship, 
                sprite: null, 
                jumpVector: null, 
                fighters: [] ,
                x: ship.sprite.x,
                y: ship.sprite.y,
                rotation: ship.sprite.rotation,
                acceleration: (ship.sprite.body as any).acceleration
            }
        }
        server.publishMessage({
            type: ServerMessages.PLAYER_EVENT, 
            event: update
        })
        this.bufferedInputs.push(update)
    }
}

const getValueForEvent = (event:PlayerEvents, ship:ShipSprite) => {
    switch(event){
        case PlayerEvents.FIRE_PRIMARY:
            return true
        case PlayerEvents.ROTATE:
            return ship.rotation
        case PlayerEvents.THRUST:
            return (ship.body as any).acceleration
        case PlayerEvents.THRUST_OFF:
            return true
    }
}