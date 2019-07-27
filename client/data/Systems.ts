
import * as Assets from '../data/Assets'

export const Rigel:SystemState = {
    name: 'Rigel',
    x: 0,
    y: 0,
    stellarObjects: [],
    asteroidConfig: [],
    ships: [],
    assetList: [
        { key: 'star', resource: Assets.star, type: 'image' },
        { key: 'bigStar', resource: Assets.star2, type: 'image' },
        { key: 'planet', resource: Assets.planet, type: 'image' },
        { key: 'asteroid1', resource: Assets.asteroid1, type: 'image' },
        { key: 'asteroid2', resource: Assets.asteroid2, type: 'image' },
        { key: 'lazor', resource: Assets.lazor, type: 'image' },
        { key: 'ship', resource: Assets.ship, type: 'image' },
        { key: 'boom', resource: Assets.boom, type: 'spritesheet', data:  { frameWidth: 64, frameHeight: 64 } },
    ]
}
export const Arcturus:SystemState = {
    name: 'Arcturus',
    x: 10000,
    y: 10000,
    stellarObjects: [],
    asteroidConfig: [],
    ships: [],
    assetList: [
        { key: 'star', resource: Assets.star, type: 'image' },
        { key: 'bigStar', resource: Assets.star2, type: 'image' },
        { key: 'planet', resource: Assets.planet, type: 'image' },
        { key: 'asteroid1', resource: Assets.asteroid1, type: 'image' },
        { key: 'asteroid2', resource: Assets.asteroid2, type: 'image' },
        { key: 'lazor', resource: Assets.lazor, type: 'image' },
        { key: 'ship', resource: Assets.ship, type: 'image' },
        { key: 'boom', resource: Assets.boom, type: 'spritesheet', data:  { frameWidth: 64, frameHeight: 64 } },
    ]
}