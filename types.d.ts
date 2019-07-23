
declare enum GunType {
    Energy, Kinetic, Quantum
}

declare enum Direction {
    DOWN, UP, FORWARD, REVERSE, RIGHT, LEFT
}

interface Tuple {
    x: number
    y: number
}

interface Player {
    name:string
    id:string
    activeShipId: string
    ships: Array<Ship>
    reputation: Array<Faction>
    notoriety: number
}

interface Faction {
    name: string
    reputation: number
}

interface Ship {
    name: string
    id:string
    shields: number
    armor: number
    hull: number
    sprite: Phaser.GameObjects.Sprite
    fuel: number
    maxFuel: number
    energy: number
    maxEnergy: number
    heat: number
    maxHeat: number
    fighters: Array<Ship>
    turn: number
    accel: number
    speed: number
    maxSpeed: number
    cargoSpace: number
    maxCargoSpace: number
    gunMounts: number
    turrentMounts: number
    hardPoints: number
    guns: Array<Gun>
}

interface Gun {
    name: string
    type: GunType
    energyPerShot: number
    heatPerShot: number
    projectileSpeed: number
    accuracy: number
    shotsPerSecond: number
    ammo: number
    maxAmmo: number
    projectileTrackingInterval: number
    projectileTurnSpeed: number
    isTurrent: boolean
}

interface System {
    name: string

}

interface Session {
    sessionId: string
    players: Array<Player>
    systems: Array<System>
    npcs: Array<Player>
}

interface RState {
    isConnected: boolean
    currentUser: Player
    activeSession: Session
}