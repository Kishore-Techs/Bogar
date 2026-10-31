import subprocess

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    EDGE,
    "--headless",
    "--disable-gpu",
    "--force-device-scale-factor=1",
    "--window-size=390,844",
    r"--screenshot=k:\Bogar\screenshots\test_mobile_scale1.png",
    "http://localhost:5174/#login"
]
subprocess.run(cmd, check=True)
print("Done mobile scale 1 capture!")
