import urllib.request
import re
import json

req = urllib.request.Request('https://dharaniherbbals.in/assets/index-CnwmL35n.js', headers={'User-Agent': 'Mozilla/5.0'})
js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
print('JS length:', len(js))

urls = set(re.findall(r'https?://[^\s"\'<>]+', js))
for u in sorted(urls):
    if any(k in u.lower() for k in ['api', 'vedan', 'dharani', 'product', 'backend', 'item', 'catalog']):
        print('URL:', u)

# Also check for relative API endpoints like /api/
endpoints = set(re.findall(r'["\'](/api/[^"\']+)["\']', js))
for ep in sorted(endpoints):
    print('Endpoint:', ep)
