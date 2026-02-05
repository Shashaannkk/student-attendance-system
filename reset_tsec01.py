"""
Quick script to reset password for TSEC01 user
"""
from sqlmodel import Session, select
from database import engine
from models import User
from auth_utils import get_password_hash

def reset_tsec01_password():
    new_password = "admin123"  # Change this to whatever you want
    
    with Session(engine) as session:
        user = session.exec(
            select(User).where(
                User.org_code == "CLG-THAKUR-ZVZTJU",
                User.username == "TSEC01"
            )
        ).first()
        
        if not user:
            print("User TSEC01 not found!")
            return
        
        user.password_hash = get_password_hash(new_password)
        session.add(user)
        session.commit()
        
        print("\n" + "="*60)
        print("Password reset successful!")
        print("="*60)
        print(f"Organization Code: CLG-THAKUR-ZVZTJU")
        print(f"Username: TSEC01")
        print(f"New Password: {new_password}")
        print("="*60 + "\n")

if __name__ == "__main__":
    reset_tsec01_password()
