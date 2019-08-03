
import * as Assets from './Assets'

export const Rigel:SystemState = {
    name: 'Rigel',
    x: 5000,
    y: 5000,
    stellarObjects: [{x: 550, y:550, asset: 'planet'}],
    asteroidConfig: [
        {
            type: 'Silver',
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
    assetList: Assets.defaults
}
export const Arcturus:SystemState = {
    name: 'Arcturus',
    x: 10000,
    y: 10000,
    stellarObjects: [{x: 850, y:750, asset: 'planet'}],
    asteroidConfig: [
        {
            type: 'Silver',
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
    assetList: Assets.defaults
}

export const Centauri:SystemState = {
    name: 'Centauri',
    x: 15000,
    y: 1000,
    stellarObjects: [{x: 150, y:750, asset: 'planet'}],
    asteroidConfig: [
        {
            type: 'Silver',
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
    assetList: Assets.defaults
}

export const StarSystems:Array<SystemState> = [
    Rigel, Arcturus, Centauri
]