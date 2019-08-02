import { GameObjects, Physics, Scene, } from "phaser";
import ServerStarSystem from "./ServerStarSystem";

export default class ServerShipSprite extends Physics.Arcade.Sprite {

    projectiles: GameObjects.Group
    landingSequence: Phaser.Tweens.Tween
    jumpSequence: boolean
    shipData: ShipData

    constructor(scene:Scene, x:number, y:number, texture:string, projectiles:GameObjects.Group, ship:ShipData){
        super(scene, x, y, texture)
        this.scene.add.existing(this)
        this.scene.physics.world.enable(this);
        this.shipData = ship
        this.scaleX = 0.3
        this.scaleY = 0.3
        this.setMaxVelocity(ship.maxSpeed).setFriction(400, 400);
        this.depth = 3
        this.projectiles = projectiles
    }

    startLandingSequence = (target:GameObjects.Sprite) => {
        //landing sequence
        let distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
        let planetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
        this.scene.tweens.add({
            targets: this,
            rotation: planetAngle+(Math.PI/2),
            duration: 1500,
            onComplete: ()=>{
                const duration = (distance/(this.shipData.maxSpeed/2))*1000
                this.setVelocity(0,0)
                this.landingSequence = this.scene.tweens.add({
                    targets: this,
                    x: target.x,
                    y: target.y,
                    ease: Phaser.Math.Easing.Cubic.Out,
                    duration,
                    onComplete: ()=>{
                        this.stopLandingSequence()
                    }
                })
            }
        })
    }

    stopLandingSequence = () => {
        if(this.landingSequence) this.landingSequence.stop()
    }

    startJumpSequence = (targetSystem:SystemState) => {
        //jump sequence, pass to next system.
        let distance = Phaser.Math.Distance.Between(this.x, this.y, targetSystem.x, targetSystem.y)
        let systemAngle = Phaser.Math.Angle.Between(this.x, this.y, targetSystem.x, targetSystem.y)
        const rotation = systemAngle+(Math.PI/2)
        let systemVector = { x: Math.sin(rotation), y: Math.cos(rotation), rotation}
        this.scene.tweens.add({
            targets: this,
            rotation: systemAngle+(Math.PI/2),
            duration: 1500,
            onComplete: ()=>{
                const duration = (distance/(this.shipData.maxSpeed))*100
                this.setCollideWorldBounds(false)
                this.scene.tweens.add({
                    targets: this,
                    x: targetSystem.x,
                    y: targetSystem.y,
                    duration: duration,
                    onComplete: ()=> {
                        const target = this.scene.scene.get(targetSystem.name) as ServerStarSystem
                        let newShip = target.spawnShip(this.shipData, {
                            x:10, y:10, rotation, 
                            xVelocity: systemVector.x*this.shipData.maxSpeed, 
                            yVelocity: systemVector.y*this.shipData.maxSpeed
                        });
                        newShip.shipData.targetSystemName = targetSystem.name;
                        (this.scene as ServerStarSystem).jumpingShips.push(newShip);
                        (this.scene as ServerStarSystem).ships.delete(this.shipData.id)
                        this.destroy()
                    }
                })
            }
        })
    }

    firePrimary = () => {
        const projectile = this.projectiles.get().setActive(true).setVisible(true)
        if(projectile){
            projectile.fire(this)
            this.shipData.firePrimary = true
        }
    }

    fireSecondary = () => {

    }

    rotateLeft = () => {
        if(this.landingSequence) this.landingSequence.stop()
        this.rotation -= this.shipData.turn
    }
    rotateRight = () => {
        if(this.landingSequence) this.landingSequence.stop()
        this.rotation += this.shipData.turn
    }
    thrust = () => {
        if(this.landingSequence) this.landingSequence.stop()
        let vector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        this.setAcceleration(vector.x*this.shipData.maxSpeed, vector.y*-this.shipData.maxSpeed); //negative b/c y is inverted in crazyland
    }
    thrustOff = () => {
        this.setAcceleration(0,0)
    }

    //Custom sprite needs this magical named method
    preUpdate = (time, delta) =>
    { }

    applyUpdate = (update:ShipUpdate) => {
        //not used on server side
    }

}


