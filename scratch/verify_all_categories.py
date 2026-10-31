import subprocess, time, json, urllib.request, websocket, base64, os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9270

def capture(url, out_path, scroll_y=500, wait_time=3.0):
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        url
    ])
    try:
        time.sleep(wait_time)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
        
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.recv()
        
        if scroll_y > 0:
            ws.send(json.dumps({
                "id": 2, 
                "method": "Runtime.evaluate", 
                "params": {"expression": f"window.scrollTo(0, {scroll_y}); true"}
            }))
            ws.recv()
            time.sleep(1.0)
            
        ws.send(json.dumps({"id": 3, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
        while True:
            raw = ws.recv()
            data = json.loads(raw)
            if data.get("id") == 3:
                with open(out_path, "wb") as f:
                    f.write(base64.b64decode(data["result"]["data"]))
                print(f"Captured: {out_path}")
                break
        ws.close()
    finally:
        proc.terminate()
        proc.wait()

pages = [
    ("http://localhost:5173/#poojas", "scratch/verify_poojas.png", 500),
    ("http://localhost:5173/#tea", "scratch/verify_tea.png", 500),
    ("http://localhost:5173/#thuni", "scratch/verify_thuni.png", 400),
    ("http://localhost:5173/#chains", "scratch/verify_chains.png", 400),
    ("http://localhost:5173/#food", "scratch/verify_food.png", 500),
    ("http://localhost:5173/#hair", "scratch/verify_hair.png", 500),
    ("http://localhost:5173/#skin", "scratch/verify_skin.png", 500),
]

for url, out, scroll in pages:
    capture(url, out, scroll)
