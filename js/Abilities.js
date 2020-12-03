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

    constructor (id, player) {

        this.id = id;

        this.player = player;

        //ability duration set by player type
        this.timer = gameSettings.abilityTypes[gameSettings.playerTypes[this.player.type].ability].duration;
    }

    update () {
        //count down timer based on tickrate
        this.timer -= gameSettings.tickRate;
    }
}

//turret ability
class Turret extends Ability {

    constructor (id, player) {

        super(id, player);

        //position is current position of the player
        this.x = this.player.x;
        this.y = this.player.y;

        //time to shoot
        this.cooldown = gameSettings.abilityTypes.turret.attackCooldown;
    }

    update (enemies) {
        super.update();

        //decrease cooldown
        this.cooldown -= gameSettings.tickRate;

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
        }
    }
}

//freeze ability
class Freeze extends Ability {

    constructor (id, player) {

        super(id, player);

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

    constructor (id, player) {

        super(id, player);
    }

    update () {
        super.update();
    }
}

//shield ability
class Shield extends Ability {

    constructor (id, player) {

        super(id, player);
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
                    };
                    break;
                
                case Freeze:
                    ability_info[id] = {
                        type: "freeze",
                        x: ability.x,
                        y: ability.y,
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

        let ability;

        //generate id
        let id = 'ability' + (this.idCounter++).toString();

        //spawn ability based on player class
        switch (gameSettings.playerTypes[player.type].ability) {
            case "shield":
                ability = new Shield(id, player);
                break;
            case "turret":
                ability = new Turret(id, player);
                break;
            case "fullauto":
                ability = new FullAuto(id, player);
                break;
            case "freeze":
                ability = new Freeze(id, player);
                break;
        }

        //place into objects
        this.objects[id] = ability;
    }

    //returns string of active ability, null otherwise
    checkActiveAbility (player) {

        //loop through abilities
        for (let id in this.objects) {
            let ability = this.objects[id];

            //check if this ability belongs to the player
            if (ability.player.id === player.id) {
                return gameSettings.playerTypes[player.type].ability;
            }
        }

        //if none found
        return null;
    }
}

//export to room
module.exports = Abilities;