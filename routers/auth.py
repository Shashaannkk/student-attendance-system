from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from typing import Annotated
import shutil
from pathlib import Path
import os
import time

from database import get_session
from models import User, Organization
from schemas import Token, OrganizationRegister, OrganizationResponse
from auth_utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from jose import JWTError, jwt
from auth_utils import SECRET_KEY, ALGORITHM
from org_utils import generate_org_code, send_org_code_email

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
async def login_for_access_token(
    org_code: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    session: Session = Depends(get_session)
):
    """
    Login with organization code, username, and password.
    All three must match for successful authentication.
    """
    print("\n" + "="*60)
    print("🔐 LOGIN ENDPOINT CALLED!")
    print("="*60)
    print(f"--- LOGIN ATTEMPT ---")
    print(f"Org Code: '{org_code}'")
    print(f"Username: '{username}'")
    
    # Step 1: Validate organization code
    org_statement = select(Organization).where(Organization.org_code == org_code.upper())
    organization = session.exec(org_statement).first()
    
    if not organization:
        print(f"[X] Organization code not found: {org_code}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization code",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OK] Organization found: {organization.institution_name}")
    
    # Step 2: Find user within this organization
    user_statement = select(User).where(
        User.org_code == org_code.upper(),
        User.username == username
    )
    user = session.exec(user_statement).first()
    
    if not user:
        print(f"[X] User '{username}' not found in organization '{org_code}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username for this organization",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OK] User found: {user.username}, Role: {user.role}")
    print(f"[DEBUG] Stored password hash: {user.password_hash[:20]}...")
    print(f"[DEBUG] Attempting to verify password...")
    
    # Step 3: Verify password
    if not verify_password(password, user.password_hash):
        print(f"[X] Password verification failed for user: {username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OK] Login successful for: {user.username}")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "org_code": user.org_code,
            "institution_type": organization.institution_type,
            "institution_name": organization.institution_name
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Get current user with organization info"""
    org_statement = select(Organization).where(Organization.org_code == current_user.org_code)
    organization = session.exec(org_statement).first()
    
    return {
        "username": current_user.username,
        "role": current_user.role,
        "org_code": current_user.org_code,
        "institution_type": organization.institution_type if organization else None,
        "institution_name": organization.institution_name if organization else None,
        "profile_picture_url": current_user.profile_picture_url
    }

@router.post("/register-organization", response_model=OrganizationResponse)
def register_organization(
    org_data: OrganizationRegister,
    session: Session = Depends(get_session)
):
    """
    Register a new school/college organization.
    Generates org code and creates admin user.
    """
    # Check if email already registered
    email_check = select(Organization).where(Organization.email == org_data.email)
    existing_org = session.exec(email_check).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate unique org code
    org_code = generate_org_code(org_data.institution_name, org_data.institution_type)
    
    # Ensure org code is unique (very unlikely collision, but check anyway)
    while True:
        code_check = select(Organization).where(Organization.org_code == org_code)
        if not session.exec(code_check).first():
            break
        org_code = generate_org_code(org_data.institution_name, org_data.institution_type)
    
    # Create organization
    organization = Organization(
        org_code=org_code,
        institution_name=org_data.institution_name,
        institution_type=org_data.institution_type,
        email=org_data.email
    )
    session.add(organization)
    
    # Create admin user
    admin_user = User(
        org_code=org_code,
        username=org_data.admin_username,
        password_hash=get_password_hash(org_data.admin_password),
        role="admin"
    )
    session.add(admin_user)
    
    session.commit()
    session.refresh(organization)
    
    # Send email with credentials
    send_org_code_email(
        email=org_data.email,
        org_code=org_code,
        institution_name=org_data.institution_name,
        admin_username=org_data.admin_username,
        admin_password=org_data.admin_password
    )
    
    return OrganizationResponse(
        org_code=org_code,
        institution_name=organization.institution_name,
        institution_type=organization.institution_type,
        email=organization.email,
        admin_username=org_data.admin_username,
        message=f"Organization registered successfully! An email has been sent to {org_data.email} with your credentials."
    )

@router.post("/register-user")
def register_user(
    org_code: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Register a new user (teacher) within an organization. Admin only."""
    # Check if current user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin only.")
    
    # Verify org code matches current user's organization
    if current_user.org_code != org_code.upper():
        raise HTTPException(status_code=403, detail="Cannot create users for other organizations")
    
    # Check if username already exists in this organization
    user_check = select(User).where(
        User.org_code == org_code.upper(),
        User.username == username
    )
    existing_user = session.exec(user_check).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists in this organization")
    
    # Create new user
    new_user = User(
        org_code=org_code.upper(),
        username=username,
        password_hash=get_password_hash(password),
        role=role
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return {"username": new_user.username, "role": new_user.role, "org_code": new_user.org_code}
