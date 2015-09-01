/**
 * Lol-Runer
 *
 * Command line tool made to prosource the best runes and masteries for your
 * favorite League of Legends champions.
 *
 * Authors: Zach North (www.zachnorth.com) and Rory Snively (rorysnively.com)
 */

var runer = require('./src/process')

// Show correct usage to user if input is bad.

var usage = function() {
    console.log("usage: ");
    console.log("--champion || -c : specify the input champion to search for");
    console.log("--verbose  || -v : output all runesets" );
    console.log("--populate || -p : populate the list of challenger players");
    return;
}

// Handle command line inputs.
var args = process.argv.slice(2);
if (args.length < 1 || args.length > 5) {
    usage();
}
else {
    var champName;
    var champId;
    var displayAll = false;
    for (var i = 0; i < args.length; i++) {
        if (args[i] === "-c" || args[i] === "--champion") {
            champName = args[++i];
            champId = runer.getChampId(champName);
        }
        else if (args[i] === "-v" || args[i] === "--verbose") {
            displayAll = true;
        }
        else if (args[i] === "-p" || args[i] === "--populate") {
            return runer.populateProList();
        }
        // Any other arg found: show usage.
        else {
            return usage();
        }
    }
    if (champId) {
        console.log("Looking for " + champName + " games...");
        runer.getAggregatedChampInfo(champId, displayAll);
    }
    else {
        console.log("invalid champ name");
        return usage();
    }
}
