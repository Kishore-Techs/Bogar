import json, os

with open('scratch/comprehensive_audit.json', 'r', encoding='utf-8') as f:
    categories = json.load(f)

print("========================================")
print("AFFECTED PRODUCTS AUDIT")
print("========================================")

affected_by_cat = {}
all_affected_keys = set()

for cat_name, items in categories.items():
    aff = []
    for it in items:
        an = it.get('analysis')
        if an and an.get('is_affected'):
            aff.append(it)
            # Store identifiers
            all_affected_keys.add(str(it['id']))
            if it.get('image'):
                all_affected_keys.add(it['image'])
                all_affected_keys.add(os.path.basename(it['image']))
            if it.get('fallbackImage'):
                all_affected_keys.add(it['fallbackImage'])
                all_affected_keys.add(os.path.basename(it['fallbackImage']))
            if it.get('local_file'):
                all_affected_keys.add(os.path.basename(it['local_file']))
                all_affected_keys.add(it['local_file'].replace('\\', '/'))
    affected_by_cat[cat_name] = aff
    print(f"\n{cat_name.upper()}: {len(aff)} affected / {len(items)} total")
    for a in aff:
        print(f"  - [{a['id']}] {a['name']} (aspect={a['analysis']['aspect']}, var={a['analysis']['var_lr']})")

print(f"\nTotal unique affected keys: {len(all_affected_keys)}")

with open('scratch/affected_keys.json', 'w', encoding='utf-8') as f:
    json.dump(list(all_affected_keys), f, indent=2)
