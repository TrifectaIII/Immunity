var gameSettings = {
    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 1000,
    height: 1000,

    // starting health for players
    maxHealth: 10,

    // time in MS to respawn players
    respawnTime: 3000,

    //players speed
    playerSpeed: 5,

    //size of player
    playerRadius: 25,

    //speed of shots + full spread
    shotSpeed: 15,

    //lifespan of shots (in ticks)
    shotLifespan: 40,

    //lifespan of full spread (in ticks)
    fullSpreadLifespan: 15,

    //number of shots per full spread
    fullSpreadCount: 3,

    //angle between edge shots in full spread in radians
    fullSpreadAngle: Math.PI/6,

    //time between spawns of pickups in ms
    pickupTime: 5000,

    //max pickups in the world at a time, per player
    pickupMax: 4,

    //different types of pickups
    pickupTypes: ['health'],

    //colors for each player to tell them apart
    colorPairs: {
        blue: ['#29ADFF','#1D2B53'],
        yellow: ['#FFEC27','#AB5236'],
        pink: ['#FF77A8','#7E2553'],
        green: ['#00E436','#008751'],
    },

    //info specific to each class
    classes: {
        heavy: {
            colors: ['#00E436','#008751'],//green
        },
        engineer: {
            colors: ['#FFEC27','#AB5236'],//yellow
        },
        sniper: {
            colors: ['#FF77A8','#7E2553'],//pink
        },
        soldier: {
            colors: ['#29ADFF','#1D2B53'],//blue
        },
    },
}

//players component speed when moving @ angle
gameSettings.playerSpeedAngle = gameSettings.playerSpeed/(Math.sqrt(2));

// EXPORT only if server side
///////////////////////////////////////////
try{
    module.exports = gameSettings;
}
catch {
    // console.log('this is the client!')
}