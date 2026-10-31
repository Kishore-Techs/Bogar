import subprocess, os

html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #f8f5ee; font-family: sans-serif; display: flex; gap: 20px; padding: 20px; }
.card { width: 360px; background: white; border-radius: 14px; overflow: hidden; border: 1px solid rgba(139, 106, 63, 0.12); }
.media { height: 220px; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.media img { width: 100%; height: 100%; object-fit: contain; }
p { padding: 12px; margin: 0; font-weight: bold; }
</style>
</head>
<body>
  <div class="card">
    <div class="media" style="background-color: #FFFFFF;">
      <img src="file:///k:/Bogar/public/assets/images/poojas/pooja_1294.jpeg">
    </div>
    <p>pooja_1294 in #FFFFFF</p>
  </div>
  <div class="card">
    <div class="media" style="background-color: rgb(237, 236, 239);">
      <img src="file:///k:/Bogar/public/assets/images/poojas/pooja_1294.jpeg">
    </div>
    <p>pooja_1294 in rgb(237, 236, 239)</p>
  </div>
  <div class="card">
    <div class="media" style="background-color: rgb(189, 187, 188);">
      <img src="file:///k:/Bogar/public/assets/images/poojas/pooja_1264.jpg">
    </div>
    <p>pooja_1264 in rgb(189, 187, 188)</p>
  </div>
</body>
</html>
"""

with open('scratch/test_compare.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    EDGE,
    "--headless",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--window-size=1200,500",
    "--screenshot=k:/Bogar/scratch/test_compare.png",
    f"file:///{os.path.abspath('scratch/test_compare.html').replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print("Saved test_compare.png")
