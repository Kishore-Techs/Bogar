import subprocess
import time
import json
import urllib.request
import websocket
import base64
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def send_cdp(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    ws.send(json.dumps(payload))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == msg_id:
            return data

def capture_video_section_viewport(width, height, out_name):
    port = 9225
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={port}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        f"--window-size={width},{height}",
        "http://localhost:5173/"
    ])
    
    try:
        time.sleep(2.5)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{port}/json").read())
        # Pick the page tab
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws_url = page_tab["webSocketDebuggerUrl"]
        ws = websocket.create_connection(ws_url, timeout=10)
        
        # Enable Page domain
        send_cdp(ws, 1, "Page.enable")
        
        # Find element bounding box and scroll it into view
        eval_script = """
        (() => {
            const el = document.querySelector('.bogar-video-section');
            if (!el) return null;
            el.scrollIntoView({ behavior: 'instant', block: 'center' });
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            };
        })()
        """
        res = send_cdp(ws, 2, "Runtime.evaluate", {"expression": eval_script, "returnByValue": True})
        print(f"[{width}x{height}] Section info:", res["result"]["result"].get("value"))
        
        time.sleep(1.0)
        
        # Take screenshot of viewport
        shot_res = send_cdp(ws, 3, "Page.captureScreenshot", {"format": "png"})
        img_bytes = base64.b64decode(shot_res["result"]["data"])
        out_file = os.path.join(r"k:\Bogar\scratch", out_name)
        with open(out_file, "wb") as f:
            f.write(img_bytes)
        print(f"Saved {out_file} ({len(img_bytes)} bytes)")
        ws.close()
    finally:
        proc.terminate()

capture_video_section_viewport(1440, 900, "video_section_1440.png")
capture_video_section_viewport(820, 1000, "video_section_820.png")
capture_video_section_viewport(390, 844, "video_section_390.png")
print("Done capturing all 3 viewports!")
