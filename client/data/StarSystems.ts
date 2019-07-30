
import * as Assets from './Assets'

export const Rigel:SystemState = {
    name: 'Rigel',
    x: 0,
    y: 0,
    stellarObjects: [{x: 550, y:550, asset: 'planet'}],
    asteroidConfig: [
        {
            type: 'Platinum',
            density: 1,
            isBelt: true
        },
        {
            type: 'Iron',
            density: 3,
            isBelt: true
        }
    ],
    ships: [],
    assetList: [
        { key: 'star', resource: Assets.star, type: 'image' },
        { key: 'bigStar', resource: Assets.star2, type: 'image' },
        { key: 'planet', resource: Assets.planet, type: 'image' },
        { key: 'asteroid1', resource: Assets.asteroid1, type: 'image' },
        { key: 'asteroid2', resource: Assets.asteroid2, type: 'image' },
        { key: 'boom', resource: Assets.boom, type: 'spritesheet', data:  { frameWidth: 64, frameHeight: 64 } },
        { key: 'lazor', resource: Assets.lazor, type: 'image' },
        { key: 'ship', resource: Assets.ship, type: 'image' },
        { key: 'proton', resource: Assets.proton, type: 'image' }
    ]
}
export const Arcturus:SystemState = {
    name: 'Arcturus',
    x: 10000,
    y: 10000,
    stellarObjects: [{x: 850, y:750, asset: 'planet'}],
    asteroidConfig: [
        {
            type: 'Platinum',
            density: 1,
            isBelt: true
        },
        {
            type: 'Iron',
            density: 3,
            isBelt: true
        }
    ],
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
        { key: 'proton', resource: Assets.proton, type: 'image' }
    ]
}

export const StarSystems:Array<SystemState> = [
    Rigel, Arcturus
]