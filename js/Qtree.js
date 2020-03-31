// FOR COLLISION CODE
/*The tree consist of branches and leaves nodes (BRANCH AND LEAVES NODES ARE THE SAME OBJECT TYPE)

- leaves are nodes with agents
- branches are nodes with NO agents (null).
- Each tree node has 4 children (q1,q2,q3,q4), where each child represent a quadrant in the bounding area. 

  Quadrant numbers

  2  I  1
  ---+---
  3  I  4


*/



class QT_bound{
  constructor(x,y,w,h){
    /* 
    x & y -> center of QT_bound rectangle
    w -> width 
    h -> height
    */
    this.x = x;
    this.y = y; 
    this.w = w; 
    this.h = h;
  }

  //checks whether an object's position (a point) is within the current bounds
  encompass(obj){
    /*
    input -> object
    output - > True or False
    */
    return ( (obj.x >= this.x - this.w/2) &&
             (obj.x <= this.x + this.w/2) &&
             (obj.y >= this.y - this.h/2) &&
             (obj.y <= this.y + this.h/2));
  }

  //A helper functions that determines whether 2 sides of a rectangle is overlapping 2 sides of another rectangle
  overlapping(minA, maxA, minB, maxB){
    /*
    input-> minA: the lower value of the two sides (eg. the left side of the rectangle)
            maxA: the higher value of the two sides (eg. the right side of the rectangle)
            minB: the lower value of the two side of the other rectangle
            minB: the higher value of the two sides of the other rectangle

    output-> True or False
    */
    return (minB <= maxA && minA <= maxB);
  }

  //Checks whether a given rectangular area is intersecting the current bound 
  intersect(search_param){
    /* 
      input -> search_param: an QT_bound obj, or any rectangular object with x,y,w,h attributes
      output - > True or False
    */
    let aLeft = this.x - this.w/2;
    let aRight = this.x + this.w/2;
    let bLeft = search_param.x - search_param.w/2;
    let bRight = search_param.x + search_param.w/2;

    let aTop = this.y + this.h/2;
    let aBot = this.y - this.h/2; 
    let bTop = search_param.y + search_param.h/2;
    let bBot = search_param.y - search_param.h/2;

    return (this.overlapping(aLeft, aRight, bLeft, bRight) && this.overlapping(aBot, aTop, bBot, bTop) );

  }

}


class Qtree{
  constructor(QT_bound,cap){
    /* 
    input-> QT_bound: An QT_bound object
            cap: agent capacity of each node (int)

    */
    this.bound = QT_bound;
    this.cap = cap;
    this.agents = []; 
    this.q1  = null;
    this.q2 = null;
    this.q3 = null;
    this.q4 = null; 
  }

  
  //go over each children and try to insert the agent into it 
  _redistributeAgents(){
    for( let i = 0; i < this.agents.length; i++){
      this._insert(this.agents[i]);
    }
  }


  //helper function that actually insert's the object
  _insert(obj){
    
    switch( this._getQuadrant(obj) ){
      case 1:
        this.q1.insert(obj);
        break;
      
      case 2:
        this.q2.insert(obj);
        break;
      
      case 3:
        this.q3.insert(obj);
        break;

      case 4:
        this.q4.insert(obj);
        break;
      }
  }

  //function called by the instance,used to insert objects into the tree
  insert(obj){
    if (!obj){
        return;
    }
    //if leaf node is reached 
    if (this.agents){
      // console.log("is this.agent is True");printed
      //if agent is within current node's boundary 
      if (this.bound.encompass(obj)){
        // console.log("encompass true"); printed
        if (this.agents.length < this.cap) {
          this.agents.push(obj);
          return   
        }else{
          this.subDivide();
          this._redistributeAgents();
          // if agents attribute is null, it means that theres no obj stored here (making this node a 'branch')
          this.agents = null; 
          this._insert(obj);
        }
      }

    //if the current node is branch node, then agent is inserted into the proper quadrant
    }else{
     this._insert(obj);
    }

  }

  _getQuadrant(obj){
    /*helper function to determine the quadrant an object is in */
    let top = this.bound.y + this.bound.h/2;
    if (this.bound.x <= obj.x && (obj.x <= this.bound.x + this.bound.w/2)){
      if(this.bound.y <= obj.y && obj.y <= top){
        return 1
      }else{
        return 4
      }
    }else{
      if(this.bound.y <= obj.y && obj.y <= top){
        return 2
      }else{
        return 3
      }
    }
  }

  subDivide(){
    // console.log("SUBDIVIDED\n new size",this.bound.w/2,this.bound.h/2)
    let half_width = this.bound.w/2;
    let half_height = this.bound.h/2;
    this.q1 = new Qtree(new QT_bound(this.bound.x+half_width/2, this.bound.y+half_height/2, half_width , half_height), this.cap);
    this.q2 = new Qtree(new QT_bound(this.bound.x-half_width/2, this.bound.y+half_height/2, half_width , half_height), this.cap);
    this.q3 = new Qtree(new QT_bound(this.bound.x-half_width/2, this.bound.y-half_height/2, half_width , half_height), this.cap);
    this.q4 = new Qtree(new QT_bound(this.bound.x+half_width/2, this.bound.y-half_height/2, half_width , half_height), this.cap);
    // console.log(this);
  }

  query(search_parameter, found){
    /* search parameter should be a QT_bound object */
    if (!found){
      found = [];
    }

    //if it does not intersect
    if (!search_parameter.intersect(this.bound)){
      return found;
    }

    //if there is agents in this branch
    if (this.agents){
      for(let agent of this.agents){
        if (search_parameter.encompass(agent)){
          found.push(agent);
        }
      }
    }

    if (this.q1){
      this.q1.query(search_parameter,found);
      this.q2.query(search_parameter,found);
      this.q3.query(search_parameter,found);
      this.q4.query(search_parameter,found);
    }

    return found;
  }

  //show Quadtree grid 
  render_boundaries(){
  /*Use for visual debug*/
    rect((this.bound.x-this.bound.w/2), (this.bound.y-this.bound.h/2), this.bound.w, this.bound.h );
    if (this.q1){
      this.q1.render_area();
      this.q2.render_area();
      this.q3.render_area();
      this.q4.render_area();
    }
  }


}

module.exports = {
  QT_bound:QT_bound,
  Qtree:Qtree
}