function distance (obj1, obj2) {
    return Math.sqrt(
        Math.pow(obj1.x-obj2.x, 2) + 
        Math.pow(obj1.y-obj2.y ,2)
    );
}

function collide (obj1, rad1, obj2, rad2) {
    return (distance(obj1, obj2) < rad1 + rad2);
}

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

    //assume bullets will always have a mass of 2
    let total_mass = 2 + enemy.mass;

    //normal unit vectors 
    let nx = (enemy.x - bullet.x)/dist;
    let ny = (enemy.y - bullet.y)/dist;

    //tangent unit vectors
    let tx = -ny;
    let ty = nx;

    // tangential velocity before collision 
    let et = enemy.dx*tx +enemy.dy*ty;
    
    //normal velocity before collision
    let bvn = bullet.velocity.x*nx + bullet.velocity.y*ny;
    let evn = enemy.dx*nx + enemy.dy*ny;

    //normal velocity after collision
    let evn_ac = (evn*(enemy.mass - 2)+4*bvn)/total_mass;
    //change enemy velocity
    enemy.dx = et*tx + evn_ac*nx; 
    enemy.dy = et*ty + evn_ac*ny; 

    
}




module.exports = {
    distance:distance,
    collide:collide,
    collideAndDisplace:collideAndDisplace,
    calCollisionVect:calCollisionVect,
}