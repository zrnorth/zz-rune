"""
Contains the logic to make a rune set based on player input.
"""

import championgg_api
import util
import pprint

def get_runes_for_champs(champions):
    """
    Given a list of champions, returns a list of tuples of the form [(ChampRole, [RunesShorthand])]
    """
    results = []
    for champion in champions:
        roleRuneMap = championgg_api.get_most_winning_runes(champion)
        for runeset in roleRuneMap:
            if runeset == 'error': # got a bad runeset, probably bad champ name input.
                continue
                
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
            newScore = dict[key][0] + 1
            champRoleList = dict[key][1]
            champRoleList.append(champRole)

            dict[key] = (newScore, champRoleList)
        else: # New key, so add to the dict
            dict[key] = (1, [champRole])
    
    return dict
    
def get_runepages(championList, maxPages):
    """
    Given a list of champions and a maximum number of pages, returns a mapping of
    runepages to champions they are used for. Also returns a list of "left-out" champs.
    """
    runeSets = get_runes_for_champs(championList)
    merged = merge_all_common_runesets(runeSets)
    
    results = []
    leftOut = []
    count = 0
    # Sort by the "score" of a runepage, to remove the ones that are too low in priority (if necessary)
    for key in sorted(merged, key=merged.get, reverse=True):
        if count < maxPages:
            results.append( (key, merged[key]) )
            count += 1
        else:
            leftOut.append( (key, merged[key]) )
    print("Results: ")
    print(results)
    if leftOut:
        print("These pages were left out: ")
        print(leftOut)
    