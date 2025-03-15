#!/bin/bash
python3 ./scraper/extractNPCComponents.py ~/Downloads/DAWN_\ The\ RPG\ 1.03.pdf
python3 ./scraper/extractNPCEdges.py ~/Downloads/DAWN_\ The\ RPG\ 1.03.pdf
python3 ./scraper/extractNPCTechniques.py ~/Downloads/DAWN_\ The\ RPG\ 1.03.pdf
python3 ./scraper/extractTechniques.py ~/Downloads/DAWN_\ The\ RPG\ 1.03.pdf