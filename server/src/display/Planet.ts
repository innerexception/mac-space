import { GameObjects } from "phaser";
import { getRandomPublicMission } from "../../../client/components/util/Util";
import ServerStarSystem from "../ServerStarSystem";

export default class Planet extends GameObjects.Sprite {

    config: StellarObjectConfig    
    
    constructor(scene:ServerStarSystem, x:number, y:number, texture:string, config:StellarObjectConfig){
        super(scene, x, y, texture)
        this.config = config
        config.missions = new Array(10).fill(null).map(slot=>getRandomPublicMission(scene.state))
    }
}