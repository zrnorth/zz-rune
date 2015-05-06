This is a tool for determining optimal runes in League of Legends
through crowdsourcing professional players.

We have a giant list of pro player IDs, which we query for recent games
with the inputted champion. The most popular rune setups can easily be
determined from this dataset.

This project uses the Riot API for League of Legends (https://developer.riotgames.com/api/methods).

We haven't packaged up the source for distribution yet, so for now clone this repository and run
```
node runer.js -c [CHAMPION]
```
installing any dependencies that you don't have using
```
npm install [DEPENDENCY]
```
