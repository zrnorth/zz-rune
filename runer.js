var fs = require('fs');
var colors = require('colors');
var request = require('request');

// The call we care about.
var getMatchHistoryBySummonerId = function(region, id, champId, callback) {
    var path = "/v2.2/matchhistory/" + id + "?championIds=" + champId + "&";
    apiWrapper(region, path, callback);
}

var apiWrapper = function(region, path, callback) {
    // Pls don't use my key <3
    var key = '734c49ac-b2f3-4edf-a2cd-34d29a346662';
    var endpoint = "https://" + region + ".api.pvp.net/api/lol/" +
                    region + path + "api_key=" + key;
    makeRequest(endpoint, callback);
}

var makeRequest = function(endpoint, callback) {
    request.get(endpoint, function(err, res, body) {
        if (err) {
            callback(err);
        }
        else if (res.statusCode === 200) {
            try {
                callback(null, JSON.parse(body));
            }
            catch(e) {
                callback(e + ": " + endpoint);
            }
        }
        else {
            var errorString = res.statusCode + " generated by call: " + endpoint;

            if (res.statusCode === 429) {
                errorString += "\n * Note: a 429 is generated by calling the Riot API too many times in a short period. ";
                errorString += "Wait a couple seconds and try again.";
            }
            callback(errorString);
        }
    });
}

// Helps for loading data from JSONs synchronously
var loadJSON = function(filename) {
    var data = fs.readFileSync(filename);
    return JSON.parse(data);
}

// Given an input list, gets a random subset of this list with num values.
var getRandomSubset = function(inputList, num) {
    if (num <= 0) return null;
    var output = [];

    for (var i = 0; i < num; i++) {
        var index = Math.floor(Math.random() * inputList.length);
        var item = inputList[index];
        output.push(item);
        inputList.splice(index, 1); // prevent duplicates
    }
    return output;
}

// Data loaders, useful to abstract these away
var getProList = function(num) {
    var inputList = loadJSON("pros.js");
    return getRandomSubset(inputList, num)
}

var getChampId = function(champName) {
    var champData = loadJSON("champ_info.js");
    var champNameLowercase = champName.toLowerCase();
    for (var i = 0; i < champData.length; i++) {
        if (champData[i].name === champNameLowercase) {
            return champData[i].id;
        }
    }
    return null;
}

var getRuneInfo = function(runeId) {
    var runeData = loadJSON("rune_info.js");
    for (var i = 0; i < runeData.length; i++) {
        if (runeData[i].id === runeId) {
            return runeData[i];
        }
    }
    
    return null;
}

// Global trackers to make sure we don't get throttled.
var requestsMade = 0;
var maxRequestsAllowed = 10;

// Based on the inputted champion, get some recent data from professional games.
var getAggregatedChampInfo = function(champId) {
    var runes = [];
    var pros = getProList(maxRequestsAllowed);
    for (var i = 0; i < pros.length; i++) {
        var id = pros[i];
        if (!id) { // reached the end of our list
            break;
        }
        getMatchHistoryBySummonerId('na', id, champId, function(err, data) {
            if (err) {
                console.log(err);
            }
            else if (data.matches) {
                for (var m = 0; m < data.matches.length; m++) {
                    var match = data.matches[m];
                    
                    // Sometimes match doesn't contain rune data...
                    // Rito pls
                    if (match.participants[0].runes !== undefined) {
                        runes.push(match.participants[0].runes);
                    }
                }
            }

            requestsMade++;
            
            if (requestsMade >= maxRequestsAllowed) {
                if (runes.length === 0) {
                    console.log("No games found :(");
                }
                else {
                    var processedRuneSets = processRunes(runes);
                    formattedOutput(processedRuneSets);
                }
            }
        });
    }
}

