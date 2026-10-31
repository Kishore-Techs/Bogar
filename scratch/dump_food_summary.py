import json

with open('k:/Bogar/scratch/food_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

with open('k:/Bogar/scratch/food_summary.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total: {len(products)}\n")
    for i, p in enumerate(products, 1):
        out.write(f"{i}. ID: {p['id']} | Name: {p['name']} | Price: Rs.{p['price']} | Public: {p.get('is_public')}\n")
        out.write(f"   Image: {p.get('image')}\n")
        out.write(f"   Desc: {(p.get('description') or '')[:100]}\n")
print("Done writing food_summary.txt")
