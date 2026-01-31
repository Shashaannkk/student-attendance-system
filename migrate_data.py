import json
import os
from sqlmodel import Session, select, create_engine
from models import User, Student, Attendance
from database import engine, create_db_and_tables

# Paths to JSON files
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
STUDENTS_FILE = os.path.join(DATA_DIR, "students.json")
ATTENDANCE_FILE = os.path.join(DATA_DIR, "attendance.json")

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return None
    with open(filepath, "r") as f:
        return json.load(f)

def migrate_users(session: Session):
    data = load_json(USERS_FILE)
    if not data or "users" not in data:
        return
    
    print("\nMigrating Users...")
    count = 0
    for username, info in data["users"].items():
        # Check if exists
        statement = select(User).where(User.username == username)
        existing = session.exec(statement).first()
        
        if not existing:
            user = User(
                username=username,
                password_hash=info["password_hash"], # Copying existing hash
                role=info["role"]
            )
            session.add(user)
            count += 1
            print(f"  Added user: {username}")
        else:
            print(f"  Skipped existing user: {username}")
    
    session.commit()
    print(f"Migrated {count} users.")

def migrate_students(session: Session):
    data = load_json(STUDENTS_FILE)
    if not data:
        return

    print("\nMigrating Students...")
    count = 0
    # JSON structure is {class_name: [[id, {name, roll_no}], ...]}
    for class_name, students_list in data.items():
        for student_entry in students_list:
            # student_entry is [id, {name, roll_no}]
            if len(student_entry) != 2:
                continue
                
            s_id = student_entry[0]
            info = student_entry[1]
            
            # Check if exists
            statement = select(Student).where(Student.student_id == s_id)
            existing = session.exec(statement).first()
            
            if not existing:
                student = Student(
                    student_id=s_id,
                    name=info["name"],
                    class_name=class_name,
                    roll_no=int(info.get("roll_no", 0))
                )
                session.add(student)
                count += 1
                print(f"  Added student: {info['name']} ({s_id})")
            else:
                print(f"  Skipped existing student: {s_id}")
                
    session.commit()
    print(f"Migrated {count} students.")

def main():
    print("Starting migration...")
    create_db_and_tables()
    
    with Session(engine) as session:
        migrate_users(session)
        migrate_students(session)
        # attendance migration is more complex due to schema differences, skipping for MVP unless requested
    
    print("\nMigration complete!")

if __name__ == "__main__":
    main()
