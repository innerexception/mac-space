import { ReducerActions, PlayerEvents } from '../../../enum'

const appReducer = (state = getInitialState(), action:any):RState => {
    switch (action.type) {
        case ReducerActions.CONNECTED: 
            return { ...state, isConnected: true}
        case ReducerActions.CONNECTION_ERROR: 
            return { ...state, isConnected: false}
        case ReducerActions.OPEN_PLANET: 
            return { ...state, showPlanetMenu: action.state, playerEvent:null, activeShip: action.activeShip, player: action.player }
        case ReducerActions.OPEN_MAP:
            return { ...state, showMap: action.state, playerEvent: null, activeShip: action.activeShip }
        case ReducerActions.SYSTEM_SELECTED:
            return { ...state, showMap: false, playerEvent: PlayerEvents.SELECT_SYSTEM, systemName:action.systemName }
        case ReducerActions.TAKE_OFF:
            return { ...state, showPlanetMenu: false, playerEvent: action.playerEvent, activeShip: action.activeShip }
        case ReducerActions.SET_LOGIN:
            return {...state, loginName: action.name, loginPassword: action.password }
        case ReducerActions.LOGIN_FAILED:
            return {...state, loginPassword:'', loginError:true}
        case ReducerActions.COMMODITY_ORDER:
            return { ...state, 
                commodityOrder: { ...action }, 
                playerEvent: PlayerEvents.COMMODITY_ORDER }
        case ReducerActions.PLAYER_REPLACE:
            return {...state, player: action.player, activeShip: action.activeShip, playerEvent: null }
        case ReducerActions.PLAYER_REPLACE_SHIP:
            return {...state, activeShip: action.activeShip, playerEvent: null }
        default:
            return state
    }
};

export default appReducer;

const getInitialState = ():RState => {
    return {
        isConnected: false,
        player: null,
        activeShip: null,
        showMap: false,
        showPlanetMenu: false,
        playerEvent: null,
        commodityOrder: null,
        loginName: '',
        loginPassword: '',
        loginError:false,
        systemName:''
    }
}