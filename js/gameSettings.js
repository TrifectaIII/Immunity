var gameSettings = {

    // GENERAL 
    /////////////////////////////////////////////////

    //title of game (WIP)
    title: "Immunity",

    //maximum length of player names
    nameMax: 10,

    //player name for testing (not case sensitive)
    testName: "cheater",

    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 3000,
    height: 3000,

    //starting lives for each room
    livesStart: 2,

    // PLAYERS
    /////////////////////////////////////////////////

    // time in MS to respawn players
    respawnTime: 3000,

    //info specific to each class
    playerTypes: {

        soldier: {

            radius: 25,
            maxHealth: 15,
            acceleration: 1,
            maxVelocity: 5,
            mass: 15,

            colors: { //blue
                light: '#29ADFF',
                dark: '#1D2B53',
            },

            shots: {
                count: 1,
                velocity: 15,
                angle: 0,
                range: 500,
                cooldown: 100,
                damage: 3,
                mass: 1,
            },
        },

        engineer: {

            radius: 25,
            maxHealth: 15,
            acceleration: 1,
            maxVelocity: 5,
            mass: 20,

            colors: { //yellow
                light: '#FFEC27',
                dark: '#AB5236',
            },

            shots: {
                count: 3,
                velocity: 15,
                angle:Math.PI/6,
                range: 300,
                cooldown: 200,
                damage: 2,
                mass: 1,
            },
        },

        sniper: {

            radius: 20,
            maxHealth: 10,
            acceleration: 3,
            maxVelocity: 7,
            mass: 10,

            colors: { //pink
                light: '#FF77A8',
                dark: '#7E2553',
            },

            shots: {
                count: 1,
                velocity: 25,
                angle: 0,
                range: 1000,
                cooldown: 500,
                damage: 30,
                mass: 20,
            },
        },

        heavy: {
            
            radius: 30,
            maxHealth: 20,
            acceleration: 0.3,
            maxVelocity: 4,
            mass: 20,

            colors: { //green
                light: '#00E436',
                dark: '#008751',
            },

            shots: {
                count: 5,
                velocity: 15,
                angle:Math.PI/4,
                range: 200,
                cooldown: 250,
                damage: 3,
                mass: 5,
            },
        },
    },

    // ENEMIES 
    /////////////////////////////////////////////////

    //number of enemies per player per wave at start
    enemyCountStart: 5,

    //how many additional enemies per player each wave
    enemyCountScale: 1,

    //info specific to each enemy type
    enemyTypes: {

        normal: {

            radius: 25,
            maxHealth: 15,
            acceleration: 0.2,
            maxVelocity: 4,
            mass: 15,

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
            maxHealth: 25,
            acceleration: 0.1,
            maxVelocity: 3,
            mass: 30,

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
            acceleration: 0.5,
            maxVelocity: 8,
            mass: 1,

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

    // PICKUPS
    /////////////////////////////////////////////////

    //chance of enemy dropping a pickup (fraction of 1)
    pickupDropChance: 0.1,

    //max pickups in the world at a time, per player
    pickupMax: 3,

    //radius of pickup objects
    pickupRadius: 18,

    //different types of pickups
    pickupTypes: {
        health: {
            chance: 95,
        },

        life: {
            chance: 5,
        },
    },

    //health pickup value
    pickupHealthAmount: 5,

    // ZONES
    /////////////////////////////////////////////////

    //number of zones per wave per person
    zoneCount: 1,

    //starting radius of zones
    zoneRadiusStart: 500,

    //how much zones grow each wave
    zoneRadiusScale: 10,

    //maximum radius of zones
    zoneRadiusMax: 1000,

    //rate of closing, per player in zone
    zoneCloseRate: 1,

    //rate of zone growing when no player in zone
    zoneGrowRate: 0.25,

    //cooldown on zones spawning enemies (ms)
    zoneCooldown: 2500,

    // OTHER
    /////////////////////////////////////////////////

    //color palette
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