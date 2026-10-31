import re

with open('src/config/dharaniPoojaProducts.js', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'name:\s*["\']([^"\']+)["\'].*?image:\s*["\']([^"\']+)["\']', text, re.S):
    name, img = m.groups()
    if any(k in name for k in ['Homa', 'Thirumanjal', 'Thalampoo', 'Dhoopa']):
        print(f'{name} -> {img}')
