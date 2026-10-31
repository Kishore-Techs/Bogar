import json, os, urllib.parse
from PIL import Image

with open('scratch/all_category_products.json', 'r', encoding='utf-8') as f:
    categories = json.load(f)

def find_local_image(p):
    # Check fallbackImage first
    fb = p.get('fallbackImage')
    if fb and fb.startswith('/assets/images/'):
        loc = os.path.join('public', fb.lstrip('/'))
        if os.path.exists(loc):
            return loc
    
    # Check image
    img = p.get('image', '')
    if img.startswith('/assets/images/'):
        loc = os.path.join('public', img.lstrip('/'))
        if os.path.exists(loc):
            return loc
            
    # Try searching by filename
    filename = os.path.basename(urllib.parse.urlparse(img).path)
    if filename:
        for root, dirs, files in os.walk('public/assets/images'):
            for f in files:
                if f.lower() == filename.lower() or urllib.parse.unquote(filename).lower() == f.lower():
                    return os.path.join(root, f)
                    
    # Also search by product id in public/assets/images/category/
    cat = p.get('category', '').lower()
    pid = str(p.get('id', ''))
    for root, dirs, files in os.walk('public/assets/images'):
        for f in files:
            if pid in f:
                return os.path.join(root, f)
                
    return None

def analyze_image(path):
    if not path or not os.path.exists(path):
        return None
    try:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        # Sample left, right, top, bottom edges
        left = [im.getpixel((0, y)) for y in range(0, h, max(1, h//20))]
        right = [im.getpixel((w-1, y)) for y in range(0, h, max(1, h//20))]
        top = [im.getpixel((x, 0)) for x in range(0, w, max(1, w//20))]
        bottom = [im.getpixel((x, h-1)) for x in range(0, w, max(1, w//20))]

        def var(pxs):
            ar = sum(p[0] for p in pxs)/len(pxs)
            ag = sum(p[1] for p in pxs)/len(pxs)
            ab = sum(p[2] for p in pxs)/len(pxs)
            return sum((p[0]-ar)**2 + (p[1]-ag)**2 + (p[2]-ab)**2 for p in pxs)/len(pxs)

        def is_white(pxs):
            return sum(1 for p in pxs if p[0]>240 and p[1]>240 and p[2]>240) / len(pxs) > 0.8

        def is_solid(v):
            return v < 40  # low variance = solid color studio background

        vl = var(left)
        vr = var(right)
        vt = var(top)
        vb = var(bottom)
        
        aspect = w / h
        # Container aspect is ~1.73 (380x220)
        # If aspect < 1.6, left and right sides have margins (fx > 0).
        # If left or right edge is NOT white AND NOT solid (vl > 40 or vr > 40),
        # stretching 1px creates horizontal bands/streaks!
        has_horizontal_stretch_issue = (aspect < 1.55) and (not is_white(left) or not is_white(right)) and (vl > 40 or vr > 40)
        
        # If aspect > 1.8, top and bottom have margins (fy > 0).
        # If top or bottom edge is NOT white AND NOT solid, stretching 1px creates vertical bands!
        has_vertical_stretch_issue = (aspect > 1.85) and (not is_white(top) or not is_white(bottom)) and (vt > 40 or vb > 40)

        is_affected = has_horizontal_stretch_issue or has_vertical_stretch_issue

        return {
            'path': path,
            'size': (w, h),
            'aspect': round(aspect, 3),
            'var_lr': round(max(vl, vr), 1),
            'var_tb': round(max(vt, vb), 1),
            'is_white_lr': is_white(left) and is_white(right),
            'is_white_tb': is_white(top) and is_white(bottom),
            'is_affected': is_affected
        }
    except Exception as e:
        return {'path': path, 'error': str(e)}

audit_results = {}
total_affected = 0
total_products = 0

for cat_name, products in categories.items():
    cat_list = []
    for p in products:
        total_products += 1
        loc = find_local_image(p)
        analysis = analyze_image(loc)
        item = {
            'id': p.get('id'),
            'name': p.get('name'),
            'image': p.get('image'),
            'fallbackImage': p.get('fallbackImage'),
            'local_file': loc,
            'analysis': analysis
        }
        if analysis and analysis.get('is_affected'):
            total_affected += 1
        cat_list.append(item)
    audit_results[cat_name] = cat_list

print(f"Total products audited: {total_products}")
print(f"Total affected products with Lemon-Pickle style issue: {total_affected}")

with open('scratch/comprehensive_audit.json', 'w', encoding='utf-8') as f:
    json.dump(audit_results, f, indent=2)

print("\n--- AFFECTED PRODUCTS BY CATEGORY ---")
for cat_name, items in audit_results.items():
    aff = [it for it in items if it['analysis'] and it['analysis'].get('is_affected')]
    if aff:
        print(f"\n[{cat_name.upper()}] ({len(aff)} affected / {len(items)} total):")
        for it in aff:
            an = it['analysis']
            print(f"  - ID: {it['id']} | Name: {it['name']}")
            print(f"    File: {an['path']} | Aspect: {an['aspect']} | EdgeVar: {an['var_lr']}")
