from sqlmodel import Session, select, create_engine
from models import User
from database import engine, create_db_and_tables
import hashlib

def reset_password():
    username = "admin"
    new_password = "admin123"
    new_hash = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
    
    try:
        create_db_and_tables()
        with Session(engine) as session:
            statement = select(User).where(User.username == username)
            user = session.exec(statement).first()
            
            if user:
                user.password_hash = new_hash
                user.role = "admin" # Ensure role is correct
                session.add(user)
                session.commit()
                msg = f"Updated existing admin password to '{new_password}'"
            else:
                user = User(username=username, password_hash=new_hash, role="admin")
                session.add(user)
                session.commit()
                msg = f"Created new admin user with password '{new_password}'"
                
            with open("reset_status.txt", "w") as f:
                f.write(msg)
    except Exception as e:
        with open("reset_status.txt", "w") as f:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    reset_password()
