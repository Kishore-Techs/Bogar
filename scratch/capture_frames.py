import subprocess

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html = """<!DOCTYPE html>
<html>
<head>
<style>
body { margin: 0; background: #000; display: flex; gap: 10px; padding: 10px; }
.card { width: 300px; height: 500px; border-radius: 16px; overflow: hidden; background: #111; position: relative; border: 2px solid gold; }
video { width: 100%; height: 100%; object-fit: cover; }
.contain video { object-fit: contain; }
</style>
</head>
<body>
  <div class="card"><video src="http://localhost:5173/assets/videos/gemini_generated_video_7b190859.mp4" autoplay muted loop></video></div>
  <div class="card"><video src="http://localhost:5173/assets/videos/gemini_generated_video_caa071c0.mp4" autoplay muted loop></video></div>
  <div class="card"><video src="http://localhost:5173/assets/videos/gemini_generated_video_3a65de49.mp4" autoplay muted loop></video></div>
</body>
</html>
"""

with open("scratch/vtest_layout.html", "w", encoding="utf-8") as f:
    f.write(html)

cmd = [EDGE, "--headless", "--disable-gpu", "--virtual-time-budget=3000", "--window-size=1000,600", "--screenshot=k:/Bogar/scratch/vtest_layout.png", "k:/Bogar/scratch/vtest_layout.html"]
subprocess.run(cmd, check=True)
print("Captured vtest_layout.png")
