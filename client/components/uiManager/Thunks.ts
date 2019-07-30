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

export const onWSMessage = (data:any) => {
    if (!data ) {
        dispatch({
            type:'noop'
        })
    }
    else{
        const payload = JSON.parse(data.data)
        dispatch({...payload})
    }
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

export const onLogin = (currentUser:Player, sessionId:string) => {
    dispatch({ type: ReducerActions.SET_USER, currentUser })
    // server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId})
}

export const onMatchStart = (currentUser:Player, session:Session) => {
    const newSession = {
        ...session,
    }

    // sendSessionUpdate(newSession)
}

export const onCleanSession = () => {
    dispatch({
        type: ReducerActions.MATCH_CLEANUP
    })
}