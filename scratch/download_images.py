import urllib.request
import os
import json

os.makedirs('k:/Bogar/public/assets/images/poojas', exist_ok=True)

with open('k:/Bogar/scratch/pooja_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    url = p['image']
    ext = os.path.splitext(url.split('?')[0])[1]
    if not ext or len(ext) > 5:
        ext = '.jpg'
    filename = f"pooja_{p['id']}{ext}"
    local_path = os.path.join('k:/Bogar/public/assets/images/poojas', filename)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out:
            out.write(resp.read())
        print(f"Downloaded {p['name']} -> {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Error downloading {p['name']}: {e}")
