import { GameObjects, Physics, Scene, } from "phaser";
import ServerStarSystem from "../ServerStarSystem";
import GalaxyScene from "../GalaxyScene";
import { ServerMessages, AiProfileType, FactionName, CargoType, MissionType } from "../../../enum";
import { getCargoWeight, getRandomPublicMission } from '../../../client/components/util/Util'
import Planet from "./Planet";
import Projectile from "./Projectile";
import { StarSystems } from "../data/StarSystems";

export default class ServerShipSprite extends Physics.Arcade.Sprite {

    projectiles: GameObjects.Group
    landingSequence: Phaser.Tweens.Tween
    jumpSequence: boolean
    shipData: ShipData
    theGalaxy: GalaxyScene
    aiEvent: Phaser.Time.TimerEvent
    nextAiEvent: number

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
        if(ship.aiProfile){
            ship.aiProfile.jumpedIn=true
            ship.aiProfile.attackTime=0
            ship.aiProfile.attackerId=''
            ship.aiProfile.targetShipId=''
            switch(ship.aiProfile.type){
                case AiProfileType.MERCHANT:
                    this.aiEvent = this.scene.time.addEvent({ delay: 500, callback: this.merchantAICombatListener, loop: true})
                    this.scene.time.addEvent({
                        delay: 3000,
                        callback: this.AiEvents.land
                    })
                    break
                case AiProfileType.PIRATE:
                    this.aiEvent = this.scene.time.addEvent({ delay: 500, callback: this.pirateAICombatListener, loop: true})
                    break
                case AiProfileType.POLICE:
                    this.aiEvent = this.scene.time.addEvent({ delay: 500, callback: this.policeAICombatListener, loop: true})
                    this.scene.time.addEvent({
                        delay: 3000,
                        callback: this.AiEvents.land
                    })
                    break
            }
        }
    
    }

    startBoardingSequence = (targetShipId:string) => {
        //boarding sequence
        let system = (this.scene as ServerStarSystem)
        let target = system.ships.get(targetShipId)
        let distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
        let planetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
        this.scene.tweens.add({
            targets: this,
            rotation: planetAngle+(Math.PI/2),
            duration: 1500,
            onComplete: ()=>{
                if(this.scene){
                    const duration = (distance/(this.shipData.maxSpeed/2))*1000
                    this.setVelocity(0,0)
                    this.landingSequence = this.scene.tweens.add({
                        targets: this,
                        x: target.x,
                        y: target.y,
                        ease: Phaser.Math.Easing.Cubic.InOut,
                        duration,
                        onComplete: ()=>{
                            console.log('boarding sequence completed for: '+this.shipData.id)
                            if(this.shipData.aiProfile){
                                this.scene && this.scene.time.addEvent({
                                    delay: 5000,
                                    callback: this.AiEvents.plunderAndTakeOff
                                })
                            }
                        }
                    })
                }
            }
        })
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
                if(this.scene){
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
                            this.shipData.landedAtName = target.config.planetName
                            console.log('landing sequence completed for: '+this.shipData.id)
                            if(this.shipData.aiProfile){
                                this.scene && this.scene.time.addEvent({
                                    delay: 5000,
                                    callback: this.AiEvents.takeOff
                                })
                            }
                        }
                    })
                }
            }
        })
    }

    stopLandingSequence = () => {
        if(this.landingSequence) this.landingSequence.stop()
        this.shipData.transientData.landingTargetName = ''
    }

    takeOff = () => {
        console.log('take off')
        this.shipData.landedAtName = null
        if(this.shipData.aiProfile){
            this.scene.time.addEvent({
                delay: 3000,
                callback: this.AiEvents.jump
            })
        }
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
                if(this.scene){
                    const duration = (distance/(this.shipData.maxSpeed))*50
                    this.setCollideWorldBounds(false)
                    this.scene.tweens.add({
                        targets: this,
                        x: targetSystem.x,
                        y: targetSystem.y,
                        duration: duration,
                        onComplete: ()=> {
                            if(this.scene){
                                const target = this.scene.scene.get(targetSystem.name) as ServerStarSystem
                                let x = Phaser.Math.Between(100,3000)
                                let newShip = target.spawnShip(this.shipData, {
                                    x, y:100, rotation, 
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
                        }
                    })
                }
            }
        })
    }

    firePrimary = (target?:ShipSprite) => {
        //TODO: change to fireOn/fireOff
        const projectile = this.projectiles.get().setActive(true).setVisible(true) as Projectile
        if(projectile){
            projectile.fire(this.shipData.weapons[this.shipData.selectedPrimaryIndex], this, target)
            this.shipData.transientData.firePrimary = true
        }
    }

    selectPrimary = () => {
        this.shipData.selectedPrimaryIndex = (this.shipData.selectedPrimaryIndex + 1) % this.shipData.weapons.length
    }

    fireSecondary = () => {

    }

    buyOutfit = (equipment:ShipOutfit) => {
        //TODO
    }

    acceptMission = (mission:Mission) => {
        const player = this.theGalaxy.players.get(this.shipData.ownerId)
        if(player){
            let planet = (this.scene as ServerStarSystem).planets.find(planet=>planet.config.planetName === this.shipData.landedAtName)
            let planetData = planet.config
            let sMission = planetData.missions.find(pmission=>pmission.id === mission.id)
            sMission.payment = sMission.payment ? sMission.payment : player.notoriety*100
            player.missions.push(sMission)
            if(mission.cargo)
                this.shipData.cargo.push(mission.cargo)
            if(mission.targets){
                if(mission.type === MissionType.DESTROY){
                    //TODO: spawn appropriate number of targets in system with PATROL ai so they don't leave
                }
                if(mission.type === MissionType.ESCORT){
                    //TODO: spawn number of merchant or vip ships to escort and give them a TRAVELTO ai
                }
            }
            if(mission.minimumTimeInSystem){
                //TODO: start the clock once this ship takes off
            }
            
            this.theGalaxy.server.publishMessage({ type: ServerMessages.PLAYER_DATA_UPDATE, event: player, system:'' })
            planetData.missions = planetData.missions.filter(pmission=>pmission.id !== mission.id)
            planetData.missions.push(getRandomPublicMission((this.scene as ServerStarSystem).state))
        }
    }

    completeMission = (mission:Mission) => {
        const player = this.theGalaxy.players.get(this.shipData.ownerId)
        if(player){
            let planet = (this.scene as ServerStarSystem).planets.find(planet=>planet.config.planetName === this.shipData.landedAtName)
            let planetData = planet.config
            if(mission.destinationPlanetName === planetData.planetName){
                let success = (mission.type === MissionType.DELIVERY && mission.destinationPlanetName === planetData.planetName) ||
                            (mission.type === MissionType.DESTROY && mission.targetsDestroyed) ||
                            (mission.type === MissionType.ESCORT && mission.escortsAlive) ||
                            (mission.type === MissionType.PATROL && mission.timeElapsedInSystem >= mission.minimumTimeInSystem)
                if(success){
                    player.credits += mission.payment
                    if(mission.type === MissionType.ESCORT || mission.type === MissionType.DESTROY){
                        player.notoriety+=1
                    }
                    if(mission.faction){
                        player.reputation.forEach(faction=>{
                            if(faction.name === mission.faction) faction.reputation+=1
                        })
                    }
                    player.missions = player.missions.filter(pmission=>mission.id!==pmission.id)
                }
            }
            this.theGalaxy.server.publishMessage({ type: ServerMessages.PLAYER_DATA_UPDATE, event: player, system:'' })
        }
    }

    abandonMission = (mission:Mission) => {
        const player = this.theGalaxy.players.get(this.shipData.ownerId)
        if(player){
            if(mission.type === MissionType.ESCORT || mission.type === MissionType.DESTROY){
                player.notoriety-=1
                if(player.notoriety < 0) player.notoriety = 0
            }
            if(mission.faction){
                player.reputation.forEach(faction=>{
                    if(faction.name === mission.faction) faction.reputation-=1
                    if(faction.reputation < 0) faction.reputation = 0
                })
            }
            this.theGalaxy.server.publishMessage({ type: ServerMessages.PLAYER_DATA_UPDATE, event: player, system:'' })
        }
    }

    processOrder = (order:CommodityOrder) => {
        const player = this.theGalaxy.players.get(this.shipData.ownerId)
        if(player){
            let planet = (this.scene as ServerStarSystem).planets.find(planet=>planet.config.planetName === this.shipData.landedAtName)
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
                            asset: '',
                            type: CargoType.COMMODITY
                        })
                    player.credits -= price
                    console.log('buy processed order, new credits: '+player.credits)
                    //TODO: fix pump and dump exploit
                    commodity.price += Math.round(commodity.price * (0.01 * order.amount))
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
                commodity.price -= Math.round(commodity.price * (0.01 * order.amount))
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

    merchantAICombatListener = () => {
        //If attacked, respond and retreat to other non-hostile ships
        if(this.shipData.aiProfile.attackerId){
            if(this.shipData.aiProfile.attackTime > 20){
                this.aiEvent.remove()
                this.AiEvents.jump()
            }
            else{
                let system = (this.scene as ServerStarSystem)
                let target = system.ships.get(this.shipData.aiProfile.attackerId)
                //this.firePrimary()
                if(target){
                    let targetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
                    const rotation = (targetAngle+(Math.PI/2))+Math.PI
                    this.scene.tweens.add({
                        targets: this,
                        rotation,
                        duration: this.shipData.turn*10000
                    })
                    this.thrust()
                    this.shipData.aiProfile.attackTime+=1
                }
                else{
                    delete this.shipData.aiProfile.attackerId
                    this.AiEvents.land()
                }
            }
        }
        //Random radio chatter?
    }

    pirateAICombatListener = () => {
        if(!this.shipData.aiProfile.targetShipId){
            //Choose a target of faction not your own
            let system = (this.scene as ServerStarSystem)
            system.ships.forEach(ship=>{
                if(ship.shipData.faction !== this.shipData.faction) 
                    this.shipData.aiProfile.targetShipId = ship.shipData.id
            })
        }
        if(this.shipData.aiProfile.targetShipId){
            let system = (this.scene as ServerStarSystem)
            let target = system.ships.get(this.shipData.aiProfile.targetShipId)
            if(!target){
                //target left the system or has been destroyed
                delete this.shipData.aiProfile.targetShipId
            }
            else{
                let targetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
                const rotation = targetAngle+(Math.PI/2)
                this.scene.tweens.add({
                    targets: this,
                    rotation,
                    duration: this.shipData.turn*10000
                })
                this.thrust()
                //Engage target
                if(target.shipData.hull > 5)
                    this.firePrimary()
                else{
                    this.aiEvent.remove()
                    this.AiEvents.board()
                }
            }
            //Roll for rage kill after boarding?, then leave system
        }
        //Attempt retreat when hull is < 50%
        if(this.shipData.hull < 5){
            this.aiEvent.remove()
            this.AiEvents.jump()
        } 
    }

    policeAICombatListener = () => {
        //If any neutral is attacked, or a pirate appears, engage targets
        if(!this.shipData.aiProfile.targetShipId){
            //Choose a target of faction not your own
            let system = (this.scene as ServerStarSystem)
            system.ships.forEach(ship=>{
                if(ship.shipData.faction === FactionName.PIRATE) 
                    this.shipData.aiProfile.targetShipId = ship.shipData.id
                if(ship.shipData.aiProfile && ship.shipData.aiProfile.attackerId && ship.shipData.faction !== FactionName.PIRATE)
                    this.shipData.aiProfile.targetShipId = ship.shipData.aiProfile.attackerId
            })
        }
        if(this.shipData.aiProfile.targetShipId){
            let system = (this.scene as ServerStarSystem)
            let target = system.ships.get(this.shipData.aiProfile.targetShipId)
            if(!target){
                //target left the system or has been destroyed
                delete this.shipData.aiProfile.targetShipId
                this.aiEvent.remove()
                this.AiEvents.land()
            }
            else{
                let targetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
                const rotation = targetAngle+(Math.PI/2)
                this.scene.tweens.add({
                    targets: this,
                    rotation,
                    duration: this.shipData.turn*10000
                })
                this.thrust()
                //Engage target
                this.firePrimary()
            }
        }
    }

    AiEvents = {
        land: ()=>{
            let system = (this.scene as ServerStarSystem)
            let target = system.planets[Phaser.Math.Between(0, system.planets.length-1)]
            this.startLandingSequence(target)
            console.log('ai landing start:'+this.shipData.id)
        },
        takeOff: ()=>{
            this.takeOff()
            console.log('ai takeoff start '+this.shipData.id)
        },
        jump: ()=>{
            this.aiEvent && this.aiEvent.remove()
            let otherSystems = this.theGalaxy.scenes.filter(scene=>scene!==(this.scene as ServerStarSystem).name)
            let targetName = otherSystems[Phaser.Math.Between(0,otherSystems.length-1)]
            const system = StarSystems.find(system=>system.name === targetName)
            this.startJumpSequence(system)
            console.log('ai jump start to:'+ system.name+' '+this.shipData.id)
        },
        board: () => {
            this.startBoardingSequence(this.shipData.aiProfile.targetShipId)
        },
        plunderAndTakeOff: () => {
            //TODO: remove any carried goods
            if(this.scene){
                let system = (this.scene as ServerStarSystem)
                let target = system.ships.get(this.shipData.aiProfile.targetShipId)
                if(target) target.shipData.cargo = []
                delete this.shipData.aiProfile.targetShipId
                this.AiEvents.jump()
            }
        }
    }
}
