import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9253

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1300,900",
    "http://localhost:5173/scratch/test_render_approaches.html"
])
try:
    time.sleep(3.0)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
    ws = websocket.create_connection(tabs[0]["webSocketDebuggerUrl"], timeout=20)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.recv()
    time.sleep(1.0)
    ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == 2:
            with open(r"k:\Bogar\scratch\test_render_approaches.png", "wb") as f:
                f.write(base64.b64decode(data["result"]["data"]))
            print("Saved scratch\\test_render_approaches.png")
            break
    ws.close()
finally:
    proc.terminate()
    proc.wait()
