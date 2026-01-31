from sqlmodel import Session, select
from database import engine
from models import User

def list_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        if not users:
            print("No users found in database.")
        else:
            print(f"{'Username':<20} | {'Role':<10}")
            print("-" * 35)
            for user in users:
                print(f"{user.username:<20} | {user.role:<10}")

if __name__ == "__main__":
    list_users()
