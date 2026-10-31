import subprocess
import time
import json
import urllib.request
import os

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
proc = subprocess.Popen([
    EDGE,
    "--remote-debugging-port=9222",
    "--headless",
    "--disable-gpu",
    "--window-size=1440,1100",
    "http://localhost:5173/#collections"
])

try:
    time.sleep(2)
    # Get tabs from CDP
    req = urllib.request.urlopen("http://localhost:9222/json")
    tabs = json.loads(req.read().decode())
    target_tab = tabs[0]
    ws_url = target_tab['webSocketDebuggerUrl']
    print("Tab ready:", ws_url)
finally:
    proc.terminate()
