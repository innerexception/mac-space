import * as React from 'react'
import * as Phaser from 'phaser'
import StarSystem from '../util/StarSystem'
import { Rigel } from '../../data/StarSystems';
import WebsocketClient from '../../WebsocketClient'
const server = new WebsocketClient()

interface Props {
    loginName: string
    loginPassword: string
}

interface State {
    phaserInstance: Phaser.Game | null
}

export default class Viewscreen extends React.Component<Props, State> {

    state = {
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
                default: 'arcade'
            },
            scene: [new StarSystem({
                key:Rigel.name, 
                server:server, 
                initialState: Rigel, 
                loginName: this.props.loginName, 
                loginPassword: this.props.loginPassword
            })]
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