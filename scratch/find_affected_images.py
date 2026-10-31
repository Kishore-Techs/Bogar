import os, glob
from PIL import Image

def analyze_image(path):
    try:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        # Sample left edge and right edge
        left_pixels = [im.getpixel((0, y)) for y in range(0, h, max(1, h // 10))]
        right_pixels = [im.getpixel((w - 1, y)) for y in range(0, h, max(1, h // 10))]
        
        # Check variance of edge pixels
        def variance(pixels):
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)
            var = sum((p[0]-avg_r)**2 + (p[1]-avg_g)**2 + (p[2]-avg_b)**2 for p in pixels) / len(pixels)
            return var
            
        left_var = variance(left_pixels)
        right_var = variance(right_pixels)
        
        # Check if white or uniform
        is_white = all(p[0] > 240 and p[1] > 240 and p[2] > 240 for p in left_pixels + right_pixels)
        is_uniform = left_var < 50 and right_var < 50
        
        aspect = w / h
        return {
            'path': path,
            'size': (w, h),
            'aspect': aspect,
            'is_white': is_white,
            'is_uniform': is_uniform,
            'left_var': left_var,
            'right_var': right_var,
        }
    except Exception as e:
        return {'path': path, 'error': str(e)}

images = glob.glob('public/assets/images/**/*.jpg', recursive=True) + \
         glob.glob('public/assets/images/**/*.jpeg', recursive=True) + \
         glob.glob('public/assets/images/**/*.png', recursive=True)

affected = []
for p in sorted(images):
    res = analyze_image(p)
    if 'error' not in res:
        # If not uniform and aspect ratio is < 1.4 (so it had side margins stretched)
        if not res['is_white'] and not res['is_uniform'] and res['aspect'] < 1.4:
            affected.append(res)

print(f"Total images: {len(images)}")
print(f"Affected photographic non-uniform images with aspect < 1.4: {len(affected)}")
for a in affected:
    print(f"{a['path']} | size={a['size']} aspect={a['aspect']:.2f} left_var={a['left_var']:.1f}")
