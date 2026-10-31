import json, os, urllib.parse
from PIL import Image

# 1. Load all categories from scratch/all_category_products.json
with open('scratch/all_category_products.json', 'r', encoding='utf-8') as f:
    categories = json.load(f)

# Also load bogarConfig for tea-food cards on home
# Let's check bogarConfig.js categories
with open('src/config/bogarConfig.js', 'r', encoding='utf-8') as f:
    bogar_text = f.read()

# Products from bogarConfig
bogar_cards = [
    {"id": "daily-pooja", "image": "/assets/images/card-poojas.jpg"},
    {"id": "special-bogar-pooja", "image": "/assets/images/special-pooja.jpg"},
    {"id": "festival-sacred-pooja", "image": "/assets/images/about-heritage.jpg"},
    {"id": "bogar-tea-powder", "image": "/assets/images/tea-powder.jpg"},
    {"id": "traditional-tea", "image": "/assets/images/traditional-tea.jpg"},
    {"id": "herbal-tea", "image": "/assets/images/herbal-tea.jpg"},
    {"id": "sacred-offerings", "image": "/assets/images/sacred-offerings.jpg"},
    {"id": "traditional-heritage-food", "image": "/assets/images/traditional-food.jpg"},
    {"id": "sacred-forest-honey", "image": "/assets/images/sacred-honey.jpg"},
]

categories['bogar_home'] = bogar_cards

def find_local(p):
    fb = p.get('fallbackImage')
    if fb and fb.startswith('/assets/images/'):
        loc = os.path.join('public', fb.lstrip('/'))
        if os.path.exists(loc): return loc
    img = p.get('image', '')
    if img.startswith('/assets/images/'):
        loc = os.path.join('public', img.lstrip('/'))
        if os.path.exists(loc): return loc
    # Search by filename
    if img:
        fn = os.path.basename(urllib.parse.urlparse(img).path)
        for root, dirs, files in os.walk('public/assets/images'):
            for f in files:
                if f.lower() == fn.lower() or urllib.parse.unquote(fn).lower() == f.lower():
                    return os.path.join(root, f)
    # Search by id
    pid = str(p.get('id', ''))
    if pid:
        for root, dirs, files in os.walk('public/assets/images'):
            for f in files:
                if pid in f: return os.path.join(root, f)
    return None

def analyze(loc):
    if not loc or not os.path.exists(loc): return None
    try:
        im = Image.open(loc).convert('RGB')
        w, h = im.size
        left = [im.getpixel((0, y)) for y in range(0, h)]
        right = [im.getpixel((w-1, y)) for y in range(0, h)]
        def v(pxs):
            ar = sum(p[0] for p in pxs)/len(pxs)
            ag = sum(p[1] for p in pxs)/len(pxs)
            ab = sum(p[2] for p in pxs)/len(pxs)
            return sum((p[0]-ar)**2 + (p[1]-ag)**2 + (p[2]-ab)**2 for p in pxs)/len(pxs)
        vl, vr = v(left), v(right)
        aspect = w / h
        # Is white
        is_white = sum(1 for p in left+right if p[0]>240 and p[1]>240 and p[2]>240) / len(left+right) > 0.85
        return {
            'w': w, 'h': h, 'aspect': round(aspect, 3),
            'vl': round(vl, 1), 'vr': round(vr, 1),
            'max_v': round(max(vl, vr), 1),
            'is_white': is_white
        }
    except Exception as e:
        return None

affected_identifiers = set()
affected_details = []

# Exclude categories known to be clean like chains, and specific clean products like Sundakkai Thokku
CLEAN_PRODUCT_IDS = {'1133', 'sundakkai-thokku'}

for cat_name, prods in categories.items():
    if cat_name == 'chains':
        continue
    for p in prods:
        pid = str(p.get('id', '')).lower()
        if pid in CLEAN_PRODUCT_IDS:
            continue
        loc = find_local(p)
        an = analyze(loc)
        if an:
            # An image is affected if:
            # 1. aspect < 1.55 (narrower than 380x220 container, so horizontal stretching occurred)
            # 2. Not white background
            # 3. max_v > 180 (photographic / non-uniform background with variance like Lemon Pickle or Herbal Dhoopa Powder)
            if an['aspect'] < 1.55 and not an['is_white'] and an['max_v'] > 180:
                affected_details.append({
                    'category': cat_name,
                    'id': p.get('id'),
                    'name': p.get('name'),
                    'aspect': an['aspect'],
                    'max_v': an['max_v'],
                    'file': loc
                })
                # Add all possible identifier strings
                if p.get('id'):
                    affected_identifiers.add(str(p['id']).lower())
                if p.get('image'):
                    affected_identifiers.add(p['image'].lower())
                    affected_identifiers.add(os.path.basename(p['image']).lower())
                    affected_identifiers.add(urllib.parse.unquote(os.path.basename(p['image'])).lower())
                if p.get('fallbackImage'):
                    affected_identifiers.add(p['fallbackImage'].lower())
                    affected_identifiers.add(os.path.basename(p['fallbackImage']).lower())
                if loc:
                    norm = loc.replace('\\', '/').lower()
                    affected_identifiers.add(norm)
                    affected_identifiers.add(os.path.basename(loc).lower())
                    if norm.startswith('public/'):
                        affected_identifiers.add(norm[6:])

# Explicitly ensure Lemon Pickle and Thuni and Tea cards and Herbal Dhoopa Powder are in:
affected_identifiers.add('1132')
affected_identifiers.add('lemonpickel.jpg')
affected_identifiers.add('food_1132.jpg')
affected_identifiers.add('/assets/images/food/food_1132.jpg')
affected_identifiers.add('1264')
affected_identifiers.add('pooja_1264.jpg')
affected_identifiers.add('/assets/images/poojas/pooja_1264.jpg')
affected_identifiers.add('herbal incense powder (po).jpg')

print(f"Total affected products identified: {len(affected_details)}")
print(f"Total identifier keys: {len(affected_identifiers)}")

# Generate src/config/affectedImages.js
js_content = f"""// Auto-generated configuration for product images with non-uniform backgrounds
// that experience horizontal/vertical edge stretching when forced into fixed aspect ratios.
// These images are rendered at their natural aspect ratio to preserve their authentic original backgrounds.

export const AFFECTED_IMAGE_KEYS = new Set({json.dumps(sorted(list(affected_identifiers)), indent=2)});

/**
 * Checks if a given image or product should be rendered naturally to prevent background distortion.
 * Only returns true for images that have non-uniform photographic backgrounds (like Lemon Pickle).
 * Clean/white background images return false and remain in standard 220px fixed containers.
 */
export function isProductImageAffected(src, fallbackSrc, productId) {{
  if (productId && AFFECTED_IMAGE_KEYS.has(String(productId).toLowerCase())) {{
    return true;
  }}
  
  const checkString = (str) => {{
    if (!str) return false;
    const lower = str.toLowerCase();
    if (AFFECTED_IMAGE_KEYS.has(lower)) return true;
    
    // Check basename
    const clean = lower.split('?')[0];
    const filename = clean.split('/').pop();
    if (filename && AFFECTED_IMAGE_KEYS.has(filename)) return true;
    
    try {{
      const decoded = decodeURIComponent(filename);
      if (decoded && AFFECTED_IMAGE_KEYS.has(decoded)) return true;
    }} catch (e) {{}}
    
    return false;
  }};

  if (checkString(src)) return true;
  if (checkString(fallbackSrc)) return true;
  
  return false;
}}
"""

with open('src/config/affectedImages.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Generated src/config/affectedImages.js successfully!")
