//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual boss
function Boss (type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    // this.velocity = {
    //     x: 0,
    //     y: 0,
    // }
    // this.health = gameSettings.bossTypes[this.type].maxHealth;
    // this.cooldown = 0;
} 

// object constructor for bosses container
function Bosses (room) {

    //hold individual enemy objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all bosses
Bosses.prototype.update = function () {
    
    //make sure game is not over
    if (!this.room.gameOver) {

        
    }
}

// spawn an individual boss in
Bosses.prototype.spawnBoss = function () {

    var type;
 
    this.objects[id] = new Boss(type, x, y);
}

//kills boss based on it's id
Bosses.prototype.killEnemy = function (id) {
    let boss = this.objects[id];

    if (Math.random() < gameSettings.pickupDropChance) {
        this.room.pickups.spawnPickup(boss.x, boss.y);
    }

    delete this.objects[id];
}

//collects info on enemies to send to clients
Bosses.prototype.collect = function () {

    let boss_info = {};

    for (let id in this.objects) {
        let boss = this.objects[id];
        boss_info[id] = {
            x: boss.x,
            y: boss.y,
            type: boss.type,
            health: boss.health,
        };
    }
    
    return boss_info;
}

//get count of bosses
Bosses.prototype.count = function () {
    return Object.keys(this.objects).length;
}

module.exports = Bosses;