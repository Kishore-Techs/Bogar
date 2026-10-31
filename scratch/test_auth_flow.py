import subprocess, time, json, urllib.request, websocket, base64

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
PORT = 9272

proc = subprocess.Popen([
    EDGE,
    "--headless",
    f"--remote-debugging-port={PORT}",
    "--remote-allow-origins=*",
    "--disable-gpu",
    "--window-size=1440,900",
    "http://localhost:5173/#login"
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

    # 1. Capture Step 1 (Name + Phone)
    screenshot(ws, "scratch/auth_step1.png", 2)

    # 2. Fill Name and Phone, click Continue / Get OTP
    fill_script = """
    (() => {
        const nameInput = document.getElementById('auth-name');
        const phoneInput = document.getElementById('auth-phone');
        if (!nameInput || !phoneInput) return 'Inputs not found';
        
        // Fill React inputs
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(nameInput, 'Arunachalam');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        nativeInputValueSetter.call(phoneInput, '9876543210');
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const submitBtn = document.querySelector('.bogar-auth-btn-submit');
        if (submitBtn) submitBtn.click();
        return 'Submitted Step 1';
    })()
    """
    res = evaluate(ws, fill_script, 3)
    print("Step 1 eval:", res)
    time.sleep(2.0)

    # 3. Capture Step 2 (OTP Verification)
    screenshot(ws, "scratch/auth_step2.png", 4)

    # 4. Fill OTP '123456' and click Verify OTP
    fill_otp_script = """
    (() => {
        const boxes = document.querySelectorAll('.bogar-auth-otp-box');
        if (boxes.length !== 6) return 'Boxes not 6: ' + boxes.length;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        '123456'.split('').forEach((digit, i) => {
            nativeInputValueSetter.call(boxes[i], digit);
            boxes[i].dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        setTimeout(() => {
            const verifyBtn = document.querySelector('.bogar-auth-btn-submit');
            if (verifyBtn) verifyBtn.click();
        }, 500);
        return 'Filled OTP';
    })()
    """
    res_otp = evaluate(ws, fill_otp_script, 5)
    print("Step 2 eval:", res_otp)
    time.sleep(2.5)

    # 5. Capture post-login state (Navbar showing user name)
    screenshot(ws, "scratch/auth_step3_logged_in.png", 6)

    ws.close()
finally:
    proc.terminate()
    proc.wait()
