from sqlmodel import Session, select
from database import engine
from models import Student
import random
import time

def seed_direct():
    print("Starting Direct DB Seeding...")
    
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir", "Ritvik", "Darsh"]
    last_names = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Desai", "Mehta", "Joshi", "Reddy", "Nair", "Bhat", "Rao", "Saxena", "Iyer", "Kulkarni", "Das", "Chopra", "Verma", "Mishra", "Shetty"]
    
    classes = ["10A", "10B", "11A", "11B", "12A", "12B"]

    added_count = 0
    
    try:
        with Session(engine) as session:
            # Check existing count
            existing = session.exec(select(Student)).all()
            print(f"Existing students: {len(existing)}")
            
            if len(existing) >= 40:
                print("Already have enough students. Skipping.")
                return

            for i in range(1, 41):
                fname = random.choice(first_names)
                lname = random.choice(last_names)
                name = f"{fname} {lname}"
                cls = random.choice(classes)
                roll = random.randint(1, 100)
                sid = f"STU{int(time.time())}{i:02d}" 
                
                student = Student(
                    student_id=sid,
                    name=name,
                    class_name=cls,
                    roll_no=roll
                )
                session.add(student)
                added_count += 1
            
            session.commit()
            print(f"Successfully added {added_count} students to DB.")
            
    except Exception as e:
        print(f"Error seeding DB: {e}")
        # If locked, tell user
        if "locked" in str(e).lower():
            print("Database is locked. Please stop the server and run this script again.")

if __name__ == "__main__":
    seed_direct()
