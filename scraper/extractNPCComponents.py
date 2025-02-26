import pymupdf4llm
import sys
import json
import re
import csv

def newType(archetype):
    return {
        'name': '',
        'archetype': archetype,
        'flavor': '',
        'basehp': '',
        'tierhp': '',
        'speed': '',
        'tierarmor': '0',
        'passive': '',
        'actionname': '',
        'action': '',
        'attackname': '',
        'attack': '',
        'attackdice': '',
        'attacktierdice': '1',
        'attacktensionx': '1',
        'acename': '',
        'acetension': '',
        'ace': ''
    }

output = []
def extract(sourcebook, archetype, startpage, endpage):
    left_side = pymupdf4llm.to_markdown(sourcebook, margins=(0, 0,306,0), pages=range(startpage, endpage), write_images=False)
    right_side = pymupdf4llm.to_markdown(sourcebook, margins=(306, 0,0,0), pages=range(startpage, endpage), write_images=False)
    techniques = left_side + "\n\n\n" + right_side
    current = newType(archetype)
    currenttype = ""
    firsttype = True

    ## TODO: Fix the first NPC at the top of the section

    for line in techniques.splitlines():
        # Are we in a new tech?
        m = re.search(r"^###### (.+) [|] (.+)$", line)
        if m and current['name'] != '':
            # Print the previous tech and start a new one
            output.append(current)
            current = newType(archetype)
            currenttype = ''
            firsttype = False

        if m: #I don't want to nest IFs
            current['name'] = m.group(1)
            current['flavor'] = m.group(2)
            currenttype = 'flavor'
            continue

        # Are we in THE FIRST tech?
        m = re.search(r"^ (.+) [|] (.+)$", line)
        if firsttype and m:
            current['name'] = m.group(1)
            current['flavor'] = m.group(2)
            currenttype = 'flavor'
            firsttype = False
            continue

        if line.startswith("####"): #page numbers and half of the "complexity" words at the top of some but not all pages
            continue

        m = re.search(r"^\-\-\-\-\-$", line)
        if m:
            continue

        m = re.search(r"^([0-9]+) \+ \[Tier [\u00d7x] (\d+)\] Health, ([0-9]+) Speed", line)
        if m:
            current['basehp'] = m.group(1)
            current['tierhp'] = m.group(2)
            current['speed'] = m.group(3)
            m = re.search(r"\[Tier\] Armor$", line)
            if m:
                current['tierarmor'] = '1'
            continue

        #swarms and bodyguards
        if line == '1* Health, 0* Speed':
            current['basehp'] = '1'
            current['tierhp'] = '0'
            current['speed'] = '0'
            continue

        m = re.search(r"^\*\*\*?Passive: (.*)\*\*$", line)
        if m:
            current['passive'] = m.group(1)
            currenttype = 'passive'
            continue

        m = re.search(r"^\*\*\[Action\] ([^:]+): (.*)\*\*$", line)
        if m:
            current['actionname'] = m.group(1)
            current['action'] = m.group(2)
            currenttype = 'action'
            continue

        m = re.search(r"^\*\*\[Attack\] ([^:]+): (.*)\*\*$", line)
        if m:
            current['attackname'] = m.group(1)
            current['attack'] = m.group(2)
            currenttype = 'attack'
            continue

        m = re.search(r"^\*\*\*?\[Ace:T(\d+)\] ([^:]+): (.*)\*\*$", line)
        if m:
            current['acetension'] = m.group(1)
            current['acename'] = m.group(2)
            current['ace'] = m.group(3)
            currenttype = 'ace'
            continue

        m = re.search(r"^\*\*(Reward: .*)\*\*$", line)
        if m:
            current[currenttype] = current[currenttype] + "\n" + m.group(1)
            continue

        if len(line) > 0 and currenttype != '':
            current[currenttype] = current[currenttype] + " " + line

    if current['name'] != '':
        output.append(current)

sourcebook = sys.argv[1]
extract(sourcebook, "DPS", 114, 117)
extract(sourcebook, "Tank", 117, 120)
extract(sourcebook, "Support", 120, 122)
extract(sourcebook, "Engine", 122, 125)

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

with open("./scripts/npcs/components.json", "w") as file:
    print(json.dumps(output, indent=2), file=file);

with open("./scripts/npcs/components.csv", "w") as file:
    fieldnames = newType("").keys()
    writer = csv.DictWriter(file, fieldnames=fieldnames, dialect='unix')
    writer.writeheader()
    writer.writerows(output)