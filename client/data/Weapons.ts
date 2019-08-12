import { WeaponType } from "../../enum";

export const ProtonGun:Weapon = {
    name: 'Proton Gun',
    type: WeaponType.Energy,
    energyPerShot: 1,
    heatPerShot: 0,
    projectileSpeed: 100,
    accuracy: 1,
    shotsPerSecond: 3,
    isTurrent: false,
    shieldDamage: 1,
    armorDamage: 0.5,
    projectileAsset: 'proton',
    range: 300,
    isBeam: false,
}

export const LaserCannon:Weapon = {
    name: 'Laser Cannon',
    type: WeaponType.Energy,
    energyPerShot: 1,
    heatPerShot: 0,
    projectileSpeed: 100,
    accuracy: 1,
    isBeam: true,
    isTurrent: false,
    shieldDamage: 0.1,
    armorDamage: 0.1,
    projectileAsset: 'lazor',
    range: 200
}

export const Weapons:Array<Weapon> = [ProtonGun, LaserCannon]