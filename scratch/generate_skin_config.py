import json
import os

prods = json.load(open('k:/Bogar/scratch/skin_products.json', encoding='utf-8'))
img_dir = 'k:/Bogar/public/assets/images/skin'

clean_prods = []
for p in prods:
    pid = p['id']
    local_img = None
    for ext in ['.jpg', '.jpeg', '.png', '.webp', '.jfif']:
        fn = f"skin_{pid}{ext}"
        if os.path.exists(os.path.join(img_dir, fn)):
            local_img = f"/assets/images/skin/{fn}"
            break
    if not local_img:
        local_img = p.get('image', '')

    raw_desc = (p.get('description') or '').strip()
    clean_desc = " ".join(raw_desc.replace('_x000D_', '').replace('\n', ' ').split())
    if not clean_desc:
        clean_desc = f"Authentic traditional {p['name']} prepared with pure herbal ingredients."

    short_desc = clean_desc
    if len(short_desc) > 130:
        short_desc = short_desc[:127].rsplit(' ', 1)[0] + '...'

    clean_prods.append({
        "id": pid,
        "dharaniId": pid,
        "name": p['name'].strip(),
        "tamilName": p.get('tamil_name') or '',
        "category": "Skin",
        "price": f"{float(p.get('price', 0)):.2f}",
        "shortDescription": short_desc,
        "description": clean_desc,
        "image": p.get('image', ''),
        "fallbackImage": local_img,
        "stock": p.get('stock', 500),
        "productType": p.get('product_type') or 'skin'
    })

js_content = f"""/**
 * Official Dharani Herbbals Skin Products Data & Live Sync
 * Source: https://dharaniherbbals.in/shop?category=Skin
 * API: https://api.codingboss.in/herbal/products/
 * Total Initial Products: {len(clean_prods)}
 */

export const DHARANI_SKIN_PRODUCTS_INITIAL = {json.dumps(clean_prods, indent=2, ensure_ascii=False)};

/**
 * Dynamically fetches live Skin products from official Dharani Herbbals API.
 * Reflects live price changes, new products, descriptions, and images.
 */
export async function fetchLiveDharaniSkinProducts() {{
  try {{
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const response = await fetch('https://api.codingboss.in/herbal/products/', {{
      signal: controller.signal,
      headers: {{
        'Accept': 'application/json'
      }}
    }});
    clearTimeout(timeoutId);

    if (!response.ok) {{
      throw new Error(`API returned HTTP ${{response.status}}`);
    }}

    const allProducts = await response.json();
    if (!Array.isArray(allProducts) || allProducts.length === 0) {{
      return DHARANI_SKIN_PRODUCTS_INITIAL;
    }}

    const liveSkin = allProducts.filter((p) => {{
      const cat = (p.category_name || '').toLowerCase();
      return cat === 'skin';
    }});

    if (liveSkin.length === 0) {{
      return DHARANI_SKIN_PRODUCTS_INITIAL;
    }}

    // Map all live products from Dharani dynamically
    return liveSkin.map((live) => {{
      const initial = DHARANI_SKIN_PRODUCTS_INITIAL.find((i) => i.dharaniId === live.id);
      const rawDesc = (live.description || '').replace(/_x000D_\\n/g, ' ').replace(/_x000D_/g, ' ').replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').trim();
      let shortDesc = rawDesc || (initial ? initial.shortDescription : `Authentic ${{live.name}} prepared with pure herbal ingredients.`);
      if (shortDesc.length > 130) {{
        shortDesc = shortDesc.slice(0, 127).trim() + '...';
      }}

      return {{
        id: live.id,
        dharaniId: live.id,
        name: live.name.trim(),
        tamilName: live.tamil_name || (initial ? initial.tamilName : ''),
        category: 'Skin',
        price: live.price ? parseFloat(live.price).toFixed(2) : (initial ? initial.price : '0.00'),
        image: live.image || (initial ? initial.image : ''),
        fallbackImage: initial ? initial.fallbackImage : (live.image || ''),
        shortDescription: shortDesc,
        description: rawDesc || shortDesc,
        stock: live.stock !== undefined ? live.stock : 500,
        productType: live.product_type || 'skin'
      }};
    }});
  }} catch (err) {{
    console.warn('Live Dharani Skin fetch note:', err.message);
    return DHARANI_SKIN_PRODUCTS_INITIAL;
  }}
}}
"""

with open('k:/Bogar/src/config/dharaniSkinProducts.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated src/config/dharaniSkinProducts.js with {len(clean_prods)} products.")
