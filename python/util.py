"""
Utility / helpers
"""
import os
import json
__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Globals
SETUP = False
RUNE_DICT = {}

def setup():
    """
    Get setup for calls, getting the api keys from the config file.
    """
    global SETUP, RUNE_INFO
    dataLocation = os.path.realpath(os.path.join(__location__, "../data"))
    with open(os.path.join(dataLocation, 'rune_info.js'), 'r') as f:
        try:
            runeList = json.load(f)
            convertRuneListToDict(runeList)
        except ValueError:
            RUNE_DICT = {}
    SETUP = True
    
def convertRuneListToDict(runeList):
    """
    We want to take our list of all types of runes, and change it to a 
    dict with the rune id as a key.
    """
    for runeType in runeList:
        key = runeType['id']
        del runeType['id']
        value = runeType
        RUNE_DICT[key] = value
    
def rune_group_shorthand(runeGroup):
    """
    Helper to put the runes into shorthand.
    input: json, ex: 
    {   'id': 5273,
        'description': '+0.87 magic penetration', 
        'name': 'Greater Mark of Magic Penetration', 
        'number': 9  }
        
    output: "9x Magic Pen Reds"
    
    """
    if not SETUP:
        setup()
        
    id = runeGroup['id']
    num = runeGroup['number']
        
    str = "{0}x {1} {2}".format(num, RUNE_DICT[id]['stat'], RUNE_DICT[id]['type'])
    if num > 1:
        str += "s"
    return str
    