var gameSettings = {
    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 2000,
    height: 2000,

    // time in MS to respawn players
    respawnTime: 3000,

    //players speed
    playerSpeed: 5,

    //size of player
    playerRadius: 25,

    //time between spawns of pickups in ms
    pickupTime: 5000,

    //max pickups in the world at a time, per player
    pickupMax: 4,

    //different types of pickups
    pickupTypes: ['health'],

    //info specific to each class
    classes: {
        heavy: {
            maxHealth: 20,
            speed: 3,
            colors: ['#00E436','#008751'],//green
            shotCount: 5,
            shotSpeed: 15,
            shotAngle: Math.PI/4,
            shotLifespan: 15,
        },
        engineer: {
            maxHealth: 15,
            speed: 5,
            colors: ['#FFEC27','#AB5236'],//yellow
            shotCount: 3,
            shotSpeed: 15,
            shotAngle: Math.PI/6,
            shotLifespan: 20,
        },
        sniper: {
            maxHealth: 10,
            speed: 7,
            colors: ['#FF77A8','#7E2553'],//pink
            shotCount: 1,
            shotSpeed: 25,
            shotAngle: 0,
            shotLifespan: 60,
        },
        soldier: {
            maxHealth: 15,
            speed: 5,
            colors: ['#29ADFF','#1D2B53'],//blue
            shotCount: 1,
            shotSpeed: 15,
            shotAngle: 0,
            shotLifespan: 35,
        },
    },
}

// EXPORT only if server side
///////////////////////////////////////////
try{
    module.exports = gameSettings;
}
catch {
    // console.log('this is the client!')
}