import subprocess
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUT_DIR = r"k:\Bogar\test_screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

targets = [
    ("final_view_all_desktop_1440.png", "1440,1100", "http://localhost:5173/#view-all"),
    ("final_view_all_tablet_820.png", "820,1180", "http://localhost:5173/#view-all"),
    ("final_view_all_mobile_390.png", "390,844", "http://localhost:5173/#view-all"),
    ("final_homepage_desktop_1440.png", "1440,900", "http://localhost:5173/#home"),
]

for filename, size, url in targets:
    out_path = os.path.join(OUT_DIR, filename)
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=4000",
        f"--window-size={size}",
        f"--screenshot={out_path}",
        url
    ]
    print(f"Capturing {filename}...")
    subprocess.run(cmd, check=True)
    if os.path.exists(out_path):
        print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")

print("All final validation screenshots captured successfully!")
