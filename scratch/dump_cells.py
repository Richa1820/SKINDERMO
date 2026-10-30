import json

nb_path = 'd:/mini-project/SKINDERMO_WEBSITE/research/SKINDERMO_Model_Training.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells_to_inspect = [5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 21, 22, 23, 24, 43, 44, 45, 46, 47, 48, 54, 55, 56]
for cidx in cells_to_inspect:
    if cidx < len(nb['cells']):
        cell = nb['cells'][cidx]
        src = "".join(cell['source'])
        print(f"=== CELL {cidx} ===")
        print(src)
        print("\n" + "="*50 + "\n")
