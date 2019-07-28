import GalaxyScene from "./GalaxyScene";

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade'
  },
  scene: [GalaxyScene],
  autoFocus: false
};

const game = new Phaser.Game(config);
(window as any).gameLoaded();
