import subprocess, os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html = """<!DOCTYPE html>
<html><body>
<script>
window.location.href = "http://localhost:5173/";
</script>
</body></html>"""

targets = [
    ("video_desktop_1440.png", "1440,900"),
    ("video_tablet_820.png", "820,1180"),
    ("video_mobile_390.png", "390,844")
]

# We need to scroll down to the video section on the homepage
# Or use headless with script to scroll to .bogar-video-section
for fname, size in targets:
    out = os.path.abspath(f"scratch/{fname}")
    if os.path.exists(out):
        os.remove(out)
    script_runner = f"""<!DOCTYPE html>
<html>
<head>
<style>body,html,iframe {{ width:100%; height:100%; margin:0; padding:0; border:none; }}</style>
</head>
<body>
<iframe id="app" src="http://localhost:5173/"></iframe>
<script>
const f = document.getElementById('app');
f.onload = () => {{
  setTimeout(() => {{
    try {{
      const el = f.contentDocument.querySelector('.bogar-video-section');
      if (el) {{
        el.scrollIntoView({{ behavior: 'instant', block: 'center' }});
      }}
    }} catch(e) {{}}
  }}, 1500);
}};
</script>
</body>
</html>
"""
    # But since iframe might have cross-origin or local restrictions,
    # let's just capture full homepage or scroll with Edge
    pass

