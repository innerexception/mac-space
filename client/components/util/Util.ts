import { Position, Toaster } from "@blueprintjs/core"
import { Ships } from '../../data/Ships'
import { AiProfileType } from "../../../enum";
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
        attackTime: 0
    }
    shipData.id = v4()
    return shipData
}