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

// Given an input list, gets a random subset of this list with num values.
function getRandomSubset(inputList, num) {
    if (num <= 0) return null;
    var output = [];

    for (var i = 0; i < num; i++) {
        var index = Math.floor(Math.random() * inputList.length);
        var item = inputList[index];
        output.push(item);
        inputList.splice(index, 1); // prevent duplicates
    }
    console.log(output);
    return output;
}

// Takes a file of pro player names in array format and returns that array.
function getProListFromFile(filename, num) {
    fs = require('fs');
    var inputList = [];

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        inputList = JSON.parse(data);
        return getRandomSubset(inputList, num)
    });
}

var inputList = getProListFromFile('pros.js', 4);
