import subprocess
import time
import json
import urllib.request
import websocket
import base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def capture_viewport(width, height, out_name):
    port = 9224
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={port}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        f"--window-size={width},{height}",
        "http://localhost:5173/"
    ])
    
    time.sleep(2)
    try:
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{port}/json").read())
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        ws = websocket.create_connection(ws_url)
        
        # Scroll to video section
        scroll_code = """
        (() => {
            const section = document.querySelector('.bogar-video-section');
            if (section) {
                section.scrollIntoView({ behavior: 'instant', block: 'center' });
                return true;
            }
            return false;
        })()
        """
        ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": scroll_code}}))
        ws.recv()
        
        time.sleep(1.5)
        
        # Capture screenshot
        ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
        res = json.loads(ws.recv())
        data = res["result"]["data"]
        with open(f"k:\\Bogar\\scratch\\{out_name}", "wb") as f:
            f.write(base64.b64decode(data))
        print(f"Captured {out_name}")
    finally:
        proc.terminate()

capture_viewport(1440, 900, "video_section_desktop.png")
capture_viewport(820, 1000, "video_section_tablet.png")
capture_viewport(390, 844, "video_section_mobile.png")
