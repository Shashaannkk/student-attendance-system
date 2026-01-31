from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from database import get_session
from models import User
from schemas import Token
from auth_utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from auth_utils import SECRET_KEY, ALGORITHM

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # Proceed with normal DB check for others
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    
    # DEBUG LOGGING
    print(f"--- LOGIN ATTEMPT ---")
    print(f"Username received: '{form_data.username}'")
    print(f"Password received: '{form_data.password}'")
    
    if not user:
        print("❌ User NOT FOUND in database.")
        from database import DB_PATH
        print(f"Checking DB at: {DB_PATH}")
    else:
        print(f"User found: {user.username}, Role: {user.role}")
        print(f"Stored Hash: {user.password_hash}")
        
        is_valid = verify_password(form_data.password, user.password_hash)
        print(f"Password Valid? {is_valid}")
        
        if not is_valid:
            print("❌ Password verification FAILED.")
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register")
def register_user(user: User, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Check if admin
    if current_user.role != "admin":
         raise HTTPException(status_code=403, detail="Not authorized")

    statement = select(User).where(User.username == user.username)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    user.password_hash = get_password_hash(user.password_hash) # In request, we expect plain password in this field temporarily or use a separate schema
    # Note: user.password_hash in the request body is treated as plain text password here for simplicity
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"username": user.username, "role": user.role}
