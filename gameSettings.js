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

    //size of player
    playerRadius: 25,

    //time between spawns of pickups in ms
    pickupTime: 5000,

    //max pickups in the world at a time, per player
    pickupMax: 1,

    //different types of pickups
    pickupTypes: ['health'],

    //info specific to each class
    classes: {

        heavy: {

            maxHealth: 20,
            speed: 3,

            colors: { //green
                light: '#00E436',
                dark: '#008751',
            },

            shots: {
                count: 5,
                speed: 15,
                angle:Math.PI/4,
                range: 250,
            },
        },

        engineer: {

            maxHealth: 15,
            speed: 5,

            colors: { //yellow
                light: '#FFEC27',
                dark: '#AB5236',
            },

            shots: {
                count: 3,
                speed: 15,
                angle:Math.PI/6,
                range: 300,
            },
        },
        sniper: {

            maxHealth: 10,
            speed: 7,

            colors: { //pink
                light: '#FF77A8',
                dark: '#7E2553',
            },

            shots: {
                count: 1,
                speed: 25,
                angle: 0,
                range: 800,
            },
        },

        soldier: {

            maxHealth: 15,
            speed: 5,

            colors: { //blue
                light: '#29ADFF',
                dark: '#1D2B53',
            },

            shots: {
                count: 1,
                speed: 15,
                angle: 0,
                range: 600,
            },
        },
    },

    colors: {
        black:"#000000",
        brown:"#AB5236",
        red:"#FF004D",
        blue:"#29ADFF",
        darkblue:"#1D2B53",
        darkgrey:"#5F574F",
        mango:"#FFA300",
        purple:"#83769C",
        darkpink:"#7E2553",
        grey:"#C2C3C7",
        yellow:"#FFEC27",
        pink:"#FF77A8",
        darkgreen:"#008751",
        white:"#FFF1E8",
        green:"#00E436",
        tan:"#FFCCAA",
    }
}

// EXPORT only if node.js
///////////////////////////////////////////
if (typeof module != 'undefined') {
    module.exports = gameSettings;
}