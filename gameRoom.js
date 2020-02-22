


//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require('./gameSettings.js');



//Collision Functions from collisions.js
///////////////////////////////////////////////////////////////////////////

const collisions = require('./collisions.js');



// Helper Functions
///////////////////////////////////////////////////////////////////////////

//returns random integer between low and high, inclusive
function randint(low,high) {
    if (high > low) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }
    return Math.floor(Math.random() * (low - high + 1) + high);
}

//calculates angle of vector between player position and shot destination
function angle(x, y, dest_x, dest_y) {
    return Math.atan2(dest_x - x, dest_y - y);
}

//calculates component velocities of shot based on angle and net speed
function velocity(ang, speed) {
    return {
        x:Math.sin(ang) * speed,
        y:Math.cos(ang) * speed,
    };
}



// ROOM CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////

//constructor for room objects
function Room (roomId) {

    this.roomId = roomId;

    //hold info about game objects
    this.players = {};
    this.shots = {};
    this.pickups = {};
    this.enemies = {};

    //spawn pickups
    this.pickupSpawner = setInterval(
        this.spawnPickups.bind(this), //bind to room scope
        gameSettings.pickupTime //interval from game settings
    );

    this.waveCount = 0;
}



// ROOM UPDATE
///////////////////////////////////////////////////////////////////////////

//called every gameSettings.tickRate ms in index.js
Room.prototype.update = function () {
    //return game info for emit to room
    return {
        player_info: this.updatePlayers(),
        shot_info: this.updateShots(),
        pickup_info: this.updatePickups(),
        enemy_info: this.updateEnemies(),

        game_info: {
            waveCount: this.waveCount,
        },
    }
}

//UPDATE SHOTS 
/////////////////////////////////////////

Room.prototype.updateShots = function () {

    //loop through all shots
    for (let id in this.shots) {
        let shot = this.shots[id];

        //move based on velocity
        shot.x += shot.velocity.x;
        shot.y += shot.velocity.y;

        let destroyed = false;

        // check for collisions with enemys
        for (let id in this.enemies) {
            let enemy = this.enemies[id];
            if (collisions.collide(
                    enemy, gameSettings.enemies[enemy.type].radius, 
                    shot, 0
                )) {
                    //remove health
                    if (enemy.health > 0) {
                        enemy.health--;
                        destroyed = true;
                        if (enemy.health <= 0) {
                            if (shot.socketId in this.players) {
                                this.players[shot.socketId].killStreak++;
                            }
                            delete this.enemies[id];
                        }
                    }
            } 
        }

        //remove range based on speed
        shot.range -= gameSettings.classes[shot.class].shots.speed;
        
        //destroy if out of range
        destroyed = destroyed || shot.range <= 1;
        
        //delete if destroyed
        if (destroyed) {
            delete this.shots[id];
        }
    }

    // collect info on remaining shots
    var shot_info = {};
    
    for (let id in this.shots) {
        let shot = this.shots[id];
        shot_info[id] = {
            x: shot.x,
            y: shot.y,
            class: shot.class,
        };
    }

    return shot_info;
}

//UPDATE PLAYERS
/////////////////////////////////////////

