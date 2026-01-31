import hashlib
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

# Configuration
SECRET_KEY = "your-secret-key-change-it-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password):
    """Hash password using SHA-256 (Matching CLI implementation)."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password, hashed_password):
    """Verify password against stored SHA-256 hash."""
    return hash_password(plain_password) == hashed_password

def get_password_hash(password):
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
