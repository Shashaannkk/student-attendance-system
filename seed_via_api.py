import requests
import random
import time

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    try:
        resp = requests.post(
            f"{BASE_URL}/token",
            data={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if resp.status_code == 200:
            return resp.json()["access_token"]
        else:
            print(f"Login failed: {resp.text}")
            return None
    except Exception as e:
        print(f"Connection error: {e}")
        return None

    with open("seed_log.txt", "w") as f:
        f.write("Starting Seeding Process...\n")
        
        token = get_token()
        if not token:
            f.write("Failed to get token.\n")
            return

        headers = {"Authorization": f"Bearer {token}"}
        
        first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir", "Ritvik", "Darsh"]
        last_names = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Desai", "Mehta", "Joshi", "Reddy", "Nair", "Bhat", "Rao", "Saxena", "Iyer", "Kulkarni", "Das", "Chopra", "Verma", "Mishra", "Shetty"]
        
        classes = ["10A", "10B", "11A", "11B", "12A", "12B"]

        f.write("Authentic-ated. Seeding 40 students...\n")
        
        count = 0
        for i in range(1, 41):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            name = f"{fname} {lname}"
            cls = random.choice(classes)
            roll = random.randint(1, 100)
            sid = f"STU{int(time.time())}{i:02d}" 
            
            payload = {
                "student_id": sid,
                "name": name,
                "class_name": cls,
                "roll_no": roll
            }
            
            try:
                resp = requests.post(f"{BASE_URL}/students/", json=payload, headers=headers)
                if resp.status_code == 200:
                    f.write(f"[{i}/40] Added {name} ({sid})\n")
                    count += 1
                else:
                    f.write(f"[{i}/40] Failed: {resp.text}\n")
            except Exception as e:
                f.write(f"[{i}/40] Error: {e}\n")
            
        f.write(f"Seeding complete. Total added: {count}\n")

if __name__ == "__main__":
    seed_students()