// Do the analysis on the returned runes.
var processRunes = function(runes) {
    var runeData = loadJSON('rune_info.js');
    // We need this in a dictionary for quick lookup
    var runeDict = {};
    runeData.forEach(function(x) {
        var entry = {"name": x.name, "type": x.type, "tier": x.tier, "stat": x.stat, "boost": x.boost};
        runeDict[x.id] = entry;
    });
    var processedRuneSets = [];
    for (var i = 0; i < runes.length; i++) {
        var runeEntry = runes[i];
        var processedRuneSet = [];
        for (var j = 0; j < runeEntry.length; j++) {
            var id = runeEntry[j].runeId;
            var rank = runeEntry[j].rank;

            // Look up the rune by the id, and get our relevant data.
            // Store the entry in processedRunes so we can keep all of them.
            var rune = runeDict[id];
            if (!rune) { 
                //lookup failed. this is probably an error in the rune data file.
                //just continue
                var errorRune = {"color" : "error", "stat" : "error", "boost" : 0, "number" : 0}
                processedRuneSet.push(errorRune);
            }
            else { // lookup succeeded
                var processedRune = {"color" : rune.type, "stat" : rune.stat, "boost" : rune.boost, "number" : rank};
                processedRuneSet.push(processedRune);
            }
        }
        processedRuneSets.push(processedRuneSet);
    }
    return processedRuneSets;
}

var formattedOutput = function(runeSets) {
    console.log("Rune sets found!");
    for (var i = 0; i < runeSets.length; i++) {
        console.log("Set " + (i+1) + ":");
        var runeSet = runeSets[i];
        for (var j = 0; j < runeSet.length; j++) {
            var rune = runeSet[j];
            
            var totalBoost;
            if (rune.stat === 'hybrid penetration') {
                var totalArmor = (rune.number * rune.boost[0]);
                var totalMagic = (rune.number * rune.boost[1]);
                totalBoost = totalArmor + " / " + totalMagic;
            }
            else {
                var totalBoost = (rune.number * rune.boost).toFixed(2);
            }
            
            var totalBoostAt18 = totalBoost * 18;
            var percentage = false;
            
            if (rune.stat === 'critical chance' || rune.stat === 'critical damage' || rune.stat === 'movement speed'
                    || rune.stat === 'attack speed' || rune.stat === 'cooldown reduction' || rune.stat === 'scaling cooldown reduction'
                    || rune.stat === 'percent health' || rune.stat === 'life steal' || rune.stat === 'spell vamp'
                    || rune.stat === 'experience gained') {
                totalBoost = totalBoost + "%";
                percentage = true;
            }
            
            if (rune.stat.substring(0, 7) === "scaling") {
                if (percentage) {
                    totalBoost = totalBoost + " per level (" + totalBoostAt18 + "% at level 18)";
                }
                else {
                    totalBoost = totalBoost + " per level (" + totalBoostAt18 + " at level 18)";
                }
            }
            
            if (rune.color === 'red') {
                console.log(colors.red(rune.color + ": " + rune.stat + " x " + rune.number + "   (total boost: " + totalBoost + ")"));
            }
            else if (rune.color === 'yellow') {
                console.log(colors.yellow(rune.color + ": " + rune.stat + " x " + rune.number + "   (total boost: " + totalBoost + ")"));
            }
            else if (rune.color === 'blue') {
                console.log(colors.blue(rune.color + ": " + rune.stat + " x " + rune.number + "   (total boost: " + totalBoost + ")"));
            }
            else { // quint
                console.log(colors.white(rune.color + ": " + rune.stat + " x " + rune.number + "   (total boost: " + totalBoost + ")"));
            }
        }
        console.log("\n");
    }
}

// Show correct usage to user if input is bad
var usage = function() {
    console.log("usage: ");
    console.log("--champion || -c : specify the input champion to search for");
}

// Handle command line inputs
var args = process.argv.slice(2);
if (args.length != 2) {
    usage();
}
else {
    for (var i = 0; i < args.length; i++) {
        if (args[i] === "-c" || args[i] === "--champion") {
            var champName = args[++i];
            var champId = getChampId(champName);
            if (champId) {
                console.log("Looking for " + champName + " games...");
                getAggregatedChampInfo(champId);
            }
            else {
                console.log("error: invalid champion name");
                usage();
            }
        }
        // default: show usage
        else {
            usage();
        }
    }
}
