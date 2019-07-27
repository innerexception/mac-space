
declare enum GunType {
    Energy, Kinetic, Quantum
}

declare enum Direction {
    DOWN, UP, FORWARD, REVERSE, RIGHT, LEFT
}

interface Tuple {
    x: number
    y: number
    rotation?: number
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

interface ShipSprite extends Phaser.Physics.Arcade.Sprite {
    startLandingSequence(target:Phaser.GameObjects.Sprite)
    startJumpSequence(targetSystem:SystemState)
    firePrimary()
    fireSecondary()
}

interface Ship {
    name: string
    id:string
    shields: number
    armor: number
    hull: number
    sprite: ShipSprite
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

interface SystemState {
    name: string
    x: number
    y: number
    stellarObjects: Array<StellarObjectConfig>
    asteroidConfig: Array<AsteroidConfig>
    ships: Array<Ship>,
    sceneConfig: Phaser.Types.Scenes.CreateSceneFromObjectConfig
}

interface StellarObjectConfig {
    name: string,
    x: number,
    y: number,
    asset: string,
    landable: boolean
}

interface AsteroidConfig {
    type: 'Iron'|'Silver'|'Platinum',
    density: number,
    isBelt: boolean
}

interface Session {
    sessionId: string
    players: Array<Player>
    systems: Array<SystemState>
    npcs: Array<Player>
}

interface RState {
    isConnected: boolean
    currentUser: Player | null
    activeSession: Session
    showMap: boolean
    showPlanetMenu: boolean
}