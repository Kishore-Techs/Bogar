import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9274

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/#poojas"
])

def evaluate(ws, expr, msg_id):
    ws.send(json.dumps({"id": msg_id, "method": "Runtime.evaluate", "params": {"expression": expr}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == msg_id:
            return data.get("result", {})

def screenshot(ws, path, msg_id):
    ws.send(json.dumps({"id": msg_id, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
    while True:
        raw = ws.recv()
        data = json.loads(raw)
        if data.get("id") == msg_id:
            with open(path, "wb") as f:
                f.write(base64.b64decode(data["result"]["data"]))
            print(f"Saved: {path}")
            break

try:
    time.sleep(3.0)
    tabs = json.loads(urllib.request.urlopen(f"http://localhost:{PORT}/json").read())
    page_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws = websocket.create_connection(page_tab["webSocketDebuggerUrl"], timeout=20)
    ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    ws.recv()

    # Clear user from localStorage first so we test unauthenticated add to cart
    clear_script = """
    (() => {
        localStorage.removeItem('bogar_current_user');
        sessionStorage.removeItem('bogar_pending_action');
        window.location.hash = '#poojas';
        window.location.reload();
        return 'Cleared';
    })()
    """
    evaluate(ws, clear_script, 2)
    time.sleep(3.0)

    # Re-enable page after reload
    ws.send(json.dumps({"id": 3, "method": "Page.enable"}))
    ws.recv()

    # Scroll down to pooja products and click "ADD TO CART"
    add_script = """
    (() => {
        window.scrollTo(0, 500);
        const addBtn = document.querySelector('.bogar-btn-add-cart');
        if (!addBtn) return 'Button not found';
        addBtn.click();
        return 'Clicked ADD TO CART';
    })()
    """
    res_add = evaluate(ws, add_script, 4)
    print("Add to cart res:", res_add)
    time.sleep(2.0)

    # Capture Login screen showing preserved item description
    screenshot(ws, "scratch/flow_add_to_cart_login.png", 5)

    # Fill Name + Phone
    login_script = """
    (() => {
        const nameInput = document.getElementById('auth-name');
        const phoneInput = document.getElementById('auth-phone');
        if (!nameInput || !phoneInput) return 'Inputs not found';
        
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(nameInput, 'Murugan Devotee');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        nativeInputValueSetter.call(phoneInput, '9840123456');
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const submitBtn = document.querySelector('.bogar-auth-btn-submit');
        if (submitBtn) submitBtn.click();
        return 'Step 1 submitted';
    })()
    """
    evaluate(ws, login_script, 6)
    time.sleep(2.0)

    # Capture Step 2 OTP
    screenshot(ws, "scratch/flow_add_to_cart_otp.png", 7)

    # Fill OTP '123456'
    otp_script = """
    (() => {
        const boxes = document.querySelectorAll('.bogar-auth-otp-box');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        '123456'.split('').forEach((d, i) => {
            nativeInputValueSetter.call(boxes[i], d);
            boxes[i].dispatchEvent(new Event('input', { bubbles: true }));
        });
        setTimeout(() => {
            const verifyBtn = document.querySelector('.bogar-auth-btn-submit');
            if (verifyBtn) verifyBtn.click();
        }, 400);
        return 'OTP filled';
    })()
    """
    evaluate(ws, otp_script, 8)
    time.sleep(3.0)

    # Capture landing on Cart with item automatically added
    screenshot(ws, "scratch/flow_cart_continued.png", 9)

    ws.close()
finally:
    proc.terminate()
    proc.wait()
