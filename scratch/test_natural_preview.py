import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9284

def capture_preview(url, scroll_expr, out_path):
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
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.recv()
        
        # Inject natural rendering on affected items
        inject = """
        (() => {
            const affectedIds = ['food-product-1132', 'food-product-1135', 'food-product-1129', 'product-thuni-robes', 'product-thuni-shawl'];
            affectedIds.forEach(id => {
                const card = document.getElementById(id);
                if (!card) return;
                const media = card.querySelector('.bogar-product-card__media');
                if (!media) return;
                
                // Get img src
                const img = media.querySelector('img');
                if (!img) return;
                
                media.innerHTML = '';
                media.style.height = 'auto';
                
                const newImg = new Image();
                newImg.onload = () => {
                    media.style.aspectRatio = `${newImg.naturalWidth} / ${newImg.naturalHeight}`;
                };
                newImg.src = img.src;
                newImg.style.width = '100%';
                newImg.style.height = '100%';
                newImg.style.display = 'block';
                newImg.style.objectFit = 'contain';
                media.appendChild(newImg);
            });
            return 'Injected';
        })()
        """
        ws.send(json.dumps({"id": 2, "method": "Runtime.evaluate", "params": {"expression": inject}}))
        ws.recv()
        time.sleep(1.0)
        
        ws.send(json.dumps({"id": 3, "method": "Runtime.evaluate", "params": {"expression": scroll_expr}}))
        ws.recv()
        time.sleep(1.0)
        
        ws.send(json.dumps({"id": 4, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
        while True:
            raw = ws.recv()
            data = json.loads(raw)
            if data.get("id") == 4:
                with open(out_path, "wb") as f:
                    f.write(base64.b64decode(data["result"]["data"]))
                print(f"Saved: {out_path}")
                break
        ws.close()
    finally:
        proc.terminate()
        proc.wait()

capture_preview('http://localhost:5173/#food', "document.getElementById('food-product-1132')?.scrollIntoView({block: 'center'}); true", 'scratch/test_natural_food.png')
capture_preview('http://localhost:5173/#thuni', "window.scrollTo(0, 300); true", 'scratch/test_natural_thuni.png')
