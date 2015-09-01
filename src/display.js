// Printing functions for the command line

var colors = require('colors');

// Publically available printing functions
module.exports = {
    // Prints the aggregated summary data from the rune set dictionary.
    printRuneMasterySetSummary : function(processedRuneMasterySetSummary, numSets) {
        console.log("SUMMARY:\n");
        // First iteration: get the total number of items
        for (var i = 0; i < processedRuneMasterySetSummary.length; i++) {
            var summaryEntry = processedRuneMasterySetSummary[i];
            printPercentageBar(summaryEntry.frequency, numSets);
            printRuneMasterySet(summaryEntry.runesAndMasteries);
            console.log("\n");
        }
        console.log("Total games found: " + numSets + "\n");
    }, 

    // Print all the rune-mastery sets found.
    // Each one is printed individually below.
    printAllRuneMasterySets : function(runeMasterySets) {
        for (var i = 0; i < runeMasterySets.length; i++) {
            console.log("Set " + (i+1) + ":");
            printRuneMasterySet(runeMasterySets[i]);
            console.log("\n");
        }
    },

    // Helper / error messages

    noGamesFound : function() {
        console.log("No games found. :(");
    },

    updatedPros : function() {
        console.log("Updated pros.js.");
    },

    error : function(err) {
        console.log(err);
    }
}

// Helpers for the public functions

// Display a set of runes and masteries.
var printRuneMasterySet = function(runeMasterySet) {
    var runes = runeMasterySet.runes;
    var masteries = runeMasterySet.masteries;
    for (var i = 0; i < runes.length; i++) {
        var rune = runes[i];
        
        // Print runes.
        var totalBoost;
        if (rune.stat === 'hybrid penetration') {
            var totalArmor = (rune.number * rune.boost[0]);
            var totalMagic = (rune.number * rune.boost[1]);
            totalBoost = totalArmor + " / " + totalMagic;
        }
        else {
            var totalBoost = (rune.number * rune.boost).toFixed(2);
        }
        
        var totalBoostAt18 = (totalBoost * 18).toFixed(2);
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
        else { // Quints
            console.log(colors.white(rune.color + ": " + rune.stat + " x " + rune.number + "   (total boost: " + totalBoost + ")"));
        }
    }
    // Print masteries.
    console.log(colors.cyan("masteries: " + masteries));
}

// Displays a line representing the percentage count/total followed by
// the rounded percentage value.
var printPercentageBar = function(count, total) {
    var percentage = (count / total * 100).toFixed(2);
    
    var barLength = 40;
    var bar = "";
    for (var i = 0; i < barLength; i++) {
        if (i / barLength < count / total) {
            bar += "=";
        }
        else {
            bar += " ";
        }
    }
    console.log("[" + bar + "] " + percentage + "%");
}

