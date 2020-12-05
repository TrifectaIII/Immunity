//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Container Class for Extending from Container.js
///////////////////////////////////////////////////////////////////////////

const Container = require(__dirname + '/Container.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//class for other ability classes to inherit
class Ability {

    constructor (id, player, room) {

        this.id = id;

        this.player = player;

        this.room = room;

        //tie this ability object to the player object
        this.player.ability = this;

        //ability duration set by player type
        this.timer = gameSettings.abilityTypes[gameSettings.playerTypes[this.player.type].ability].duration;
    }

    update () {
        //count down timer based on tickDelay
        this.timer -= (1000/gameSettings.tickRate);
    }

    shutDown () {
        //removes this ability object from player object
        this.player.ability = null;
    }
}

//turret ability
class Turret extends Ability {

    constructor (id, player, room) {

        super(id, player, room);

        //position is current position of the player
        this.x = this.player.x;
        this.y = this.player.y;

        //time to shoot
        this.cooldown = gameSettings.abilityTypes.turret.attackCooldown;
    }

    update (enemies) {
        super.update();

        //decrease cooldown
        this.cooldown -= (1000/gameSettings.tickRate);

        //shoot if over
        if (this.cooldown <= 0) {
            //reset cd
            this.cooldown = gameSettings.abilityTypes.turret.attackCooldown;

            let closestDistance = Infinity;
            let closestEnemy = null;

            //loop through enemies to find closest
            for (let eid in enemies) {
                let enemy = enemies[eid];

                let dist = Physics.distance(this, enemy);

                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestEnemy = enemy;
                }
            }

            //make sure closest is in range
            if (closestDistance <= this.player.getShotInfo().range) {

                //shoot
                this.room.shots.spawnPlayerShot(this.player, closestEnemy.x, closestEnemy.y, this.x, this.y);
            }
        }
    }
}

//freeze ability
class Freeze extends Ability {

    constructor (id, player, room) {

        super(id, player, room);

        //position is current position of the player
        this.x = this.player.x;
        this.y = this.player.y;
    }

    update () {
        super.update();
    }
}

//full-auto ability
class FullAuto extends Ability {

    constructor (id, player, room) {

        super(id, player, room);
    }

    update () {
        super.update();
    }
}

//shield ability
class Shield extends Ability {

    constructor (id, player, room) {

        super(id, player, room);
    }

    update () {
        super.update();
    }
}


// class for abilities container
class Abilities extends Container {

    constructor (room) {

        //call Container constructor
        super(room);

        this.idCounter = 0;
    }

    //updates all ability objects
    update () {

        //loop through all objects
        for (let id in this.objects) {
            let ability = this.objects[id];

            //delete if out of time, or player not active anymore
            if (ability.timer <= 0 ||
                !(ability.player.id in this.room.players.playing)) {

                    //shut down ability
                    ability.shutDown();

                    //remove from abilities object
                    delete this.objects[id];

                    continue;
            }

            //update the ability
            ability.update(this.room.enemies.objects);
        }
    }

    //collect info on objects to send to clients
    collect () {
        
        let ability_info = {};

        for (let id in this.objects) {
            let ability = this.objects[id];

            switch (ability.constructor) {
                
                case Turret:
                    ability_info[id] = {
                        type: "turret",
                        x: ability.x,
                        y: ability.y,
                        playerId: ability.player.id,
                    };
                    break;
                
                case Freeze:
                    ability_info[id] = {
                        type: "freeze",
                        x: ability.x,
                        y: ability.y,
                        playerId: ability.player.id,
                    };
                    break;

                case FullAuto:
                    ability_info[id] = {
                        type: "fullauto",
                        playerId: ability.player.id,
                    };
                    break;

                case Shield:
                    ability_info[id] = {
                        type: "shield",
                        playerId: ability.player.id,
                    };
                    break;
            }
        }

        return ability_info;
    }

    //spawns an ability for the player
    spawnAbility (player) {

        let room = this.room;

        let ability;

        //generate id
        let id = 'ability' + (this.idCounter++).toString();

        //spawn ability based on player class
        switch (gameSettings.playerTypes[player.type].ability) {
            case "shield":
                ability = new Shield(id, player, room);
                break;
            case "turret":
                ability = new Turret(id, player, room);
                break;
            case "fullauto":
                ability = new FullAuto(id, player, room);
                break;
            case "freeze":
                ability = new Freeze(id, player, room);
                break;
        }

        //place into objects
        this.objects[id] = ability;
    }
}

//export to room
module.exports = Abilities;