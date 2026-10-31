import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9278

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/#book-pooja"
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

    # Clear user from localStorage first
    clear_script = """
    (() => {
        localStorage.removeItem('bogar_current_user');
        sessionStorage.removeItem('bogar_pending_action');
        window.location.hash = '#book-pooja';
        window.location.reload();
        return 'Cleared';
    })()
    """
    evaluate(ws, clear_script, 2)
    time.sleep(3.0)

    ws.send(json.dumps({"id": 3, "method": "Page.enable"}))
    ws.recv()

    # Fill booking form details and submit via form submit event
    book_script = """
    (() => {
        const nameInput = document.getElementById('devotee-name');
        const phoneInput = document.getElementById('booking-phone');
        const emailInput = document.getElementById('booking-email');
        const dateInput = document.getElementById('booking-date');
        
        const setVal = (el, val) => {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        
        if (nameInput) setVal(nameInput, 'Sundaram Pillai');
        if (phoneInput) setVal(phoneInput, '9876500000');
        if (emailInput) setVal(emailInput, 'sundaram@temple.org');
        if (dateInput) setVal(dateInput, '2026-10-15');
        
        const form = document.querySelector('.bogar-booking-form');
        if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            return 'Dispatched submit';
        }
        return 'Form not found';
    })()
    """
    res = evaluate(ws, book_script, 4)
    print("Book submit:", res)
    time.sleep(2.0)

    # Capture login screen showing preserved pooja booking notice
    screenshot(ws, "scratch/flow_pooja_login.png", 5)

    # Fill Step 1 & submit
    otp_start = """
    (() => {
        const nameInput = document.getElementById('auth-name');
        const phoneInput = document.getElementById('auth-phone');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(nameInput, 'Sundaram Pillai');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        setter.call(phoneInput, '9876500000');
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('.bogar-auth-btn-submit').click();
        return 'OTP requested';
    })()
    """
    evaluate(ws, otp_start, 6)
    time.sleep(2.0)

    # Fill Step 2 OTP
    otp_verify = """
    (() => {
        const boxes = document.querySelectorAll('.bogar-auth-otp-box');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        '123456'.split('').forEach((d, i) => {
            setter.call(boxes[i], d);
            boxes[i].dispatchEvent(new Event('input', { bubbles: true }));
        });
        setTimeout(() => {
            document.querySelector('.bogar-auth-btn-submit').click();
        }, 300);
        return 'OTP verified';
    })()
    """
    evaluate(ws, otp_verify, 7)
    time.sleep(3.0)

    # Capture return to booking page with details preserved
    screenshot(ws, "scratch/flow_pooja_returned.png", 8)

    ws.close()
finally:
    proc.terminate()
    proc.wait()
