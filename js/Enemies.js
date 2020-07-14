//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//class for individual enemy
class Enemy {

    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.health = gameSettings.enemyTypes[this.type].maxHealth;
        this.cooldown = 0;
    }

    //return enemy radius
    getRadius() {
        return gameSettings.enemyTypes[this.type].radius;
    }

    //return enemy max speed
    getMaxSpeed() {
        return gameSettings.enemyTypes[this.type].maxVelocity;
    }

    //return enemy acceleration magnitude
    getAcceleration() {
        return gameSettings.enemyTypes[this.type].acceleration;
    }

    //return enemy mass
    getMass() {
        return gameSettings.enemyTypes[this.type].mass;
    }

    //return info about enemy attacks
    getAttackInfo() {
        return gameSettings.enemyTypes[this.type].attack;
    }

    //return info about enemy shots
    getShotInfo() {
        return gameSettings.enemyTypes[this.type].shots;
    }
}

// class for enemies container
class Enemies {

    constructor(room) {

        //hold individual enemy objects
        this.objects = {};

        //counter for object id's
        this.idCounter = 0;

        //save room that object exists in
        this.room = room;
    }

    //updates all enemies
    update() {

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
                        enemy.getAcceleration()
                    );
                    enemy.velocity.x += acceleration.x;
                    enemy.velocity.y += acceleration.y;

                    //reduce velocity to max, if needed
                    Physics.capVelocity(enemy, enemy.getMaxSpeed());

                    //move based on velocity
                    enemy.x += enemy.velocity.x;
                    enemy.y += enemy.velocity.y;

                    //attacking
                    //check for off cooldown
                    if (enemy.cooldown <= 0) {

                        //shoot if enemy type has shots are are in range
                        if (enemy.getShotInfo() &&
                            enemy.getShotInfo().range >= Physics.distance(enemy, player) - player.getRadius()) {

                            //reset enemy cooldown
                            enemy.cooldown = enemy.getAttackInfo().cooldown;

                            //shoot at player
                            this.room.shots.spawnEnemyShot(enemy, player.x, player.y);
                        }
                        else if (Physics.isColliding(
                            enemy, enemy.getRadius(),
                            player, player.getRadius()
                        )) {

                            //reset enemy cooldown
                            enemy.cooldown = enemy.getAttackInfo().cooldown;

                            //do damage to player
                            this.room.players.damagePlayer(player, enemy.getAttackInfo().damage);
                        }
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
                    enemy.x += enemy.velocity.x;
                    enemy.y += enemy.velocity.y;
                }

                //boundaries
                enemy.x = Math.min(Math.max(enemy.x, 0), gameSettings.width);
                enemy.y = Math.min(Math.max(enemy.y, 0), gameSettings.height);
                let near_by_objects = this.room.Quadtree.query(new QT.QT_bound(enemy.x, enemy.y, 150, 150));

                //check for collisions with other enemies
                for (let i in near_by_objects) {
                    //recall that near_by_objects is a list of lists: [[object_id, object_data]...]
                    let obj = near_by_objects[i];
                    if (obj.constructor.name == "Enemy") {
                        if (enemy.id != obj.id) {
                            Physics.collideAndDisplace(
                                enemy,
                                enemy.getRadius(),
                                obj,
                                obj.getRadius()
                            );
                        }
                    }
                    else if (obj.constructor.name == "Socket") {

                        if (obj.id in this.room.players.playing &&
                            obj.health > 0) {
                            Physics.collideAndDisplace(
                                enemy,
                                enemy.getRadius(),
                                obj,
                                obj.getRadius()
                            );
                        }
                    }
                }


            }
        }
    }

    // spawn an individual enemy in
    spawnEnemy() {

        var type;
        //if mono wave, choose that type
        if (this.room.waveType in gameSettings.enemyTypes) {
            type = this.room.waveType;
        }
        //otherwise choose randomly
        else {
            //pick random type for this enemy
            type = Object.keys(gameSettings.enemyTypes)[Math.floor(Math.random() * Object.keys(gameSettings.enemyTypes).length)];
        }


        //determine side that enemy will spawn on
        let side = Math.floor(Math.random() * 4);

        //determine starting x and y based on side
        var x;
        var y;
        switch (side) {
            //top
            case 0:
                y = 0;
                x = Math.floor(Math.random() * (gameSettings.width + 1));
                break;
            //bottom
            case 1:
                y = gameSettings.height;
                x = Math.floor(Math.random() * (gameSettings.width + 1));
                break;
            //right
            case 2:
                y = Math.floor(Math.random() * (gameSettings.height + 1));
                x = gameSettings.width;
                break;
            //left
            case 3:
                y = Math.floor(Math.random() * (gameSettings.height + 1));
                x = 0;
                break;
        }

        //use id counter as id, then increase
        let id = 'enemy' + (this.idCounter++).toString();

        //create enemy object
        this.objects[id] = new Enemy(id, type, x, y);
    }

    //damages an individual enemy
    damageEnemy(enemy, amount, playerId) {

        //subtract health
        enemy.health -= amount;

        // if enemy died
        if (enemy.health <= 0) {

            //increase player killStreak
            if (playerId in this.room.players.objects) {
                this.room.players.objects[playerId].killStreak++;
            }

            //drop pickup based on chance
            if (Math.random() < gameSettings.enemyDropChance) {
                this.room.pickups.spawnPickup(enemy.x, enemy.y);
            }

            //delete enemy
            delete this.objects[enemy.id];
        }
    }

    //collects info on enemies to send to clients
    collect() {

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
    count() {
        return Object.keys(this.objects).length;
    }
}

module.exports = Enemies;