import { GameObjects, Physics, } from "phaser";

export default class ResourceChunk extends GameObjects.Image {

    weight: number
    inventoryData: InventoryData

    constructor(scene, x, y){
        super(scene, x, y, 'planet')
        this.weight = 1
        this.inventoryData = {
            name: 'stuff',
            weight: 1,
            asset: 'planet'
        }
    }

    spawn = (parentAsteroid:Physics.Arcade.Sprite) => {
        this.setPosition(parentAsteroid.x, parentAsteroid.y); // Initial position
        this.setScale(0.2,0.2)
    }
    
    update = (time, delta) =>
    {
        // this.x += this.xSpeed * delta;
        // this.y += this.ySpeed * delta;
        // this.timeAlive += delta;
    }
}


