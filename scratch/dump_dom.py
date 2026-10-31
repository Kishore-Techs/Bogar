import subprocess, re
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
cmd = [EDGE, '--headless', '--disable-gpu', '--virtual-time-budget=3000', '--dump-dom', 'http://localhost:5173/#poojas']
p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
m = re.search(r'id="pooja-product-1294".*?class="bogar-product-card__media"[^>]*>', p.stdout, re.DOTALL)
if m:
    print("Found Card 1 media element:")
    print(m.group(0))
else:
    print("Not found")

m2 = re.search(r'id="pooja-product-1265".*?class="bogar-product-card__media"[^>]*>', p.stdout, re.DOTALL)
if m2:
    print("Found Card 2 media element:")
    print(m2.group(0))

m3 = re.search(r'id="pooja-product-1264".*?class="bogar-product-card__media"[^>]*>', p.stdout, re.DOTALL)
if m3:
    print("Found Card 3 media element:")
    print(m3.group(0))
