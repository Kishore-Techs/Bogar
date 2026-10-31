import os, json, re
from PIL import Image

def analyze(path):
    if not os.path.exists(path): return None
    try:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        pts = []
        for x in range(0, w, max(1, w // 20)):
            pts.append(im.getpixel((x, 0)))
            pts.append(im.getpixel((x, h - 1)))
        for y in range(0, h, max(1, h // 20)):
            pts.append(im.getpixel((0, y)))
            pts.append(im.getpixel((w - 1, y)))
        
        is_white = all(p[0] >= 240 and p[1] >= 240 and p[2] >= 240 for p in pts)
        
        mr = sum(p[0] for p in pts)/len(pts)
        mg = sum(p[1] for p in pts)/len(pts)
        mb = sum(p[2] for p in pts)/len(pts)
        var = sum((p[0]-mr)**2 + (p[1]-mg)**2 + (p[2]-mb)**2 for p in pts) / len(pts)
        return {'w': w, 'h': h, 'aspect': w/h, 'is_white': is_white, 'var': var}
    except Exception as e:
        return None

def parse_config(filepath):
    if not os.path.exists(filepath): return []
    content = open(filepath, 'r', encoding='utf-8').read()
    products = []
    for b in re.finditer(r'\{([^{}]+)\}', content):
        txt = b.group(1)
        m_id = re.search(r'id:\s*(\d+|"[^"]+")', txt)
        m_name = re.search(r'name:\s*"([^"]+)"', txt)
        m_img = re.search(r'(?:image|fallbackImage):\s*"([^"]+)"', txt)
        if m_id and m_name and m_img:
            products.append({
                'id': m_id.group(1).strip('"'),
                'name': m_name.group(1),
                'img': m_img.group(1)
            })
    return products

configs = [
    ('Food', 'src/config/dharaniFoodProducts.js'),
    ('Pooja', 'src/config/dharaniPoojaProducts.js'),
    ('Tea', 'src/config/dharaniTeaProducts.js'),
    ('Hair', 'src/config/dharaniHairProducts.js'),
    ('Skin', 'src/config/dharaniSkinProducts.js'),
    ('Health', 'src/config/dharaniHealthWellnessProducts.js'),
    ('Bogar', 'src/config/bogarConfig.js')
]

report = {}
for name, cpath in configs:
    prods = parse_config(cpath)
    cat_affected = []
    cat_correct = []
    seen = set()
    for p in prods:
        key = (p['id'], p['img'])
        if key in seen: continue
        seen.add(key)
        local = os.path.join('public', p['img'].lstrip('/'))
        st = analyze(local)
        if not st: continue
        # An image is affected if it is NOT white background and has high border variance or photographic edges
        if not st['is_white'] and st['var'] > 100:
            cat_affected.append({**p, 'aspect': round(st['aspect'], 2), 'var': round(st['var'], 1), 'w': st['w'], 'h': st['h']})
        else:
            cat_correct.append({**p, 'aspect': round(st['aspect'], 2), 'var': round(st['var'], 1)})
    report[name] = {'affected': cat_affected, 'correct_count': len(cat_correct), 'affected_count': len(cat_affected)}

with open('scratch/detailed_product_audit.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

for name, d in report.items():
    print(f'{name}: {d["affected_count"]} affected, {d["correct_count"]} already-correct')
