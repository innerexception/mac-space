import { Scene, Cameras } from "phaser";

const star = require('../../assets/tiny.png')
const star2 = require('../../assets/tiny2.png')
const ship = require('../../assets/ship/bounder.png')

export default class DefaultScene extends Scene {

    minimap: Cameras.Scene2D.BaseCamera
    player: Phaser.Physics.Impact.ImpactSprite
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    thruster: Phaser.GameObjects.Particles.ParticleEmitter

    preload = () =>
    {
        this.load.image('star', star);
        this.load.image('bigStar', star2);
        this.load.image('ship', ship);
        // this.load.spritesheet('face', 'assets/sprites/metalface78x92.png', { frameWidth: 78, frameHeight: 92 });
    }
    
    create = () =>
    {
         //  The world is 3200 x 600 in size
        this.cameras.main.setBounds(0, 0, 3200, 3200).setName('main');
    
        //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
        this.minimap = this.cameras.add(0, 0, 100, 100).setZoom(0.1).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 400;
    
        this.createStarfield();
    
        //  Add a player ship
    
        this.player = this.impact.add.sprite(1600, 400, 'ship');
        this.player.scaleX = 0.3
        this.player.scaleY = 0.3
        this.player.setMaxVelocity(700).setFriction(400, 400);
    
        this.cursors = this.input.keyboard.createCursorKeys();

        this.thruster = this.add.particles('jets').createEmitter({
                x: this.player.x,
                y: this.player.y,
                angle: this.player.angle,
                scale: { start: 0.2, end: 0 },
                blendMode: 'ADD',
                lifespan: 300,
                on: false
        });
        this.thruster.setSpeed(100)

        // // Enables movement of player with WASD keys
        // this.input.keyboard.on('keydown-W', (event) => {
        //     this.player.setAccelerationY(-800);
        // });
        // this.input.keyboard.on('keydown-S', (event) => {
        //     this.player.setAccelerationY(800);
        // });
        // this.input.keyboard.on('keydown-A', (event) => {
        //     this.player.setAccelerationX(-800);
        // });
        // this.input.keyboard.on('keydown-D', (event) => {
        //     this.player.setAccelerationX(800);
        // });

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
        else
        {
            this.player.setAcceleration(0, 0);
            this.thruster.stop()
        }
    
        this.player.x = Phaser.Math.Clamp(this.player.x, 0, 3200)
        this.player.y = Phaser.Math.Clamp(this.player.y, 0, 3200)

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
    
        group.createMultiple({ key: 'bigStar', frameQuantity: 128 });
    
        var rect = new Phaser.Geom.Rectangle(0, 0, 3200, 3200);
    
        Phaser.Actions.RandomRectangle(group.getChildren(), rect);
    
        group.children.iterate((child, index) => {
    
            var sf = Math.max(0.3, Math.random());
            //this.minimap.ignore(child);
            
        }, this);
    }
}