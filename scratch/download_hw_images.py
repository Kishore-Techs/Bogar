import json
import urllib.request
import os
import urllib.parse

prods = json.load(open('k:/Bogar/scratch/hw_products.json', encoding='utf-8'))
out_dir = 'k:/Bogar/public/assets/images/health-wellness'
os.makedirs(out_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

success = 0
for p in prods:
    pid = p['id']
    raw_url = p.get('image', '')
    if not raw_url:
        continue

    url_parts = urllib.parse.urlsplit(raw_url)
    ext = os.path.splitext(url_parts.path)[1].lower() or '.jpg'
    local_filename = f"hw_{pid}{ext}"
    local_path = os.path.join(out_dir, local_filename)

    if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
        success += 1
        continue

    clean_url = raw_url.replace(' ', '%20')
    try:
        req = urllib.request.Request(clean_url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            with open(local_path, 'wb') as f:
                f.write(resp.read())
        success += 1
    except Exception as e:
        # Try alternate encoding
        try:
            clean_path = urllib.parse.quote(url_parts.path)
            alt_url = urllib.parse.urlunsplit((url_parts.scheme, url_parts.netloc, clean_path, url_parts.query, url_parts.fragment))
            req = urllib.request.Request(alt_url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                with open(local_path, 'wb') as f:
                    f.write(resp.read())
            success += 1
        except Exception as e2:
            pass

print(f"Downloaded / verified: {success} / {len(prods)}")
