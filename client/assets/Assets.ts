export const star = require('./star/g0.png')
export const star2 = require('./star/a0.png')
export const ship = require('./ship/aerie.png')
export const planet = require('./planet/callisto.png')
export const asteroid1 = require('./asteroid/iron/spin-00.png')
export const asteroid2 = require('./asteroid/lead/spin-00.png')
export const lazor = require('./projectile/laser+0.png')
export const boom = require('./explosion.png')
export const proton = require('./projectile/proton+.png')


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