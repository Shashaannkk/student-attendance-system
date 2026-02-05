from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-it-in-production-DO-NOT-USE-THIS")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

from passlib.context import CryptContext

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """Hash password using bcrypt. Truncate to 72 bytes if necessary."""
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # Encode to bytes and truncate to 72 bytes for bcrypt compatibility
    password_bytes = password.encode('utf-8')[:72]
    
    # Hash the bytes directly to avoid passlib's internal encoding issues with Python 3.13
    return pwd_context.hash(password_bytes)

def verify_password(plain_password: str, hashed_password: str):
    """Verify password against stored bcrypt hash."""
    # Ensure password is a string
    if not isinstance(plain_password, str):
        plain_password = str(plain_password)
    
    # Encode to bytes and truncate to 72 bytes to match hashing behavior
    password_bytes = plain_password.encode('utf-8')[:72]
    
    # Verify the bytes directly
    return pwd_context.verify(password_bytes, hashed_password)

def get_password_hash(password: str):
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