Room.prototype.updatePlayers = function () {

    //loop through all players
    for (let id in this.players) {
        let player = this.players[id];
        
        //move player based on direction
        if (player.health > 0) {

            //speed is set by class
            let speed = gameSettings.classes[player.class].speed;
            let speedComponent = speed/(Math.sqrt(2));

            //move based on direction sent by client
            switch (player.direction) {
                case 'none':
                    break;
                //diagonal movements use component speed
                case 'rightup':
                    player.x += speedComponent;
                    player.y -= speedComponent;
                    break;
                case 'leftup':
                    player.x -= speedComponent;
                    player.y -= speedComponent;
                    break;
                case 'rightdown':
                    player.x += speedComponent;
                    player.y += speedComponent;
                    break;
                case 'leftdown':
                    player.x -= speedComponent;
                    player.y += speedComponent;
                    break;
                //cardinal movements use raw speed
                case 'right':
                    player.x += speed;
                    break;
                case 'left':
                    player.x -= speed;
                    break;
                case 'up':
                    player.y -= speed;
                    break;
                case 'down':
                    player.y += speed;
                    break;
            }

            //check for collisions with other players
            for (let pid in this.players) {
                if (player.id != pid && this.players[pid].health > 0) {
                    collisions.collideAndDisplace(
                        player, gameSettings.playerRadius,
                        this.players[pid], gameSettings.playerRadius
                    );
                }
            }

            //boundaries
            player.x = Math.min(Math.max(player.x, 0), gameSettings.width);
            player.y = Math.min(Math.max(player.y, 0), gameSettings.height);
        }
    }

    //collect info on players
    let player_info = {};

    for (let id in this.players) {
        let player = this.players[id];
        player_info[id] = {
            x: player.x,
            y: player.y,
            class: player.class,
            health: player.health,
            name: player.name,
            killStreak: player.killStreak,
        };
    }
    
    return player_info;
}

//UPDATE ENEMIES
/////////////////////////////////////////

Room.prototype.updateEnemies = function () {

    //spawn new wave if all enemies dead
    if (this.enemyCount() <= 0) {
        this.spawnWave();
    }

    //loop through all enemies
    for (let id in this.enemies) {
        let enemy = this.enemies[id];

        //find closest player
        let closestDistance = Infinity;
        let closestId = 0;
        for (let pid in this.players) {
            if (this.players[pid].health > 0) {
                let thisDistance = collisions.distance(this.players[pid], enemy);
                if (thisDistance < closestDistance) {
                    closestDistance = thisDistance;
                    closestId = pid;
                }
            }
        }

        //reduce attack cooldown
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= gameSettings.tickRate;
        }

        if (closestDistance < Infinity) {
            let player = this.players[closestId];

            //move in direction of closest player
            let ang = angle(enemy.x, enemy.y, player.x, player.y);
            let vel = velocity(ang, gameSettings.enemies[enemy.type].speed);
            enemy.x += vel.x;
            enemy.y += vel.y;

            //attacking
            if (enemy.attackCooldown <= 0 &&
                collisions.collide(
                    enemy, gameSettings.enemies[enemy.type].radius,
                    player, gameSettings.playerRadius
                )) {
                    //reset enemy cooldown
                    enemy.attackCooldown = gameSettings.enemies[enemy.type].attackCooldown;
                    //do damage to player
                    player.health -= gameSettings.enemies[enemy.type].attackDamage;
                    //set player to respawn if dead
                    if (player.health <= 0) {
                        setTimeout(function () {
                            this.spawnSocket(player);
                        }.bind(this), 
                        gameSettings.respawnTime);
                    }
            }
        }

        //check for collisions with other enemies
        for (let eid in this.enemies) {
            if (enemy.id != eid) {
                collisions.collideAndDisplace(
                    enemy, gameSettings.enemies[enemy.type].radius,
                    this.enemies[eid], gameSettings.enemies[this.enemies[eid].type].radius,
                );
            }
        }

        //check for collisions with living players
        for (let pid in this.players) {
            if (this.players[pid].health > 0) {
                collisions.collideAndDisplace(
                    enemy, gameSettings.enemies[enemy.type].radius,
                    this.players[pid], gameSettings.playerRadius
                );
            }
        }
    }

    //collect info on enemies
    let enemy_info = {};

    for (let id in this.enemies) {
        let enemy = this.enemies[id];
        enemy_info[id] = {
            x: enemy.x,
            y: enemy.y,
            type: enemy.type,
            health: enemy.health,
        };
    }
    
    return enemy_info;
}

//UPDATE PICKUPS
/////////////////////////////////////////

