"""
Contains the logic to make a rune set based on player input.
"""

import championgg_api
import util

def get_runes_for_champs(champions):
    results = []
    for champion in champions:
        roleRuneMap = championgg_api.get_most_winning_runes(champion)
        for runeset in roleRuneMap:
            role = runeset['role']
            runeGroups = runeset['runes']
            runeShorthands = []
            
            for runeGroup in runeGroups:
                runeShorthands.append(util.rune_group_shorthand(runeGroup))
            
            championRoleString = ("{0} {1}").format(champion, runeset['role'])
            results.append( (championRoleString, runeShorthands) )
    
    return results