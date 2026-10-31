import subprocess
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

targets = [
    ("k:/Bogar/scratch/hair_view_all_1440.png", "1440,1100", "http://localhost:5173/#view-all"),
    ("k:/Bogar/scratch/hair_page_1440.png", "1440,1200", "http://localhost:5173/#hair"),
    ("k:/Bogar/scratch/hair_page_mobile.png", "390,844", "http://localhost:5173/#hair"),
]

for out_path, size, url in targets:
    if os.path.exists(out_path):
        os.remove(out_path)
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=3500",
        f"--window-size={size}",
        f"--screenshot={out_path}",
        url
    ]
    subprocess.run(cmd, check=True)
    print("Captured:", out_path, "Exists:", os.path.exists(out_path), "Size:", os.path.getsize(out_path) if os.path.exists(out_path) else 0)
