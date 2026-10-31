import subprocess
import time
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

targets = [
    ("k:/Bogar/scratch/poojas_desktop_1440.png", "1440,1100", "http://localhost:5173/#poojas"),
    ("k:/Bogar/scratch/poojas_tablet_820.png", "820,1180", "http://localhost:5173/#poojas"),
    ("k:/Bogar/scratch/poojas_mobile_390.png", "390,844", "http://localhost:5173/#poojas"),
    ("k:/Bogar/scratch/teafood_check_1440.png", "1440,1100", "http://localhost:5173/#tea-food")
]

for out_path, size, url in targets:
    if os.path.exists(out_path):
        os.remove(out_path)
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--user-data-dir=k:/Bogar/scratch/edge_profile",
        "--virtual-time-budget=3000",
        f"--window-size={size}",
        f"--screenshot={out_path}",
        url
    ]
    subprocess.run(cmd, check=True)
    print("Captured:", out_path, "Exists:", os.path.exists(out_path))
