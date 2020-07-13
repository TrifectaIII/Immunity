//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual player shots
function PlayerShot (id, player, velocity) {
    this.id = id;
    this.type = player.type;
    this.x = player.x;
    this.y = player.y;
    this.playerId = player.id;
    this.velocity = velocity;
    this.range = gameSettings.playerTypes[player.type].shots.range;
}

//returns damage of player shot
PlayerShot.prototype.getDamage = function () {
    return gameSettings.playerTypes[this.type].shots.damage;
}

//returns speed of player shot
PlayerShot.prototype.getSpeed = function () {
    return gameSettings.playerTypes[this.type].shots.velocity;
}

//object constructor for individual enemy shots
function EnemyShot (id, enemy, velocity) {
    this.id = id;
    this.type = enemy.type;
    this.x = enemy.x;
    this.y = enemy.y;
    this.velocity = velocity;
    this.range = gameSettings.enemyTypes[enemy.type].shots.range;
}

//returns damage of enemy shot
EnemyShot.prototype.getDamage = function () {
    return gameSettings.enemyTypes[this.type].shots.damage;
}

//returns speed of player shot
EnemyShot.prototype.getSpeed = function () {
    return gameSettings.enemyTypes[this.type].shots.velocity;
}

//object constructor for individual enemy shots
function BossShot (id, boss, velocity) {
    this.id = id;
    this.x = boss.x;
    this.y = boss.y;
    this.velocity = velocity;
    this.range = gameSettings.boss.shots.range;
}

//returns damage of eboss shot
BossShot.prototype.getDamage = function () {
    return gameSettings.boss.shots.damage;
}

//returns speed of player shot
BossShot.prototype.getSpeed = function () {
    return gameSettings.boss.shots.velocity;
}

// object constructor for shots container
function Shots (room) {

    //hold all objects
    this.objects = {};

    //hold player shot objects
    this.playerShots = {};

    //hold player shot objects
    this.enemyShots = {};

    //hold boss shot objects
    this.bossShots = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all shots
Shots.prototype.update = function () {

    if (!this.room.gameOver) {

        //loop through all player shots
        for (let id in this.playerShots) {
            let shot = this.playerShots[id];

            //move based on velocity
            shot.x += shot.velocity.x;
            shot.y += shot.velocity.y;

            let destroyed = false;

            // check for collisions with enemies

            //get nearby objects from qtree
            let nearby_objs = this.room.Quadtree.query(new QT.QT_bound(shot.x,shot.y,100,100));

            //loop through nearby objects
            for (let id in nearby_objs) {

                //access near entity
                let entity = nearby_objs[id];

                //if entity is enemy, and then check collision
                if (entity.constructor.name == "Enemy" &&
                    Physics.isColliding(
                        entity, gameSettings.enemyTypes[entity.type].radius, 
                        shot, 0 //shots have no radius
                    )) {

                            let enemy = entity;

                            destroyed = true;

                            //calculate physics collision
                            Physics.collideShotEnemy(shot, enemy);

                            //damage enemy
                            this.room.enemies.damageEnemy(
                                enemy, 
                                shot.getDamage(), 
                                shot.playerId
                            );

                            break;
                }
            }

            //check for collision with bosses 

            //loop through bosses
            for (let bid in this.room.bosses.objects) {

                let boss = this.room.bosses.objects[bid];

                if (Physics.isColliding(
                        boss, gameSettings.boss.radius, 
                        shot, 0 //shots have no radius
                    )) {

                            destroyed = true;

                            //boss unaffected by bullet momentum
                            // Physics.collideShotBoss(shot, boss);

                            //damage enemy
                            this.room.bosses.damageBoss(
                                boss, 
                                shot.getDamage(), 
                                shot.playerId
                            );

                            break;
                }
            }

            //remove range based on speed
            shot.range -= shot.getSpeed();
            
            //destroy if out of range
            destroyed = destroyed || shot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.playerShots[id];
                delete this.objects[id];
            }
        }

        //loop through all enemy shots
        for (let id in this.enemyShots) {
            let enemyShot = this.enemyShots[id];

            //move based on velocity
            enemyShot.x += enemyShot.velocity.x;
            enemyShot.y += enemyShot.velocity.y;

            let destroyed = false;

            // check for collisions with players
            for (let id in this.room.players.playing) {
                let player = this.room.players.playing[id];

                if (Physics.isColliding(
                        player, gameSettings.playerTypes[player.type].radius, 
                        enemyShot, 0 //enemy shots have no radius
                    )) {

                        destroyed = true;

                        Physics.collideShotPlayer(enemyShot, player);

                        //do damage to player if not cheating
                        if (player.name.toUpperCase() != gameSettings.testName.toUpperCase()){
                            this.room.players.damagePlayer(
                                player, 
                                enemyShot.getDamage()
                            );
                        }

                        break;
                }
            }

            //remove range based on speed
            enemyShot.range -= enemyShot.getSpeed();
            
            //destroy if out of range
            destroyed = destroyed || enemyShot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.enemyShots[id];
                delete this.objects[id];
            }
        }

        //loop through all boss shots
        for (let id in this.bossShots) {
            let bossShot = this.bossShots[id];

            //move based on velocity
            bossShot.x += bossShot.velocity.x;
            bossShot.y += bossShot.velocity.y;

            let destroyed = false;

            // check for collisions with players
            for (let id in this.room.players.playing) {
                let player = this.room.players.playing[id];

                if (Physics.isColliding(
                        player, gameSettings.playerTypes[player.type].radius, 
                        bossShot, 0 //enemy shots have no radius
                    )) {

                        destroyed = true;

                        Physics.collideShotPlayer(bossShot, player);

                        //do damage to player if not cheating
                        if (player.name.toUpperCase() != gameSettings.testName.toUpperCase()){
                            this.room.players.damagePlayer(
                                player, 
                                bossShot.getDamage()
                            );
                        }

                        break;
                }
            }

            //remove range based on speed
            bossShot.range -= bossShot.getSpeed();
            
            //destroy if out of range
            destroyed = destroyed || bossShot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.bossShots[id];
                delete this.objects[id];
            }
        }
    }
}


