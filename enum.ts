export const ApiUrl= 'ws://localhost:8082'
export const ReducerActions= {
    PLAYER_AVAILABLE: 'ma',
    CONNECTION_ERROR: 'ce',
    CONNECTED: 'c',
    SET_USER: 'su',
    OPEN_PLANET: 'op',
    OPEN_MAP: 'om',
    PLAYER_EVENT: 'pev',
    COMMODITY_ORDER:'cord',
    SET_LOGIN:'srl',
    LOGIN_FAILED: 'lff',
    SYSTEM_SELECTED: 'ssl',
    TAKE_OFF:'tot',
    PLAYER_REPLACE: 'rplpl',
    PLAYER_REPLACE_SHIP: 'prps',
    PLANET_REPLACE: 'plrp',
    ACCEPT_MISSION: 'ams',
    COMPLETE_MISSION: 'compm',
    ABANDON_MISSION: 'abndm',
    PLAYER_REPLACE_TARGET:'prprt',
    PLAYER_SHIP_LOST: 'pded'
}
export enum WeaponType {
    Energy='e', Kinetic='k', Quantum='q'
}
export enum Metals {
    IRON='Iron', SILVER='Silver', GOLD='Gold', PLATINUM='Platinum', COPPER='Copper'
}
export enum FactionName {
    NEUTRAL='neut',
    PIRATE='pirat',
    POLICE='poletzei'
}
export enum CargoType {
    PASSENGER='pass',
    COMMODITY='comm',
    ILLEGAL='ille'
}
export const CargoTypes = [
    CargoType.PASSENGER, CargoType.ILLEGAL, CargoType.COMMODITY
]
export enum MissionType {
    ESCORT='esco', DELIVERY='deliv', DESTROY='destro', PATROL='pat'
}
export const MissionTypes = [
    MissionType.DELIVERY, MissionType.DESTROY, MissionType.ESCORT
]
export enum PlayerEvents { 
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
    SELECT_PRIMARY='slctw',
    COMPLETE_MISSION='cmplm',
    ABANDON_MISSION='abndm',
    SELECT_TARGET='selct'
}

export enum AiProfileType {
    MERCHANT='merc',
    PIRATE='pirate',
    POLICE='police',
    PIRATE_PATROL='pirate_patrol'
}

export enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_DATA_UPDATED= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su',
    PLAYER_LOGIN='plo',
    PLAYER_DATA_UPDATE='pda'
}
