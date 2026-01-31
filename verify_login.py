import requests

def test_login(username, password):
    url = "http://localhost:8000/token"
    payload = {
        "username": username,
        "password": password
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    print(f"Attempting login for: {username} / {password}")
    try:
        response = requests.post(url, data=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Login SUCCESS!")
            print("Token received:", response.json().get("access_token")[:20] + "...")
            return True
        else:
            print("❌ Login FAILED")
            print("Response:", response.text)
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    with open("login_test_result.txt", "w") as f:
        f.write("--- TESTING TEACHER LOGIN ---\n")
        
        # Capture print output by redirecting stdout or manual logging
        # Simple manual logging here
        
        # Teacher
        username, password = "teacher1", "password1"
        url = "http://localhost:8000/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {"username": username, "password": password}
        
        try:
             resp = requests.post(url, data=payload, headers=headers)
             f.write(f"Login {username}: Status {resp.status_code}\n")
             f.write(f"Response: {resp.text}\n")
        except Exception as e:
             f.write(f"Error {username}: {e}\n")

        # Admin
        username, password = "admin", "admin"
        payload = {"username": username, "password": password}
        try:
             resp = requests.post(url, data=payload, headers=headers)
             f.write(f"Login {username}: Status {resp.status_code}\n")
             f.write(f"Response: {resp.text}\n")
        except Exception as e:
             f.write(f"Error {username}: {e}\n")