Room.prototype.updatePickups = function () {

    //loop through all pickups
    for (let id in this.pickups) {
        let pickup = this.pickups[id];

        //find closest alive player
        let closestDistance = Infinity;
        let closestId = 0;
        for (let pid in this.players) {
            if (this.players[pid].health > 0) {
                let thisDistance = collisions.distance(this.players[pid], pickup);
                if (thisDistance < closestDistance) {
                    closestDistance = thisDistance;
                    closestId = pid;
                }
            }
        }
        let player = this.players[closestId];

        //if player is close enough
        if (closestDistance < Infinity &&
            collisions.collide(
                player, 
                gameSettings.playerRadius,
                pickup, 
                gameSettings.pickupRadius
            )
        ) {
            switch (pickup.type) {
                case "health":
                    //if player not at max health
                    if (player.health < gameSettings.classes[player.class].maxHealth) {
                        //give health and delete pickup
                        player.health = Math.min(
                            gameSettings.classes[player.class].maxHealth,
                            player.health + gameSettings.pickupHealthAmount
                        );
                        delete this.pickups[id];
                    }
                    break;
            }
        }
    }

    //collect info for clients
    let pickup_info = {};

    for (let id in this.pickups) {
        let pickup = this.pickups[id];
        pickup_info[id] = {
            x: pickup.x,
            y: pickup.y,
            type: pickup.type,
        }
    }

    return pickup_info;
}



// ADD SOCKET TO ROOM AND SET IT UP
///////////////////////////////////////////////////////////////////////////

Room.prototype.addSocket = function (socket, className) {
    if (this.getPop() < gameSettings.roomCap) {

        //add to players object
        this.players[socket.id] = socket;

        //join socketio room
        socket.join(this.roomId);

        //set roomId to socket
        socket.roomId = this.roomId;

        //give default direction
        socket.direction = 'none';

        //give socket it's selected class
        socket.class = className;

        //spawn socket for first time
        this.spawnSocket(socket);

        //SET UP LISTENERS
        /////////////////////////////////

        //switch player direction
        socket.on('direction', function (direction) {

            socket.direction = direction;

        }.bind(this));//bind to room scope

        //handle shooting
        socket.on('shoot', function (dest_x, dest_y) {

            if (socket.health > 0) {
                
                //each class shoots differently
                let myClass = gameSettings.classes[socket.class];

                //single-shot classes
                if (myClass.shots.count == 1) {
                    //calculate velocity based on shot speed and where the player clicked
                    vel = velocity(
                        angle(socket.x, socket.y, dest_x, dest_y), 
                        myClass.shots.speed
                    );

                    //create new shot object
                    var id = Math.random();
                    this.shots[id] = {
                        x: socket.x,
                        y: socket.y,
                        class: socket.class,
                        socketId: socket.id,
                        velocity: vel,
                        range: myClass.shots.range,
                    };
                }

                //multi-shot (shotgun) classes
                else {
                    for (let i = 0; i < myClass.shots.count; i++) {

                        let vel = velocity(
                            angle(
                                socket.x, socket.y, 
                                dest_x, dest_y
                            ) 
                            + (i - myClass.shots.count/2 + 0.5) 
                            * (myClass.shots.angle/(myClass.shots.count-1)),
                            myClass.shots.speed
                        );
    
                        var id = Math.random();
                        this.shots[id] = {
                            x: socket.x,
                            y: socket.y,
                            class: socket.class,
                            socketId: socket.id,
                            velocity: vel,
                            range: myClass.shots.range,
                        };
                    }
                }
            }
        }.bind(this));//bind to room scope

        //handle pickup command 
        // socket.on('pickup', function () {
        //     if (socket.alive) {
        //         //loop through pickups and find closest
        //         let closestDistance = Infinity;
        //         let closestId = 0;
        //         for (let id in this.pickups) {
        //             let thisDistance = collisions.distance(this.pickups[id], socket);
        //             if (thisDistance < closestDistance) {
        //                 closestDistance = thisDistance;
        //                 closestId = id;
        //             }
        //         }
        //         //if pickup is close enough, consume it.
        //         if (closestDistance < Infinity &&
        //             collisions.collide(
        //                 socket, 
        //                 gameSettings.playerRadius,
        //                 this.pickups[closestId], 
        //                 gameSettings.pickupRadius
        //             )
        //             ) {
        //             switch (this.pickups[closestId].type) {
        //                 //health pickup gives 5 hp, up to max
        //                 case "health":
        //                     socket.health = Math.min(gameSettings.classes[socket.class].maxHealth, socket.health + 5);
        //                     break;
        //             }
        //             //delete after use
        //             delete this.pickups[closestId];
        //         }
        //     }
        // }.bind(this));//bind to room scope

        //confirm join with server after socket totally set up
        socket.emit('joined',this.roomId);
    }
}



