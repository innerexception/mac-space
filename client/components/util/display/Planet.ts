import { GameObjects, Scene, } from "phaser";

export default class Planet extends GameObjects.Sprite {

    config: StellarObjectConfig    

    constructor(scene:Scene, x:number, y:number, texture:string, config:StellarObjectConfig){
        super(scene, x, y, texture)
        this.config = config
        this.scene.add.existing(this)
    }
}