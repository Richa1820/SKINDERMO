import json

nb_path = 'd:/mini-project/SKINDERMO_WEBSITE/research/SKINDERMO_Model_Training.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}")
for i, cell in enumerate(nb['cells']):
    ctype = cell['cell_type']
    text = "".join(cell['source']).strip()
    first_line = text.split("\n")[0] if text else "<empty>"
    print(f"Cell {i} [{ctype}]: {first_line[:100]}")