//create a new shot
Shots.prototype.spawnPlayerShot = function (player, destX, destY) {

    //each player has different settings
    let classShots = gameSettings.playerTypes[player.type].shots;

    //single-shot classes
    if (classShots.count <= 1) {
        
        //calculate velocity based on shot velocity and where the player clicked
        let velocity = Physics.componentVector(
            Physics.angleBetween(player.x, player.y, destX, destY), 
            classShots.velocity
        );

        //use id counter as id, then increase
        let id = 'playerShot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new PlayerShot(id, player, velocity);
        this.playerShots[id] = this.objects[id];
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < classShots.count; i++) {

            //calculate velocity based on shot velocity and where the player clicked and spread
            let velocity = Physics.componentVector(
                Physics.angleBetween(player.x, player.y, destX, destY) 
                + (i - classShots.count/2 + 0.5) 
                * (classShots.angle/(classShots.count-1)),
                classShots.velocity
            );

            //use id counter as id, then increase
            let id = 'playerShot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new PlayerShot(id, player, velocity);
            this.playerShots[id] = this.objects[id];
        }
    }
}  

//create a new enemy shot
Shots.prototype.spawnEnemyShot = function (enemy, destX, destY) {

    //each enemy class has different settings
    let classShots = gameSettings.enemyTypes[enemy.type].shots;

    //single-shot classes
    if (classShots.count <= 1) {
        
        //calculate velocity based on destination and shot speed
        let velocity = Physics.componentVector(
            Physics.angleBetween(enemy.x, enemy.y, destX, destY), 
            classShots.velocity
        );

        //use id counter as id, then increase
        let id = 'enemyShot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new EnemyShot(id, enemy, velocity);
        this.enemyShots[id] = this.objects[id];
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < classShots.count; i++) {

            //calculate velocity based on destination, shot speed and spread
            let velocity = Physics.componentVector(
                Physics.angleBetween(enemy.x, enemy.y, destX, destY) 
                + (i - classShots.count/2 + 0.5) 
                * (classShots.angle/(classShots.count-1)),
                classShots.velocity
            );

            //use id counter as id, then increase
            let id = 'enemyShot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new EnemyShot(id, enemy, velocity);
            this.enemyShots[id] = this.objects[id];
        }
    }
}  

//create a new boss shot
Shots.prototype.spawnBossShot = function (boss, destX, destY) {

    //boss shot settings
    let bossShots = gameSettings.boss.shots;

    //single-shot classes
    if (bossShots.count <= 1) {
        
        //calculate velocity based on destination and shot speed
        let velocity = Physics.componentVector(
            Physics.angleBetween(boss.x, boss.y, destX, destY), 
            bossShots.velocity
        );

        //use id counter as id, then increase
        let id = 'bossShot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new BossShot(id, boss, velocity);
        this.bossShots[id] = this.objects[id];
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < bossShots.count; i++) {

            //calculate velocity based on destination, shot speed and spread
            let velocity = Physics.componentVector(
                Physics.angleBetween(boss.x, boss.y, destX, destY) 
                + (i - bossShots.count/2 + 0.5) 
                * (bossShots.angle/(bossShots.count-1)),
                bossShots.velocity
            );

            //use id counter as id, then increase
            let id = 'bossShot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new BossShot(id, boss, velocity);
            this.bossShots[id] = this.objects[id];
        }
    }
}  

// collect info on shot objects
Shots.prototype.collect = function () {

    var playerShot_info = {};

    for (let id in this.playerShots) {
        let playerShot = this.playerShots[id];
        playerShot_info[id] = {
            x: playerShot.x,
            y: playerShot.y,
            type: playerShot.type,
        };
    }

    var enemyShot_info = {};

    for (let id in this.enemyShots) {
        let enemyShot = this.enemyShots[id];
        enemyShot_info[id] = {
            x: enemyShot.x,
            y: enemyShot.y,
            type: enemyShot.type,
        };
    }

    var bossShot_info = {};

    for (let id in this.bossShots) {
        let bossShot = this.bossShots[id];
        bossShot_info[id] = {
            x: bossShot.x,
            y: bossShot.y,
            type: bossShot.type,
        };
    }

    return {
        playerShots: playerShot_info,
        enemyShots: enemyShot_info,
        bossShots: bossShot_info,
    };
}

// Shots.prototype.findIndexOfEnemy = function (enemy) {

//     for( i in this.room.enemies.objects){
//         let e = this.room.enemies.objects[i];
//         if (e.x == enemy.x && e.y == enemy.y){
//             return i;
//         }
//     }
// }

module.exports = Shots;