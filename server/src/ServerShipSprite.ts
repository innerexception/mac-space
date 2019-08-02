import { GameObjects, Physics, Scene, } from "phaser";

export default class ServerShipSprite extends Physics.Arcade.Sprite {

    projectiles: GameObjects.Group
    landingSequence: boolean
    jumpSequence: boolean
    landingTarget: GameObjects.Sprite
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
                        //TODO: send player left message and send player entered message with system entry vector
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
        this.rotation -= this.shipData.turn
    }
    rotateRight = () => {
        this.rotation += this.shipData.turn
    }
    thrust = () => {
        let vector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        this.setAcceleration(vector.x*this.shipData.maxSpeed, vector.y*-this.shipData.maxSpeed); //negative b/c y is inverted in crazyland
    }
    thrustOff = () => {
        this.setAcceleration(0,0)
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
                    }
                })
                this.landingSequence = false
            }
        }
    }

    applyUpdate = (update:ShipUpdate) => {
        //not used on server side
    }

}


