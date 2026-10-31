import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    products = json.loads(resp.read().decode('utf-8'))

target_queries = [
    "108",
    "Deepa Oil",
    "Herbal Dhoopa Powder",
    "27",
    "Thirumanjal",
    "Thalampoo",
    "54"
]

print("--- SEARCHING TARGET PRODUCTS ---")
for t in target_queries:
    print(f"\nSearch for: {t}")
    matches = [
        p for p in products 
        if t.lower() in (p.get('name') or '').lower() or t.lower() in (p.get('description') or '').lower()
    ]
    for m in matches:
        print(f"  ID: {m['id']} | Name: {m['name']} | Price: {m['price']} | MRP: {m['mrp']} | Category: {m.get('category_name')}")
        print(f"  Image: {m.get('image')}")
        print(f"  Desc: {m.get('description')}")

# Also check categories in Dharani
categories_set = set(p.get('category_name') for p in products)
print("\n--- ALL CATEGORIES ---")
for c in sorted(str(x) for x in categories_set):
    print(" ", c)

# Print all products in pooja-related categories or matching words
print("\n--- ALL POOJA RELATED PRODUCTS ---")
for p in products:
    name = (p.get('name') or '')
    cat = (p.get('category_name') or '')
    if any(k in name.lower() or k in cat.lower() for k in ['pooja', 'homa', 'dravyangal', 'thiraviyangal', 'oil', 'dhoop', 'kunkum', 'manjal', 'deepa', 'offering']):
        print(f"  [{p['id']}] ({cat}) {name} - Price: {p['price']}, MRP: {p['mrp']}")
        print(f"    Image: {p.get('image')}")
