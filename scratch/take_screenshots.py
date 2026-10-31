import subprocess
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUT_DIR = r"k:\Bogar\screenshots"
os.makedirs(OUT_DIR, exist_ok=True)

targets = [
    ("desktop_home.png", "1440,900", "http://localhost:5174/#home"),
    ("desktop_login.png", "1440,900", "http://localhost:5174/#login"),
    ("desktop_signup.png", "1440,900", "http://localhost:5174/#signup"),
    ("desktop_poojas.png", "1440,900", "http://localhost:5174/#poojas"),
    ("desktop_chains.png", "1440,900", "http://localhost:5174/#chains"),
    ("mobile_home.png", "390,844", "http://localhost:5174/#home"),
    ("mobile_login.png", "390,844", "http://localhost:5174/#login"),
    ("mobile_signup.png", "390,844", "http://localhost:5174/#signup"),
]

for filename, size, url in targets:
    out_path = os.path.join(OUT_DIR, filename)
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=3500",
        f"--window-size={size}",
        f"--screenshot={out_path}",
        url
    ]
    print(f"Capturing {filename}...")
    subprocess.run(cmd, check=True)
    if os.path.exists(out_path):
        print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")

print("All screenshots captured successfully!")
