import json
import os

nb_path = r"research/SKINDERMO_Model_Training.ipynb"
with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}")
with open(r"scratch/nb_dump.txt", "w", encoding="utf-8") as out:
    for i, cell in enumerate(nb['cells']):
        cell_type = cell.get("cell_type", "")
        source = "".join(cell.get("source", []))
        out.write(f"\n{'='*20} Cell {i} ({cell_type}) {'='*20}\n")
        out.write(source + "\n")
        outputs = cell.get("outputs", [])
        if outputs:
            out.write(f"\n--- Outputs ({len(outputs)}) ---\n")
            for out_item in outputs:
                if "text" in out_item:
                    out.write("".join(out_item["text"]) + "\n")
                elif "data" in out_item and "text/plain" in out_item["data"]:
                    out.write("".join(out_item["data"]["text/plain"]) + "\n")

print("Dumped notebook to scratch/nb_dump.txt")
