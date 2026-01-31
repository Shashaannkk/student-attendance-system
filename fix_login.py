from sqlmodel import Session, select, create_engine
from models import User, Student
from database import engine, create_db_and_tables
import hashlib
import json
import os

def fix_login():
    print("Starting Login Fix Process...")
    
    # 1. Ensure DB exists
    create_db_and_tables()
    print("✓ Database tables verified.")
    
    with Session(engine) as session:
        # 2. Check/Reset Admin User
        username = "admin"
        password = "admin123"
        pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        
        if user:
            user.password_hash = pw_hash
            user.role = "admin"
            session.add(user)
            print(f"✓ Updated existing 'admin' password to '{password}'")
        else:
            user = User(username=username, password_hash=pw_hash, role="admin")
            session.add(user)
            print(f"✓ Created new 'admin' user with password '{password}'")
        
        # 3. Check/Migrate Other Users (Optional but good)
        users_file = "data/users.json"
        if os.path.exists(users_file):
            with open(users_file, "r") as f:
                data = json.load(f)
                count = 0
                for uname, info in data.get("users", {}).items():
                    if uname == "admin": continue
                    
                    stmt = select(User).where(User.username == uname)
                    existing = session.exec(stmt).first()
                    if not existing:
                        new_user = User(
                            username=uname, 
                            password_hash=info["password_hash"], 
                            role=info["role"]
                        )
                        session.add(new_user)
                        count += 1
                if count > 0:
                    print(f"✓ Migrated {count} additional users from users.json")
        
        session.commit()
        print("\nSUCCESS! Login credentials fixed.")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("\nPlease restart your server (Ctrl+C and run 'python run_server.py') and try logging in again.")

if __name__ == "__main__":
    fix_login()
