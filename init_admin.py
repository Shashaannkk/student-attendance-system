"""
One-time script to initialize the admin user with correct password hash.
Run this once to set up the default admin account.
"""
from auth import hash_password
import json

DATA_FILE = "data/users.json"

# Create admin with password "admin123"
admin_hash = hash_password("admin123")

data = {
    "users": {
        "admin": {
            "password_hash": admin_hash,
            "role": "admin"
        }
    }
}

with open(DATA_FILE, "w") as f:
    json.dump(data, f, indent=4)

print("Admin account initialized!")
print(f"Username: admin")
print(f"Password: admin123")
print(f"Password hash: {admin_hash}")
