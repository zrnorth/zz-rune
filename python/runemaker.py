"""
Contains the logic to make a rune set based on player input.
"""

import championgg_api
import util

def get_runes_for_champs(champions):
    """
    Given a list of champions, returns a list of tuples of the form [(ChampRole, [RunesShorthand])]
    """
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
    
def merge_all_common_runesets(champRoleRunesList):
    """
    Given a list of form [(ChampRole, [RunesShorthand])], consolidates the common sets
    and returns a list of for [( ( [ChampRole1, ChampRole2, ...], [RunesShorthand] )]
    """
    dict = {}
    for champRole, runesShorthand in champRoleRunesList:
        key = ", ".join(runesShorthand)
        
        if key in dict: # Collision! combine the values.
            newKey = dict[key][0]
            newKey.append(champRole)
            newScore = dict[key][1] + 1
            dict[key] = (newKey, newScore)
        else: # New key, so add to the dict
            dict[key] = ([champRole], 1)
    
    return dict
    