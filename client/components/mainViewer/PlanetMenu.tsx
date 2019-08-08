import * as React from 'react'
import { onCommodityOrder, onShipTakeOff } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { Button, LightButton } from '../Shared'

interface Props {
    activeShip: ShipData
}

interface State {
    planet:StellarObjectConfig
    activeView: string
}

export default class PlanetMenu extends React.Component<Props, State> {

    state = {
        planet: this.props.activeShip.landedAt,
        activeView: 'main'
    }

    componentDidMount = () => {
        // window.addEventListener('keydown', (e)=>this.handleKeyDown(e.keyCode))
    }

    onTakeOff = () => {
        onShipTakeOff({...this.props.activeShip})
    }

    onCommodityOrder = (commodity:Commodity, amount: number, buy: boolean) => {
        onCommodityOrder(commodity, amount, buy)
    }

    getPlanetMainMenu = () => {
        return (
            <div style={{...styles.disabled, display: 'flex'}}>
                <div style={AppStyles.notification}>
                    <h3>{this.state.planet.name}</h3>
                    <div>
                        {this.getView(this.state.activeView)}
                    </div>
                </div>
            </div>
        )
    }

    getView = (viewName:string) => {
        switch(viewName){
            case 'main': return this.mainView(this.state.planet)
            case 'commodities': return this.commodityView(this.state.planet, this.props.activeShip)
        }
    }

    mainView = (planet:StellarObjectConfig) => 
        <div>
            {planet.commodities && LightButton(true, ()=>this.setState({activeView: 'commodities'}), 'Trade')}
            {/* {planet.shipyard && LightButton(true, ()=>this.setState({activeView:'shipyard'}), 'Shipyard')} 
            {planet.outfitter && LightButton(true, ()=>this.setState({activeView:'outfitter'}), 'Outfitter')}   
            {planet.bar && LightButton(true, ()=>this.setState({activeView:'bar'}), 'Bar')}        
            {planet.missions && LightButton(true, ()=>this.setState({activeView:'missions'}), 'Job Board')}         */}
            {Button(true, this.onTakeOff, 'Leave')}
        </div>
    

    commodityView = (planet:StellarObjectConfig, ship:ShipData) => 
        <div>
            {planet.commodities && planet.commodities.map(commodity => 
                <div style={{display:"flex"}}>
                    <h5>{commodity.name}</h5>
                    <div>{commodity.price}</div>
                    {LightButton(ship.cargoSpace > 0, ()=>this.onCommodityOrder(commodity, 1, true), 'Buy 1')}
                    {LightButton(ship.cargoSpace > 0, ()=>this.onCommodityOrder(commodity, ship.cargoSpace, true), 'Buy All')}
                    {LightButton(ship.cargo.find(item=>item.name === commodity.name) ? true : false, ()=>this.onCommodityOrder(commodity, 1, false), 'Sell 1')}
                    {LightButton(ship.cargo.find(item=>item.name === commodity.name) ? true : false, ()=>this.onCommodityOrder(commodity, ship.cargo.filter(item=>item.name === commodity.name).length, false), 'Sell All')}
                    {Button(true, ()=>this.setState({activeView:'main'}), 'Done')}
                </div>
            )}
        </div>

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