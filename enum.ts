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
    PLAYER_REPLACE_SHIP: 'prps'
}
export enum WeaponType {
    Energy='e', Kinetic='k', Quantum='q'
}
export enum Metals {
    IRON='Iron', SILVER='Silver', GOLD='Gold', PLATINUM='Platinum', COPPER='Copper'
}
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
    SELECT_PRIMARY='slctw'
}

export enum ServerMessages {
    HEADLESS_CONNECT= 'hct',
    PLAYER_DATA_UPDATED= 'pea',
    PLAYER_EVENT= 'pe',
    SERVER_UPDATE= 'su',
    PLAYER_LOGIN='plo',
    PLAYER_DATA_UPDATE='pda'
}
