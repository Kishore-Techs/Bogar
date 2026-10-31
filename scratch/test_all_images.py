import os, re, json
from PIL import Image

configs = [
    ('Poojas', 'src/config/dharaniPoojaProducts.js'),
    ('Tea', 'src/config/dharaniTeaProducts.js'),
    ('BogarConfig (Clothes/Chains)', 'src/config/bogarConfig.js'),
    ('Food', 'src/config/dharaniFoodProducts.js'),
    ('Hair', 'src/config/dharaniHairProducts.js'),
    ('Skin', 'src/config/dharaniSkinProducts.js'),
    ('Health & Wellness', 'src/config/dharaniHealthWellnessProducts.js')
]

for label, path in configs:
    if not os.path.exists(path):
        print(f"Missing {path}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all items: name, image, fallbackImage, shortDescription
    # Regex match blocks
    print(f"=== {label} ({path}) ===")
    matches = re.findall(r'name:\s*["\']([^"\']+)["\'].*?image:\s*["\']([^"\']+)["\'](?:.*?fallbackImage:\s*["\']([^"\']+)["\'])?', content, re.DOTALL)
    print(f"Found {len(matches)} products")
    for name, img, fb in matches[:3]:
        print(f"  Name: {name} | img: {img[:40]} | fb: {fb}")
