import os, json, urllib.parse, re
from PIL import Image

def get_image_bg(path):
    try:
        im = Image.open(path)
        w, h = im.size
        if im.mode == 'RGBA':
            corners = [im.getpixel((0,0)), im.getpixel((w-1,0)), im.getpixel((0,h-1)), im.getpixel((w-1,h-1))]
            if any(c[3] < 30 for c in corners):
                return '#FFFFFF'
        im = im.convert('RGB')
        
        # Sample border pixels
        # Sample along top, bottom, left, right
        step_x = max(1, w // 40)
        step_y = max(1, h // 40)
        top = [im.getpixel((x, 0)) for x in range(0, w, step_x)]
        bottom = [im.getpixel((x, h-1)) for x in range(0, w, step_x)]
        left = [im.getpixel((0, y)) for y in range(0, h, step_y)]
        right = [im.getpixel((w-1, y)) for y in range(0, h, step_y)]
        
        # Check pure white
        all_edges = top + bottom + left + right
        if all(min(p) >= 250 for p in all_edges):
            return '#FFFFFF'
        
        # If image aspect ratio is <= 1 (square or portrait):
        # In container of 220px height x 360px width, image height touches 220px,
        # so left and right are exposed!
        if w <= h:
            # Left and right edges are exposed
            exposed = left + right
            avg_r = sum(p[0] for p in exposed) // len(exposed)
            avg_g = sum(p[1] for p in exposed) // len(exposed)
            avg_b = sum(p[2] for p in exposed) // len(exposed)
        else:
            # Landscape: check whether it's wider than container aspect ratio (~1.63)
            # If w/h > 1.63, top and bottom are exposed
            # If w/h < 1.63, left and right are exposed
            container_ratio = 360.0 / 220.0 # ~1.636
            img_ratio = float(w) / float(h)
            if img_ratio > container_ratio:
                exposed = top + bottom
            else:
                exposed = left + right
            avg_r = sum(p[0] for p in exposed) // len(exposed)
            avg_g = sum(p[1] for p in exposed) // len(exposed)
            avg_b = sum(p[2] for p in exposed) // len(exposed)
            
        if min(avg_r, avg_g, avg_b) >= 252:
            return '#FFFFFF'
            
        return f'rgb({avg_r}, {avg_g}, {avg_b})'
    except Exception as e:
        print(f"Error for {path}: {e}")
        return '#FFFFFF'

bg_map = {}

# 1. Process all local images in public/assets/images
for root, dirs, files in os.walk('public/assets/images'):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, 'public').replace('\\', '/')
            bg = get_image_bg(full_path)
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
    
    # Matches both `image: "..."` and `"image": "..."`
    items = re.findall(r'["\']?image["\']?\s*:\s*["\']([^"\']+)["\'].*?["\']?fallbackImage["\']?\s*:\s*["\']([^"\']+)["\']', content, re.DOTALL)
    for img_url, fb_url in items:
        # get bg from fallback
        bg = bg_map.get(fb_url) or bg_map.get('/' + fb_url.lstrip('/')) or bg_map.get(os.path.basename(fb_url)) or '#FFFFFF'
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

print(f"Generated {len(bg_map)} mappings")

with open('src/config/productBgMap.js', 'w', encoding='utf-8') as out:
    out.write('// Auto-generated product image background colors\n')
    out.write('export const PRODUCT_BG_MAP = {\n')
    for k in sorted(bg_map.keys()):
        safe_k = json.dumps(k)
        safe_v = json.dumps(bg_map[k])
        out.write(f'  {safe_k}: {safe_v},\n')
    out.write('};\n')

print("Saved to src/config/productBgMap.js")
