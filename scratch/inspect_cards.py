import subprocess, time, json, urllib.request, websocket

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9282

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

pages = ['#poojas', '#tea-food', '#thuni', '#chains', '#food', '#hair', '#skin', '#health-wellness']

try:
    time.sleep(3.0)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
    
    for page in pages:
        evaluate(ws, f"window.location.hash = '{page}'; true")
        time.sleep(1.5)
        
        script = """
        (() => {
            const cards = document.querySelectorAll('.bogar-product-card');
            const results = [];
            cards.forEach(c => {
                const nameEl = c.querySelector('.bogar-product-card__name');
                const imgEl = c.querySelector('img');
                const name = nameEl ? nameEl.innerText : 'Unknown';
                const src = imgEl ? (imgEl.src || '') : '';
                results.push({ name, src });
            });
            return results;
        })()
        """
        res = evaluate(ws, script) or []
        print(f"\n=== Page: {page} ({len(res)} cards) ===")
        for r in res[:8]:
            print(f"  {r['name']} -> {r['src'].split('/')[-1]}")
    ws.close()
finally:
    proc.terminate()
    proc.wait()
