import urllib.request
import re

req = urllib.request.Request('https://dharaniherbbals.in/assets/index-CnwmL35n.js', headers={'User-Agent': 'Mozilla/5.0'})
js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

# Search for currency symbols or price formatting
matches = re.findall(r'(\u20B9|\bRs\.?|\bINR\b)[^;]{0,50}', js)
for m in matches[:10]:
    print('Price display:', m)

# Search for price formatting in product cards
for m in re.finditer(r'price', js):
    start = max(0, m.start() - 50)
    end = min(len(js), m.end() + 80)
    snippet = js[start:end]
    if '₹' in snippet or 'Rs' in snippet:
        print("Snippet:", snippet)
        break
