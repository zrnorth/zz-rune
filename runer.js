var Irelia = require('irelia');
var irelia = new Irelia({
    secure: true,
    host: 'na.api.pvp.net',
    path: '/api/lol/',
    key: '734c49ac-b2f3-4edf-a2cd-34d29a346662',
    debug: true
});

function getSummonerData(summonerName) {
    irelia.getSummonerByName('na', summonerName, function (err, res){
        console.log(err, res);
    });
}

// Takes a file of pro player names in array format and returns that array.
function getProListFromFile(filename) {
    fs = require('fs');
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        return JSON.parse(data);
    });
}

function getRandomPro(inputList) {

}

getProListFromFile('pros.js');
