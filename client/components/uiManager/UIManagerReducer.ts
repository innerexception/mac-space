import { ReducerActions, PlayerEvents } from '../../../enum'

const appReducer = (state = getInitialState(), action:any):RState => {
    switch (action.type) {
        case ReducerActions.CONNECTED: 
            return { ...state, isConnected: true}
        case ReducerActions.CONNECTION_ERROR: 
            return { ...state, isConnected: false}
        case ReducerActions.MATCH_UPDATE: 
            return { ...state, activeSession: action.session }
        case ReducerActions.PLAYER_LEFT:
            state.activeSession.players.filter((player:any) => player.id !== action.currentUser.id)
            return { ...state, activeSession: {...state.activeSession}}
        case ReducerActions.PLAYER_REPLACE: 
            return { ...state, currentUser: action.currentUser }
        case ReducerActions.MATCH_CLEANUP: 
            return { ...state, activeSession: null, currentUser:null}
        case ReducerActions.OPEN_PLANET: 
            return { ...state, showPlanetMenu: action.state, playerEvent:null }
        case ReducerActions.OPEN_MAP:
            return { ...state, showMap: action.state, playerEvent: null }
        case ReducerActions.SET_LOGIN:
            return {...state, loginName: action.name, loginPassword: action.password }
        case ReducerActions.LOGIN_FAILED:
            return {...state, loginPassword:'', loginError:true}
        case ReducerActions.PLAYER_EVENT: 
            state.currentUser.ships = state.currentUser.ships.map(ship=>{
                if(ship.id === action.ship.id) return action.ship
                return ship
            })
            return { ...state, currentUser: {...state.currentUser}, playerEvent: action.event }
        case ReducerActions.COMMODITY_ORDER:
            return { ...state, commodityOrder: { ...action }, playerEvent: PlayerEvents.COMMODITY_ORDER }
        case ReducerActions.PHASER_SCENE_CHANGE:
            state.currentUser.ships = state.currentUser.ships.map(ship=>{
                if(ship.id === action.activeShip.id) return action.activeShip
                return ship
            })
            return { ...state, currentUser: {...state.currentUser}, playerEvent: null }
        default:
            return state
    }
};

export default appReducer;

const getInitialState = ():RState => {
    return {
        activeSession: {
            sessionId:'',
            players: new Array<Player>(),
            systems: new Array<SystemState>(),
            npcs: new Array<Player>()
        },
        isConnected: false,
        currentUser: null,
        showMap: false,
        showPlanetMenu: false,
        playerEvent: null,
        commodityOrder: null,
        loginName: '',
        loginPassword: '',
        loginError:false
    }
}