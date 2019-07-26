import { Scene, Cameras, GameObjects, Physics, } from "phaser";
import { onTogglePlanetMenu } from '../uiManager/Thunks'
import { Arcturus, Rigel } from "../../data/Systems";

const star = require('../../assets/star/g0.png')
const star2 = require('../../assets/star/a0.png')
const ship = require('../../assets/ship/aerie.png')
const planet = require('../../assets/planet/callisto.png')
const asteroid1 = require('../../assets/asteroid/iron/spin-00.png')
const asteroid2 = require('../../assets/asteroid/lead/spin-00.png')
const lazor = require('../../assets/projectile/laser+0.png')
const boom = require('../../assets/explosion.png')

export default class System extends Scene {

    minimap: Cameras.Scene2D.BaseCamera
    player: Physics.Arcade.Sprite
    planet: GameObjects.Sprite
    asteroids: Array<Physics.Arcade.Sprite>
    explosions: GameObjects.Group
    projectile: GameObjects.Group
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    thruster: GameObjects.Particles.ParticleEmitter
    landingSequence: boolean
    currentSystem: SystemConfig
    selectedSystem: SystemConfig
    jumpSequence: boolean
    name: string
    jumpVector: Tuple

    constructor(config, jumpVector?:Tuple){
        super(config)
        this.jumpVector = jumpVector
    }

    preload = () =>
    {
        this.load.image('star', star)
        this.load.image('bigStar', star2)
        this.load.image('ship', ship)
        this.load.image('planet', planet)
        this.load.image('asteroid1', asteroid1)
        this.load.image('asteroid2', asteroid2)
        this.load.image('lazor', lazor)
        this.load.spritesheet('boom', boom, { frameWidth: 64, frameHeight: 64 });
    }
    
