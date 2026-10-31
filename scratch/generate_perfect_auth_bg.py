from PIL import Image, ImageFilter

src_img = r"C:\Users\ELCOT\.gemini\antigravity-ide\brain\057a9689-cd1d-410f-b752-10be633fa808\.user_uploaded\media_1790600537080.jpg"
im = Image.open(src_img).convert('RGB')
w, h = im.size # 1024 x 576

# The temple hero area is between y=38 and y=428 (navbar ends at 37/38, footer starts at 428/429)
temple = im.crop((0, 38, w, 428))
tw, th = temple.size # 1024 x 390

bg = temple.copy()

# The card in the reference was from x=328 to x=696
# Between x=300 and x=724, let's smoothly blend the deep warm dark temple background
for y in range(th):
    p_left = temple.getpixel((295, y))
    p_right = temple.getpixel((728, y))
    for x in range(295, 729):
        t = (x - 295) / (728 - 295)
        # Deep dark warm brown tone
        base_r = int(p_left[0] * (1 - t) + p_right[0] * t)
        base_g = int(p_left[1] * (1 - t) + p_right[1] * t)
        base_b = int(p_left[2] * (1 - t) + p_right[2] * t)
        
        # Pull slightly towards deep temple dark #160F0B = (22, 15, 11)
        r = int(base_r * 0.40 + 22 * 0.60)
        g = int(base_g * 0.40 + 15 * 0.60)
        b = int(base_b * 0.40 + 11 * 0.60)
        bg.putpixel((x, y), (r, g, b))

# Apply smooth gaussian blur across the blend zone (x=280 to 745)
blend_box = (280, 0, 745, th)
crop_zone = bg.crop(blend_box)
crop_blur = crop_zone.filter(ImageFilter.GaussianBlur(radius=10))
bg.paste(crop_blur, blend_box)

# Now scale up to 1920 width with bicubic resampling for crisp high-DPI display
target_w = 1920
target_h = int(th * (1920 / tw)) # ~731
high_res = bg.resize((target_w, target_h), Image.Resampling.LANCZOS)

out_path = r"k:\Bogar\public\assets\images\auth-bg.jpg"
high_res.save(out_path, quality=95)
print(f"Generated perfect high-res auth-bg.jpg ({target_w}x{target_h}) at {out_path}")
