import pymupdf4llm
import sys
import json
import re
import csv

def newEdge():
    return {
        'name': '',
        'flavor': '',
        'defensename': '',
        'turnname': '',
        'phasename': '',
        'defense': '',
        'turn': '',
        'phase': ''
    }

output = []
def extract(sourcebook, startpage, endpage):
    left_side = pymupdf4llm.to_markdown(sourcebook, margins=(0, 0,306,0), pages=range(startpage, endpage), write_images=False)
    right_side = pymupdf4llm.to_markdown(sourcebook, margins=(306, 0,0,0), pages=range(startpage, endpage), write_images=False)
    techniques = left_side + "\n\n\n" + right_side
    current = newEdge()
    currenttype = ""

    for line in techniques.splitlines():
        # Are we in a new tech?
        m = re.search(r"^###### (.+) [|] (.+)$", line)
        if m and current['name'] != '':
            # Print the previous tech and start a new one
            output.append(current)
            current = newEdge()
            currenttype = ''

        if m: #I don't want to nest IFs
            current['name'] = m.group(1)
            current['flavor'] = m.group(2)
            continue

        if line.startswith("####"): #page numbers and half of the "complexity" words at the top of some but not all pages
            continue

        m = re.search(r"^\-\-\-\-\-$", line)
        if m:
            continue

        m = re.search(r"^\*\*([^:]+) \(Defense Reaction\): (.*)\*\*$", line)
        if m:
            current['defensename'] = m.group(1)
            current['defense'] = m.group(2)
            currenttype = 'defense'
            continue

        m = re.search(r"^\*\*([^:]+) \((Start Of Turn|Ally Turn Start|Misc Reaction)\): (.*)\*\*$", line)
        if m:
            current['turnname'] = f"{m.group(1)} ({m.group(2)})"
            current['turn'] = m.group(3)
            currenttype = 'turn'
            continue

        m = re.search(r"^\*\*([^:]+) \(Phase Change\): (.*)\*\*$", line)
        if m:
            current['phasename'] = m.group(1)
            current['phase'] = m.group(2)
            currenttype = 'phase'
            continue

        if len(line) > 0 and currenttype != '':
            current[currenttype] = current[currenttype] + " " + line

    if current['name'] != '':
        output.append(current)

sourcebook = sys.argv[1]
extract(sourcebook, 111, 113)

with open("./scripts/npcs/edges.json", "w") as file:
    print(json.dumps(output, indent=2), file=file);

with open("./scripts/npcs/edges.csv", "w") as file:
    fieldnames = newEdge().keys()
    writer = csv.DictWriter(file, fieldnames=fieldnames, dialect='unix')
    writer.writeheader()
    writer.writerows(output)