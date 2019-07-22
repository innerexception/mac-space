import * as React from 'react'
import * as PIXI from 'pixi.js'
const tile = require('../../assets/tiny2.png')

interface Props {
}

interface State {
}

export default class Viewscreen extends React.Component<Props, State> {

    state = {
        viewportRef: React.createRef<HTMLDivElement>()
    }

    componentDidMount() {
        const app = new PIXI.Application();
        this.state.viewportRef.current.appendChild(app.view)
        this.initPixi(app)
        window.addEventListener('keydown', (e)=>this.handleKeyDown(e.keyCode))
    }

    handleKeyDown = (keyCode:number) =>{
        switch(keyCode){
            // case 65:
            //     this.state.isPlayerAttacking ? this.hideAttackTiles():this.showAttackTiles(this.props.me, this.props.me.character.abilities.find(ability=>ability.name==='Attack'))
            //     break
            // case 38:
            //     this.moveUnit(this.props.me, Directions.UP)
            //     break
            // case 40: 
            //     this.moveUnit(this.props.me, Directions.DOWN)
            //     break
            // case 37: 
            //     this.moveUnit(this.props.me, Directions.LEFT)
            //     break
            // case 39: 
            //     this.moveUnit(this.props.me, Directions.RIGHT)
            //     break
        }
    }

    initPixi(app){
        // create a texture from an image path
        const texture = PIXI.Texture.from(tile);

        /* create a tiling sprite ...
        * requires a texture, a width and a height
        * in WebGL the image size should preferably be a power of two
        */
        const tilingSprite = new PIXI.TilingSprite(
            texture,
            app.screen.width,
            app.screen.height,
        );
        app.stage.addChild(tilingSprite);

        let count = 0;

        app.ticker.add(() => {
            count += 0.005;

            tilingSprite.tileScale.x = 2 + Math.sin(count);
            tilingSprite.tileScale.y = 2 + Math.cos(count);

            tilingSprite.tilePosition.x += 1;
            tilingSprite.tilePosition.y += 1;
        });
    }

    render(){
        return (
            <div ref={this.state.viewportRef}/>
        )
    }
}