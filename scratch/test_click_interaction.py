import subprocess
import time
import json
import urllib.request
import websocket
import base64
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def send_cdp(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    ws.send(json.dumps(payload))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == msg_id:
            return data

port = 9226
proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={port}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/"
])

try:
    time.sleep(2.5)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{port}/json").read())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=10)
    
    send_cdp(ws, 1, "Page.enable")
    
    # Scroll into view
    send_cdp(ws, 2, "Runtime.evaluate", {
        "expression": "document.querySelector('.bogar-video-section').scrollIntoView({ behavior: 'instant', block: 'center' });"
    })
    
    time.sleep(1)
    
    # Click on Video 2 (card index 1)
    click_script = """
    (() => {
        const cards = document.querySelectorAll('.bogar-video-card');
        if (cards.length > 1) {
            cards[1].click();
            return { clicked: true, totalCards: cards.length };
        }
        return { clicked: false };
    })()
    """
    click_res = send_cdp(ws, 3, "Runtime.evaluate", {"expression": click_script, "returnByValue": True})
    print("Click result:", click_res["result"]["result"].get("value"))
    
    time.sleep(1.5)
    
    # Check states of videos
    state_script = """
    (() => {
        const vids = document.querySelectorAll('.bogar-video-card video');
        const cards = document.querySelectorAll('.bogar-video-card');
        return Array.from(vids).map((v, i) => ({
            index: i,
            paused: v.paused,
            currentTime: v.currentTime,
            isActiveCard: cards[i].classList.contains('bogar-video-card--active')
        }));
    })()
    """
    state_res = send_cdp(ws, 4, "Runtime.evaluate", {"expression": state_script, "returnByValue": True})
    print("Video states after clicking Video 2:", state_res["result"]["result"].get("value"))
    
    # Screenshot of Video 2 being active
    shot = send_cdp(ws, 5, "Page.captureScreenshot", {"format": "png"})
    with open(r"k:\Bogar\scratch\video2_active_click.png", "wb") as f:
        f.write(base64.b64decode(shot["result"]["data"]))
    print("Saved k:\\Bogar\\scratch\\video2_active_click.png")
    
    ws.close()
finally:
    proc.terminate()
