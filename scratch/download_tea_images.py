import urllib.request
import json
import os

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    all_products = json.loads(resp.read().decode('utf-8'))

target_ids = [1027, 1025, 1023, 1022, 1021, 1020, 1019, 1017, 1016, 1015, 1014, 1013, 1012]
tea_products = []

for tid in target_ids:
    p = next((x for x in all_products if x['id'] == tid), None)
    if p:
        tea_products.append(p)

with open('k:/Bogar/scratch/tea_products_full.json', 'w', encoding='utf-8') as f:
    json.dump(tea_products, f, indent=2, ensure_ascii=False)

os.makedirs('k:/Bogar/public/assets/images/tea', exist_ok=True)

for p in tea_products:
    img_url = p['image']
    ext = os.path.splitext(img_url.split('?')[0])[1]
    if not ext or len(ext) > 5:
        ext = '.jpg'
    filename = f"tea_{p['id']}{ext}"
    local_path = os.path.join('k:/Bogar/public/assets/images/tea', filename)
    try:
        req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_img) as r_img, open(local_path, 'wb') as out_f:
            out_f.write(r_img.read())
        print(f"Downloaded {p['name']} -> {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Error downloading {p['name']}: {e}")
