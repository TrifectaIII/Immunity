// color switching animations
var Animation = {

    //grap all player light colors as array
    colors: function() {
        let colorList = [];
        for (let className in gameSettings.playerTypes) {
            colorList.push(gameSettings.playerTypes[className].colors.light);
        }
        return colorList;
    }(),

    //current index in array
    colorIndex: 0,

    //time between color switches in MS
    colorTime: 400,

    //returns current color
    getColor: function () {
        return this.colors[this.colorIndex];
    },

    interval: null,
}

//switch colors every colorTime ms
Animation.interval = setInterval(function () {
    //increase index and return to 0 if at length of colors array
    this.colorIndex = (this.colorIndex+1)%this.colors.length;
}.bind(Animation), Animation.colorTime);