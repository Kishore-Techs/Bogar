import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9298

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1200,800",
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

    apply_cover = """
    (() => {
        const style = document.createElement('style');
        style.id = 'test-cover-style';
        style.innerHTML = `
            .bogar-product-card__media {
                height: 220px !important;
                width: 100% !important;
                overflow: hidden !important;
            }
            .bogar-product-card__image {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                object-position: center !important;
            }
        `;
        document.head.appendChild(style);
        return 'Style Injected';
    })()
    """

    time.sleep(1.0)
    evaluate(ws, apply_cover)
    time.sleep(0.5)

    # 1. Poojas Row 1
    evaluate(ws, "window.scrollTo(0, 350); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_cover_poojas_r1.png")

    # 2. Poojas Row 2
    evaluate(ws, "window.scrollTo(0, 750); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_cover_poojas_r2.png")

    # 3. Food (Lemon pickle)
    evaluate(ws, "window.location.hash = '#food'; true")
    time.sleep(2.0)
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_cover_food_lemon.png")

    # 4. Thuni / Clothes
    evaluate(ws, "window.location.hash = '#clothes'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 350); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_cover_clothes.png")

    # 5. Chains
    evaluate(ws, "window.location.hash = '#chains'; true")
    time.sleep(2.0)
    evaluate(ws, "window.scrollTo(0, 350); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_cover_chains.png")

finally:
    proc.terminate()
    proc.wait()
