import os, re, json
from PIL import Image

def analyze_img(path):
    if not os.path.exists(path):
        return None
    try:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        # Sample left and right edges
        left = [im.getpixel((0, y)) for y in range(0, h, max(1, h // 25))]
        right = [im.getpixel((w - 1, y)) for y in range(0, h, max(1, h // 25))]
        top = [im.getpixel((x, 0)) for x in range(0, w, max(1, w // 25))]
        bottom = [im.getpixel((x, h - 1)) for x in range(0, w, max(1, w // 25))]

        def var(pxs):
            ar = sum(p[0] for p in pxs) / len(pxs)
            ag = sum(p[1] for p in pxs) / len(pxs)
            ab = sum(p[2] for p in pxs) / len(pxs)
            return sum((p[0]-ar)**2 + (p[1]-ag)**2 + (p[2]-ab)**2 for p in pxs) / len(pxs)

        vl = var(left)
        vr = var(right)
        vt = var(top)
        vb = var(bottom)
        
        # Check if white background
        all_border = left + right + top + bottom
        is_white = all(p[0] > 240 and p[1] > 240 and p[2] > 240 for p in all_border)
        
        return {
            'size': (w, h),
            'aspect': w / h,
            'vl': vl,
            'vr': vr,
            'max_v_side': max(vl, vr),
            'is_white': is_white
        }
    except Exception as e:
        return None

# Parse JS files in src/config/dharani*Products.js
config_files = [
    ('Food', 'src/config/dharaniFoodProducts.js'),
    ('Pooja', 'src/config/dharaniPoojaProducts.js'),
    ('Tea', 'src/config/dharaniTeaProducts.js'),
    ('Hair', 'src/config/dharaniHairProducts.js'),
    ('Skin', 'src/config/dharaniSkinProducts.js'),
    ('Health', 'src/config/dharaniHealthProducts.js'),
]

results = {}
for cat, fpath in config_files:
    if not os.path.exists(fpath): continue
    content = open(fpath, 'r', encoding='utf-8').read()
    # match id, name, fallbackImage
    # pattern: "id": (\d+),.*?"name": "([^"]+)",.*?"fallbackImage": "([^"]+)"
    # or js object format
    entries = re.findall(r'id:\s*(\d+|"[^"]+"),?\s*(?:dharaniId:\s*\d+,?\s*)?name:\s*"([^"]+)",(?:.*?fallbackImage:\s*"([^"]+)")?', content, re.DOTALL)
    if not entries:
        # try JSON format
        entries = re.findall(r'"id":\s*(\d+),.*?"name":\s*"([^"]+)".*?"fallbackImage":\s*"([^"]+)"', content, re.DOTALL)
    
    cat_affected = []
    for pid, name, fb in entries:
        if not fb: continue
        local_path = os.path.join('public', fb.lstrip('/'))
        data = analyze_img(local_path)
        if data:
            # If not white and max_v_side > 150 (photographic / textured / object touching edge)
            # and aspect < 1.45 (so it suffered horizontal stretching in 380x220 container)
            if not data['is_white'] and data['max_v_side'] > 150 and data['aspect'] < 1.45:
                cat_affected.append({
                    'id': pid,
                    'name': name,
                    'fallback': fb,
                    'aspect': data['aspect'],
                    'var': data['max_v_side'],
                    'size': data['size']
                })
    results[cat] = cat_affected

print("=== AFFECTED IMAGES WITH LEMON-PICKLE-LIKE ISSUE ===")
total = 0
for cat, items in results.items():
    print(f"\n{cat} ({len(items)} affected):")
    total += len(items)
    for it in items:
        print(f"  [{it['id']}] {it['name']}: aspect={it['aspect']:.2f}, var={it['var']:.0f}, path={it['fallback']}")

print(f"\nTOTAL AFFECTED ACROSS ALL CONFIGS: {total}")
