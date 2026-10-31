import json, os, urllib.parse
from PIL import Image

with open('scratch/all_page_cards.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

def get_local_path(src):
    parsed = urllib.parse.urlparse(src)
    path = parsed.path
    if path.startswith('/assets/images/'):
        return os.path.join('public', path.lstrip('/'))
    # If from vedanmart
    filename = os.path.basename(path)
    # search in public/assets/images
    for root, dirs, files in os.walk('public/assets/images'):
        for file in files:
            if file.lower() == filename.lower() or urllib.parse.unquote(filename).lower() == file.lower():
                return os.path.join(root, file)
    return None

def check_edge_banding(img_path):
    if not img_path or not os.path.exists(img_path):
        return None
    try:
        im = Image.open(img_path).convert('RGB')
        w, h = im.size
        # Sample left column and right column
        left = [im.getpixel((0, y)) for y in range(0, h, max(1, h // 20))]
        right = [im.getpixel((w - 1, y)) for y in range(0, h, max(1, h // 20))]
        
        def var(pxs):
            ar = sum(p[0] for p in pxs) / len(pxs)
            ag = sum(p[1] for p in pxs) / len(pxs)
            ab = sum(p[2] for p in pxs) / len(pxs)
            return sum((p[0]-ar)**2 + (p[1]-ag)**2 + (p[2]-ab)**2 for p in pxs) / len(pxs)
            
        vl = var(left)
        vr = var(right)
        aspect = w / h
        return {
            'size': (w, h),
            'aspect': aspect,
            'var_left': vl,
            'var_right': vr,
            'max_var': max(vl, vr)
        }
    except Exception as e:
        return None

report = {}
for page, cards in pages.items():
    page_report = []
    for c in cards:
        name = c['name']
        src = c['src']
        lp = get_local_path(src)
        data = check_edge_banding(lp)
        if data:
            # An image is affected if max_var > 100 and aspect < 1.45 (so it had side stretching)
            is_affected = data['max_var'] > 100 and data['aspect'] < 1.45
            page_report.append({
                'name': name,
                'src': src,
                'local_path': lp,
                'aspect': data['aspect'],
                'max_var': data['max_var'],
                'is_affected': is_affected
            })
    report[page] = page_report

with open('scratch/affected_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

print("Saved scratch/affected_report.json")
