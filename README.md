This is a tool for determining optimal runes and masteries in League of Legends
through crowdsourcing professional players.

We have a giant list of pro player IDs, which we query for recent games
with the inputted champion. The most popular rune and mastery setups can easily be
determined from this dataset.

This project uses the Riot API for League of Legends (https://developer.riotgames.com/api/methods).

To run this, clone the repository and run
```
npm install
node zzrune.js -p
node zzrune.js -c [CHAMPION]
```