// OTHER ROOM METHODS
///////////////////////////////////////////

//remove socket if socket exists in room
Room.prototype.removeSocket = function (socket) {
    if (socket.id in this.players) {
        delete this.players[socket.id];
    }
}

//spawns or respawns a player
Room.prototype.spawnSocket = function (socket) {
    //give random position in world
    socket.x = randint(100, gameSettings.width - 100);
    socket.y = randint(100, gameSettings.height - 100);

    //give max health based on class
    socket.health = gameSettings.classes[socket.class].maxHealth;

    //reset killstreak
    socket.killStreak = 0;
}

//spawns pickups into the room based on # of players
Room.prototype.spawnPickups = function () {
    for (
        let i=0; 
        //try to make 1 for every current player
        i < this.getPop() && 
        //loop should break if cap is hit (population * pickupMax)
        Object.keys(this.pickups).length < this.getPop() * gameSettings.pickupMax;
        i++) {
            let id = Math.random();
            this.pickups[id] = {
                //choose a random type from the settings list
                type: gameSettings.pickupTypes[randint(0, gameSettings.pickupTypes.length-1)],
                x: randint(100, gameSettings.width-100),
                y: randint(100, gameSettings.height-100),
            }
    } 
}

Room.prototype.spawnWave = function () {
    this.waveCount += 1;

    //make enemies based on number of players
    for (let i = 0; i < this.getPop() * gameSettings.enemyMax; i++) {

        //generate id
        let id = Math.random();

        //pick randoim type for this enemy
        let type = Object.keys(gameSettings.enemies)[randint(0, Object.keys(gameSettings.enemies).length -1)];

        //determine side that enemy will spawn on
        let side = randint(1,4);

        //determine starting x and y
        var x;
        var y;
        switch (side) {
            //top
            case 1:
                y = 0;
                x = randint(0, gameSettings.width);
                break;
            //bottom
            case 2:
                y = gameSettings.height;
                x = randint(0, gameSettings.width);
                break;
            //right
            case 3:
                y = randint(0, gameSettings.height);
                x = gameSettings.width;
                break;
            //left
            case 4:
                y = randint(0, gameSettings.height);;
                x = 0;
                break;
        }

        this.enemies[id] = {
            type: type,
            x: x,
            y: y,
            health: gameSettings.enemies[type].maxHealth,
            attackCooldown: 0,
        }
    }
}

Room.prototype.enemyCount = function () {
    return Object.keys(this.enemies).length;
}

//stops timing events for the room
Room.prototype.shutdown = function () {
    clearInterval(this.pickupSpawner);
}

//get current population of room
Room.prototype.getPop = function () {
    return Object.keys(this.players).length;
}

//checks if room has space
Room.prototype.hasSpace = function () {
    return this.getPop() < gameSettings.roomCap;
}

//checks if room is empty
Room.prototype.isEmpty = function () {
    return this.getPop() == 0;
}



// EXPORTS CONSTRCTOR TO index.js
///////////////////////////////////////////////////////////////////////////
module.exports = Room;