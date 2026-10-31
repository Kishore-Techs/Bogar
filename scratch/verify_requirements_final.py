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
PORT = 9239

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

def run_tests():
    print("Starting Edge in headless mode...")
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/"
    ])

    results = {}

    try:
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
        send_cdp(ws, 1, "Page.enable")
        time.sleep(1.0)

        # Clear storage first to ensure clean state
        clear_script = """
        (() => {
            localStorage.removeItem('bogar_current_user');
            localStorage.removeItem('bogar_cart');
            sessionStorage.removeItem('bogar_pending_action');
            window.location.hash = 'home';
            return true;
        })()
        """
        send_cdp(ws, 2, "Runtime.evaluate", {"expression": clear_script, "returnByValue": True})
        time.sleep(1.0)

        # ==========================================
        # TEST 1: HOMEPAGE VIEW CART BUTTON RULE
        # ==========================================
        print("\n--- TEST 1: HOMEPAGE VIEW CART BUTTON RULE ---")
        check_homepage = """
        (() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const viewCartElements = allElements.filter(el => {
                // Must have exact direct or prominent text "VIEW CART"
                const text = el.innerText || '';
                return (
                    el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button'
                ) && /VIEW\\s+CART/i.test(text);
            });

            const heroCartBtn = document.querySelector('.bogar-hero .bogar-hero__btn-cart, .bogar-hero button[class*="cart"]');
            const floatingCartBtn = document.querySelector('.bogar-homepage-floating-cart');
            const navbarCartBtn = document.querySelector('.bogar-navbar .bogar-btn-view-cart');
            
            // Check navbar layout order
            const navLinks = Array.from(document.querySelectorAll('.bogar-navbar__links .bogar-navbar__link')).map(el => el.innerText.trim());
            const brandText = document.querySelector('.bogar-navbar__title')?.innerText.trim();
            const ctaButtons = Array.from(document.querySelectorAll('.bogar-navbar__cta-wrapper button')).map(el => el.innerText.replace(/\\s+/g, ' ').trim());

            return {
                viewCartElementsCount: viewCartElements.length,
                heroHasViewCart: !!heroCartBtn,
                floatingCartExists: !!floatingCartBtn,
                navbarCartExists: !!navbarCartBtn,
                navbarCartText: navbarCartBtn ? navbarCartBtn.innerText.replace(/\\s+/g, ' ').trim() : null,
                brandText,
                navLinks,
                ctaButtons
            };
        })()
        """
        res1 = send_cdp(ws, 10, "Runtime.evaluate", {"expression": check_homepage, "returnByValue": True})
        val1 = res1["result"]["result"]["value"]
        print("Homepage check result:", json.dumps(val1, indent=2))
        results["test1"] = val1

        # Screenshot of Homepage Navbar & Hero
        shot1 = send_cdp(ws, 11, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\final_homepage_navbar.png", "wb") as f:
            f.write(base64.b64decode(shot1["result"]["data"]))
        print("Captured scratch/final_homepage_navbar.png")

        # ==========================================
        # TEST 2: NAVBAR VIEW CART CLICK OPENS CART
        # ==========================================
        print("\n--- TEST 2: NAVBAR VIEW CART CLICK OPENS CART ---")
        click_nav_cart = """
        (() => {
            const btn = document.querySelector('.bogar-navbar .bogar-btn-view-cart');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        })()
        """
        send_cdp(ws, 20, "Runtime.evaluate", {"expression": click_nav_cart, "returnByValue": True})
        time.sleep(1.0)

        check_cart_page = """
        (() => {
            const hash = window.location.hash;
            const tabs = Array.from(document.querySelectorAll('.bogar-cart-tab-btn')).map(t => t.innerText.replace(/\\s+/g, ' ').trim());
            const title = document.querySelector('.bogar-cart-title')?.innerText.trim();
            return {
                currentHash: hash,
                cartTitle: title,
                tabs
            };
        })()
        """
        res2 = send_cdp(ws, 21, "Runtime.evaluate", {"expression": check_cart_page, "returnByValue": True})
        val2 = res2["result"]["result"]["value"]
        print("Cart page opened check:", json.dumps(val2, indent=2))
        results["test2"] = val2

        # ==========================================
        # TEST 3: ADD TO CART WHEN NOT LOGGED IN
        # ==========================================
        print("\n--- TEST 3: PRODUCT ADD TO CART - LOGIN REQUIRED ---")
        # Navigate to Tea products page
        nav_tea = """
        (() => {
            window.location.hash = 'tea-food';
            return true;
        })()
        """
        send_cdp(ws, 30, "Runtime.evaluate", {"expression": nav_tea, "returnByValue": True})
        time.sleep(1.0)

        # Click ADD TO CART on the first product
        add_cart_unauth = """
        (() => {
            const card = document.querySelector('.bogar-product-card');
            const btn = card ? card.querySelector('.bogar-btn-add-cart') : null;
            const prodName = card ? card.querySelector('.bogar-product-card__name')?.innerText.trim() : null;
            if (btn) {
                btn.click();
                return { clicked: true, prodName };
            }
            return { clicked: false };
        })()
        """
        res3_click = send_cdp(ws, 31, "Runtime.evaluate", {"expression": add_cart_unauth, "returnByValue": True})
        print("Clicked Add To Cart:", res3_click["result"]["result"]["value"])
        time.sleep(1.0)

        # Verify redirected to login with pendingAction preserved
        check_login_redirect = """
        (() => {
            const hash = window.location.hash;
            const pending = sessionStorage.getItem('bogar_pending_action');
            const cartInStorage = localStorage.getItem('bogar_cart');
            const isLoginPage = !!document.querySelector('.bogar-auth-card');
            const authTitle = document.querySelector('.bogar-auth-card__title')?.innerText.trim();
            return {
                currentHash: hash,
                isLoginPage,
                authTitle,
                pendingAction: pending ? JSON.parse(pending) : null,
                cartInStorage: cartInStorage ? JSON.parse(cartInStorage) : []
            };
        })()
        """
        res3_ver = send_cdp(ws, 32, "Runtime.evaluate", {"expression": check_login_redirect, "returnByValue": True})
        val3 = res3_ver["result"]["result"]["value"]
        print("Login redirection & preserved item check:", json.dumps(val3, indent=2))
        results["test3"] = val3

        # Screenshot of Login page preserving item
        shot3 = send_cdp(ws, 33, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\final_login_preservation.png", "wb") as f:
            f.write(base64.b64decode(shot3["result"]["data"]))
        print("Captured scratch/final_login_preservation.png")

        # ==========================================
        # TEST 4: SUCCESSFUL LOGIN AUTO-ADDS PRODUCT
        # ==========================================
        print("\n--- TEST 4: SUCCESSFUL LOGIN AUTO-ADDS PRODUCT ---")
        login_script = """
        (() => {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const submitBtn = document.querySelector('.bogar-auth-btn-submit');
            
            if (emailInput && passwordInput && submitBtn) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                nativeSetter.call(emailInput, 'devotee.raman@bogar.org');
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                nativeSetter.call(passwordInput, 'SacredBogar108');
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                
                submitBtn.click();
                return true;
            }
            return false;
        })()
        """
        res_log = send_cdp(ws, 40, "Runtime.evaluate", {"expression": login_script, "returnByValue": True})
        print("Login script executed:", res_log["result"]["result"]["value"])
        time.sleep(2.0)

        # Check that user was redirected to #cart and the product is inside their cart
        check_after_login = """
        (() => {
            const hash = window.location.hash;
            const cartItems = Array.from(document.querySelectorAll('.bogar-cart-card')).map(card => ({
                name: card.querySelector('.bogar-cart-card__name')?.innerText.trim(),
                qty: card.querySelector('.bogar-cart-qty-input')?.value || card.querySelector('.bogar-cart-card__qty')?.innerText.trim()
            }));
            const currentUser = localStorage.getItem('bogar_current_user');
            const badgeCount = document.querySelector('.bogar-navbar__cart-badge')?.innerText.trim();

            return {
                currentHash: hash,
                currentUser: currentUser ? JSON.parse(currentUser) : null,
                cartItems,
                navbarBadge: badgeCount
            };
        })()
        """
        res4 = send_cdp(ws, 41, "Runtime.evaluate", {"expression": check_after_login, "returnByValue": True})
        val4 = res4["result"]["result"]["value"]
        print("After login cart check:", json.dumps(val4, indent=2))
        results["test4"] = val4

        # Screenshot of Cart with automatically added product
        shot4 = send_cdp(ws, 42, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\final_cart_after_login.png", "wb") as f:
            f.write(base64.b64decode(shot4["result"]["data"]))
        print("Captured scratch/final_cart_after_login.png")

        # ==========================================
        # TEST 5: RETURN TO HOMEPAGE & VERIFY
        # ==========================================
        print("\n--- TEST 5: RETURN TO HOMEPAGE WITH USER LOGGED IN ---")
        return_home = """
        (() => {
            window.location.hash = 'home';
            return true;
        })()
        """
        send_cdp(ws, 50, "Runtime.evaluate", {"expression": return_home, "returnByValue": True})
        time.sleep(1.0)

        check_homepage_logged_in = """
        (() => {
            const heroCartBtn = document.querySelector('.bogar-hero .bogar-hero__btn-cart');
            const floatingCartBtn = document.querySelector('.bogar-homepage-floating-cart');
            const navbarCartBtn = document.querySelector('.bogar-navbar .bogar-btn-view-cart');
            const navbarUserBtn = document.querySelector('.bogar-navbar .bogar-btn-book');
            const cartBadge = document.querySelector('.bogar-navbar .bogar-navbar__cart-badge')?.innerText.trim();

            return {
                heroHasViewCart: !!heroCartBtn,
                floatingCartExists: !!floatingCartBtn,
                navbarCartExists: !!navbarCartBtn,
                navbarCartBadge: cartBadge,
                navbarUserBtnText: navbarUserBtn?.innerText.trim()
            };
        })()
        """
        res5 = send_cdp(ws, 51, "Runtime.evaluate", {"expression": check_homepage_logged_in, "returnByValue": True})
        val5 = res5["result"]["result"]["value"]
        print("Homepage with authenticated user:", json.dumps(val5, indent=2))
        results["test5"] = val5

        shot5 = send_cdp(ws, 52, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\final_homepage_authenticated.png", "wb") as f:
            f.write(base64.b64decode(shot5["result"]["data"]))
        print("Captured scratch/final_homepage_authenticated.png")

        ws.close()
    finally:
        proc.terminate()
        proc.wait()

    print("\n================== ALL TESTS COMPLETE ==================")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_tests()
