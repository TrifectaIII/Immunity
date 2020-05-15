//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual enemy shots
function EnemyShot (enemy, velocity) {
    this.type = enemy.type;
    this.x = enemy.x;
    this.y = enemy.y;
    this.velocity = velocity;
    this.range = gameSettings.enemyTypes[enemy.type].shots.range;
}

// object constructor for enemy shots container
function EnemyShots (room) {

    //hold individual shot objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all enemy shots
EnemyShots.prototype.update = function () {

    if (!this.room.gameOver) {
        //loop through all shots
        for (let id in this.objects) {
            let enemyshot = this.objects[id];

            //move based on velocity
            enemyshot.x += enemyshot.velocity.x;
            enemyshot.y += enemyshot.velocity.y;

            let destroyed = false;

            // check for collisions with players
            for (let id in this.room.players.playing) {
                let player = this.room.players.playing[id];

                if (Physics.isColliding(
                        player, gameSettings.playerdTypes[player.type].radius, 
                        enemyshot, 0 //enemy shots have no radius
                    )) {
                        destroyed = true;

                        //do damage to player
                        player.health -= gameSettings.enemyTypes[enemyshot.type].shots.damage;

                        //if player died, do not allow negative life
                        player.health = Math.max(player.health, 0);
                }
            }

            //remove range based on velocity
            enemyshot.range -= gameSettings.enemyTypes[enemyshot.type].shots.velocity;
            
            //destroy if out of range
            destroyed = destroyed || enemyshot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.objects[id];
            }
        }
    }
}


//create a new enemy shot
EnemyShots.prototype.spawnShot = function (enemy, destX, destY) {

    //each class shoots differently
    let classShots = gameSettings.enemyTypes[enemy.type].shots;

    //single-shot classes
    if (classShots.count <= 1) {
        
        //calculate velocity based on player location and shot speed
        let velocity = Physics.componentVector(
            Physics.angleBetween(enemy.x, enemy.y, destX, destY), 
            classShots.velocity
        );

        //use id counter as id, then increase
        let id = 'enemyshot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new EnemyShot(player, velocity);
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < classShots.count; i++) {

            //calculate velocity based on player location, shot speed and spread
            let velocity = Physics.componentVector(
                Physics.angleBetween(
                    enemy.x, enemy.y, 
                    destX, destY
                ) 
                + (i - classShots.count/2 + 0.5) 
                * (classShots.angle/(classShots.count-1)),
                classShots.velocity
            );

            //use id counter as id, then increase
            let id = 'enemyshot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new EnemyShot(enemy, velocity);
        }
    }
}  

// collect info on enemy shot objects
EnemyShots.prototype.collect = function () {

    var enemyshot_info = {};

    for (let id in this.objects) {
        let enemyshot = this.objects[id];
        enemyshot_info[id] = {
            x: enemyshot.x,
            y: enemyshot.y,
            type: enemyshot.type,
        };
    }

    return enemyshot_info;
}

module.exports = EnemyShots;