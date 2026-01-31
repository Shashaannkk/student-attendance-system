from sqlmodel import Session, select, create_engine
from models import User
from database import engine
import sys

def check_users():
    try:
        with Session(engine) as session:
            statement = select(User)
            users = session.exec(statement).all()
            with open("db_check_result.txt", "w") as f:
                f.write(f"Found {len(users)} users in DB:\n")
                for u in users:
                    f.write(f" - {u.username} (Role: {u.role})\n")
            print("Done writing to file.")
    except Exception as e:
        with open("db_check_result.txt", "w") as f:
            f.write(f"Error reading DB: {e}\n")

if __name__ == "__main__":
    check_users()
