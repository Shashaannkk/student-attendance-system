from sqlmodel import Session, select
from database import engine
from models import Student

def count_students():
    with Session(engine) as session:
        statement = select(Student)
        results = session.exec(statement).all()
        print(f"Total Students in DB: {len(results)}")

if __name__ == "__main__":
    count_students()
