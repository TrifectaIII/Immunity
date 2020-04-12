//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual shots
function Shot (player, velocity) {
    this.type = player.type;
    this.x = player.x;
    this.y = player.y;
    this.playerId = player.id;
    this.velocity = velocity;
    this.range = gameSettings.playerTypes[player.type].shots.range;
}

// object constructor for shots container
function Shots (room) {

    //hold individual shot objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all shots
Shots.prototype.update = function () {

    if (!this.room.gameOver) {
        //loop through all shots
        for (let id in this.objects) {
            let shot = this.objects[id];

            //move based on velocity
            shot.x += shot.velocity.x;
            shot.y += shot.velocity.y;

            let destroyed = false;

            // check for collisions with enemies

            let nearby_objs = this.room.Quadtree.query(new QT.QT_bound(shot.x,shot.y,100,100));

            for (let id in nearby_objs) {
                let enemy = nearby_objs[id];

                if (enemy.constructor.name == "Enemy") {
                    if (Physics.isColliding(
                            enemy, gameSettings.enemyTypes[enemy.type].radius, 
                            shot, 0 //shots have no radius
                        )) {
                            //remove health based on class
                            if (enemy.health > 0) {
                                enemy.health -= gameSettings.playerTypes[shot.type].shots.damage;
                                destroyed = true;

                                Physics.collideShotEnemy(shot,enemy);

                                //check if enemy died
                                if (enemy.health <= 0) {

                                    //increase killStreak
                                    if (shot.playerId in this.room.players.objects) {
                                        this.room.players.objects[shot.playerId].killStreak++;
                                    }
                                    //delete enemy
                                    delete this.room.enemies.objects[this.findIndexOfEnemy(enemy)];
                                }
                            }
                    }
                } 
            }

            //remove range based on velocity
            shot.range -= gameSettings.playerTypes[shot.type].shots.velocity;
            
            //destroy if out of range
            destroyed = destroyed || shot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.objects[id];
            }
        }
    }
}


//create a new shot
Shots.prototype.spawnShot = function (player, destX, destY) {

    //each class shoots differently
    let classShots = gameSettings.playerTypes[player.type].shots;

    //single-shot classes
    if (classShots.count <= 1) {
        
        //calculate velocity based on shot velocity and where the player clicked
        let velocity = Physics.componentVector(
            Physics.angleBetween(player.x, player.y, destX, destY), 
            classShots.velocity
        );

        //use id counter as id, then increase
        let id = 'shot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new Shot(player, velocity);
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < classShots.count; i++) {

            //calculate velocity based on shot velocity and where the player clicked and spread
            let velocity = Physics.componentVector(
                Physics.angleBetween(
                    player.x, player.y, 
                    destX, destY
                ) 
                + (i - classShots.count/2 + 0.5) 
                * (classShots.angle/(classShots.count-1)),
                classShots.velocity
            );

            //use id counter as id, then increase
            let id = 'shot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new Shot(player, velocity);
        }
    }
}  

// collect info on shot objects
Shots.prototype.collect = function () {

    var shot_info = {};

    for (let id in this.objects) {
        let shot = this.objects[id];
        shot_info[id] = {
            x: shot.x,
            y: shot.y,
            type: shot.type,
        };
    }

    return shot_info;
}

Shots.prototype.findIndexOfEnemy = function (enemy) {

    for( i in this.room.enemies.objects){
        let e = this.room.enemies.objects[i];
        if (e.x == enemy.x && e.y == enemy.y){
            return i;
        }
    }
}

module.exports = Shots;