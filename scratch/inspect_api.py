import urllib.request
import re

req = urllib.request.Request('https://dharaniherbbals.in/assets/index-CnwmL35n.js', headers={'User-Agent': 'Mozilla/5.0'})
js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

idx = js.find('api.codingboss.in')
while idx != -1:
    start = max(0, idx - 200)
    end = min(len(js), idx + 400)
    print("MATCH:\n", js[start:end])
    print("-" * 50)
    idx = js.find('api.codingboss.in', idx + 1)
