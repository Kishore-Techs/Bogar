import os, json, urllib.parse, re
from PIL import Image

bg_map = {}

def get_bg(path):
    try:
        im = Image.open(path)
        if im.mode == 'RGBA':
            w, h = im.size
            corners = [im.getpixel((0,0)), im.getpixel((w-1,0)), im.getpixel((0,h-1)), im.getpixel((w-1,h-1))]
            if any(c[3] < 20 for c in corners):
                return '#FFFFFF'
        im = im.convert('RGB')
        w, h = im.size
        corners = [
            im.getpixel((0, 0)),
            im.getpixel((w - 1, 0)),
            im.getpixel((0, h - 1)),
            im.getpixel((w - 1, h - 1))
        ]
        # White check: all corners light
        is_white = all(min(c) >= 195 for c in corners)
        if is_white:
            return '#FFFFFF'
        avg_r = sum(c[0] for c in corners) // 4
        avg_g = sum(c[1] for c in corners) // 4
        avg_b = sum(c[2] for c in corners) // 4
        return f'rgb({avg_r}, {avg_g}, {avg_b})'
    except Exception as e:
        return '#FFFFFF'

# 1. Process all local images in public/assets/images
for root, dirs, files in os.walk('public/assets/images'):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, 'public').replace('\\', '/')
            bg = get_bg(full_path)
            bg_map[rel_path] = bg
            bg_map['/' + rel_path] = bg
            bg_map[rel_path.replace('/', '\\')] = bg
            bg_map['/' + rel_path.replace('/', '\\')] = bg
            bg_map[f] = bg

# 2. Extract images from config files to map remote URLs
config_files = [
    'src/config/dharaniPoojaProducts.js',
    'src/config/dharaniTeaProducts.js',
    'src/config/dharaniHairProducts.js',
    'src/config/dharaniSkinProducts.js',
    'src/config/dharaniFoodProducts.js',
    'src/config/dharaniHealthWellnessProducts.js',
    'src/config/bogarConfig.js'
]

for cfg in config_files:
    if not os.path.exists(cfg):
        continue
    with open(cfg, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    # find all image and fallbackImage pairs or image occurrences
    # patterns: image: "...", fallbackImage: "..."
    items = re.findall(r'image:\s*["\']([^"\']+)["\'].*?fallbackImage:\s*["\']([^"\']+)["\']', content, re.DOTALL)
    for img_url, fb_url in items:
        # get bg from fallback
        bg = bg_map.get(fb_url) or bg_map.get(os.path.basename(fb_url)) or '#FFFFFF'
        bg_map[img_url] = bg
        try:
            decoded = urllib.parse.unquote(img_url)
            bg_map[decoded] = bg
        except:
            pass
        img_name = img_url.split('/')[-1]
        bg_map[img_name] = bg
        try:
            decoded_name = urllib.parse.unquote(img_name)
            bg_map[decoded_name] = bg
        except:
            pass

# Write out src/config/productBgMap.js
with open('src/config/productBgMap.js', 'w', encoding='utf-8') as out:
    out.write('// Auto-generated product image background colors\n')
    out.write('export const PRODUCT_BG_MAP = {\n')
    for k in sorted(bg_map.keys()):
        safe_k = json.dumps(k)
        safe_v = json.dumps(bg_map[k])
        out.write(f'  {safe_k}: {safe_v},\n')
    out.write('};\n')

print(f'Successfully wrote {len(bg_map)} mappings to src/config/productBgMap.js')
