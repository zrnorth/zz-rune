var fs = require('fs');
var path = require('path');

// Helper utilities go here.
module.exports = {

    // Helper function for loading data from JSONs synchronously.
    loadJSON : function(filename) {
        // Path.join allows relative filenames.
        var data = fs.readFileSync(path.join(__dirname, '/', filename));
        return JSON.parse(data);
    },

    // Returns a randomly selected "num"-sized subset of the input list.
    getRandomSubset : function(inputList, num) {
        if (num <= 0) return null;
        var output = [];

        for (var i = 0; i < num; i++) {
            // Add a random element from list to subset.
            var index = Math.floor(Math.random() * inputList.length);
            var item = inputList[index];
            output.push(item);
            // Remove element from original list to prevent duplicates.
            inputList.splice(index, 1);
        }
        return output;
    }
}
