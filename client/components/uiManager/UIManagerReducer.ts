import { ReducerActions } from '../../../enum'

const appReducer = (state = getInitialState(), action:any) => {
    switch (action.type) {
        case ReducerActions.CONNECTED: 
            return { ...state, isConnected: true}
        case ReducerActions.CONNECTION_ERROR: 
            return { ...state, isConnected: false}
        case ReducerActions.MATCH_UPDATE: 
            return { ...state, activeSession: action.session }
        case ReducerActions.PLAYER_ENTERED:
            state.activeSession.players.push(action.currentUser)
            return { ...state, activeSession: {...state.activeSession}}
        case ReducerActions.PLAYER_LEFT:
            state.activeSession.players.filter((player:any) => player.id !== action.currentUser.id)
            return { ...state, activeSession: {...state.activeSession}}
        case ReducerActions.SET_USER: 
            return { ...state, currentUser: action.currentUser }
        case ReducerActions.MATCH_CLEANUP: 
            return { ...state, activeSession: null, currentUser:null}
        default:
            return state
    }
};

export default appReducer;

const getInitialState = () => {
    return {
        activeSession: {
            players: new Array<any>()
        },
        isConnected: false,
        currentUser: {
            
        }
    }
}