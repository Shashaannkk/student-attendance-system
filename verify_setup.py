import requests
import sys

def verify_setup():
    base_url = "http://127.0.0.1:8000"
    
    print(f"Checking server at {base_url}...")
    
    try:
        # Check Root
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print(f"✓ Root endpoint reachable: {response.json()}")
        else:
            print(f"✗ Root endpoint failed: {response.status_code}")
            sys.exit(1)
            
        # Check Docs
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print(f"✓ Swagger UI reachable")
        else:
            print(f"✗ Swagger UI failed: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server. Is it running?")
        sys.exit(1)

if __name__ == "__main__":
    verify_setup()
