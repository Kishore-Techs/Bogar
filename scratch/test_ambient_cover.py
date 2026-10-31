import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9295

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

    ambient_script = """
    (() => {
        document.querySelectorAll('.bogar-product-card__media').forEach(media => {
            media.style.height = '220px';
            media.style.width = '100%';
            media.style.position = 'relative';
            media.style.overflow = 'hidden';
            
            const container = media.querySelector('.bogar-product-image-container');
            const img = media.querySelector('img');
            if (!container || !img) return;
            
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            
            // Check if ambient bg already exists
            let bgImg = container.querySelector('.bogar-ambient-bg');
            if (!bgImg) {
                bgImg = document.createElement('img');
                bgImg.className = 'bogar-ambient-bg';
                bgImg.src = img.src;
                bgImg.style.position = 'absolute';
                bgImg.style.top = '-10%';
                bgImg.style.left = '-10%';
                bgImg.style.width = '120%';
                bgImg.style.height = '120%';
                bgImg.style.objectFit = 'cover';
                bgImg.style.filter = 'blur(16px)';
                bgImg.style.opacity = '0.55';
                bgImg.style.pointerEvents = 'none';
                bgImg.style.zIndex = '1';
                container.insertBefore(bgImg, img);
            }
            
            img.style.position = 'relative';
            img.style.zIndex = '2';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            img.style.opacity = '1';
        });
        return 'Ambient Applied';
    })()
    """

    time.sleep(1.5)
    evaluate(ws, ambient_script)
    time.sleep(1.0)
    evaluate(ws, "window.scrollTo(0, 380); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/ambient_poojas_row1.png")

    evaluate(ws, "window.scrollTo(0, 780); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/ambient_poojas_row2.png")

    # Navigate to food
    evaluate(ws, "window.location.hash = '#food'; true")
    time.sleep(2.0)
    evaluate(ws, ambient_script)
    time.sleep(1.0)
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/ambient_food_lemon.png")

finally:
    proc.terminate()
    proc.wait()
