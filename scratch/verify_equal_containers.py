import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9294

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/#poojas"
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

    # 1. Poojas (Row 1: 108 Homa, Deepa Oil, Herbal Dhoopa)
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 380); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/final_poojas_row1_equal.png")

    # Poojas (Row 2: 27 Types, Thirumanjal, Thalampoo)
    evaluate(ws, "window.scrollTo(0, 780); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/final_poojas_row2_equal.png")

    # 2. Food (Pulithokku, Sundakkai, Lemon Pickle)
    evaluate(ws, "window.location.hash = '#food'; true")
    time.sleep(2.0)
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/final_food_lemon_equal.png")

    # 3. Thuni
    evaluate(ws, "window.location.hash = '#thuni'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 300); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/final_thuni_equal.png")

    # 4. Chains
    evaluate(ws, "window.location.hash = '#chains'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 300); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/final_chains_equal.png")

finally:
    proc.terminate()
    proc.wait()
