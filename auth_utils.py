from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-it-in-production-DO-NOT-USE-THIS")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def hash_password(password: str) -> str:
    """Hash password using bcrypt. Truncate to 72 bytes if necessary."""
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # Encode to bytes and truncate to 72 bytes for bcrypt compatibility
    password_bytes = password.encode('utf-8')[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored bcrypt hash."""
    try:
        # Ensure password is a string
        if not isinstance(plain_password, str):
            plain_password = str(plain_password)
        
        # Ensure hash is a string
        if not isinstance(hashed_password, str):
            hashed_password = str(hashed_password)
        
        # Encode to bytes and truncate to 72 bytes to match hashing behavior
        password_bytes = plain_password.encode('utf-8')[:72]
        
        # Encode the stored hash to bytes
        hashed_bytes = hashed_password.encode('utf-8')
        
        # Verify
        result = bcrypt.checkpw(password_bytes, hashed_bytes)
        
        # Debug logging (can be removed in production)
        if not result:
            print(f"[DEBUG] Password verification failed")
            print(f"[DEBUG] Password length: {len(plain_password)}, Hash starts with: {hashed_password[:29]}")
        
        return result
    except Exception as e:
        print(f"[ERROR] Password verification exception: {type(e).__name__}: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Alias for hash_password."""
    return hash_password(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

import secrets

def generate_invite_token() -> str:
    """Generate a secure random token for teacher invites."""
    return secrets.token_urlsafe(32)  # 32 bytes = 43 characters
