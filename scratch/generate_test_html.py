import os
import urllib.request
from PIL import Image

# Let's create an HTML file to test Option A (object-fit: cover) and Option B (ambient cover) and Option C (contain)
# for 6 key products:
# 1. 108 Homa Dravyangal (wide image)
# 2. Herbal Dhoopa Powder (tall image)
# 3. 27 Types of Homa Offerings (user screenshot card 1)
# 4. Thirumanjal Powder (user screenshot card 2)
# 5. Lemon Pickle (original problem image)
# 6. Pulithokku

html = """
<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #f5f2eb; font-family: sans-serif; padding: 20px; }
  h2 { margin-top: 30px; }
  .grid { display: grid; grid-template-columns: repeat(3, 300px); gap: 20px; margin-bottom: 20px; }
  .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .media { width: 300px; height: 220px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff; }
  .info { padding: 15px; }
  .title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
  
  /* Option A: Pure object-fit: cover */
  .img-cover { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
  
  /* Option B: Ambient soft fill + sharp contain */
  .media-ambient { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .bg-ambient { position: absolute; inset: -15%; width: 130%; height: 130%; object-fit: cover; filter: blur(20px); opacity: 0.55; transform: scale(1.1); }
  .img-contain { position: relative; z-index: 2; width: 100%; height: 100%; object-fit: contain; display: block; }
</style>
</head>
<body>
  <h1>Comparison Test: Option A (Cover) vs Option B (Ambient Full Cover)</h1>

  <h2>Option A: Standard object-fit: cover (all containers 220px)</h2>
  <div class="grid">
    <div class="card">
      <div class="media">
        <img class="img-cover" src="https://vedanmart.com/images/Poojas%20Gallery/108%20Homa%20Draviyangal.jpeg">
      </div>
      <div class="info"><div class="title">108 Homa Dravyangal (Wide)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <img class="img-cover" src="https://vedanmart.com/images/Poojas/Herbal%20Incense%20Powder%20(PO).jpg">
      </div>
      <div class="info"><div class="title">Herbal Dhoopa Powder (Tall)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <img class="img-cover" src="https://vedanmart.com/images/Poojas/27%20Types%20of%20Homa%20Offerings.jpg">
      </div>
      <div class="info"><div class="title">27 Types Homa (Row 2 Card 1)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <img class="img-cover" src="https://vedanmart.com/images/Poojas/THIRUMANJANA%20POWDER%20(PO).jpg">
      </div>
      <div class="info"><div class="title">Thirumanjal Powder (Row 2 Card 2)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <img class="img-cover" src="/assets/images/food/food_1056.jpg">
      </div>
      <div class="info"><div class="title">Lemon Pickle</div></div>
    </div>
    <div class="card">
      <div class="media">
        <img class="img-cover" src="/assets/images/food/food_1044.jpg">
      </div>
      <div class="info"><div class="title">Pulithokku</div></div>
    </div>
  </div>

  <h2>Option B: Ambient Full Cover (Full Product Sharp + Ambient Background Fill)</h2>
  <div class="grid">
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="https://vedanmart.com/images/Poojas%20Gallery/108%20Homa%20Draviyangal.jpeg">
          <img class="img-contain" src="https://vedanmart.com/images/Poojas%20Gallery/108%20Homa%20Draviyangal.jpeg">
        </div>
      </div>
      <div class="info"><div class="title">108 Homa Dravyangal (Wide)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="https://vedanmart.com/images/Poojas/Herbal%20Incense%20Powder%20(PO).jpg">
          <img class="img-contain" src="https://vedanmart.com/images/Poojas/Herbal%20Incense%20Powder%20(PO).jpg">
        </div>
      </div>
      <div class="info"><div class="title">Herbal Dhoopa Powder (Tall)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="https://vedanmart.com/images/Poojas/27%20Types%20of%20Homa%20Offerings.jpg">
          <img class="img-contain" src="https://vedanmart.com/images/Poojas/27%20Types%20of%20Homa%20Offerings.jpg">
        </div>
      </div>
      <div class="info"><div class="title">27 Types Homa (Row 2 Card 1)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="https://vedanmart.com/images/Poojas/THIRUMANJANA%20POWDER%20(PO).jpg">
          <img class="img-contain" src="https://vedanmart.com/images/Poojas/THIRUMANJANA%20POWDER%20(PO).jpg">
        </div>
      </div>
      <div class="info"><div class="title">Thirumanjal Powder (Row 2 Card 2)</div></div>
    </div>
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="/assets/images/food/food_1056.jpg">
          <img class="img-contain" src="/assets/images/food/food_1056.jpg">
        </div>
      </div>
      <div class="info"><div class="title">Lemon Pickle</div></div>
    </div>
    <div class="card">
      <div class="media">
        <div class="media-ambient">
          <img class="bg-ambient" src="/assets/images/food/food_1044.jpg">
          <img class="img-contain" src="/assets/images/food/food_1044.jpg">
        </div>
      </div>
      <div class="info"><div class="title">Pulithokku</div></div>
    </div>
  </div>
</body>
</html>
"""

with open('public/test_cover_compare.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Written public/test_cover_compare.html")
