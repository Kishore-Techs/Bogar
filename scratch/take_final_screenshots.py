import subprocess

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

targets = [
    (r"k:\Bogar\screenshots\final_desktop_login_1024.png", "1024,576"),
    (r"k:\Bogar\screenshots\final_desktop_login_1440.png", "1440,900"),
    (r"k:\Bogar\screenshots\final_mobile_login_390.png", "390,844"),
]

for out_path, size in targets:
    cmd = [
        EDGE,
        "--headless",
        "--disable-gpu",
        "--virtual-time-budget=3500",
        f"--window-size={size}",
        f"--screenshot={out_path}",
        "http://localhost:5174/#login"
    ]
    subprocess.run(cmd, check=True)
    print("Captured", out_path)

print("All final screenshots captured!")
