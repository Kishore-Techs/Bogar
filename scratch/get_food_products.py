import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    all_products = json.loads(resp.read().decode('utf-8'))

food_products = [p for p in all_products if p.get('category_name') == 'Food']
print(f"Total Food products in Dharani: {len(food_products)}")

with open('k:/Bogar/scratch/food_products.json', 'w', encoding='utf-8') as f:
    json.dump(food_products, f, indent=2, ensure_ascii=False)

for p in food_products:
    print(f"ID: {p['id']} | Name: {p['name']} | Price: {p['price']} | MRP: {p['mrp']}")
    print(f"  Image: {p.get('image')}")
    desc = p.get('description') or ''
    print(f"  Desc: {desc[:80]}...")
