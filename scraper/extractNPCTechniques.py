import pymupdf4llm
import sys
import json
import re
import csv

def newType():
    return {
        'name': '',
        'archetype': 'Scene',
        'flavor': '',
        'basehp': '0',
        'tierhp': '0',
        'speed': '0',
        'baseevasion': '0',
        'tierevasion': '0',
        'basearmor': '0',
        'tierarmor': '0',
        'passive': '',
        'actionname': '',
        'action': '',
        'attackname': '',
        'attack': '',
        'attackdice': '0',
        'attacktierdice': '1',
        'attacktensionx': '1',
        'acename': '',
        'acetension': '0',
        'ace': ''
    }

def statLine(type, line):
    m = re.search(r"(?:[\dX]+)?(?: \+ )?(?:\[Tier?\]|\[Tier [\u00d7x] [\d]+\])?[ ]?"+type, line)
    if not m:
        return None

    matchedStat = m.group(0)
    
    base = '0'
    m = re.search(r"([\dX]+)(?: \+ \[[Tier \u00d7x]+\])?[ ]?", matchedStat)
    if m:
        base = m.group(1)
    
    tier = '0'
    m = re.search(r"(\[Tier?\]|\[Tier [\u00d7x] [\d]+\]) ", matchedStat)
    if m:
        m2 = re.search(r"[Tier [\u00d7x] (\d+)]", m.group(0))
        if m2:
            tier = m2.group(1)
        else:
            tier = '1'

    return (base, tier)


output = []
def extract(sourcebook, startpage, endpage):
    left_side = pymupdf4llm.to_markdown(sourcebook, margins=(0, 0,306,0), pages=range(startpage, endpage), write_images=False)
    right_side = pymupdf4llm.to_markdown(sourcebook, margins=(306, 0,0,0), pages=range(startpage, endpage), write_images=False)
    techniques = left_side + "\n\n\n" + right_side
    current = newType()
    currenttype = ""

    ## TODO: Fix the first NPC at the top of the section

    for line in techniques.splitlines():
        # Are we in a new tech?
        m = re.search(r"^###### (.+) [|] (.+)$", line)
        if m and current['name'] != '':
            # Print the previous tech and start a new one
            output.append(current)
            current = newType()
            currenttype = ''

        if m: #I don't want to nest IFs
            current['name'] = m.group(1)
            current['flavor'] = m.group(2)
            continue

        if line.startswith("NPC Modifier."):
            current['archetype'] = "Technique"
            continue

        if line.startswith("####"): #page numbers and half of the "complexity" words at the top of some but not all pages
            continue

        m = re.search(r"^\-\-\-\-\-$", line)
        if m:
            continue

        # This block is sometimes all on the same line, there should NOT be any continues here
        # This sometimes finds things in passive/attack descriptions. Stat lines should ONLY
        # happen before we start processing passives/attacks/actions
        if currenttype == '':
            statsblock = False
            armor = statLine("Armor", line)
            if armor:
                current["basearmor"] = armor[0]
                current["tierarmor"] = armor[1]
                statsblock = True

            speed = statLine("Speed", line)
            if speed:
                current['speed'] = speed[0]
                statsblock = True

            health = statLine("Health", line)
            if health:
                if health[0] != 'X':
                    current["basehp"] = health[0]
                current["tierhp"] = health[1]
                statsblock = True

            evasion = statLine("Evasion", line)
            if evasion:
                current["baseevasion"] = evasion[0]
                current["tierevasion"] = evasion[1]
                statsblock = True

            if statsblock:
                continue
        # End section all on the same line

        m = re.search(r"^\*\*\*?Passive: (.*)\*\*$", line)
        if m:
            current['passive'] = m.group(1)
            currenttype = 'passive'
            continue

        m = re.search(r"^\*\*\*?Action: (.*)\*\*$", line)
        if m:
            current['actionname'] = current['name']
            current['action'] = m.group(1)
            currenttype = 'action'
            continue

        m = re.search(r"^\*\*\*?Attack: (.*)\*\*$", line)
        if m:
            current['attackname'] = current['name']
            current['attack'] = m.group(1)
            currenttype = 'attack'
            continue

        m = re.search(r"^\*\*(Reward: .*)\*\*$", line)
        if m:
            current[currenttype] = current[currenttype] + "\n" + m.group(1)
            continue

        if len(line) > 0 and currenttype != '':
            current[currenttype] = current[currenttype] + " " + line
            continue

        if len(line) == 0 and currenttype != '':
            current[currenttype] = current[currenttype] + "\n\n"
            continue

    if current['name'] != '':
        output.append(current)

sourcebook = sys.argv[1]
extract(sourcebook, 126, 128)

## Attack dice and damage are... really hard to extract in line, so we need to do a second pass

for component in output:
    attack = component['attack']
    m = re.search(r"Roll (\d) \+ \[Tier(?: [\u00d7x] )?([\d]*)\]", attack)
    if m:
        component['attackdice'] = m.group(1)
        if m.group(2) != '':
            component['attacktierdice'] = m.group(2)
    
    m = re.search(r"Reward: Deal \[Hits\] \+ \[Tension(?: [\u00d7x] )?([\d]*)\]", attack)
    if m and m.group(1) != '':
        component['attacktensionx'] = m.group(1)

with open("./scripts/npcs/techniques.json", "w") as file:
    print(json.dumps(output, indent=2), file=file);

with open("./scripts/npcs/techniques.csv", "w") as file:
    fieldnames = newType().keys()
    writer = csv.DictWriter(file, fieldnames=fieldnames, dialect='unix')
    writer.writeheader()
    writer.writerows(output)