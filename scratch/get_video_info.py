import subprocess, re

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html = """<!DOCTYPE html>
<html>
<body>
<video id="v1" src="http://localhost:5173/assets/videos/gemini_generated_video_7b190859.mp4"></video>
<video id="v2" src="http://localhost:5173/assets/videos/gemini_generated_video_caa071c0.mp4"></video>
<video id="v3" src="http://localhost:5173/assets/videos/gemini_generated_video_3a65de49.mp4"></video>
<div id="out"></div>
<script>
let count = 0;
function check() {
  count++;
  if (count === 3) {
    document.getElementById('out').innerText = JSON.stringify({
      v1: { w: v1.videoWidth, h: v1.videoHeight, d: v1.duration },
      v2: { w: v2.videoWidth, h: v2.videoHeight, d: v2.duration },
      v3: { w: v3.videoWidth, h: v3.videoHeight, d: v3.duration }
    });
  }
}
v1.onloadedmetadata = check;
v2.onloadedmetadata = check;
v3.onloadedmetadata = check;
</script>
</body>
</html>
"""

with open("scratch/vinfo.html", "w", encoding="utf-8") as f:
    f.write(html)

cmd = [EDGE, "--headless", "--disable-gpu", "--virtual-time-budget=3000", "--dump-dom", "k:/Bogar/scratch/vinfo.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
m = re.search(r'id="out">([^<]+)<', res.stdout)
if m:
    print(m.group(1))
else:
    print("Not found, output length:", len(res.stdout))
