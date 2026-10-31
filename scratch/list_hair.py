import json

prods = json.load(open('k:/Bogar/scratch/hair_products.json', encoding='utf-8'))
print(f"Total Hair Products: {len(prods)}")
for i, p in enumerate(prods):
    print(f"{i+1}. [ID:{p['id']}] {p['name']} | Rs {p.get('price')} | Image: {p.get('image')}")
