import * as React from 'react'
import AppStyles from '../../AppStyles';
import { Button, LightButton } from '../Shared'
import { onToggleMapMenu, onPlayerEvent } from '../uiManager/Thunks';
import { StarSystems } from '../../data/StarSystems';
import { PlayerEvents } from '../../../enum';

interface Props {
    activeShip: ShipData
}

interface State {
    selectedSystemName: string
}

export default class Map extends React.Component<Props, State> {

    state = {
        selectedSystemName: this.props.activeShip.systemName
    }

    onChooseDestination = () => {
        onPlayerEvent({...this.props.activeShip, targetSystemName: this.state.selectedSystemName}, PlayerEvents.SELECT_SYSTEM)
        onToggleMapMenu(false)
    }

    getMap = () => {
            return (
                <div style={{...styles.disabled, display: 'flex'}}>
                    <div style={AppStyles.notification}>
                        <h3>Milky Way</h3>
                        <div style={{width:'60vw', height:'60vh', background:'black', position:'relative'}}>
                            {StarSystems.map(system=>
                                <div style={{position:'absolute', top: system.y/100, left: system.x/100}} 
                                     onClick={()=>this.setState({selectedSystemName: system.name})}>
                                    <div style={{height:'0.5em', width:'0.5em', background:'white', borderRadius:'50%'}}/> 
                                    <h5>{system.name}</h5>    
                                </div>
                            )}
                        </div>
                        {Button(true, this.onChooseDestination, 'Ok')}
                    </div>
                </div>
            )
    }

    render(){
        return (this.getMap())
    }
}

const styles = {
    disabled: {
        pointerEvents: 'none' as 'none',
        alignItems:'center', justifyContent:'center', 
        position:'absolute' as 'absolute', top:0, left:0, width:'100%', height:'100%'
    },
    mapFrame: {
        position:'relative' as 'relative',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        overflow:'auto',
        maxHeight:'60vh',
        maxWidth:'100%'
    },
    tileInfo: {
        height: '5em',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px dotted',
        display:'flex',
        justifyContent:'space-between'
    },
    tile: {
        width: '2em',
        height:'1.7em',
        border: '1px',
        position:'relative' as 'relative'
    },
    tileItem: {
        fontFamily:'Item', color: AppStyles.colors.grey2, fontSize:'0.6em', position:'absolute' as 'absolute', top:0, left:0
    },
    levelBarOuter: {
        height:'0.25em',
        background: AppStyles.colors.white
    },
    unitFrame: {position: 'absolute' as 'absolute', top: '0px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', zIndex:3}
}