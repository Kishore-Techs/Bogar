import urllib.request
import json

with open('k:/Bogar/scratch/pooja_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    img = p['image']
    try:
        # Urlencode space if needed
        req = urllib.request.Request(img, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            print(f"OK ({resp.status}): {p['name']} -> {img}")
    except Exception as e:
        print(f"FAILED: {p['name']} -> {img}: {e}")
