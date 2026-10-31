import subprocess, time, json, urllib.request, websocket, base64, os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9286

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/#food"
])

def evaluate(ws, expr):
    ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": expr, "returnByValue": True}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == 1:
            return data.get("result", {}).get("result", {}).get("value")

def screenshot(ws, path):
    ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == 2:
            with open(path, "wb") as f:
                f.write(base64.b64decode(data["result"]["data"]))
            print(f"Saved: {path}")
            break

try:
    time.sleep(3.0)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.recv()

    # Capture Lemon pickle on #food
    time.sleep(2.0)
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/current_food_lemon_pickle.png")

    # Capture Poojas
    evaluate(ws, "window.location.hash = '#poojas'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 400); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/current_poojas.png")

    # Capture Thuni
    evaluate(ws, "window.location.hash = '#thuni'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 300); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/current_thuni.png")

finally:
    proc.terminate()
    proc.wait()
