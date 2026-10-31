import subprocess
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
out_path = r"k:\Bogar\scratch\homepage_tall_verify.png"

cmd = [
    EDGE,
    "--headless",
    "--disable-gpu",
    "--virtual-time-budget=4000",
    "--window-size=1440,3200",
    f"--screenshot={out_path}",
    "http://localhost:5173/"
]

print("Running command...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)
if os.path.exists(out_path):
    print("Exists! Size:", os.path.getsize(out_path))
else:
    print("File not found")
