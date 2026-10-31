from PIL import Image

im = Image.open(r"k:\Bogar\scratch\homepage_tall_verify.png")
w, h = im.size
print("Size:", w, h)

# Let's crop from 1800 to 3200
crop_2 = im.crop((0, 1800, 1440, min(3200, h)))
crop_2.save(r"k:\Bogar\scratch\video_section_lower.png")
print("Saved video_section_lower.png")
