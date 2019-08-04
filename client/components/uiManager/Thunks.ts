import { dispatch } from '../../../client/App'
import { ReducerActions } from '../../../enum'

export const setUser = (currentUser:object) => {
    dispatch({
        type: ReducerActions.SET_USER,
        currentUser
    })
}

export const onTogglePlanetMenu = (state:boolean) => {
    dispatch({
        type: ReducerActions.OPEN_PLANET,
        state
    })
}

export const onToggleMapMenu = (state:boolean) => {
    dispatch({
        type: ReducerActions.OPEN_MAP,
        state
    })
}

export const onShipEvent = (ship:ShipData, event:PlayerEvents) => {
    dispatch({
        type: ReducerActions.PLAYER_EVENT,
        ship,
        event
    })
}

export const onBuyEvent = (commodity:Commodity, amount:number) => {
    dispatch({
        type: ReducerActions.BUY_COMMODITY,
        commodity,
        amount
    })
}

export const onSellEvent = (commodity:Commodity, amount:number) => {
    dispatch({
        type: ReducerActions.SELL_COMMODITY,
        commodity,
        amount
    })
}


export const onConnected= () => {
    dispatch({
        type: ReducerActions.CONNECTED
    })
}

export const onConnectionError= () => {
    dispatch({
        type: ReducerActions.CONNECTION_ERROR
    })
}

export const onLogin = (name:string, password:string) => {
    dispatch({ type: ReducerActions.SET_LOGIN, name, password })
}

export const onCleanSession = () => {
    dispatch({
        type: ReducerActions.MATCH_CLEANUP
    })
}