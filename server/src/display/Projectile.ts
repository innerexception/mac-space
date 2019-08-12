import { GameObjects, Physics, } from "phaser";

export default class Projectile extends GameObjects.Image {

    timeAlive: number
    xSpeed: number
    ySpeed: number
    weapon: Weapon

    constructor(scene, x, y){
        super(scene, x, y, 'proton')
    }

    fire = (weapon:Weapon, shooter:Physics.Arcade.Sprite, target?:Physics.Arcade.Sprite) => {
        this.weapon = weapon
        this.setTexture(weapon.projectileAsset)
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.setScale(0.2,0.2)
        if(target) this.rotation = Math.atan( (target.x-this.x) / (target.y-this.y));
        else this.rotation = shooter.rotation

        let targetVector = { x: Math.sin(shooter.rotation), y: Math.cos(shooter.rotation)}
        this.xSpeed = targetVector.x
        this.ySpeed = -targetVector.y
        this.x += this.xSpeed * 50;
        this.y += this.ySpeed * 50;

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.timeAlive = 0; // Time since new bullet spawned
    }
    
    update = (time, delta) =>
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.timeAlive += delta;
        if (this.timeAlive > this.weapon.range)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}


