//returns random integer between low and high, inclusive
function randint(low,high) {
    if (high > low) {
        return Math.floor(Math.random()*(high+1-low) +low);
    }
    return Math.floor(Math.random()*(low+1-high) +high);
}