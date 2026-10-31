import urllib.request
import json
import subprocess
import time
import websocket

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
proc = subprocess.Popen([
    EDGE,
    "--headless",
    "--remote-debugging-port=9223",
    "--disable-gpu",
    "--window-size=390,844",
    "http://localhost:5174/#login"
])

time.sleep(2)
try:
    tabs = json.loads(urllib.request.urlopen("http://localhost:9223/json").read())
    ws_url = tabs[0]["webSocketDebuggerUrl"]
    ws = websocket.create_connection(ws_url)
    
    # Evaluate script to find any element causing horizontal overflow
    query = """
    (() => {
        const docWidth = document.documentElement.clientWidth;
        const results = [];
        document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 1) {
                results.push({
                    tag: el.tagName,
                    class: el.className,
                    id: el.id,
                    right: rect.right,
                    width: rect.width,
                    docWidth: docWidth
                });
            }
        });
        return JSON.stringify(results.slice(0, 10));
    })()
    """
    msg = json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": query, "returnByValue": True}})
    ws.send(msg)
    res = json.loads(ws.recv())
    print("Overflow elements:", res["result"]["result"]["value"])
    
    # Also inspect .bogar-auth-card rect
    card_query = """
    (() => {
        const card = document.querySelector('.bogar-auth-card');
        const r = card.getBoundingClientRect();
        return JSON.stringify({ left: r.left, top: r.top, width: r.width, right: r.right });
    })()
    """
    ws.send(json.dumps({"id": 2, "method": "Runtime.evaluate", "params": {"expression": card_query, "returnByValue": True}}))
    res2 = json.loads(ws.recv())
    print("Card rect:", res2["result"]["result"]["value"])

finally:
    proc.terminate()