    create = () =>
    {
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
        this.physics.world.setBoundsCollision();
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        this.minimap = this.cameras.add(0, 0, 100, 100).setZoom(0.1).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 400;
        
        this.selectedSystem = Arcturus
        this.currentSystem = Rigel

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 23, first: 23 }),
            frameRate: 20
        });

        this.createStarfield();
        this.addAsteroids();
        this.planet = this.add.sprite(500,550,'planet')

        //  Add a player ship
    
        this.player = this.physics.add.sprite(1600, 400, 'ship');
        this.player.scaleX = 0.3
        this.player.scaleY = 0.3
        this.player.setMaxVelocity(700).setFriction(400, 400);
        if(this.jumpVector){
            this.player.setVelocity(this.jumpVector.x*500, this.jumpVector.y*-500)
            this.player.rotation = this.jumpVector.rotation
        } 

        this.projectile = this.physics.add.group({ classType: Projectile  })
        this.projectile.runChildUpdate = true

        this.explosions = this.add.group()

        this.physics.add.collider(this.projectile, this.asteroids, this.playerShotAsteroid);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.thruster = this.add.particles('jets').createEmitter({
            x: this.player.x,
            y: this.player.y,
            angle: this.player.angle,
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 150,
            on: false
        });
        this.thruster.setSpeed(100)
        this.player.depth = 3

        
        this.input.keyboard.on('keydown-L', (event) => {
            //TODO cycle available sites
            //this.planets.getNext().setSelected()

            //landing sequence
            let planetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.planet.x, this.planet.y)
            this.player.setMaxVelocity(200)
            this.tweens.add({
                targets: this.player,
                rotation: planetAngle+(Math.PI/2),
                duration: 1500,
                onComplete: ()=>{
                    this.landingSequence = true
                }
            })
            
        });
        this.input.keyboard.on('keydown-J', (event) => {
            //jump sequence, pass to next system.
            let systemAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.selectedSystem.x, this.selectedSystem.y)
            const rotation = systemAngle+(Math.PI/2)
            let systemVector = { x: Math.sin(rotation), y: Math.cos(rotation), rotation}
            let targetScene = this.scene.get(this.selectedSystem.name)
            if(!targetScene)
                this.scene.add(
                    this.selectedSystem.name, 
                    new System({ key: this.selectedSystem.name, active: false, visible:false }, systemVector), 
                    false
                )
            this.physics.world.setBoundsCollision(false, false, false, false)
            this.tweens.add({
                targets: this.player,
                rotation: systemAngle+(Math.PI/2),
                duration: 1500,
                onComplete: ()=>{
                    this.jumpSequence = true
                    this.tweens.add({
                        targets: this.player,
                        x: this.selectedSystem.x,
                        y: this.selectedSystem.y,
                        duration: 2000,
                        onComplete: ()=> {
                            this.cameras.main.flash()
                            this.scene.switch(this.selectedSystem.name)
                            this.player.setPosition(1600, 400)
                            this.jumpSequence = false
                            this.physics.world.setBoundsCollision(true)
                        }
                    })
                }
            })
        });
        this.input.keyboard.on('keydown-SPACE', (event) => {
            //TODO: fire primary
            const projectile = this.projectile.get().setActive(true).setVisible(true)
            if(projectile){
                projectile.fire(this.player)
            }
        });
    }
    
    update = () =>
    {
        if (this.cursors.left.isDown)
        {
            this.player.rotation -= 0.05
            this.player.flipX = true;
        }
        else if (this.cursors.right.isDown)
        {
            this.player.rotation += 0.05
            this.player.flipX = false;
        }
        let vector = { x: Math.sin(this.player.rotation), y: Math.cos(this.player.rotation)}
        if (this.cursors.up.isDown)
        {
            this.player.setAcceleration(vector.x*500, vector.y*-500); //negative b/c y is inverted in crazyland
            this.thruster.emitParticle(16);
        }
        else if(this.landingSequence){
            let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.planet.x, this.planet.y)
            let planetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.planet.x, this.planet.y)
            this.player.rotation = planetAngle+(Math.PI/2)
            let planetVector = { x: Math.sin(this.player.rotation), y: Math.cos(this.player.rotation)}
            
            if(distance > 250){
                this.player.setAcceleration(planetVector.x*200, planetVector.y*-200)
            }
            else if(distance <=250){
                this.tweens.add({
                    targets: this.player,
                    x: this.planet.x,
                    y: this.planet.y,
                    duration: 2000,
                    onComplete: ()=>{
                        this.player.setVelocity(0,0)
                        this.player.setMaxVelocity(700)
                        onTogglePlanetMenu(true)
                    }
                })
                this.landingSequence = false
            }
        }
        else
        {
            this.player.setAcceleration(0, 0);
            this.thruster.stop()
        }
    
        //  Position the center of the camera on the player
        //  we want the center of the camera on the player, not the left-hand side of it
        this.cameras.main.scrollX = this.player.x - 200;
        this.cameras.main.scrollY = this.player.y - 200;
        this.minimap.scrollX = Phaser.Math.Clamp(this.player.x, 0, 3000);
        this.minimap.scrollY = Phaser.Math.Clamp(this.player.y, 0, 3000);
        this.thruster.setPosition(this.player.x + vector.x, this.player.y +vector.y);
        this.thruster.setAngle(this.player.angle+45)
    }
    
    createStarfield ()
    {
        //  Starfield background
    
        //  Note the scrollFactor values which give them their 'parallax' effect
    
        var group = this.add.group();
    
        group.createMultiple([
            { key: 'bigStar', frameQuantity: 64, setScale: {x: 0.02, y:0.02} }, 
            { key: 'star', frameQuantity: 256, setScale: {x: 0.02, y:0.02} }
        ]);
    
        var rect = new Phaser.Geom.Rectangle(0, 0, 3200, 3200);
    
        Phaser.Actions.RandomRectangle(group.getChildren(), rect);
    
        group.children.iterate((child, index) => {
    
            var sf = Math.max(0.3, Math.random());
            this.minimap.ignore(child);
            
            
        }, this);
    }

    addAsteroids ()
    {
        let asteroids = []
        for(var i=0; i< 24; i++){
            asteroids.push(this.physics.add.sprite(0,0,'asteroid1')
                .setScale(Phaser.Math.FloatBetween(0.8,0.1))
                .setRotation(Phaser.Math.FloatBetween(3,0.1)))
        }
        for(var i=0; i< 48; i++){
            asteroids.push(this.physics.add.sprite(0,0,'asteroid2')
                .setScale(Phaser.Math.FloatBetween(0.8,0.1))
                .setRotation(Phaser.Math.FloatBetween(3,0.1)))
        }

        var rect = new Phaser.Geom.Ellipse(1600, 1600, 1000, 1000);
        Phaser.Actions.RandomEllipse(asteroids, rect);

        asteroids.forEach((sprite:Physics.Arcade.Sprite)=>{
            let d=Phaser.Math.Between(700,1000)
            let r=Phaser.Math.FloatBetween(-0.01,0.1)
            sprite.setData('hp', 3)
            this.time.addEvent({
                delay: 1, 
                callback: ()=>{
                    sprite.rotation+=r
                    Phaser.Actions.RotateAroundDistance([sprite], { x: 1600, y: 1600 }, 0.001, d)
                },
                loop: true 
            });
        })
        this.asteroids = asteroids
    }

    playerShotAsteroid = (asteroid:Physics.Arcade.Sprite, projectile:Projectile) =>
    {
        projectile.destroy();
        asteroid.data.values.hp-=1

        if(asteroid.data.values.hp <= 0){
            this.explosions.get(asteroid.x, asteroid.y, 'boom').play('explode')
            asteroid.destroy()
            //TODO: spawn resources
        }
    }

    playerTouchedResource = (resource:Physics.Arcade.Sprite, player:Physics.Arcade.Sprite) =>
    {
        resource.destroy()
        player.data.values.resources++
    }
}

class Projectile extends GameObjects.Image {

    timeAlive: number
    xSpeed: number
    ySpeed: number

    constructor(scene, x, y){
        super(scene, x, y, 'lazor')
    }

    fire = (shooter:Physics.Arcade.Sprite, target?:Physics.Arcade.Sprite) => {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.setScale(0.1,0.1)
        if(target) this.rotation = Math.atan( (target.x-this.x) / (target.y-this.y));
        else this.rotation = shooter.rotation

        let targetVector = { x: Math.sin(shooter.rotation), y: Math.cos(shooter.rotation)}
        this.xSpeed = targetVector.x
        this.ySpeed = -targetVector.y

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.timeAlive = 0; // Time since new bullet spawned
    }
    
    update = (time, delta) =>
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.timeAlive += delta;
        if (this.timeAlive > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

