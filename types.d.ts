declare enum WeaponType {
    Energy='e', Kinetic='k', Quantum='q'
}

declare enum Direction {
    DOWN, UP, FORWARD, REVERSE, RIGHT, LEFT
}

declare enum Metals {
    IRON='Iron', SILVER='Silver', GOLD='Gold', PLATINUM='Platinum', COPPER='Copper'
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
    PLAYER_LOGIN='plo',
    OUTFIT_ORDER='outo',
    SHIP_PURCHASE='spur',
    ACCEPT_MISSION='amis',
    SELECT_PRIMARY='slctw'
}

declare enum FactionName {
    NEUTRAL='neut',
    PIRATE='pirat',
    POLICE='poletzei'
}

declare enum AiProfileType {
    
    MERCHANT='merc',
    PIRATE='pirate',
    POLICE='police'
}

declare enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_DATA_UPDATED= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su',
    PLAYER_LOGIN='plo',
    PLAYER_DATA_UPDATE='pda',
    PLANET_EVENT='plev'
}

declare enum MissionType {
    ESCORT, DELIVERY, DESTROY
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
    name: FactionName
    reputation: number
    missions: Array<Mission>
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

interface Weapon {
    name: string
    type: WeaponType
    energyPerShot: number
    heatPerShot: number
    projectileSpeed: number
    accuracy: number
    shotsPerSecond?: number
    ammo?: number
    maxAmmo?: number
    projectileTrackingInterval?: number
    projectileTurnSpeed?: number
    isTurrent: boolean
    shieldDamage: number
    armorDamage: number
    projectileAsset: string
    range: number
    isBeam: boolean
    shipId: string
}

interface Engine {
    name: string
    acceleration: number
    maxSpeed: number
}

interface Thruster {
    name: string
    turn: number
}

interface ShipOutfit {
    outfit: Weapon | Engine | Thruster
    weight: number
    price: number
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
    planets: Array<StellarObjectConfig>
}

interface AsteroidData {
    x: number
    y: number
    hp: number
    id:string
    type?: Metals
    dead: boolean
}

interface ResourceData {
    x: number
    y:number
    type?: Metals
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
    faction: FactionName
    shields: number
    maxShields: number
    armor: number
    hull: number
    maxHull:number
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
    maxCargoSpace: number
    gunMounts: number
    turrentMounts: number
    hardPoints: number
    weapons: Array<Weapon>
    selectedPrimaryIndex: number
    asset: string
    cargo: Array<InventoryData>
    systemName: string
    landedAtName?: string
    x?: number
    y?: number
    rotation?: number
    velocity?: Tuple
    aiProfile: AiProfile
    transientData: {
        firePrimary?: boolean
        landingTargetName?: string
        targetSystemName?: string
        commodityOrder?: CommodityOrder
    }
}

interface AiProfile {
    type: AiProfileType
    attackerId: string
    attackTime: number
    jumpedIn: boolean
    targetShipId: string
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
    system: string | Array<SystemState>
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
    planetName: string
    description: string
    commodities?: Array<Commodity>
    missions?: Array<Mission>
    bar?: Array<Mission>
    outfitter?: Array<ShipOutfit>
    shipyard?: Array<ShipData>
}

interface Mission {
    description: string
    destination: StellarObjectConfig
    payment: number
    cargo: InventoryData
    type: MissionType
    targets: Array<ShipData>
}

interface Commodity {
    name: string
    price: number
}

interface AsteroidConfig {
    type: Metals,
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
    activePlanet: StellarObjectConfig | null
    showMap: boolean
    showPlanetMenu: boolean
    playerEvent: PlayerEvents
    commodityOrder: CommodityOrder
    loginName:string
    loginPassword:string
    loginError:boolean
    systemName:string
}