//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//class for individual boss
class Boss {

    constructor(id, x, y, playerCount, waveCount) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.velocity = {
            x: 0,
            y: 0,
        };
        // health is max health * (number of players + number of times boss has been killed already)
        let bossWaveCount = Math.floor(waveCount / gameSettings.bossFrequency);
        this.maxHealth = gameSettings.boss.maxHealth * (playerCount + bossWaveCount - 1);
        this.health = this.maxHealth;
        this.cooldown = 0;

        this.focusCooldown = 0;
        this.focus = 'none';
    }

    //return boss radius
    getRadius() {
        return gameSettings.boss.radius;
    }

    //return boss max speed
    getMaxSpeed() {
        return gameSettings.boss.maxVelocity;
    }

    //return boss acceleration magnitude
    getAcceleration() {
        return gameSettings.boss.acceleration;
    }

    //return boss mass
    getMass() {
        return gameSettings.boss.mass;
    }

    //return time in ms between boss focus changes
    getFocusTime() {
        return gameSettings.boss.focusTime;
    }

    //return time between boss focus changes
    getAttackInfo() {
        return gameSettings.boss.attack;
    }

    //return info about boss shots
    getShotInfo() {
        return gameSettings.boss.shots;
    }
}


// class for bosses container
class Bosses {

    constructor(room) {

        //hold individual enemy objects
        this.objects = {};

        //counter for object id's
        this.idCounter = 0;

        //save room that object exists in
        this.room = room;
    }

    //updates all bosses
    update() {

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
                if ((!(boss.focus in this.room.players.playing) || boss.focusCooldown <= 0) &&
                    this.room.players.playingCount() > 0) {
                    //choose new focus randomly from playing 
                    let playingIds = Object.keys(this.room.players.playing);
                    boss.focus = playingIds[Math.floor(Math.random() * playingIds.length)];
                    //reset cooldown
                    boss.focusCooldown = boss.getFocusTime();
                }

                //countdown attack cooldown
                if (boss.cooldown > 0) {
                    boss.cooldown -= gameSettings.tickRate;
                }

                //if focus exists
                if (boss.focus in this.room.players.playing) {
                    let player = this.room.players.playing[boss.focus];

                    //accelerate in direction of focus
                    let acceleration = Physics.componentVector(
                        Physics.angleBetween(boss.x, boss.y, player.x, player.y),
                        boss.getAcceleration()
                    );
                    boss.velocity.x += acceleration.x;
                    boss.velocity.y += acceleration.y;

                    //reduce velocity to max, if needed
                    Physics.capVelocity(boss, boss.getMaxSpeed());

                    //move based on velocity
                    boss.x += boss.velocity.x;
                    boss.y += boss.velocity.y;

                    //attacking
                    //check for off cooldown
                    if (boss.cooldown <= 0) {

                        //shoot if in range 
                        if (boss.getShotInfo().range >= Physics.distance(boss, player) - player.getRadius()) {

                            //reset boss cooldown
                            boss.cooldown = boss.getAttackInfo().cooldown;

                            //shoot at player
                            this.room.shots.spawnBossShot(boss, player.x, player.y);
                        }
                    }
                }

                //boundaries
                boss.x = Math.min(Math.max(boss.x, 0), gameSettings.width);
                boss.y = Math.min(Math.max(boss.y, 0), gameSettings.height);

                //check for collision with enemies
                for (let eid in this.room.enemies.objects) {
                    let enemy = this.room.enemies.objects[eid];

                    Physics.collideAndDisplace(
                        boss,
                        boss.getRadius(),
                        enemy,
                        enemy.getRadius()
                    );
                }

                //check for collision with players
                for (let pid in this.room.players.playing) {
                    let player = this.room.players.playing[pid];

                    Physics.collideAndDisplace(
                        boss,
                        boss.getRadius(),
                        player,
                        player.getRadius()
                    );
                }
            }
        }
    }

    // spawn an individual boss in
    spawnBoss() {

        //increment id counter
        let id = 'boss' + (this.idCounter++).toString();

        //position boss to spawn at middle of game area
        let x = gameSettings.width / 2;
        let y = gameSettings.height / 2;

        //create object
        this.objects[id] = new Boss(
            id, x, y,
            this.room.playerCount(),
            this.room.waveCount
        );
    }

    //damages an individual boss
    damageBoss(boss, amount, playerId) {

        //subtract health
        boss.health -= amount;

        // if boss died
        if (boss.health <= 0) {

            //increase player killStreak
            if (playerId in this.room.players.objects) {
                this.room.players.objects[playerId].killStreak++;
            }

            //drop pickup based on chance
            if (Math.random() < gameSettings.bossDropChance) {
                this.room.pickups.spawnPickup(boss.x, boss.y);
            }

            //delete boss
            delete this.objects[boss.id];
        }
    }

    //collects info on enemies to send to clients
    collect() {

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
    count() {
        return Object.keys(this.objects).length;
    }
}


module.exports = Bosses;