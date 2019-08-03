import * as React from 'react'
import { onShipEvent, onBuyEvent, onSellEvent } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { Button, LightButton } from '../Shared'
import { PlayerEvents } from '../../../enum';

interface Props {
    activeShip: ShipData
}

interface State {

}

export default class PlanetMenu extends React.Component<Props, State> {

    state = {
        
    }

    componentDidMount = () => {
        window.addEventListener('keydown', (e)=>this.handleKeyDown(e.keyCode))
    }

    onTakeOff = () => {
        onShipEvent({...this.props.activeShip}, PlayerEvents.TAKE_OFF)
    }

    onBuyCommodity = (commodity:Commodity, amount: number) => {
        onBuyEvent(commodity, amount)
    }

    onSellCommodity = (commodity:Commodity, amount: number) => {
        onSellEvent(commodity, amount)
    }

    getPlanetMainMenu = () => {
        let planet = this.props.activeShip.landedAt
        let ship = this.props.activeShip
        return (
            <div style={{...styles.disabled, display: 'flex'}}>
                <div style={AppStyles.notification}>
                    <h3>{planet.name}</h3>
                    <div>
                        {planet.commodities && planet.commodities.map(commodity => 
                            <div style={{display:"flex"}}>
                                <h5>{commodity.name}</h5>
                                <div>{commodity.price}</div>
                                {LightButton(ship.cargoSpace > 0, ()=>this.onBuyCommodity(commodity, 1), 'Buy 1')}
                                {LightButton(ship.cargoSpace > 0, ()=>this.onBuyCommodity(commodity, ship.cargoSpace), 'Buy All')}
                                {LightButton(ship.cargo.find(item=>item.name === commodity.name) ? true : false, ()=>this.onSellCommodity(commodity, 1), 'Sell 1')}
                                {LightButton(ship.cargo.find(item=>item.name === commodity.name) ? true : false, ()=>this.onSellCommodity(commodity, ship.cargo.filter(item=>item.name === commodity.name).length), 'Sell All')}
                            </div>
                        )}
                    </div>
                    {Button(true, this.onTakeOff, 'Ok')}
                </div>
            </div>
        )
    }

    handleKeyDown = (keyCode:number) =>{
        
    }

    render(){
        return (this.getPlanetMainMenu())
    }
}


const styles = {
    disabled: {
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