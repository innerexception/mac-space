
declare enum GunType {
    Energy, Kinetic, Quantum
}

declare enum Direction {
    DOWN, UP, FORWARD, REVERSE, RIGHT, LEFT
}

declare enum PlayerEvents { 
    ROTATE_L= 'rl',
    ROTATE_R= 'rr',
    THRUST_OFF= 'to',
    THRUST= 't',
    FIRE_PRIMARY= 'fp',
    SERVER_STATE= 'ss',
    PLAYER_SPAWNED= 'ps'
}

declare enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_EVENT_ACK= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su'
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

interface PlayerSpawnPoint {
    x: number
    y: number
    rotation: number
    xVelocity?: number
    yVelocity?: number
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
    rotateRight()
    rotateLeft()
    thrust()
    thrustOff()
    landingSequence: boolean
    applyUpdate(update:ShipUpdate)
    sendSpawnUpdate()
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
    asset: string
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
    assetList: Array<Asset>
}

interface JumpVector {
    x:number,
    y:number,
    rotation: number,
    startX?: number,
    startY?: number
}

interface ServerSystemUpdate {
    ships: Array<ShipUpdate>
    asteroids: Array<AsteroidUpdate>
}

interface AsteroidUpdate {
    x: number
    y: number
    hp: number
    id:string
    type: 'Iron'|'Silver'|'Platinum',
}

interface ShipUpdate {
    type: PlayerEvents
    sequence: number
    shipData: ShipDataOnly
}

interface ShipDataOnly {
    x: number
    y: number
    rotation: number
    acceleration: Tuple
    name: string
    id:string
    shields: number
    armor: number
    hull: number
    fuel: number
    maxFuel: number
    energy: number
    maxEnergy: number
    heat: number
    maxHeat: number
    fighters: Array<ShipDataOnly>
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
    asset: string
    jumpVector: JumpVector
}

interface ServerMessage {
    type: ServerMessages
    system: string
    event: ShipUpdate | AsteroidUpdate | ServerSystemUpdate
}

interface StellarObjectConfig {
    x: number,
    y: number,
    asset: string,
    landable?: boolean
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

interface Asset {
    key: string,
    type: 'image' | 'spritesheet'
    resource: any
    data?: any
}

interface RState {
    isConnected: boolean
    currentUser: Player | null
    activeSession: Session
    showMap: boolean
    showPlanetMenu: boolean
}