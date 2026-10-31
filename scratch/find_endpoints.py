import urllib.request
import re

req = urllib.request.Request('https://dharaniherbbals.in/assets/index-CnwmL35n.js', headers={'User-Agent': 'Mozilla/5.0'})
js = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

matches = set(re.findall(r'\$\{[FMr]\}[^`"\']+', js))
for m in sorted(matches):
    print(m)
