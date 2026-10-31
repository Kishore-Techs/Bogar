import urllib.request
import json

req = urllib.request.Request('https://api.codingboss.in/herbal/products/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    all_products = json.loads(resp.read().decode('utf-8'))

beverages = [p for p in all_products if p.get('category_name') == 'Beverages' or 'tea' in (p.get('name') or '').lower() or 'coffee' in (p.get('name') or '').lower() or 'sherbet' in (p.get('name') or '').lower() or 'sukku' in (p.get('name') or '').lower()]

print(f"Total matching beverages/tea: {len(beverages)}")
for p in beverages:
    print(f"ID: {p['id']} | Name: {p['name']} | Price: {p['price']} | Cat: {p.get('category_name')}")
    print(f"  Image: {p.get('image')}")
    print(f"  Desc: {(p.get('description') or '')[:100]}...")
