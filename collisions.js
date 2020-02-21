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

module.exports = {
    distance:distance,
    collide:collide,
    collideAndDisplace:collideAndDisplace,
}