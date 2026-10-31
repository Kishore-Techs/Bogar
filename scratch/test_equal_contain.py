import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9293

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

    # In this test, all media containers are EQUAL height (220px)
    # The canvas is removed, and img has object-fit: contain, width: 100%, height: 100%, opacity: 1
    script = """
    (() => {
        document.querySelectorAll('.bogar-product-card__media').forEach(m => {
            m.style.height = '220px';
            m.style.aspectRatio = 'unset';
            m.classList.remove('bogar-product-card__media--natural');
            const c = m.querySelector('.bogar-product-image-container');
            if (c) {
                c.style.height = '100%';
                c.style.aspectRatio = 'unset';
                c.classList.remove('bogar-product-image-container--natural');
            }
            const canvas = m.querySelector('canvas');
            if (canvas) canvas.remove();
            const img = m.querySelector('img');
            if (img) {
                img.style.position = 'static';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
            }
        });
        return 'Updated';
    })()
    """

    time.sleep(2.0)
    evaluate(ws, script)
    time.sleep(1.0)
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_equal_contain_food.png")

    # Also test on Poojas
    evaluate(ws, "window.location.hash = '#poojas'; true")
    time.sleep(2.0)
    evaluate(ws, script)
    time.sleep(1.0)
    evaluate(ws, "window.scrollTo(0, 400); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/test_equal_contain_poojas.png")

finally:
    proc.terminate()
    proc.wait()
