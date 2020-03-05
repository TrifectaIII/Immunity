//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require('./gameSettings.js');



//calculates angle of vector between 2 points
function angleBetween (x1, y1, x2, y2) {
    return Math.atan2(x2 - x1, y2 - y1);
}

//calculates x/y component vectors based on angle and magnitude of vector
function componentVector (angle, magnitude) {
    return {
        x: Math.sin(angle) * magnitude,
        y: Math.cos(angle) * magnitude,
    };
}

//cap magnitude of object's velocity at maxVelocity
function capVelocity (obj, maxVelocity) {

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
function distance (obj1, obj2) {
    return Math.sqrt(
        Math.pow(obj1.x-obj2.x, 2) + 
        Math.pow(obj1.y-obj2.y, 2)
    );
}

//checks if 2 objects are colliding given their x/y attributes and their radii
function isColliding (obj1, rad1, obj2, rad2) {
    return (distance(obj1, obj2) < rad1 + rad2);
}

//checks for collision, then displace both away from each other
function collideAndDisplace (obj1, rad1, obj2, rad2) {
    let dist = distance(obj1, obj2);
    
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

function calCollisionVect(bullet, enemy){

    let dist = distance(bullet, enemy);

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

//what to export
module.exports = {
    angleBetween:angleBetween,
    componentVector:componentVector,
    capVelocity:capVelocity,
    distance:distance,
    isColliding:isColliding,
    collideAndDisplace:collideAndDisplace,
    calCollisionVect:calCollisionVect,
}