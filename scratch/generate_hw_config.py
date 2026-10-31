import json
import os

prods = json.load(open('k:/Bogar/scratch/hw_products.json', encoding='utf-8'))
img_dir = 'k:/Bogar/public/assets/images/health-wellness'

clean_prods = []
for p in prods:
    pid = p['id']
    # find local file
    local_img = None
    for ext in ['.jpg', '.jpeg', '.png', '.webp', '.jfif']:
        fn = f"hw_{pid}{ext}"
        if os.path.exists(os.path.join(img_dir, fn)):
            local_img = f"/assets/images/health-wellness/{fn}"
            break
    if not local_img:
        local_img = p.get('image')

    desc = p.get('description') or ''
    desc = desc.replace('_x000D_\n', ' ').replace('_x000D_', ' ').replace('\r\n', ' ').replace('\n', ' ').strip()
    if not desc:
        desc = f"Authentic traditional {p['name']} prepared with pure natural herbs."

    clean_prods.append({
        "id": pid,
        "dharaniId": pid,
        "name": p['name'].strip(),
        "tamilName": p.get('tamil_name') or '',
        "category": "Health & Wellness",
        "price": f"{float(p.get('price', 0)):.2f}",
        "shortDescription": desc,
        "description": desc,
        "image": p.get('image', ''),
        "fallbackImage": local_img,
        "stock": p.get('stock', 500),
        "productType": p.get('product_type') or 'herbal'
    })

js_content = f"""/**
 * Official Dharani Herbbals Health & Wellness Products Data & Live Sync
 * Source: https://dharaniherbbals.in/shop?category=Health%20%26%20Wellness
 * API: https://api.codingboss.in/herbal/products/
 * Total Initial Products: {len(clean_prods)}
 */

export const DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL = {json.dumps(clean_prods, indent=2, ensure_ascii=False)};

/**
 * Dynamically fetches live Health & Wellness products from official Dharani Herbbals API.
 * Reflects live price changes, new products, descriptions, and images.
 */
export async function fetchLiveDharaniHealthWellnessProducts() {{
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
      return DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL;
    }}

    const liveHW = allProducts.filter((p) => {{
      const cat = (p.category_name || '').toLowerCase();
      return cat === 'health & wellness' || cat === 'health and wellness' || cat.includes('health');
    }});

    if (liveHW.length === 0) {{
      return DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL;
    }}

    // Map all live products from Dharani dynamically
    return liveHW.map((live) => {{
      const initial = DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL.find((i) => i.dharaniId === live.id);
      const desc = live.description
        ? live.description.replace(/_x000D_\\n/g, ' ').replace(/_x000D_/g, ' ').replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').trim()
        : (initial ? initial.shortDescription : `Authentic ${{live.name}} prepared with pure natural herbs.`);

      return {{
        id: live.id,
        dharaniId: live.id,
        name: live.name.trim(),
        tamilName: live.tamil_name || (initial ? initial.tamilName : ''),
        category: 'Health & Wellness',
        price: live.price ? parseFloat(live.price).toFixed(2) : (initial ? initial.price : '0.00'),
        image: live.image || (initial ? initial.image : ''),
        fallbackImage: initial ? initial.fallbackImage : (live.image || ''),
        shortDescription: desc,
        description: desc,
        stock: live.stock !== undefined ? live.stock : 500,
        productType: live.product_type || 'herbal'
      }};
    }});
  }} catch (err) {{
    console.warn('Live Dharani Health & Wellness fetch note:', err.message);
    return DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL;
  }}
}}
"""

with open('k:/Bogar/src/config/dharaniHealthWellnessProducts.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated src/config/dharaniHealthWellnessProducts.js with {len(clean_prods)} products.")
