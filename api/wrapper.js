/**
 * API helper functions 
 */

var request = require('request');

// These api calls are exposed to the rest of the application. They use the helper 
// function below (makeRequest)
module.exports = {
    // This api call gets the match history for a summoner id for the given champ id.
    getMatchHistoryBySummonerId : function(region, id, champId, callback) {
        var path = "/v2.2/matchhistory/" + id + "?championIds=" + champId + "&";
        makeApiRequest(region, path, callback);
    },

    // This api call gets the current contents of the challenger league for the given region.
    getChallengerLeague : function(region, callback) {
        var path = "/v2.5/league/challenger?type=RANKED_SOLO_5x5&";
        makeApiRequest(region, path, callback);
    }
};

// This is the 'meat'. This func makes a single request through the Riot Developer API.
var makeApiRequest = function(region, path, callback) {
    // Pls don't use my key <3
    var key = '734c49ac-b2f3-4edf-a2cd-34d29a346662';
    var endpoint = "https://" + region + ".api.pvp.net/api/lol/" +
                    region + path + "api_key=" + key;
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

        // Currently limited to 10 requests every 10 seconds. Error message if
        // that limit is exceeded.
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
