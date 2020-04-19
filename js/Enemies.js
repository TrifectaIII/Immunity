//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual enemy
function Enemy (type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.velocity = {
        x: 0,
        y: 0,
    }
    this.health = gameSettings.enemyTypes[this.type].maxHealth;
    this.cooldown = 0;
} 

// object constructor for enemies container
function Enemies (room) {

    //hold individual enemy objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all enemies
Enemies.prototype.update = function () {
    
    //make sure game is not over
    if (!this.room.gameOver) {

        //get player objects from room
        let players = this.room.players.playing;

        //loop through all enemies
        for (let id in this.objects) {
            let enemy = this.objects[id];

            //find closest player
            let closestDistance = Infinity;
            let closestId = 0;

            for (let pid in players) {
                if (players[pid].health > 0) {
                    let thisDistance = Physics.distance(players[pid], enemy);
                    if (thisDistance < closestDistance) {
                        closestDistance = thisDistance;
                        closestId = pid;
                    }
                }
            }

            //reduce attack cooldown
            if (enemy.cooldown > 0) {
                enemy.cooldown -= gameSettings.tickRate;
            }

            //if a living player exists
            if (closestDistance < Infinity) {

                //get player object
                let player = players[closestId];

                //accelerate in direction of closest player
                let acceleration = Physics.componentVector(
                    Physics.angleBetween(enemy.x, enemy.y, player.x, player.y), 
                    gameSettings.enemyTypes[enemy.type].acceleration
                );
                enemy.velocity.x += acceleration.x;
                enemy.velocity.y += acceleration.y;

                //reduce velocity to max, if needed
                Physics.capVelocity(enemy, gameSettings.enemyTypes[enemy.type].maxVelocity);

                //move based on velocity
                enemy.x += enemy.velocity.x
                enemy.y += enemy.velocity.y

                //attacking
                if (enemy.cooldown <= 0 &&
                    Physics.isColliding(
                        enemy, gameSettings.enemyTypes[enemy.type].radius,
                        player, gameSettings.playerTypes[player.type].radius
                    )) {

                        //reset enemy cooldown
                        enemy.cooldown = gameSettings.enemyTypes[enemy.type].attack.cooldown;
                        
                        //do damage to player
                        player.health -= gameSettings.enemyTypes[enemy.type].attack.damage;
                        
                        //if player died, do not allow negative life
                        player.health = Math.max(player.health, 0);
                }
            }

            //if no living players
            else {
                //slow down
                enemy.velocity.x *= 0.95;
                enemy.velocity.y *= 0.95;

                //if slow enough, stop
                if (Math.abs(enemy.velocity.x) < 0.1) {
                    enemy.velocity.x = 0;
                }
                if (Math.abs(enemy.velocity.y) < 0.1) {
                    enemy.velocity.y = 0;
                }

                //move based on velocity
                enemy.x += enemy.velocity.x
                enemy.y += enemy.velocity.y
            }

            //boundaries
            enemy.x = Math.min(Math.max(enemy.x, 0), gameSettings.width);
            enemy.y = Math.min(Math.max(enemy.y, 0), gameSettings.height);
            let near_by_objects = this.room.Quadtree.query(new QT.QT_bound(enemy.x, enemy.y, 150,150  ));

            //check for collisions with other enemies
            for (let i in near_by_objects) {
                //recall that near_by_objects is a list of lists: [[object_id, object_data]...]
                let obj = near_by_objects[i];
                if (obj.constructor.name == "Enemy"){
                    if (enemy.id != Object.values(this.objects).indexOf(obj)){
                        Physics.collideAndDisplace(
                            enemy, 
                            gameSettings.enemyTypes[enemy.type].radius,
                            obj, 
                            gameSettings.enemyTypes[obj.type].radius
                        );
                    }
                }
                else if (obj.constructor.name == "Socket"){

                    if (obj.id in this.room.players.playing &&
                        obj.health > 0) {
                        Physics.collideAndDisplace(
                            enemy, 
                            gameSettings.enemyTypes[enemy.type].radius,
                            obj, 
                            gameSettings.playerTypes[obj.type].radius
                        );
                    }


                }
            }


        }
    }
}

// spawn an individual enemy in
Enemies.prototype.spawnEnemy = function () {

    //pick randoim type for this enemy
    let type = Object.keys(gameSettings.enemyTypes)[Math.floor(Math.random()*Object.keys(gameSettings.enemyTypes).length)];

    //determine side that enemy will spawn on
    let side = Math.floor(Math.random()*4);

    //determine starting x and y based on side
    var x;
    var y;
    switch (side) {
        //top
        case 0:
            y = 0;
            x = Math.floor(Math.random()*(gameSettings.width+1));
            break;
        //bottom
        case 1:
            y = gameSettings.height;
            x = Math.floor(Math.random()*(gameSettings.width+1));
            break;
        //right
        case 2:
            y = Math.floor(Math.random()*(gameSettings.height+1));
            x = gameSettings.width;
            break;
        //left
        case 3:
            y = Math.floor(Math.random()*(gameSettings.height+1));
            x = 0;
            break;
    }

    //use id counter as id, then increase
    let id = 'enemy' + (this.idCounter++).toString();

    //create enemy object
    this.objects[id] = new Enemy(type, x, y);
}

//kills enemy based on it's id
Enemies.prototype.killEnemy = function (id) {
    let enemy = this.objects[id];

    if (Math.random() < gameSettings.pickupChance) {
        this.room.pickups.spawnPickup(enemy.x, enemy.y);
    }

    delete this.objects[id];
}

//collects info on enemies to send to clients
Enemies.prototype.collect = function () {

    let enemy_info = {};

    for (let id in this.objects) {
        let enemy = this.objects[id];
        enemy_info[id] = {
            x: enemy.x,
            y: enemy.y,
            type: enemy.type,
            health: enemy.health,
        };
    }
    
    return enemy_info;
}

//get count of enemies
Enemies.prototype.count = function () {
    return Object.keys(this.objects).length;
}

module.exports = Enemies;