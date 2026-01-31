import sys
import socket
import logging

logging.basicConfig(level=logging.INFO)

def check_port(port):
    print(f"Checking if port {port} is free...")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(('localhost', port)) == 0:
            print(f"❌ Port {port} is already in use!")
            return False
        else:
            print(f"✅ Port {port} is free.")
            return True

def check_import():
    print("Attempting to import main.app...")
    try:
        from main import app
        print("✅ Successfully imported main.app")
        return True
    except Exception as e:
        print(f"❌ Failed to import main: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    with open("diagnostic_result.txt", "w") as f:
        f.write("--- DIAGNOSTIC START ---\n")
        try:
            import_ok = check_import()
            f.write(f"Import OK: {import_ok}\n")
            
            port_ok = check_port(8000)
            f.write(f"Port 8000 Free: {port_ok}\n")
            
            if import_ok and port_ok:
                f.write("\n✅ DIAGNOSTICS PASSED. Server ready to start.\n")
            else:
                f.write("\n❌ DIAGNOSTICS FAILED.\n")
        except Exception as e:
            f.write(f"Diagnostic Error: {e}\n")
        f.write("--- DIAGNOSTIC END ---\n")
