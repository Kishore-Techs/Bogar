import os, glob
from PIL import Image

def analyze(path):
    if not os.path.exists(path):
        return None
    try:
        im = Image.open(path).convert('RGB')
        w, h = im.size
        left = [im.getpixel((0, y)) for y in range(0, h, max(1, h//10))]
        right = [im.getpixel((w-1, y)) for y in range(0, h, max(1, h//10))]
        top = [im.getpixel((x, 0)) for x in range(0, w, max(1, w//10))]
        bottom = [im.getpixel((x, h-1)) for x in range(0, w, max(1, w//10))]

        def var(pxs):
            ar = sum(p[0] for p in pxs)/len(pxs)
            ag = sum(p[1] for p in pxs)/len(pxs)
            ab = sum(p[2] for p in pxs)/len(pxs)
            return sum((p[0]-ar)**2 + (p[1]-ag)**2 + (p[2]-ab)**2 for p in pxs)/len(pxs)

        def is_white(pxs):
            return all(p[0]>245 and p[1]>245 and p[2]>245 for p in pxs)

        return {
            'size': (w, h),
            'aspect': w/h,
            'var_lr': max(var(left), var(right)),
            'var_tb': max(var(top), var(bottom)),
            'is_white_lr': is_white(left) and is_white(right),
            'is_white_tb': is_white(top) and is_white(bottom)
        }
    except Exception as e:
        return None

results = []
for root, dirs, files in os.walk('public/assets/images'):
    for f in files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            p = os.path.join(root, f)
            res = analyze(p)
            if res:
                if res['aspect'] < 1.6 and not res['is_white_lr'] and res['var_lr'] > 50:
                    results.append((p, res))

print(f"Total LR-STRETCHED images found: {len(results)}")
for p, res in sorted(results, key=lambda x: x[0]):
    print(f"{p} | aspect={res['aspect']:.2f} size={res['size']} var_lr={res['var_lr']:.1f}")
