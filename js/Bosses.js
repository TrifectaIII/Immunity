//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual boss
function Boss (id, x, y, playerCount) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.velocity = {
        x: 0,
        y: 0,
    }
    this.maxHealth = gameSettings.boss.maxHealth * playerCount;
    this.health = this.maxHealth;
    this.cooldown = 0;

    this.focusCooldown = 0;
    this.focus = 'none';
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

        //loop through objects
        for (let id in this.objects) {
            let boss = this.objects[id];

            //countdown focus cooldown
            if (boss.focusCooldown > 0) {
                boss.focusCooldown -= gameSettings.tickRate;
            }

            //change focus if needed
            if (
                (!(boss.focus in this.room.players.playing) || this.focusCooldown <= 0) &&
                this.room.players.playingCount() > 0
            ) {
                    //choose new focus randomly from playing 
                    let playingIds = Object.keys(this.room.players.playing);
                    boss.focus = playingIds[Math.floor(Math.random()*playingIds.length)];
                    //reset cooldown
                    boss.focusCooldown = gameSettings.boss.focusTime;
            }

            //countdown attack cooldown
            if (boss.cooldown > 0) {
                boss.cooldown -= gameSettings.tickRate;
            }

            //if focus exists
            if (boss.focus in this.room.players.playing) {
                player = this.room.players.playing[boss.focus];

                //accelerate in direction of focus
                let acceleration = Physics.componentVector(
                    Physics.angleBetween(boss.x, boss.y, player.x, player.y), 
                    gameSettings.boss.acceleration
                );
                boss.velocity.x += acceleration.x;
                boss.velocity.y += acceleration.y;

                //reduce velocity to max, if needed
                Physics.capVelocity(boss, gameSettings.boss.maxVelocity);

                //move based on velocity
                boss.x += boss.velocity.x
                boss.y += boss.velocity.y
            }

            //boundaries
            boss.x = Math.min(Math.max(boss.x, 0), gameSettings.width);
            boss.y = Math.min(Math.max(boss.y, 0), gameSettings.height);

            //check for collision with enemies
            for (let eid in this.room.enemies.objects) {
                let enemy = this.room.enemies.objects[eid];

                Physics.collideAndDisplace(
                    boss, 
                    gameSettings.boss.radius,
                    enemy, 
                    gameSettings.enemyTypes[enemy.type].radius
                );
            }

            //check for collision with players
            for (let pid in this.room.players.playing) {
                let player = this.room.players.playing[pid];

                Physics.collideAndDisplace(
                    boss, 
                    gameSettings.boss.radius,
                    player, 
                    gameSettings.playerTypes[player.type].radius
                );
            }
        }
    }
}

// spawn an individual boss in
Bosses.prototype.spawnBoss = function () {

    //increment id counter
    let id = 'boss' + (this.idCounter++).toString();

    //position boss to spawn at middle of game area
    let x = gameSettings.width/2;
    let y = gameSettings.height/2;

    //create object
    this.objects[id] = new Boss(id, x, y, this.room.playerCount());
}

//kills boss based on it's id
Bosses.prototype.killBoss = function (id) {
    let boss = this.objects[id];

    if (Math.random() < gameSettings.enemyDropChance) {
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
            health: boss.health,
            maxHealth: boss.maxHealth,
        };
    }
    
    return boss_info;
}

//get count of bosses
Bosses.prototype.count = function () {
    return Object.keys(this.objects).length;
}

module.exports = Bosses;