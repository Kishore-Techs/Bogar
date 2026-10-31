import subprocess, os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

pages = [
    ("poojas", "http://localhost:5173/#poojas"),
    ("tea", "http://localhost:5173/#tea-food"),
    ("clothes", "http://localhost:5173/#thuni"),
    ("chains", "http://localhost:5173/#chains"),
    ("food", "http://localhost:5173/#food"),
    ("hair", "http://localhost:5173/#hair"),
    ("skin", "http://localhost:5173/#skin"),
    ("health_wellness", "http://localhost:5173/#health-wellness")
]

for name, url in pages:
    out = os.path.abspath(f"scratch/verify_{name}.png")
    if os.path.exists(out):
        os.remove(out)
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=3500",
        "--window-size=1440,1100",
        f"--screenshot={out}",
        url
    ]
    subprocess.run(cmd, check=True)
    print(f"Captured {name}: {os.path.exists(out)}")

print("All verifications captured!")
