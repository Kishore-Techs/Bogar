import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    products = json.loads(resp.read().decode('utf-8'))

pooja_products = [p for p in products if p.get('category_name') == 'Poojas']
print(f"Total Poojas products in Dharani: {len(pooja_products)}")

with open('k:/Bogar/scratch/pooja_products.json', 'w', encoding='utf-8') as f:
    json.dump(pooja_products, f, indent=2, ensure_ascii=False)

for p in pooja_products:
    print(f"ID: {p['id']} | Name: {p['name']} | Price: {p['price']} | MRP: {p['mrp']}")
    print(f"  Image: {p.get('image')}")
