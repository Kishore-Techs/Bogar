import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    all_products = json.loads(resp.read().decode('utf-8'))

target_names = [
    "Aavaram Flower Tea",
    "Black Tea(G)",
    "Guava Leaf Tea",
    "Herbal Tea Powder",
    "Sukku Powder (Po)",
    "Green Tea (Jar)",
    "Nannari Sherbet",
    "Green Tea",
    "Vilvam Sherbet",
    "Dry Ginger Coffee",
    "Thirikadugu Tea",
    "TULSI TEA (G)",
    "Hibiscus Tea Powder"
]

print(f"Total products in Dharani: {len(all_products)}")

matched = {}
for target in target_names:
    matches = []
    t_clean = target.lower().replace(" ", "").replace("(", "").replace(")", "").replace("-", "")
    for p in all_products:
        name = p.get('name') or ''
        p_clean = name.lower().replace(" ", "").replace("(", "").replace(")", "").replace("-", "")
        if t_clean in p_clean or p_clean in t_clean or any(word in name.lower() for word in target.lower().split() if len(word) > 3):
            matches.append(p)
    matched[target] = matches

with open('k:/Bogar/scratch/tea_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matched, f, indent=2, ensure_ascii=False)

for target in target_names:
    print(f"\nTarget: {target}")
    ms = matched.get(target, [])
    for m in ms[:5]:
        print(f"  -> ID: {m['id']} | Name: {m['name']} | Price: {m['price']} | MRP: {m['mrp']} | Cat: {m.get('category_name')}")
        print(f"     Image: {m.get('image')}")
