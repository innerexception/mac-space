import { Position, Toaster } from "@blueprintjs/core"
import { Ships } from '../../data/Ships'
import { AiProfileType, FactionName } from "../../../enum";
import { v4 } from 'uuid'

export const toast = Toaster.create({
    className: `recipe-toaster`,
    position: Position.TOP,
})

export const getCargoWeight = (ship:ShipData) => {
    let weights = 0
    ship.cargo.forEach(item => weights += item.weight)
    return weights
}

export const getNPCShipData = () => {
    let shipData = Ships[Phaser.Math.Between(0,Ships.length-1)]
    shipData.aiProfile = {
        type: AiProfileType.MERCHANT,
        jumpedIn: true,
        underAttack: false,
        attackerId: '',
        attackTime: 0,
        targetShipId: ''
    }
    shipData.id = v4()
    switch(Phaser.Math.Between(0,2)){
        case 1: 
            shipData.faction = FactionName.PIRATE
            shipData.aiProfile.type = AiProfileType.PIRATE
            break
        case 2:     
            shipData.faction = FactionName.POLICE
            shipData.aiProfile.type = AiProfileType.POLICE
            break
    }
    return shipData
}