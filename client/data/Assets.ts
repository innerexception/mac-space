export const star = require('../assets/star/g0.png')
export const star2 = require('../assets/star/a0.png')
export const ship = require('../assets/ship/aerie.png')
export const planet = require('../assets/planet/callisto.png')
export const asteroid1 = require('../assets/asteroid/iron/spin-00.png')
export const asteroid2 = require('../assets/asteroid/lead/spin-00.png')
export const lazor = require('../assets/projectile/laser+0.png')
export const boom = require('../assets/explosion.png')
export const proton = require('../assets/projectile/proton+.png')


export const defaults = [
    { key: 'star', resource: star, type: 'image' },
    { key: 'bigStar', resource: star2, type: 'image' },
    { key: 'planet', resource: planet, type: 'image' },
    { key: 'Iron', resource: asteroid1, type: 'image' },
    { key: 'Silver', resource: asteroid2, type: 'image' },
    { key: 'lazor', resource: lazor, type: 'image' },
    { key: 'ship', resource: ship, type: 'image' },
    { key: 'boom', resource: boom, type: 'spritesheet', data:  { frameWidth: 64, frameHeight: 64 } },
    { key: 'proton', resource: proton, type: 'image' }
]