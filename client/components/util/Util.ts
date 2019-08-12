import { Position, Toaster } from "@blueprintjs/core"

export const toast = Toaster.create({
    className: `recipe-toaster`,
    position: Position.TOP,
})

export const getCargoWeight = (ship:ShipData) => {
    let weights = 0
    ship.cargo.forEach(item => weights += item.weight)
    return weights
}