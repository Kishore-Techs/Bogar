import json, re

def inspect_file(path, var_name):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    # Find list
    m = re.search(var_name + r'\s*=\s*(\[.*?\]);', text, re.DOTALL)
    if not m:
        print(f"Could not find {var_name} in {path}")
        return []
    raw_json = m.group(1)
    try:
        data = json.loads(raw_json)
        return data
    except Exception as e:
        # Fallback eval or regex
        print(f"JSON load failed for {var_name}: {e}")
        return []

print("Inspecting...")
poojas = inspect_file('src/config/dharaniPoojaProducts.js', 'DHARANI_POOJA_PRODUCTS_INITIAL')
print(f"Poojas: {len(poojas)}")
for p in poojas:
    print(f"  [{p['name']}]: {p.get('shortDescription')}")

teas = inspect_file('src/config/dharaniTeaProducts.js', 'DHARANI_TEA_PRODUCTS_INITIAL')
print(f"\nTeas: {len(teas)}")
for p in teas:
    print(f"  [{p['name']}]: {p.get('shortDescription')}")
