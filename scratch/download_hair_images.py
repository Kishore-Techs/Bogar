import json
import urllib.request
import os
import urllib.parse

prods = json.load(open('k:/Bogar/scratch/hair_products.json', encoding='utf-8'))
out_dir = 'k:/Bogar/public/assets/images/hair'
os.makedirs(out_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

results = {}
for p in prods:
    pid = p['id']
    raw_url = p.get('image', '')
    if not raw_url:
        print(f"Skipping {pid}, no image url")
        continue

    # Clean and encode URL
    url_parts = urllib.parse.urlsplit(raw_url)
    clean_path = urllib.parse.quote(url_parts.path)
    clean_url = urllib.parse.urlunsplit((url_parts.scheme, url_parts.netloc, clean_path, url_parts.query, url_parts.fragment))

    ext = os.path.splitext(url_parts.path)[1].lower() or '.jpg'
    local_filename = f"hair_{pid}{ext}"
    local_path = os.path.join(out_dir, local_filename)

    try:
        req = urllib.request.Request(clean_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(local_path, 'wb') as f:
                f.write(resp.read())
        print(f"Downloaded: {local_filename} ({os.path.getsize(local_path)} bytes)")
        results[pid] = f"/assets/images/hair/{local_filename}"
    except Exception as e:
        print(f"Failed {pid} ({clean_url}): {e}")
        # Try raw
        try:
            req = urllib.request.Request(raw_url.replace(' ', '%20'), headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                with open(local_path, 'wb') as f:
                    f.write(resp.read())
            print(f"Downloaded (alt): {local_filename} ({os.path.getsize(local_path)} bytes)")
            results[pid] = f"/assets/images/hair/{local_filename}"
        except Exception as e2:
            print(f"Failed alt {pid}: {e2}")

print(f"Total downloaded: {len(results)} / {len(prods)}")
