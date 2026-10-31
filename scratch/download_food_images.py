import urllib.request
import json
import os

with open('k:/Bogar/scratch/food_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

os.makedirs('k:/Bogar/public/assets/images/food', exist_ok=True)

success_count = 0
for p in products:
    img_url = p.get('image')
    if not img_url:
        continue
    ext = os.path.splitext(img_url.split('?')[0])[1]
    if not ext or len(ext) > 5:
        ext = '.jpg'
    filename = f"food_{p['id']}{ext}"
    local_path = os.path.join('k:/Bogar/public/assets/images/food', filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
        success_count += 1
        continue
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp, open(local_path, 'wb') as out_f:
            out_f.write(resp.read())
        success_count += 1
    except Exception as e:
        print(f"Error {p['id']}: {e}")

print(f"Total downloaded/verified: {success_count} / {len(products)}")
