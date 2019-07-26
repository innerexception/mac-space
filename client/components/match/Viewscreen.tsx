import * as React from 'react'
import * as Phaser from 'phaser'
import System from '../util/System'

interface Props {
    me: Player
}

interface State {
    activeShip: Ship
    phaserInstance: Phaser.Game | null
}

export default class Viewscreen extends React.Component<Props, State> {

    state = {
        activeShip: this.props.me.ships.find(ship=>ship.id===this.props.me.activeShipId),
        phaserInstance: null,
        containerRef: React.createRef<HTMLDivElement>()
    }

    componentDidMount() {
        this.state.phaserInstance = new Phaser.Game({
            type: Phaser.WEBGL,
            width: this.state.containerRef.current.clientWidth,
            height: this.state.containerRef.current.clientHeight,
            parent: 'canvasEl',
            physics: {
                default: 'arcade',
                impact: {
                    setBounds: {
                        x: 0,
                        y: 0,
                        width: 3200,
                        height: 600,
                        thickness: 32
                    }
                }
            },
            scene: [System]
        });
        window.addEventListener("resize", ()=>{
            let game = (this.state.phaserInstance as Phaser.Game)
            game.canvas.width = this.state.containerRef.current.clientWidth
            game.canvas.height = this.state.containerRef.current.clientHeight
        });
    }

    render() {
        return <div ref={this.state.containerRef} id='canvasEl' style={{width:'100%', height:'50vh'}}/>
    }
}