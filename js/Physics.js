//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');

class Physics {

    //calculates angle of vector between 2 points
    static angleBetween (x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    //returns a version of a vector with magnitude 1
    static normalizeVector(vector) {

        //calculate magnitude
        let magnitude = Math.sqrt(
            vector.x ** 2 + 
            vector.y ** 2
        );

        //return empty vector if no magnitude
        if (!magnitude) {
            return {x:0, y:0}
        }

        //normalized vector is divided by magnitude
        return {
            x: vector.x/magnitude,
            y: vector.y/magnitude,
        }
    }

    //calculates x/y component vectors based on angle and magnitude of vector
    static componentVector (angle, magnitude) {
        return {
            x: Math.cos(angle) * magnitude,
            y: Math.sin(angle) * magnitude,
        };
    }

    //cap magnitude of object's velocity at maxVelocity
    static capVelocity (obj, maxVelocity) {

        //get current magnitude of velocities
        let currentMagnitude = Math.sqrt(
            obj.velocity.x ** 2 + 
            obj.velocity.y ** 2
        );

        //check if exceeding maxV
        if (currentMagnitude > maxVelocity) {

            //calulate ratio for normalization
            let ratio = maxVelocity/currentMagnitude;

            //adjust velocity
            obj.velocity.x *= ratio;
            obj.velocity.y *= ratio;
        }
    }

    //calulates distance between centerpoints of 2 objects w/ x/y attributes
    static distance (obj1, obj2) {
        return Math.sqrt(
            Math.pow(obj1.x-obj2.x, 2) + 
            Math.pow(obj1.y-obj2.y, 2)
        );
    }

    //checks if 2 objects are colliding given their x/y attributes and their radii
    static isColliding (obj1, rad1, obj2, rad2) {
        return (Physics.distance(obj1, obj2) < rad1 + rad2);
    }

    //checks for collision, then displace both away from each other
    static collideAndDisplace (obj1, rad1, obj2, rad2) {
        let dist = Physics.distance(obj1, obj2);
        
        //check for collision, then do displacement
        if (dist < rad1 + rad2) {

            //do not allow 0 distance
            if (dist <= 1) {
                dist = 1
            }

            //calculate distance to displace each object and normalize
            let displaceDist = Math.round((dist - (rad1 + rad2)) / 2) / dist;

            //displace objects by the distance
            obj1.x -= displaceDist*(obj1.x - obj2.x);
            obj1.y -= displaceDist*(obj1.y - obj2.y);
            obj2.x += displaceDist*(obj1.x - obj2.x);
            obj2.y += displaceDist*(obj1.y - obj2.y);
        }
    }

    //impart shot momentum to enemy
    static collideShotEnemy (shot, enemy) {

        //get masses
        let enemyMass = gameSettings.enemyTypes[enemy.type].mass;
        let shotMass = gameSettings.playerTypes[shot.type].shots.mass;

        //ratio of shot mass to enemy mass
        let massRatio = shotMass/enemyMass;

        //accelerate enemy based on shot velocity and mass ratio
        enemy.velocity.x += shot.velocity.x * massRatio;
        enemy.velocity.y += shot.velocity.y * massRatio;
    }

    //impart shot momentum to boss (currently unused)
    static collideShotBoss (shot, boss) {

        //get masses
        let bossMass = gameSettings.boss.mass;
        let shotMass = gameSettings.playerTypes[shot.type].shots.mass;

        //ratio of shot mass to boss mass
        let massRatio = shotMass/bossMass;

        //accelerate boss based on shot velocity and mass ratio
        boss.velocity.x += shot.velocity.x * massRatio;
        boss.velocity.y += shot.velocity.y * massRatio;
    }

    //impart shot momentum to player
    static collideShotPlayer (shot, player) {

        //get masses
        let playerMass = gameSettings.playerTypes[player.type].mass;

        let shotMass = 0;
        if (shot.constructor.name == "BossShot") {
            shotMass = gameSettings.boss.shots.mass;
        }
        else {
            shotMass = gameSettings.enemyTypes[shot.type].shots.mass;
        }

        //ratio of shot mass to player mass
        let massRatio = shotMass/playerMass;

        //accelerate player based on shot velocity and mass ratio
        player.velocity.x += shot.velocity.x * massRatio;
        player.velocity.y += shot.velocity.y * massRatio;
    }

    static calCollisionVect (bullet, enemy) {

        let dist = Physics.distance(bullet, enemy);
    
        //get masses
        let enemy_mass = gameSettings.enemyTypes[enemy.type].mass;
        let bullet_mass = gameSettings.playerTypes[bullet.type].shots.mass;
    
        //add masses
        let total_mass = enemy_mass + bullet_mass;
    
        //normal unit vectors 
        let nx = (enemy.x - bullet.x)/dist;
        let ny = (enemy.y - bullet.y)/dist;
    
        //tangent unit vectors
        let tx = -ny;
        let ty = nx;
    
        // tangential velocity before collision 
        let et = enemy.velocity.x*tx +enemy.velocity.y*ty;
        
        //normal velocity before collision
        let bvn = bullet.velocity.x*nx + bullet.velocity.y*ny;
        let evn = enemy.velocity.x*nx + enemy.velocity.y*ny;
    
        //normal velocity after collision
        let evn_ac = (evn*(enemy_mass - bullet_mass)+2*bullet_mass*bvn)/total_mass;
        
        //accelerate enemy
        enemy.velocity.x += (et*tx + evn_ac*nx); 
        enemy.velocity.y += (et*ty + evn_ac*ny); 
    }
}

//export to anywhere that needs it
module.exports = Physics;