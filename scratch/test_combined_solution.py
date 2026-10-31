import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9285

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

    # Apply the fix in browser to test
    script = """
    (() => {
        // List of affected IDs (photographic/textured images like Lemon Pickle)
        const affectedKeywords = ['lemon', 'puli', 'curryleaf', 'pickle', 'sadha', 'biriyani', 'rasam', 'flour', 'dosai', 'kavuni', 'mittai', 'sambar', 'thuni', 'robes', 'shawl', 'temple-cloth', 'angavastram', 'dhoopa', 'kadukkai', 'orange', 'rose', 'facepack'];
        
        const cards = document.querySelectorAll('.bogar-product-card');
        cards.forEach(card => {
            const media = card.querySelector('.bogar-product-card__media');
            const img = media ? media.querySelector('img') : null;
            if (!media || !img) return;
            
            const src = (img.src || '').toLowerCase();
            const id = (card.id || '').toLowerCase();
            const nameEl = card.querySelector('.bogar-product-card__name');
            const name = nameEl ? nameEl.innerText.toLowerCase() : '';
            
            const isAffected = affectedKeywords.some(kw => src.includes(kw) || id.includes(kw) || name.includes(kw));
            
            // Remove canvas if any
            const canvas = media.querySelector('canvas');
            if (canvas) canvas.remove();
            
            if (isAffected) {
                // Adjust container aspect ratio to match the natural image aspect ratio
                media.style.height = 'auto';
                const temp = new Image();
                temp.onload = () => {
                    media.style.aspectRatio = `${temp.naturalWidth} / ${temp.naturalHeight}`;
                };
                temp.src = img.src;
                
                img.style.position = 'static';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
            } else {
                // Already correct images: keep standard 220px height, clean contain
                media.style.height = '220px';
                media.style.aspectRatio = 'unset';
                img.style.position = 'static';
                img.style.opacity = '1';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
            }
        });
        return 'Updated cards';
    })()
    """
    evaluate(ws, script)
    time.sleep(1.5)

    # Scroll to Lemon Pickle
    evaluate(ws, "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/combined_lemon_pickle.png")

    # Navigate to Thuni
    evaluate(ws, "window.location.hash = '#thuni'; true")
    time.sleep(1.5)
    evaluate(ws, script)
    time.sleep(1.0)
    evaluate(ws, "window.scrollTo(0, 300); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/combined_thuni.png")

    # Navigate to Poojas
    evaluate(ws, "window.location.hash = '#poojas'; true")
    time.sleep(1.5)
    evaluate(ws, script)
    time.sleep(1.0)
    evaluate(ws, "window.scrollTo(0, 500); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/combined_poojas.png")

    # Navigate to Hair
    evaluate(ws, "window.location.hash = '#hair'; true")
    time.sleep(1.5)
    evaluate(ws, script)
    time.sleep(1.0)
    evaluate(ws, "window.scrollTo(0, 500); true")
    time.sleep(1.0)
    screenshot(ws, "scratch/combined_hair.png")

    ws.close()
finally:
    proc.terminate()
    proc.wait()
