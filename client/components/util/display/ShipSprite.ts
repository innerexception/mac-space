import { GameObjects, Physics, } from "phaser";

export default class ShipSprite extends Physics.Arcade.Sprite {

    isDirty: boolean

    constructor(scene, x, y, texture){
        super(scene, x, y, texture)
    }

    update = (time, delta) =>
    {
        
    }
}


