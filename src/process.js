/**
 * Lol-Runer
 *
 * Command line tool made to prosource the best runes and masteries for your
 * favorite League of Legends champions.
 *
 * Authors: Zach North (www.zachnorth.com) and Rory Snively (rorysnively.com)
 */

var fs = require('fs');
var path = require('path');

var api = require('../api/wrapper');
var utils = require('./utils');
var display = require('./display');

// Global trackers to make sure we don't get throttled.
var requestsMade = 0;
var maxRequestsAllowed = 10;

module.exports = {
    // Based on the inputted champion, get some recent data from professional games.
    getAggregatedChampInfo : function(champId, displayAll) {
        var runes = [];
        var masteries = [];
        var inputList = utils.loadJSON("../data/pros.js");
        var pros = utils.getRandomSubset(inputList, maxRequestsAllowed)
        for (var i = 0; i < pros.length; i++) {
            var id = pros[i];
            if (!id) { // reached the end of our list
                break;
            }
            // Check player's match history for the desired champions. Games which
            // fit these criteria are placed in "data" object.
            api.getMatchHistoryBySummonerId('na', id, champId, function(err, data) {
                if (err) {
                    return display.error(err);
                }
                else if (data.matches) {
                    for (var m = 0; m < data.matches.length; m++) {
                        var match = data.matches[m];
                        
                        // Only use matches which contain rune/mastery data.
                        if (match.participants[0].runes !== undefined && match.participants[0].masteries !== undefined) {
                            runes.push(match.participants[0].runes);
                            masteries.push(match.participants[0].masteries);
                        }
                    }
                }

                requestsMade++;
                
                // Once maximum number of requests is reached, either display the
                // data we have, or report that none was found.
                if (requestsMade >= maxRequestsAllowed) {
                    if (runes.length === 0) {
                        display.noGamesFound();
                    }
                    else {
                        // Analyze the runes and masteries for the given champion.
                        var process = processRunesAndMasteries(runes, masteries);
                        var allProcessedRuneMasteryData = process[0];
                        var processedRuneMasterySetSummary = process[1];
                        
                        // Display all the data (verbose mode only).
                        if (displayAll) {
                            display.printAllRuneMasterySets(allProcessedRuneMasteryData);
                        }

                        // Display the sorted, processed data (normal mode).
                        var dataSetSize = allProcessedRuneMasteryData.length;
                        display.printRuneMasterySetSummary(processedRuneMasterySetSummary, dataSetSize);
                    }
                }
            });
        }
    },

    // Given a champion name (any case), return the champion's ID as represented
    // in the Riot Developer API.
    getChampId : function(champName) {
        var champData = utils.loadJSON("../data/champ_info.js");
        var champNameLowercase = champName.toLowerCase();
        for (var i = 0; i < champData.length; i++) {
            if (champData[i].name === champNameLowercase) {
                return champData[i].id;
            }
        }
        return null;
    },

    // Initialization function to populate the list of pro players with the current
    // NA challenger tier (as a JSON object containing their player IDs).
    populateProList : function() {
        api.getChallengerLeague("na", function(err, data) {
            if (err) {
                return display.error(err);
            }
            var JSONString = "[\n"
            
            for (var i = 0; i < data.entries.length; i++) {
                var playerId = data.entries[i].playerOrTeamId;
                JSONString += "  \"" + playerId + "\"";
                
                if (i === data.entries.length - 1) {
                    JSONString += "\n]";
                }
                else {
                    JSONString += ",\n";
                }
            }
            
            fs.writeFile(path.join(__dirname, '../data/pros.js'), JSONString, function(err) {
                if (err) {
                    return display.error(err);
                }
                else {
                    display.updatedPros();
                }
            });
        });
    }
}

// Given a set of runes and masteries, return a unique hash string.
var hashRunesAndMasteriesSet = function(runeSet, masteries) {
    // Sort runes by ID
    runeSet.sort(function(a, b) {
        return (a.runeId - b.runeId);
    }); 

    // Create hash of the form [Rune 1 ID][Rune 1 Quntity][Rune 2 ID][Rune 2 Quantity] ... [Rune N ID][Rune N Quantity][Mastery String]
    var hash = "";
    for (var i = 0; i < runeSet.length; i++) {
        hash += runeSet[i].runeId;
        hash += runeSet[i].rank;
    }
    hash += masteries;
    return hash;
}


// looks up the runes in a rune entry by id and puts them into a list.
var processRunes = function(runeEntry, runeDict) {
    var processedRuneSet = [];
    for (var i = 0; i < runeEntry.length; i++) {
        var id = runeEntry[i].runeId;
        var rank = runeEntry[i].rank;

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
    return processedRuneSet;
}


// Given a masteries object, return the corresponding string of the form
// [Number of Offensive Masteries]/[Number of Defensive Masteries]/[Number of
// Utility Masteries] (eg 21/0/9).
var processMasteries = function(masteries) {
    var offense = 0;
    var defense = 0;
    var utility = 0;
    
    // Get counts for Offense/Defense/Utility
    for (var i = 0; i < masteries.length; i++) {
        var mastery = masteries[i];
        
        if (mastery.masteryId < 4200) {
            offense += mastery.rank;
        }
        else if (mastery.masteryId < 4300) {
            defense += mastery.rank;
        }
        else {
            utility += mastery.rank;
        }
    }
    
    // Make string xx/xx/xx
    return (offense + "/" + defense + "/" + utility);
}


// Analyze the input lists of runes and masteries. Returns an object containing
// all reformatted sets, as well as a list of the most common rune-mastery sets.
var processRunesAndMasteries = function(runes, masteries) {

    var runeData = utils.loadJSON('../data/rune_info.js');
    // We need this in a dictionary for quick lookup.
    var runeDict = {};
    runeData.forEach(function(x) {
        var entry = {"name": x.name, "type": x.type, "tier": x.tier, "stat": x.stat, "boost": x.boost};
        runeDict[x.id] = entry;
    });
    var processedRuneMasterySets = [];
    var processedRuneMasteryDict = {};

    for (var i = 0; i < runes.length; i++) {
        var processedRuneSet = processRunes(runes[i], runeDict);
        var processedMasterySet = processMasteries(masteries[i]);
        
        // Combine the runes and masteries to put into dictionary.
        var processedRuneMasterySet = {runes: processedRuneSet, masteries: processedMasterySet};
        processedRuneMasterySets.push(processedRuneMasterySet);

        // Either place rune/mastery set into the dictionary, or increment the
        // already existing entry's count.
        var hash = hashRunesAndMasteriesSet(runes[i], processedMasterySet);
        if (processedRuneMasteryDict[hash]) {
            processedRuneMasteryDict[hash].frequency += 1;
        }
        else { 
            processedRuneMasteryDict[hash] = {runesAndMasteries: processedRuneMasterySet,  frequency: 1};
        }
    }

    // Now we need to sort the dictionary by which rune/mastery set turned up the most frequently.
    // First, put into array so we can sort.
    var sortedRuneMasteryFrequencies = [];
    for (var key in processedRuneMasteryDict) {
        if (processedRuneMasteryDict.hasOwnProperty(key)) {
            sortedRuneMasteryFrequencies.push(processedRuneMasteryDict[key]);
        }
    }
    // Now, sort by frequency.
    sortedRuneMasteryFrequencies.sort(function(a, b) {
        return (a.frequency - b.frequency);
    });
    return [processedRuneMasterySets, sortedRuneMasteryFrequencies];
}
