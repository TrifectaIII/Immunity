//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//object constructor for individual player shots
function PlayerShot (player, velocity) {
    this.type = player.type;
    this.x = player.x;
    this.y = player.y;
    this.playerId = player.id;
    this.velocity = velocity;
    this.range = gameSettings.playerTypes[player.type].shots.range;
}

//object constructor for individual enemy shots
function EnemyShot (enemy, velocity) {
    this.type = enemy.type;
    this.x = enemy.x;
    this.y = enemy.y;
    this.velocity = velocity;
    this.range = gameSettings.enemyTypes[enemy.type].shots.range;
}

// object constructor for shots container
function Shots (room) {

    //hold all objects
    this.objects = {};

    //hold player shot objects
    this.playershots = {};

    //hold player shot objects
    this.enemyshots = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all shots
Shots.prototype.update = function () {

    if (!this.room.gameOver) {

        //loop through all player shots
        for (let id in this.playershots) {
            let shot = this.playershots[id];

            //move based on velocity
            shot.x += shot.velocity.x;
            shot.y += shot.velocity.y;

            let destroyed = false;

            // check for collisions with enemies

            //get nearby objects from qtree
            let nearby_objs = this.room.Quadtree.query(new QT.QT_bound(shot.x,shot.y,100,100));

            //loop through nearby objects
            for (let id in nearby_objs) {
                let enemy = nearby_objs[id];

                //make sure object is enemy, and then check collision
                if (enemy.constructor.name == "Enemy" &&
                    Physics.isColliding(
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
                                    
                                    //kill enemy
                                    this.room.enemies.killEnemy(this.findIndexOfEnemy(enemy));
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
                delete this.playershots[id];
                delete this.objects[id];
            }
        }

        //loop through all enemy shots
        for (let id in this.enemyshots) {
            let enemyshot = this.enemyshots[id];

            //move based on velocity
            enemyshot.x += enemyshot.velocity.x;
            enemyshot.y += enemyshot.velocity.y;

            let destroyed = false;

            // check for collisions with players
            for (let id in this.room.players.playing) {
                let player = this.room.players.playing[id];

                if (Physics.isColliding(
                        player, gameSettings.playerTypes[player.type].radius, 
                        enemyshot, 0 //enemy shots have no radius
                    )) {
                        destroyed = true;

                        //do damage to player if not cheating
                        if (player.name.toUpperCase() != gameSettings.testName.toUpperCase()){
                            player.health -= gameSettings.enemyTypes[enemyshot.type].shots.damage;

                            //if player died, do not allow negative life
                            player.health = Math.max(player.health, 0);
                        }
                }
            }

            //remove range based on velocity
            enemyshot.range -= gameSettings.enemyTypes[enemyshot.type].shots.velocity;
            
            //destroy if out of range
            destroyed = destroyed || enemyshot.range <= 1;
            
            //delete if destroyed
            if (destroyed) {
                delete this.enemyshots[id];
                delete this.objects[id];
            }
        }
    }
}


//create a new shot
Shots.prototype.spawnPlayerShot = function (player, destX, destY) {

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
        let id = 'playershot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new PlayerShot(player, velocity);
        this.playershots[id] = this.objects[id];
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
            let id = 'playershot' + (this.idCounter++).toString();

            //create new object
            this.objects[id] = new PlayerShot(player, velocity);
            this.playershots[id] = this.objects[id];
        }
    }
}  

//create a new enemy shot
Shots.prototype.spawnEnemyShot = function (enemy, destX, destY) {

    //each class shoots differently
    let classShots = gameSettings.enemyTypes[enemy.type].shots;

    //single-shot classes
    if (classShots.count <= 1) {
        
        //calculate velocity based on destination and shot speed
        let velocity = Physics.componentVector(
            Physics.angleBetween(enemy.x, enemy.y, destX, destY), 
            classShots.velocity
        );

        //use id counter as id, then increase
        let id = 'enemyshot' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new EnemyShot(enemy, velocity);
        this.enemyshots[id] = this.objects[id];
    }

    //multi-shot (shotgun) classes
    else {
        for (let i = 0; i < classShots.count; i++) {

            //calculate velocity based on destination, shot speed and spread
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
            this.enemyshots[id] = this.objects[id];
        }
    }
}  

// collect info on shot objects
Shots.prototype.collect = function () {

    var playershot_info = {};

    for (let id in this.playershots) {
        let playershot = this.playershots[id];
        playershot_info[id] = {
            x: playershot.x,
            y: playershot.y,
            type: playershot.type,
        };
    }

    var enemyshot_info = {};

    for (let id in this.enemyshots) {
        let enemyshot = this.enemyshots[id];
        enemyshot_info[id] = {
            x: enemyshot.x,
            y: enemyshot.y,
            type: enemyshot.type,
        };
    }

    return {
        playershots: playershot_info,
        enemyshots: enemyshot_info,
    };
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