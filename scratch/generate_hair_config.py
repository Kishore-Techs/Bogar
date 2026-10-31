import json
import os

prods = json.load(open('k:/Bogar/scratch/hair_products.json', encoding='utf-8'))
img_dir = 'k:/Bogar/public/assets/images/hair'

clean_prods = []
for p in prods:
    pid = p['id']
    # find local file
    local_img = None
    for ext in ['.jpg', '.jpeg', '.png']:
        fn = f"hair_{pid}{ext}"
        if os.path.exists(os.path.join(img_dir, fn)):
            local_img = f"/assets/images/hair/{fn}"
            break
    if not local_img:
        local_img = p.get('image')

    desc = p.get('description') or ''
    # Clean _x000D_\n
    desc = desc.replace('_x000D_\n', ' ').replace('_x000D_', ' ').replace('\r\n', ' ').replace('\n', ' ').strip()
    if not desc:
        desc = f"Authentic traditional {p['name']} prepared with pure natural ingredients."

    clean_prods.append({
        "id": pid,
        "name": p['name'].strip(),
        "tamilName": p.get('tamil_name') or '',
        "price": f"{float(p.get('price', 0)):.2f}",
        "shortDescription": desc,
        "image": local_img,
        "fallbackImage": p.get('image', ''),
        "category": "Hair",
        "stock": p.get('stock', 0),
        "productType": p.get('product_type') or 'hair'
    })

js_content = f"""/**
 * Authentic Dharani Herbbals Hair Products
 * Extracted directly from official Dharani Herbbals database & screenshots
 * Total: {len(clean_prods)} Hair products
 */

export const DHARANI_HAIR_PRODUCTS_INITIAL = {json.dumps(clean_prods, indent=2, ensure_ascii=False)};

/**
 * Fetches live hair products from official Dharani Herbbals API with graceful fallback
 */
export async function fetchLiveDharaniHairProducts() {{
  try {{
    const response = await fetch('https://api.codingboss.in/herbal/products/', {{
      headers: {{ 'Accept': 'application/json' }}
    }});
    if (!response.ok) {{
      return DHARANI_HAIR_PRODUCTS_INITIAL;
    }}
    const data = await response.json();
    const hairData = data.filter((item) => item.category_name && item.category_name.toLowerCase() === 'hair');
    if (!hairData || hairData.length === 0) {{
      return DHARANI_HAIR_PRODUCTS_INITIAL;
    }}

    return DHARANI_HAIR_PRODUCTS_INITIAL.map((initial) => {{
      const match = hairData.find((live) => live.id === initial.id || live.name === initial.name);
      if (match) {{
        return {{
          ...initial,
          price: match.price ? parseFloat(match.price).toFixed(2) : initial.price,
          shortDescription: match.description ? match.description.replace(/_x000D_\\n/g, ' ').replace(/_x000D_/g, ' ').trim() : initial.shortDescription,
        }};
      }}
      return initial;
    }});
  }} catch (err) {{
    console.warn('Live Dharani Hair products fetch fallback:', err);
    return DHARANI_HAIR_PRODUCTS_INITIAL;
  }}
}}
"""

with open('k:/Bogar/src/config/dharaniHairProducts.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated src/config/dharaniHairProducts.js with {len(clean_prods)} products.")
