import subprocess
import time
import json
import urllib.request
import websocket
import base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9251

def run():
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/#poojas"
    ])
    try:
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        ws = websocket.create_connection(tabs[0]["webSocketDebuggerUrl"], timeout=20)
        
        # Scroll down slightly so product cards are in view
        ws.send(json.dumps({
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {"expression": "window.scrollTo(0, 450);"}
        }))
        time.sleep(1.5)
        
        ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
        while True:
            raw = ws.recv()
            data = json.loads(raw)
            if data.get("id") == 2:
                with open(r"k:\Bogar\scratch\poojas_cards_view.png", "wb") as f:
                    f.write(base64.b64decode(data["result"]["data"]))
                print("Saved scratch\\poojas_cards_view.png")
                break
        ws.close()
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run()
