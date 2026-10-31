import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9265

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
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.recv()
    
    # Inject the canvas replacement on all .bogar-product-card__media
    inject_script = """
    (() => {
        const cards = document.querySelectorAll('.bogar-product-card');
        cards.forEach(card => {
            const media = card.querySelector('.bogar-product-card__media');
            const img = media ? media.querySelector('img') : null;
            if (!media || !img) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = 380;
            canvas.height = 220;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            canvas.style.objectFit = 'cover';
            
            const ctx = canvas.getContext('2d');
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            tempImg.onload = () => {
                const cw = canvas.width;
                const ch = canvas.height;
                const iw = tempImg.naturalWidth;
                const ih = tempImg.naturalHeight;
                
                // Contain dimensions
                const scale = Math.min(cw / iw, ch / ih);
                const fw = Math.round(iw * scale);
                const fh = Math.round(ih * scale);
                const fx = Math.round((cw - fw) / 2);
                const fy = Math.round((ch - fh) / 2);
                
                // 1. Left edge stretch
                if (fx > 0) {
                    ctx.drawImage(tempImg, 0, 0, 1, ih, 0, fy, fx, fh);
                }
                // 2. Right edge stretch
                if (cw - (fx + fw) > 0) {
                    ctx.drawImage(tempImg, iw - 1, 0, 1, ih, fx + fw, fy, cw - (fx + fw), fh);
                }
                // 3. Top edge stretch
                if (fy > 0) {
                    ctx.drawImage(tempImg, 0, 0, iw, 1, fx, 0, fw, fy);
                    if (fx > 0) ctx.drawImage(tempImg, 0, 0, 1, 1, 0, 0, fx, fy);
                    if (cw - (fx + fw) > 0) ctx.drawImage(tempImg, iw - 1, 0, 1, 1, fx + fw, 0, cw - (fx + fw), fy);
                }
                // 4. Bottom edge stretch
                if (ch - (fy + fh) > 0) {
                    ctx.drawImage(tempImg, 0, ih - 1, iw, 1, fx, fy + fh, fw, ch - (fy + fh));
                    if (fx > 0) ctx.drawImage(tempImg, 0, ih - 1, 1, 1, 0, fy + fh, fx, ch - (fy + fh));
                    if (cw - (fx + fw) > 0) ctx.drawImage(tempImg, iw - 1, ih - 1, 1, 1, fx + fw, fy + fh, cw - (fx + fw), ch - (fy + fh));
                }
                
                // 5. Draw sharp foreground image
                ctx.drawImage(tempImg, 0, 0, iw, ih, fx, fy, fw, fh);
                
                // Replace img with canvas or insert canvas
                media.innerHTML = '';
                media.appendChild(canvas);
            };
            tempImg.src = img.src;
        });
        return true;
    })()
    """
    ws.send(json.dumps({"id": 2, "method": "Runtime.evaluate", "params": {"expression": inject_script}}))
    ws.recv()
    time.sleep(2.0)
    
    # Scroll down so cards are visible
    ws.send(json.dumps({"id": 3, "method": "Runtime.evaluate", "params": {"expression": "window.scrollTo(0, 500); true"}}))
    ws.recv()
    time.sleep(1.0)
    
    ws.send(json.dumps({"id": 4, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == 4:
            with open(r"k:\Bogar\scratch\poojas_canvas_test.png", "wb") as f:
                f.write(base64.b64decode(data["result"]["data"]))
            print("Saved scratch/poojas_canvas_test.png")
            break
    ws.close()
finally:
    proc.terminate()
    proc.wait()
