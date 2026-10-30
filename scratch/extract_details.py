import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('research/SKINDERMO_Model_Training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for idx in [8, 11, 12, 16, 17, 23, 24, 37, 38, 51, 54]:
    cell = nb['cells'][idx]
    print(f"\n{'='*25} Cell {idx} ({cell.get('cell_type')}) {'='*25}")
    for i, line in enumerate(cell.get('source', [])):
        print(f"{i+1:3d}: {line}", end='')
    print()
    if cell.get('outputs'):
        print('--- Outputs ---')
        for o in cell['outputs']:
            if 'text' in o:
                print(''.join(o['text']))
            elif 'data' in o and 'text/plain' in o['data']:
                print(''.join(o['data']['text/plain']))
