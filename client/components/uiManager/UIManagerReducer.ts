import { ReducerActions } from '../../../enum'

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
        case ReducerActions.SET_USER: 
            return { ...state, currentUser: action.currentUser }
        case ReducerActions.MATCH_CLEANUP: 
            return { ...state, activeSession: null, currentUser:null}
        case ReducerActions.OPEN_PLANET: 
            return { ...state, showPlanetMenu: action.state, playerEvent:null }
        case ReducerActions.OPEN_MAP:
            return { ...state, showMap: action.state, playerEvent: null }
        case ReducerActions.PLAYER_EVENT: 
            state.currentUser.ships = state.currentUser.ships.map(ship=>{
                if(ship.id === action.ship.id) return action.ship
                return ship
            })
            return { ...state, currentUser: {...state.currentUser}, playerEvent: action.event }
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
        playerEvent: null
    }
}