import subprocess
import time
import json
import urllib.request
import websocket
import base64
import sys

sys.stdout.reconfigure(encoding='utf-8')

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9245

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

def run():
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/#cart"
    ])

    try:
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
        send_cdp(ws, 1, "Page.enable")
        time.sleep(1.0)

        # Set up a sample product in cart for visual verification
        setup_script = """
        (() => {
            const user = { name: 'Devotee Raman', email: 'raman@bogar.org', phone: '+91 98765 43210' };
            localStorage.setItem('bogar_current_user', JSON.stringify(user));
            
            const item = {
                id: 'cart_1',
                product: {
                    id: 1025,
                    name: 'Black Tea(G)',
                    category: 'Tea',
                    price: '60.00',
                    image: 'https://vedanmart.com/images/Beverages/Black%20Tea(G).png',
                    shortDescription: 'Single-estate orthodox black tea leaves offering a rich, revitalizing amber brew for morning clarity.'
                },
                quantity: 1
            };
            const cartArr = [item];
            localStorage.setItem('bogar_cart', JSON.stringify(cartArr));
            localStorage.setItem('bogar_cart_raman@bogar.org', JSON.stringify(cartArr));
            window.location.reload();
            return true;
        })()
        """
        send_cdp(ws, 2, "Runtime.evaluate", {"expression": setup_script, "returnByValue": True})
        time.sleep(2.0)

        # Verify all elements in Dispatch & Order Summary
        verify_script = """
        (() => {
            const summaryCard = document.querySelector('.bogar-cart-summary-card');
            if (!summaryCard) return { found: false };

            const title = summaryCard.querySelector('.bogar-cart-summary__title')?.innerText.trim();
            const rows = Array.from(summaryCard.querySelectorAll('.bogar-summary-row')).map(r => ({
                text: r.innerText.replace(/\\s+/g, ' ').trim(),
                color: window.getComputedStyle(r).color
            }));

            const labels = Array.from(summaryCard.querySelectorAll('.bogar-form-group label')).map(l => ({
                text: l.innerText.trim(),
                color: window.getComputedStyle(l).color,
                fontWeight: window.getComputedStyle(l).fontWeight
            }));

            const inputs = Array.from(summaryCard.querySelectorAll('.bogar-form-input')).map(inp => ({
                id: inp.id,
                placeholder: inp.getAttribute('placeholder'),
                value: inp.value,
                bg: window.getComputedStyle(inp).backgroundColor,
                color: window.getComputedStyle(inp).color
            }));

            const emailFieldExists = !!summaryCard.querySelector('#cart-email') || !!summaryCard.querySelector('input[type="email"]');
            const submitBtn = summaryCard.querySelector('button[type="submit"]')?.innerText.replace(/\\s+/g, ' ').trim();

            return {
                found: true,
                title,
                rows,
                labels,
                inputs,
                emailFieldExists,
                submitBtn
            };
        })()
        """
        res = send_cdp(ws, 10, "Runtime.evaluate", {"expression": verify_script, "returnByValue": True})
        val = res["result"]["result"]["value"]
        print("Dispatch & Order Summary Check:\n", json.dumps(val, indent=2))

        # Capture screenshot
        shot = send_cdp(ws, 11, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\fixed_cart_dispatch_summary.png", "wb") as f:
            f.write(base64.b64decode(shot["result"]["data"]))
        print("Saved scratch\\fixed_cart_dispatch_summary.png")

        ws.close()
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run()
