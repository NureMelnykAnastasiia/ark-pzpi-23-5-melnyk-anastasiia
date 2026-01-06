import subprocess
import time
import sys
import os

def run_process(command, name):
    print(f"Starting {name}")
    return subprocess.Popen(
        command,
        shell=True,
        stdout=sys.stdout,
        stderr=sys.stderr
    )

def main():
    print("IoT System Launcher")
    print("Press Ctrl+C to stop the emulation\n")

    bridge = run_process(f"{sys.executable} bridge.py", "MQTT Bridge")
    time.sleep(2)
    device = run_process(f"{sys.executable} main.py", "IoT Device")

    try:
        while True:
            time.sleep(1)
            if device.poll() is not None:
                print("Device has stopped.")
                break
            if bridge.poll() is not None:
                print("Bridge has stopped. Check the error logs.")
                break
    except KeyboardInterrupt:
        print("\nStopping the system")
    finally:
        device.terminate()
        bridge.terminate()
        print("Processes have been stopped.")

if __name__ == "__main__":
    main()
