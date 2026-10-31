import json
import os

with open('k:/Bogar/scratch/food_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Sort or preserve natural order
output_items = []
for p in products:
    pid = p['id']
    name = p['name'].strip()
    price = f"{float(p['price']):.2f}"
    img_url = p.get('image') or ''
    ext = os.path.splitext(img_url.split('?')[0])[1]
    if not ext or len(ext) > 5:
        ext = '.jpg'
    fallback = f"/assets/images/food/food_{pid}{ext}"
    
    raw_desc = (p.get('description') or '').strip()
    # clean up any carriage returns or weird formatting
    clean_desc = " ".join(raw_desc.replace('_x000D_', '').replace('\n', ' ').split())
    if not clean_desc:
        clean_desc = f"Authentic traditional {name} prepared with pure ingredients."
    
    # Short description
    short_desc = clean_desc
    if len(short_desc) > 130:
        short_desc = short_desc[:127].rsplit(' ', 1)[0] + '...'

    output_items.append({
        'id': pid,
        'dharaniId': pid,
        'name': name,
        'category': 'Food',
        'price': price,
        'image': img_url,
        'fallbackImage': fallback,
        'shortDescription': short_desc,
        'description': clean_desc
    })

js_content = f"""// Official Dharani Herbbals Food Products Data & Live Sync
// Source: https://dharaniherbbals.in/ (API: https://api.codingboss.in/herbal/products/)

export const DHARANI_FOOD_PRODUCTS_INITIAL = {json.dumps(output_items, indent=2, ensure_ascii=False)};

export async function fetchLiveDharaniFoodProducts() {{
  try {{
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
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
      return DHARANI_FOOD_PRODUCTS_INITIAL;
    }}

    const liveFood = allProducts.filter((p) => p.category_name === 'Food');
    if (liveFood.length === 0) {{
      return DHARANI_FOOD_PRODUCTS_INITIAL;
    }}

    return DHARANI_FOOD_PRODUCTS_INITIAL.map((initial) => {{
      const match = liveFood.find((p) => p.id === initial.dharaniId);
      if (match) {{
        return {{
          ...initial,
          price: match.price ? parseFloat(match.price).toFixed(2) : initial.price,
          image: match.image || initial.image,
          stock: match.stock !== undefined ? match.stock : 500,
        }};
      }}
      return initial;
    }});
  }} catch (err) {{
    console.warn('Live Dharani Food fetch note:', err.message);
    return DHARANI_FOOD_PRODUCTS_INITIAL;
  }}
}}
"""

with open('k:/Bogar/src/config/dharaniFoodProducts.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated dharaniFoodProducts.js with {len(output_items)} products.")
