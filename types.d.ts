
declare enum StatusEffect {
    
}

interface Tuple {
    x: number
    y: number
}

interface Player {
    name:string
    id:string
}

interface Session {
    sessionId: string
}

interface RState {
    isConnected: boolean
    currentUser: Player
    activeSession: Session
}