import { GameObjects, Physics, } from "phaser";

export default class Projectile extends GameObjects.Image {

    timeAlive: number
    xVector: number
    yVector: number
    weapon: Weapon
    target: Physics.Arcade.Sprite

    constructor(scene, x, y){
        super(scene, x, y, 'proton')
    }

    fire = (weapon:Weapon, shooter:Physics.Arcade.Sprite, target?:Physics.Arcade.Sprite) => {
        this.weapon = weapon
        this.setTexture(weapon.projectileAsset)
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.setScale(weapon.projectileSize)
        this.rotation = shooter.rotation
        this.target=target

        let targetVector = { x: Math.sin(shooter.rotation), y: Math.cos(shooter.rotation)}
        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        if(this.weapon.isTurrent && this.target){
            //angle bullet with turrent's rotation
            this.rotation = Math.atan( (this.target.x-this.x) / (this.target.y-this.y) )
            targetVector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
        }

        this.xVector = targetVector.x
        this.yVector = -targetVector.y
        this.x += this.xVector * 50;
        this.y += this.yVector * 50;

        this.timeAlive = 0; // Time since new bullet spawned
    }
    
    update = (time, delta) =>
    {
        this.x += this.xVector * this.weapon.projectileSpeed;
        this.y += this.yVector * this.weapon.projectileSpeed;
        this.timeAlive += delta;

        if(this.weapon.isGuided && this.target) {
            this.rotation = Math.atan( (this.target.x-this.x) / (this.target.y-this.y) )
            const targetVector = { x: Math.sin(this.rotation), y: Math.cos(this.rotation)}
            this.xVector = targetVector.x
            this.yVector = -targetVector.y
        }
        if (this.timeAlive > this.weapon.range)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}


