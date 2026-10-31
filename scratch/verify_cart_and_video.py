import subprocess
import time
import json
import urllib.request
import websocket
import base64
import os
import sys

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9232

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

def run_verification():
    proc = subprocess.Popen([
        EDGE,
        "--headless",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/#food"
    ])

    try:
        time.sleep(3.0)
        tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
        page_tab = [t for t in tabs if t.get("type") == "page"][0]
        ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=15)
        
        send_cdp(ws, 1, "Page.enable")
        time.sleep(1.0)

        # 1. Add 2 products to cart
        add_script = """
        (() => {
            const buttons = document.querySelectorAll('.bogar-btn-add-cart');
            if (buttons.length >= 2) {
                buttons[0].click();
                setTimeout(() => buttons[1].click(), 250);
                return { success: true, count: buttons.length };
            }
            return { success: false, count: buttons.length };
        })()
        """
        res_add = send_cdp(ws, 2, "Runtime.evaluate", {"expression": add_script, "returnByValue": True})
        print("1. Add to cart action:", res_add["result"]["result"].get("value"))
        time.sleep(1.0)

        # 2. Check Toast Notification with "View Cart" button
        toast_script = """
        (() => {
            const toast = document.querySelector('.bogar-toast');
            const cartBtn = document.querySelector('.bogar-toast__action-btn');
            return {
                toastExists: !!toast,
                toastText: toast ? toast.innerText : null,
                hasViewCartBtn: !!cartBtn,
                buttonText: cartBtn ? cartBtn.innerText : null
            };
        })()
        """
        res_toast = send_cdp(ws, 3, "Runtime.evaluate", {"expression": toast_script, "returnByValue": True})
        print("2. Toast state with View Cart button:", res_toast["result"]["result"].get("value"))

        # 3. Click "View Cart" button in the toast
        click_toast_script = """
        (() => {
            const cartBtn = document.querySelector('.bogar-toast__action-btn');
            if (cartBtn) {
                cartBtn.click();
                return 'clicked_toast_btn';
            }
            window.location.hash = 'cart';
            return 'navigated_hash';
        })()
        """
        res_click = send_cdp(ws, 4, "Runtime.evaluate", {"expression": click_toast_script, "returnByValue": True})
        print("3. Clicked View Cart:", res_click["result"]["result"].get("value"))
        time.sleep(1.5)

        # 4. Verify Cart page elements: Both tabs, products, details
        verify_cart_script = """
        (() => {
            const tabs = Array.from(document.querySelectorAll('.bogar-cart-tab-btn')).map(b => b.innerText.trim());
            const items = Array.from(document.querySelectorAll('.bogar-cart-card')).map(card => {
                return {
                    name: card.querySelector('.bogar-cart-card__name')?.innerText,
                    category: card.querySelector('.bogar-cart-card__category')?.innerText,
                    desc: card.querySelector('.bogar-cart-card__desc')?.innerText,
                    hasImage: !!card.querySelector('.bogar-cart-card__img'),
                    price: card.querySelector('.bogar-cart-card__price-value')?.innerText,
                    itemTotal: card.querySelector('.bogar-cart-card__price-value--bold')?.innerText,
                    qty: card.querySelector('.bogar-qty-value')?.innerText,
                    hasMinus: !!card.querySelector('.bogar-qty-btn'),
                    hasPlus: !!card.querySelectorAll('.bogar-qty-btn')[1],
                    hasViewDetails: !!card.querySelector('.bogar-cart-btn-details'),
                    hasRemove: !!card.querySelector('.bogar-cart-btn-remove')
                };
            });
            const summaryTotal = document.querySelector('.bogar-summary-total-amt')?.innerText;
            return { tabs, itemsCount: items.length, items, summaryTotal };
        })()
        """
        res_cart = send_cdp(ws, 5, "Runtime.evaluate", {"expression": verify_cart_script, "returnByValue": True})
        print("4. Cart verification on #cart:")
        print(json.dumps(res_cart["result"]["result"].get("value"), indent=2))

        # Take screenshot of Cart page
        shot1 = send_cdp(ws, 6, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\verify_cart_page.png", "wb") as f:
            f.write(base64.b64decode(shot1["result"]["data"]))
        print("Saved scratch\\verify_cart_page.png")

        # 5. Test "View Details" on Product 1
        open_details_script = """
        (() => {
            const detailsBtn = document.querySelector('.bogar-cart-btn-details');
            if (detailsBtn) {
                detailsBtn.click();
                return true;
            }
            return false;
        })()
        """
        send_cdp(ws, 7, "Runtime.evaluate", {"expression": open_details_script})
        time.sleep(1)

        # Check modal info
        modal_script = """
        (() => {
            const modal = document.querySelector('.bogar-modal-card--product-details');
            if (!modal) return null;
            return {
                name: modal.querySelector('.bogar-product-modal-name')?.innerText,
                price: modal.querySelector('.bogar-product-modal-price')?.innerText,
                desc: modal.querySelector('.bogar-product-modal-desc')?.innerText,
                hasImage: !!modal.querySelector('.bogar-product-modal-img'),
                hasAddAnother: !!modal.querySelector('.bogar-btn-book')
            };
        })()
        """
        res_modal = send_cdp(ws, 8, "Runtime.evaluate", {"expression": modal_script, "returnByValue": True})
        print("5. Product Details Modal:", res_modal["result"]["result"].get("value"))

        # Close modal
        close_modal_script = """
        (() => {
            const closeBtn = document.querySelector('.bogar-modal-card__close');
            if (closeBtn) closeBtn.click();
        })()
        """
        send_cdp(ws, 9, "Runtime.evaluate", {"expression": close_modal_script})
        time.sleep(0.5)

        # 6. Test Quantity increase (+) on Product 1
        qty_script = """
        (() => {
            const plusBtn = document.querySelectorAll('.bogar-qty-btn')[1];
            if (plusBtn) plusBtn.click();
            const qtyVal = document.querySelector('.bogar-qty-value')?.innerText;
            const itemTotal = document.querySelector('.bogar-cart-card__price-value--bold')?.innerText;
            return { qtyVal, itemTotal };
        })()
        """
        res_qty = send_cdp(ws, 10, "Runtime.evaluate", {"expression": qty_script, "returnByValue": True})
        print("6. Quantity increase result:", res_qty["result"]["result"].get("value"))
        time.sleep(0.5)

        # 7. Fill Devotee dispatch details and Submit Checkout
        checkout_fill_script = """
        (() => {
            const nameInput = document.getElementById('cart-devotee-name');
            const phoneInput = document.getElementById('cart-phone');
            const emailInput = document.getElementById('cart-email');
            if (nameInput) {
                nameInput.value = 'Raman Devotee';
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (phoneInput) {
                phoneInput.value = '9840123456';
                phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (emailInput) {
                emailInput.value = 'raman.devotee@temple.org';
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const form = document.querySelector('.bogar-cart-summary__form');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.click();
                    return true;
                }
            }
            return false;
        })()
        """
        res_checkout = send_cdp(ws, 11, "Runtime.evaluate", {"expression": checkout_fill_script, "returnByValue": True})
        print("7. Checkout filled and submitted:", res_checkout["result"]["result"].get("value"))
        time.sleep(2)

        # 8. Verify MY ORDERS Tab automatically activated on SAME page and shows confirmed orders
        orders_script = """
        (() => {
            const activeTab = document.querySelector('.bogar-cart-tab-btn--active')?.innerText;
            const orders = Array.from(document.querySelectorAll('.bogar-order-card')).map(card => {
                return {
                    orderId: card.querySelector('.bogar-order-id')?.innerText,
                    status: card.querySelector('.bogar-order-status-badge')?.innerText,
                    productName: card.querySelector('.bogar-order-card__title')?.innerText,
                    hasImage: !!card.querySelector('.bogar-order-card__img'),
                    meta: Array.from(card.querySelectorAll('.bogar-order-meta-item')).map(m => m.innerText.replace('\\n', ': ')),
                    hasViewDetails: !!card.querySelector('.bogar-btn-order-action--view'),
                    hasDownloadReceipt: !!card.querySelector('.bogar-btn-order-action--receipt')
                };
            });
            return { activeTab, ordersCount: orders.length, orders };
        })()
        """
        res_orders = send_cdp(ws, 12, "Runtime.evaluate", {"expression": orders_script, "returnByValue": True})
        print("8. Orders verification on SAME page:")
        print(json.dumps(res_orders["result"]["result"].get("value"), indent=2))

        # Take screenshot of My Orders tab
        shot2 = send_cdp(ws, 13, "Page.captureScreenshot", {"format": "png"})
        with open(r"k:\Bogar\scratch\verify_orders_tab.png", "wb") as f:
            f.write(base64.b64decode(shot2["result"]["data"]))
        print("Saved scratch\\verify_orders_tab.png")

        # 9. Click "View Details" on Order 1
        open_order_details_script = """
        (() => {
            const orderViewBtn = document.querySelector('.bogar-btn-order-action--view');
            if (orderViewBtn) {
                orderViewBtn.click();
                return true;
            }
            return false;
        })()
        """
        send_cdp(ws, 14, "Runtime.evaluate", {"expression": open_order_details_script})
        time.sleep(1)

        order_modal_script = """
        (() => {
            const modal = document.querySelector('.bogar-modal-card--order-details');
            if (!modal) return null;
            return {
                title: modal.querySelector('.bogar-modal-card__title')?.innerText,
                orderId: modal.querySelector('.bogar-order-row__val--highlight')?.innerText,
                rows: Array.from(modal.querySelectorAll('.bogar-order-row')).map(r => r.innerText.replace('\\n', ': ')),
                hasPrintBtn: !!modal.querySelector('.bogar-btn-book')
            };
        })()
        """
        res_order_modal = send_cdp(ws, 15, "Runtime.evaluate", {"expression": order_modal_script, "returnByValue": True})
        print("9. Order Details Modal:", json.dumps(res_order_modal["result"]["result"].get("value"), indent=2))

        # Close order modal
        close_order_modal_script = """
        (() => {
            const closeBtn = document.querySelector('.bogar-modal-card__close');
            if (closeBtn) closeBtn.click();
        })()
        """
        send_cdp(ws, 16, "Runtime.evaluate", {"expression": close_order_modal_script})
        time.sleep(0.5)

        # 10. Navigate to Homepage (#home) and verify video section
        send_cdp(ws, 17, "Runtime.evaluate", {"expression": "window.location.hash = 'home';"})
        time.sleep(2)

        # Scroll to video section on homepage
        send_cdp(ws, 18, "Runtime.evaluate", {
            "expression": "document.querySelector('.bogar-video-section').scrollIntoView({ behavior: 'instant', block: 'center' });"
        })
        time.sleep(1.5)

        video_check_script = """
        (() => {
            const cards = document.querySelectorAll('.bogar-video-card');
            const vids = document.querySelectorAll('.bogar-video-card video');
            return {
                totalCards: cards.length,
                videoStates: Array.from(vids).map((v, i) => ({
                    index: i,
                    paused: v.paused,
                    muted: v.muted,
                    currentTime: v.currentTime,
                    isActive: cards[i].classList.contains('bogar-video-card--active')
                }))
            };
        })()
        """
        res_vids = send_cdp(ws, 19, "Runtime.evaluate", {"expression": video_check_script, "returnByValue": True})
        print("10. Homepage Video Section state:")
        print(json.dumps(res_vids["result"]["result"].get("value"), indent=2))

        # 11. Navigate away from Homepage to #cart again to verify ALL videos & audio stop immediately
        send_cdp(ws, 20, "Runtime.evaluate", {"expression": "window.location.hash = 'cart';"})
        time.sleep(1)

        check_stopped_script = """
        (() => {
            const vids = document.querySelectorAll('video');
            return {
                videoElementsCount: vids.length,
                anyPlaying: Array.from(vids).some(v => !v.paused)
            };
        })()
        """
        res_stopped = send_cdp(ws, 21, "Runtime.evaluate", {"expression": check_stopped_script, "returnByValue": True})
        print("11. Leaving Homepage - all video/audio stopped:", res_stopped["result"]["result"].get("value"))

        ws.close()
    finally:
        proc.terminate()

run_verification()
