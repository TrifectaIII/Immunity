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

    //moves to next color every 500ms
    interval: setInterval(function () {
        if (++Animation.colorIndex >= Animation.colors.length){
            Animation.colorIndex = 0;
        }
    },500),

    //returns current color
    getColor: function () {
        return this.colors[this.colorIndex];
    }
}