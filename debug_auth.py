import hashlib
import json

def get_hash(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def check_hashes():
    # Load users.json
    try:
        with open("data/users.json", "r") as f:
            data = json.load(f)
            admin_hash = data["users"]["admin"]["password_hash"]
            print(f"Stored Hash for 'admin': {admin_hash}")
            
            candidates = ["admin", "admin123", "password", "123456", "root"]
            
            found = False
            for p in candidates:
                h = get_hash(p)
                print(f"Candidate '{p}': {h}")
                if h == admin_hash:
                    print(f"\nMATCH FOUND! The password is: '{p}'")
                    found = True
                    break
            
            if not found:
                print("\nNo match found among common passwords.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_hashes()
