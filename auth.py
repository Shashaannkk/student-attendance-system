import json
import hashlib
import os

DATA_FILE = "data/users.json"

def load_data():
    """Load users data from JSON file."""
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    """Save users data to JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def normalize_username(username):
    """Normalize username to lowercase for case-insensitive login."""
    return username.strip().lower()

def hash_password(password):
    """Hash password using SHA-256."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password, password_hash):
    """Verify password against stored hash."""
    return hash_password(password) == password_hash

def register_user(username, password, role="teacher"):
    """
    Register a new user.
    Roles: 'teacher' or 'admin'
    Username is case-insensitive (stored in lowercase)
    Returns: success message or error
    """
    # Normalize username
    username = normalize_username(username)
    role = role.strip().lower()
    
    data = load_data()
    
    if username in data["users"]:
        return None, "Username already exists"
    
    if role not in ["teacher", "admin"]:
        return None, "Invalid role. Use 'teacher' or 'admin'"
    
    data["users"][username] = {
        "password_hash": hash_password(password),
        "role": role
    }
    
    save_data(data)
    return username, f"User '{username}' registered as {role}"

def login(username, password):
    """
    Authenticate user.
    Username is case-insensitive.
    Returns: (user_info, message) or (None, error_message)
    """
    # Normalize username
    username = normalize_username(username)
    
    data = load_data()
    
    if username not in data["users"]:
        return None, "User not found"
    
    user = data["users"][username]
    
    if not verify_password(password, user["password_hash"]):
        return None, "Incorrect password"
    
    return {
        "username": username,
        "role": user["role"]
    }, "Login successful"

def is_admin(user):
    """Check if user has admin role."""
    return user and user.get("role") == "admin"

def get_all_users():
    """Get list of all usernames and their roles (admin only)."""
    data = load_data()
    return {
        username: info["role"] 
        for username, info in data["users"].items()
    }
