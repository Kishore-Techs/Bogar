import subprocess, time, json, urllib.request, websocket, base64, os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9287

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173"
])

def evaluate(ws, expr):
    ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": expr, "returnByValue": True}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == 1:
            return data.get("result", {}).get("result", {}).get("value")

try:
    time.sleep(3.0)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=30)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.recv()

    # Function to inspect cards on current page
    inspect_script = """
    (() => {
        const cards = document.querySelectorAll('.bogar-product-card');
        const results = [];
        
        cards.forEach(card => {
            const media = card.querySelector('.bogar-product-card__media');
            const img = media ? media.querySelector('img') : null;
            const canvas = media ? media.querySelector('canvas') : null;
            const nameEl = card.querySelector('.bogar-product-card__name');
            const name = nameEl ? nameEl.innerText.trim() : '';
            const id = card.id || '';
            
            if (!img) return;
            
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            const cw = media.clientWidth;
            const ch = media.clientHeight;
            
            // Check edge variance using an offscreen canvas
            let varLeft = 0, varRight = 0, varTop = 0, varBottom = 0;
            let isWhiteBg = false;
            
            if (iw > 0 && ih > 0) {
                const offscreen = document.createElement('canvas');
                offscreen.width = iw;
                offscreen.height = ih;
                const ctx = offscreen.getContext('2d', { willReadFrequently: true });
                try {
                    ctx.drawImage(img, 0, 0);
                    // Sample left column
                    const leftCol = ctx.getImageData(0, 0, 1, ih).data;
                    // Sample right column
                    const rightCol = ctx.getImageData(iw - 1, 0, 1, ih).data;
                    // Sample top row
                    const topRow = ctx.getImageData(0, 0, iw, 1).data;
                    // Sample bottom row
                    const bottomRow = ctx.getImageData(0, ih - 1, iw, 1).data;
                    
                    const calcVar = (data, count, step) => {
                        let sumR = 0, sumG = 0, sumB = 0;
                        const n = count;
                        for (let i = 0; i < n; i++) {
                            const idx = i * step;
                            sumR += data[idx];
                            sumG += data[idx+1];
                            sumB += data[idx+2];
                        }
                        const avgR = sumR / n, avgG = sumG / n, avgB = sumB / n;
                        let varSum = 0;
                        for (let i = 0; i < n; i++) {
                            const idx = i * step;
                            varSum += (data[idx]-avgR)**2 + (data[idx+1]-avgG)**2 + (data[idx+2]-avgB)**2;
                        }
                        return varSum / n;
                    };
                    
                    varLeft = calcVar(leftCol, ih, 4);
                    varRight = calcVar(rightCol, ih, 4);
                    varTop = calcVar(topRow, iw, 4);
                    varBottom = calcVar(bottomRow, iw, 4);
                    
                    // Check if near white
                    let whiteCount = 0;
                    for (let i = 0; i < 20; i++) {
                        const y = Math.floor(i * (ih / 20));
                        const idx = y * 4;
                        if (leftCol[idx] > 240 && leftCol[idx+1] > 240 && leftCol[idx+2] > 240) whiteCount++;
                        if (rightCol[idx] > 240 && rightCol[idx+1] > 240 && rightCol[idx+2] > 240) whiteCount++;
                    }
                    isWhiteBg = (whiteCount / 40) > 0.85;
                } catch (e) {
                    // CORS or other error
                }
            }
            
            const aspect = iw && ih ? iw / ih : 1;
            const containerAspect = cw && ch ? cw / ch : 1;
            const maxSideVar = Math.max(varLeft, varRight);
            
            // An image is affected if:
            // 1. It is narrower than the container (aspect < containerAspect - 0.15)
            // 2. Its side edges are NOT uniform (maxSideVar > 50) and not white
            // OR if vertical margins stretched non-uniform top/bottom edges
            const hasSideStretching = (aspect < 1.55) && (maxSideVar > 50) && !isWhiteBg;
            
            results.push({
                id,
                name,
                src: img.src,
                currentSrc: img.currentSrc,
                iw,
                ih,
                aspect: Math.round(aspect * 100) / 100,
                cw,
                ch,
                varLeft: Math.round(varLeft),
                varRight: Math.round(varRight),
                maxSideVar: Math.round(maxSideVar),
                isWhiteBg,
                hasSideStretching
            });
        });
        
        return results;
    })()
    """

    pages = [
        '#food',
        '#poojas',
        '#tea-food',
        '#thuni',
        '#chains',
        '#hair',
        '#skin',
        '#health-wellness',
        '#view-all'
    ]

    all_results = {}
    for p in pages:
        evaluate(ws, f"window.location.hash = '{p}'; true")
        time.sleep(2.0)
        res = evaluate(ws, inspect_script)
        all_results[p] = res
        affected = [c for c in (res or []) if c.get('hasSideStretching')]
        print(f"Page {p}: total cards = {len(res or [])}, affected = {len(affected)}")
        for a in affected:
            print(f"   - {a['name']} ({a['id']}): aspect={a['aspect']}, sideVar={a['maxSideVar']}")

    with open('scratch/live_audit_report.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2)

finally:
    proc.terminate()
    proc.wait()
