//get sqlite library
const sqlite3 = require('sqlite3').verbose();

//create table
// db.run(`CREATE TABLE highscores(
//     name text,
//     score int
// )`);

function addScore (name, score) {
    // open database
    let db = new sqlite3.Database('../highscore.db');

    db.run(
        "INSERT INTO highscores(name, score) VALUES(?, ?)",
        [name, score],
        function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        }
    )

    //close database
    db.close();
}

function getScores () {
    // open database
    let db = new sqlite3.Database('../highscore.db');

    db.all(
        'SELECT name, score FROM highscores',
        [],
        (err, rows) => {
            if (err) {
                return console.log(err.message);
            }
            console.log(rows);
        }
    )

    //close database
    db.close();
}

module.exports = {
    addScore,
    getScores,
}   