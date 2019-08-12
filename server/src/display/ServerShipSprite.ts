import { GameObjects, Physics, Scene, } from "phaser";
import ServerStarSystem from "../ServerStarSystem";
import GalaxyScene from "../GalaxyScene";
import { ServerMessages } from "../../../enum";
import { getCargoWeight } from '../../../client/components/util/Util'
import Planet from "./Planet";

export default class ServerShipSprite extends Physics.Arcade.Sprite {

    projectiles: GameObjects.Group
    landingSequence: Phaser.Tweens.Tween
    jumpSequence: boolean
    shipData: ShipData
    theGalaxy: GalaxyScene

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
        this.theGalaxy = (this.scene.scene.manager.scenes[0] as GalaxyScene)
    }

    startLandingSequence = (target:Planet) => {
        //landing sequence
        let distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
        let planetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
        this.scene.tweens.add({
            targets:this.body.velocity,
            x: 0,
            y: 0,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: 1500
        })
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
                    ease: Phaser.Math.Easing.Cubic.InOut,
                    duration,
                    onComplete: ()=>{
                        this.stopLandingSequence()
                        this.shipData.landedAt = target.config
                        console.log('landing sequence completed for: '+target.config.name)
                    }
                })
            }
        })
    }

    stopLandingSequence = () => {
        if(this.landingSequence) this.landingSequence.stop()
        this.shipData.transientData.landingTargetName = ''
    }

    takeOff = () => {
        console.log('take off')
        this.shipData.transientData.takeOff = true
        this.shipData.landedAt = null
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
                const duration = (distance/(this.shipData.maxSpeed))*50
                this.setCollideWorldBounds(false)
                this.scene.tweens.add({
                    targets: this,
                    x: targetSystem.x,
                    y: targetSystem.y,
                    duration: duration,
                    onComplete: ()=> {
                        const target = this.scene.scene.get(targetSystem.name) as ServerStarSystem
                        let newShip = target.spawnShip(this.shipData, {
                            x:100, y:100, rotation, 
                            xVelocity: systemVector.x*this.shipData.maxSpeed, 
                            yVelocity: systemVector.y*this.shipData.maxSpeed
                        });
                        newShip.shipData.transientData.targetSystemName = targetSystem.name;
                        newShip.shipData.systemName = targetSystem.name;
                        newShip.shipData.fuel = this.shipData.fuel-1;
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
            this.shipData.transientData.firePrimary = true
        }
    }

    fireSecondary = () => {

    }

    buyOutfit = (equipment:ShipOutfit) => {
        //TODO
    }

    processOrder = (order:CommodityOrder) => {
        const player = this.theGalaxy.players.get(this.shipData.ownerId)
        if(player){
            let planet = (this.scene as ServerStarSystem).planets.find(planet=>planet.config.name === this.shipData.landedAt.name)
            let planetData = planet.config
            let commodity = planetData.commodities.find(commodity=>commodity.name===order.commodity.name)
            let price = commodity.price * order.amount
            if(order.buy){
                if(player.credits >= price && this.shipData.maxCargoSpace - getCargoWeight(this.shipData) >= order.amount){
                    let existing = this.shipData.cargo.find(cargo=>cargo.name===order.commodity.name)
                    if(existing)
                        existing.weight += order.amount
                    else 
                        this.shipData.cargo.push({
                            name: commodity.name,
                            weight: order.amount,
                            asset: ''
                        })
                    player.credits -= price
                    console.log('buy processed order, new credits: '+player.credits)
                }
            }
            else {
                let existing = this.shipData.cargo.find(cargo=>cargo.name===order.commodity.name)
                if(existing && existing.weight >= order.amount) {
                    existing.weight -= order.amount
                    player.credits += price
                }
                if(existing.weight <= 0){
                    this.shipData.cargo = this.shipData.cargo.filter(item=>item.name !== order.commodity.name)
                }
                console.log('sell processed order, new credits: '+player.credits)
            }
            player.ships = player.ships.map(ship=>{
                if(ship.id===this.shipData.id) return this.shipData
                return ship
            })
            this.theGalaxy.server.publishMessage({ type: ServerMessages.PLAYER_DATA_UPDATE, event: player, system:'' })
        }
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

    //Custom sprite needs this magical named method for update
    // preUpdate = (time, delta) =>
    // { }

    // applyUpdate = (update:ShipUpdate) => {
    //     //not used on server side
    // }

}


