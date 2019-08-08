
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
    PLAYER_SPAWNED= 'ps',
    START_LANDING='sl',
    STOP_LANDING='stl',
    START_JUMP='sj',
    TAKE_OFF='take_off',
    SELECT_SYSTEM='sys',
    COMMODITY_ORDER='cord',
    PLAYER_LOGIN='plo'
}

declare enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_DATA_UPDATED= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su',
    PLAYER_LOGIN='plo',
    PLAYER_DATA_UPDATE='pda'
}

interface Tuple {
    x: number
    y: number
    rotation?: number
}

interface Player {
    loginName:string
    id:string
    activeShipId: string
    ships: Array<ShipData>
    reputation: Array<Faction>
    notoriety: number
    credits: number
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
    shipData: ShipData
    landingSequence: boolean
    applyUpdate(update:ShipUpdate)
    sendSpawnUpdate()
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
    ships: Array<ShipData>,
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
    asteroids: Array<AsteroidData>
    resources: Array<ResourceData>
}

interface AsteroidData {
    x: number
    y: number
    hp: number
    id:string
    type?: 'Iron'|'Silver'|'Platinum'
    dead: boolean
}

interface ResourceData {
    x: number
    y:number
    type?: 'Iron'|'Silver'|'Platinum'
    id: string
    weight: number
    dead: boolean
}

interface DeadEntityUpdate {
    id: string
}

interface ShipUpdate {
    type: PlayerEvents
    sequence: number
    shipData: ShipData
}

interface ShipData {
    name: string
    id:string
    ownerId: string
    shields: number
    armor: number
    hull: number
    fuel: number
    maxFuel: number
    energy: number
    maxEnergy: number
    heat: number
    maxHeat: number
    fighters: Array<ShipData>
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
    cargo: Array<InventoryData>
    systemName: string
    landedAt?: StellarObjectConfig
    x?: number
    y?: number
    rotation?: number
    velocity?: Tuple
    transientData: {
        firePrimary?: boolean
        landingTargetName?: string
        takeOff?: boolean
        targetSystemName?: string
        commodityOrder?: CommodityOrder
    }
}

interface CommodityOrder {
    commodity:Commodity
    amount:number
    buy: boolean
}

interface InventoryData {
    name: string
    weight: number
    asset: string
}

interface ServerMessage {
    type: ServerMessages
    system: string
    event: ShipUpdate | AsteroidData | ServerSystemUpdate | Player | PlayerLogin | CommodityOrder
}

interface PlayerLogin {
    loginName:string
    loginPassword:string
}

interface StellarObjectConfig {
    x: number
    y: number
    asset: string
    landable?: boolean
    name: string
    commodities?: Array<Commodity>
}

interface Commodity {
    name: string
    price: number
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
    key: string
    type: string
    resource: any
    data?: any
}

interface RState {
    isConnected: boolean
    player: Player | null
    activeShip: ShipData | null
    showMap: boolean
    showPlanetMenu: boolean
    playerEvent: PlayerEvents
    commodityOrder: CommodityOrder
    loginName:string
    loginPassword:string
    loginError:boolean
    systemName:string
}