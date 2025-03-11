import pymupdf4llm
import sys
import json
import re
import csv

def newTechnique(archetype):
    return {
        'tech': '',
        'archetype': archetype,
        'tags': '',
        'stars': '',
        'flavor': '',
        'level': '',
        'name': '',
        'text': ''
    }

output = []
def extract(sourcebook, archetype, startpage, endpage):
    left_side = pymupdf4llm.to_markdown(sourcebook, margins=(0, 0,306,0), pages=range(startpage, endpage), write_images=False)
    right_side = pymupdf4llm.to_markdown(sourcebook, margins=(306, 0,0,0), pages=range(startpage, endpage), write_images=False)
    techniques = left_side + "\n\n\n" + right_side
    current = newTechnique(archetype)

    for line in techniques.splitlines():
        # Are we in a new tech?
        m = re.search(r"^###### (.+) [|] (.+) [|] (.*)$", line)
        if m and current['tech'] != '':
            # Print the previous tech and start a new one
            output.append(current)
            current = newTechnique(archetype)

        if m: #I don't want to nest IFs
            current['tech'] = m.group(1)
            current['stars'] = m.group(2)
            current['tags'] = m.group(3)
            continue

        if line.startswith("####"): #page numbers and half of the "complexity" words at the top of some but not all pages
            continue

        m = re.search(r"^\_(.*)\_$", line)
        if m:
            current['flavor'] = current['flavor'] + m.group(1)
            continue

        m = re.search(r"^\*\*(\d):? ([^:]+): (.*)\*\*(.*)$", line)
        if m and current['name'] != '':
            output.append(dict(current))
        
        if m:
            current['level'] = m.group(1)
            current['name'] = m.group(2)
            current['text'] = m.group(3) + m.group(4)
            continue
        
        m = re.search(r"^\-\-\-\-\-$", line)
        if m:
            continue

        if line.startswith("‣"):
            current['text'] = current['text'] + "\n" + line
        elif len(line) > 0:
            current['text'] = current['text'] + " " + line
    if current['tech'] != '':
        output.append(current)

sourcebook = sys.argv[1]
extract(sourcebook, "Powerhouse", 69, 74)
extract(sourcebook, "Vagabond", 75, 80)
extract(sourcebook, "Bulwark", 81, 85)
extract(sourcebook, "Altruist", 86, 91)
extract(sourcebook, "Disruptor", 92, 97)
extract(sourcebook, "Ruiner", 98, 103)

with open("./scripts/techniques/techniques.json", "w") as file:
    print(json.dumps(output, indent=2), file=file);

with open("./scripts/techniques/techniques.csv", "w") as file:
    fieldnames = newTechnique("").keys()
    writer = csv.DictWriter(file, fieldnames=fieldnames, dialect='unix')
    writer.writeheader()
    writer.writerows(output)