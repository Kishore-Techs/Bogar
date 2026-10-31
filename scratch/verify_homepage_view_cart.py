import subprocess
import time
import json
import urllib.request
import websocket
import base64
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9235

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

def run_test():
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/"
    ])

    try:
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=15)
        send_cdp(ws, 1, "Page.enable")
        time.sleep(1.0)

        # 1. Verify Homepage VIEW CART buttons
        check_homepage_buttons = """
        (() => {
            const heroCartBtn = document.querySelector('.bogar-hero__btn-cart');
            const floatingCartBtn = document.querySelector('.bogar-homepage-floating-cart');
            return {
                heroCartBtnExists: !!heroCartBtn,
                heroCartBtnText: heroCartBtn ? heroCartBtn.innerText.trim() : null,
                floatingCartBtnExists: !!floatingCartBtn,
                floatingCartBtnText: floatingCartBtn ? floatingCartBtn.innerText.trim() : null
            };
        })()
        """
        res_buttons = send_cdp(ws, 2, "Runtime.evaluate", {"expression": check_homepage_buttons, "returnByValue": True})
        print("1. Homepage VIEW CART buttons check:", res_buttons["result"]["result"].get("value"))

        # Take screenshot of Homepage with VIEW CART button in Hero
        shot_home = send_cdp(ws, 3, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\homepage_view_cart_button.png", "wb") as f:
            f.write(base64.b64decode(shot_home["result"]["data"]))
        print("Saved scratch\\homepage_view_cart_button.png")

        # 2. Click VIEW CART button in Hero
        click_cart_script = """
        (() => {
            const btn = document.querySelector('.bogar-hero__btn-cart');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        })()
        """
        res_click = send_cdp(ws, 4, "Runtime.evaluate", {"expression": click_cart_script, "returnByValue": True})
        print("2. Clicked Hero VIEW CART button:", res_click["result"]["result"].get("value"))
        time.sleep(1.5)

        # 3. Verify on #cart with [ YOUR CART ] and [ MY ORDERS ] tabs
        check_cart_page = """
        (() => {
            const currentHash = window.location.hash;
            const tabs = Array.from(document.querySelectorAll('.bogar-cart-tab-btn')).map(b => b.innerText.trim());
            const hasCartTab = tabs.some(t => t.includes('YOUR CART'));
            const hasOrdersTab = tabs.some(t => t.includes('MY ORDERS'));
            const activeTab = document.querySelector('.bogar-cart-tab-btn--active')?.innerText.trim();
            return {
                currentHash,
                tabs,
                hasCartTab,
                hasOrdersTab,
                activeTab
            };
        })()
        """
        res_cart = send_cdp(ws, 5, "Runtime.evaluate", {"expression": check_cart_page, "returnByValue": True})
        print("3. Cart / Orders page verification:", res_cart["result"]["result"].get("value"))

        # Take screenshot of opened Cart / Orders page
        shot_cart = send_cdp(ws, 6, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\opened_cart_orders_page.png", "wb") as f:
            f.write(base64.b64decode(shot_cart["result"]["data"]))
        print("Saved scratch\\opened_cart_orders_page.png")

        # 4. Click [ MY ORDERS ] tab to verify seamless switching on same page
        click_orders_tab = """
        (() => {
            const tabs = document.querySelectorAll('.bogar-cart-tab-btn');
            if (tabs.length >= 2) {
                tabs[1].click();
                return true;
            }
            return false;
        })()
        """
        send_cdp(ws, 7, "Runtime.evaluate", {"expression": click_orders_tab})
        time.sleep(1.0)

        check_orders_tab = """
        (() => {
            const activeTab = document.querySelector('.bogar-cart-tab-btn--active')?.innerText.trim();
            const panelText = document.querySelector('.bogar-cart-tab-panel')?.innerText.slice(0, 100);
            return { activeTab, panelSnippet: panelText };
        })()
        """
        res_orders = send_cdp(ws, 8, "Runtime.evaluate", {"expression": check_orders_tab, "returnByValue": True})
        print("4. Switched to MY ORDERS tab:", res_orders["result"]["result"].get("value"))

        # 5. Mobile view test: resize to 390x844 and check Homepage VIEW CART button
        send_cdp(ws, 9, "Runtime.evaluate", {"expression": "window.location.hash = 'home';"})
        time.sleep(1.5)
        send_cdp(ws, 10, "Emulation.setDeviceMetricsOverride", {
            "width": 390,
            "height": 844,
            "deviceScaleFactor": 2,
            "mobile": True
        })
        time.sleep(1.0)

        shot_mobile = send_cdp(ws, 11, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\homepage_view_cart_mobile.png", "wb") as f:
            f.write(base64.b64decode(shot_mobile["result"]["data"]))
        print("Saved scratch\\homepage_view_cart_mobile.png")

        ws.close()
    finally:
        proc.terminate()

run_test()
