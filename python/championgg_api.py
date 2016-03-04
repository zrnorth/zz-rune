"""
Contains the Champion.GG api setup stuff.
"""

import os
import json
import requests
__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
    
# Globals
CHAMPIONGG_KEY = ""
SETUP = False
ENDPOINT = "http://api.champion.gg/"

def setup():
    """
    Get setup for calls, getting the api keys from the config file.
    """
    global CHAMPIONGG_KEY, SETUP
    with open(os.path.join(__location__, 'config'), 'r') as f:
        try:
            config = json.load(f)
        except ValueError:
            config = {"riot_key": "", "championgg_key": ""}
    CHAMPIONGG_KEY = config["championgg_key"]
    SETUP = True

# ChampionGG API Calls

def get_champion():
    """
    Gets high level champ data from GG
    """
    if not SETUP:
        setup()

    return requests.get(
        (ENDPOINT + "/champion?api_key={0}").
        format(CHAMPIONGG_KEY)).json()
        
def get_most_winning_runes(champion):
    """
    Gets the most winning rune combos for each champ-role from GG
    """
    if not SETUP:
        setup()
    
    return requests.get(
        (ENDPOINT + "/champion/{0}/runes/mostPopular?api_key={1}").
        format(champion, CHAMPIONGG_KEY)).json()