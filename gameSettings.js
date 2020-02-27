var gameSettings = {
    //title of game (WIP)
    title: "Immunity",

    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 2000,
    height: 2000,

    //starting lives for each room
    livesStart: 3,

    // time in MS to respawn players
    respawnTime: 3000,

    //info specific to each class
    playerTypes: {

        soldier: {

            radius: 25,
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
                range: 500,
                cooldown: 100,
                damage: 1,
            },
        },

        engineer: {

            radius: 25,
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
                cooldown: 100,
                damage: 1,
            },
        },

        sniper: {

            radius: 20,
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
                range: 1000,
                cooldown: 1000,
                damage: 10,
            },
        },

        heavy: {
            
            radius: 30,
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
                range: 200,
                cooldown: 1000,
                damage: 3,
            },
        },
    },

    //number of enemies per player per wave
    enemyMax: 10,

    //info specific to each enemy type
    enemyTypes: {

        normal: {

            radius: 25,
            maxHealth: 5,
            speed: 4,

            attack: {
                cooldown: 500,
                damage: 1,
            },

            colors: {
                dark: "#000000",
                light: "#29ADFF",
            },
        },

        heavy: {

            radius: 40,
            maxHealth: 15,
            speed: 3,

            attack: {
                cooldown: 1000,
                damage: 3,
            },

            colors: {
                dark: "#000000",
                light: "#00E436",
            },
        },

        scout: {

            radius: 20,
            maxHealth: 5,
            speed: 6,

            attack: {
                cooldown: 750,
                damage: 1,
            },

            colors: {
                dark: "#000000",
                light: "#FF77A8",
            },
        },
        
    },

    //time between spawns of pickups in ms
    pickupTime: 5000,

    //max pickups in the world at a time, per player
    pickupMax: 3,

    //radius of pickup objects
    pickupRadius: 18,

    //different types of pickups
    pickupTypes: {
        health: {
            chance: 80,
        },

        life: {
            chance: 20,
        },
    },

    //health pickup value
    pickupHealthAmount: 5,

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