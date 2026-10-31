import json

with open('k:/Bogar/scratch/food_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Total Food products: {len(products)}")
for i, p in enumerate(products, 1):
    print(f"{i}. [{p['id']}] {p['name']} — ₹{p['price']}")
    print(f"   Image: {p.get('image')}")
