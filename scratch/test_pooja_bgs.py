import os
from PIL import Image

pooja_files = [
    'pooja_1294.jpeg',
    'pooja_1265.jpg',
    'pooja_1264.jpg',
    'pooja_1150.jpg',
    'pooja_1148.jpg',
    'pooja_1146.png',
    'pooja_1144.jpg'
]

def get_exact_bg(filename):
    path = os.path.join('public/assets/images/poojas', filename)
    im = Image.open(path)
    if im.mode == 'RGBA':
        w, h = im.size
        corners = [im.getpixel((0,0)), im.getpixel((w-1,0)), im.getpixel((0,h-1)), im.getpixel((w-1,h-1))]
        if any(c[3] < 30 for c in corners):
            return '#FFFFFF'
    im_rgb = im.convert('RGB')
    w, h = im.size
    # Sample all 4 edges:
    edge_pts = []
    # For width and height:
    for x in range(0, w, max(1, w//40)):
        edge_pts.append(im_rgb.getpixel((x, 0)))
        edge_pts.append(im_rgb.getpixel((x, h-1)))
    for y in range(0, h, max(1, h//40)):
        edge_pts.append(im_rgb.getpixel((0, y)))
        edge_pts.append(im_rgb.getpixel((w-1, y)))
    
    # Check if purely white
    if all(min(p) >= 250 for p in edge_pts):
        return '#FFFFFF'
    
    avg_r = sum(p[0] for p in edge_pts) // len(edge_pts)
    avg_g = sum(p[1] for p in edge_pts) // len(edge_pts)
    avg_b = sum(p[2] for p in edge_pts) // len(edge_pts)
    
    if min(avg_r, avg_g, avg_b) >= 248:
        return '#FFFFFF'
    return f'rgb({avg_r}, {avg_g}, {avg_b})'

for f in pooja_files:
    print(f"{f}: {get_exact_bg(f)}")
