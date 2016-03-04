"""
Contains the api call stuff.
Thanks to https://github.com/Kruptein, I copied much of his lolapi repo. :)
"""

import os
import json
import requests
__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
    
print(__location__)

# Globals
API_KEY = ""
PLAYER_NAME = "zrnorth" # for now
REGION_ENDPOINT = "https://{0}.api.pvp.net/api/lol/{0}/"

def setup():
    """
    Get setup for a call, getting the api key from the config file.
    """
    global API_KEY
    with open(os.path.join(__location__, 'config'), 'r') as f:
        try:
            config = json.load(f)
        except ValueError:
            config = {'key': ""}
    API_KEY = config["key"]

# Standard API calls

def get_summoner_by_name(region, summonerNames):
    """
    Get summoner objects mapped by standardized summoner name
    for a given list of summoner names.
    """
    return requests.get(
        (REGION_ENDPOINT + "v1.4/summoner/by-name/{1}?&api_key={2}").
        format(region, summonerNames, API_KEY))
        
def get_summoner_by_id(region, summonerIds):
    """
    Get summoner objects mapped by summoner ID
    for a given list of summoner IDs.
    """
    return requests.get(
        (REGION_ENDPOINT + "v1.4/summoner/{1}?api_key={2}").
        format(region, summonerIds, API_KEY))
        
def get_runes(region, summonerIds):
    """
    Get rune pages mapped by summoner ID
    for a given list of summoner IDs.
    """
    return requests.get(
        (REGION_ENDPOINT + "v1.4/summoner/{1}/runes?api_key={2}").
        format(region, summonerIds, API_KEY))
        
# Helpers
def get_summoner_id(region, summonerName):
    """
    Get your summoner id.
    """
    if "," in summonerName:
        print("Call this one id at a time ;)")
        return
        
    return get_summoner_by_name(region, summonerName).json()[summonerName.lower()]['id']
    
    
setup()