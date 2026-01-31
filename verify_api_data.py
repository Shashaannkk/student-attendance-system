import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def verify_data_access():
    # 1. Login
    print("Logging in...")
    try:
        auth_resp = requests.post(
            f"{BASE_URL}/token",
            data={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if auth_resp.status_code != 200:
            print(f"Login failed: {auth_resp.status_code} - {auth_resp.text}")
            return
            
        token = auth_resp.json()["access_token"]
        print("✓ Login successful.")
        
        # 2. Get Students
        print("Fetching students...")
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/students/", headers=headers)
        
        if resp.status_code == 200:
            students = resp.json()
            print(f"✓ Success! Found {len(students)} students.")
            for s in students[:5]: # Show first 5
                print(f"   - {s.get('name')} ({s.get('student_id')})")
        else:
             print(f"✗ Failed to get students: {resp.status_code} - {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_data_access()
