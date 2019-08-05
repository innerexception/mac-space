import * as React from 'react'
import AppStyles from '../../AppStyles';
import Map from './Map'
import PlanetMenu from './PlanetMenu'
import Viewscreen from './Viewscreen'
import { TopBar, Button } from '../Shared'

interface Props {
    currentUser?: Player
    showMap: boolean
    showPlanetMenu: boolean
    loginName: string
    loginPassword: string
}

interface State {
    showMatchOptions: boolean
}

export default class Match extends React.Component<Props, State> {

    state = {
        showMatchOptions: false,
        showMap: false
    }

    render(){
        const activeShip = this.props.currentUser && this.props.currentUser.ships.find(ship=>ship.id === this.props.currentUser.activeShipId)
        return (
            <div style={AppStyles.window}>
                {TopBar('MacSpace')}
                <div style={{padding:'0.5em', maxWidth:'25em'}}>
                    <div>
                        top right widgets:
                        radar
                        fuel / energy / heat
                        sheild / hull
                    </div>
                    <div style={{...styles.modal, display: this.state.showMatchOptions ? 'flex':'none'}}>
                        <div style={{display:'flex'}}>
                            options menu (esc)
                        </div>
                    </div>
                    {this.props.showMap && <Map activeShip={activeShip}/>}
                    {this.props.showPlanetMenu && <PlanetMenu activeShip={activeShip}/>}
                    <Viewscreen loginName={this.props.loginName} loginPassword={this.props.loginPassword}/>
                </div>
         </div>
        )
    }
}

const styles = {
    frame: {
        padding:'1em',
        position:'relative' as 'relative'
    },
    modal: {
        backgroundImage: 'url('+require('../../assets/tiny2.png')+')',
        backgroundRepeat: 'repeat',
        position:'absolute' as 'absolute',
        top:0, left:0, right:0, bottom:0,
        maxWidth: '20em',
        maxHeight: '20em',
        border: '1px solid',
        borderRadius: '5px',
        margin: 'auto',
        flexDirection: 'column' as 'column',
        justifyContent: 'flex-start'
    },
    circleButton: {
        cursor:'pointer',
        height:'2em',
        width:'2em',
        display:'flex',
        alignItems:'center',
        justifyContent: 'center'
    },
    choiceBtn: {
        margin: 0,
        cursor: 'pointer',
        border: '1px solid',
        padding: '0.5em',
        borderRadius: '5px',
    },
    disabled: {
        position:'absolute' as 'absolute',
        top:0,
        left:0,
        background:'black',
        opacity: 0.1,
        width:'100vw',
        height:'100vh'
    },
    toggleButton: {
        cursor:'pointer',
        border:'1px solid',
        borderRadius: '3px',
        padding:'0.5em'
    },
    scrollContainer: {
        overflow: 'auto',
        height: '66%',
        marginBottom:'0.5em',
        marginTop: '0.5em',
        background: 'white',
        border: '1px solid',
        padding: '0.5em'
    },
    unitRow: {
        display: 'flex',
        alignItems: 'center',
        width: '33%',
        justifyContent: 'space-between'
    }
}