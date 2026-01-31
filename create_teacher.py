from sqlmodel import Session, select
from database import engine
from models import User
from auth_utils import get_password_hash

def create_teacher():
    with Session(engine) as session:
        # Check if teacher exists
        statement = select(User).where(User.username == "teacher1")
        user = session.exec(statement).first()
        
        if not user:
            print("Creating teacher1...")
            teacher = User(
                username="teacher1", 
                password_hash=get_password_hash("password1"), 
                role="teacher"
            )
            session.add(teacher)
            session.commit()
            print("Teacher created: teacher1 / password1")
        else:
            print("Teacher already exists. Updating password...")
            new_hash = get_password_hash("password1")
            user.password_hash = new_hash
            session.add(user)
            session.commit()
            print("Teacher password updated to: password1")
            
            # Verify immediately
            from auth_utils import verify_password
            is_valid = verify_password("password1", new_hash)
            print(f"IMMEDIATE VERIFICATION: 'password1' matches hash? {is_valid}")

        # Also check for admin
        statement = select(User).where(User.username == "admin")
        admin = session.exec(statement).first()
        if not admin:
             print("Creating admin...")
             admin_user = User(
                 username="admin",
                 password_hash=get_password_hash("admin"),
                 role="admin"
             )
             session.add(admin_user)
             session.commit()
             print("Admin created: admin / admin")
        else:
             print("Admin already exists: admin")

if __name__ == "__main__":
    create_teacher()
