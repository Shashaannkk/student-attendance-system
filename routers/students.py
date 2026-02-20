from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from database import get_session
from models import Student, User
from schemas import StudentCreate, StudentRead, ClassSeedRequest
from routers.auth import get_current_user

router = APIRouter()

# 40 Real Indian student names for seeding
SEED_NAMES = [
    "Aarav Sharma", "Aditya Kumar", "Akash Patel", "Ananya Singh", "Arjun Verma",
    "Aryan Gupta", "Ayesha Khan", "Bhavesh Joshi", "Chirag Desai", "Deepak Mehta",
    "Divya Nair", "Farhan Shaikh", "Gaurav Yadav", "Harshita Tiwari", "Ishaan Malhotra",
    "Janhavi Patil", "Jay Kapoor", "Kabir Reddy", "Kavya Iyer", "Kiran Bhatt",
    "Komal Pandey", "Lakshmi Pillai", "Manish Rathore", "Meera Chatterjee", "Mihir Shah",
    "Neha Jain", "Nikita Srivastava", "Om Kulkarni", "Pooja Mishra", "Pranav Dubey",
    "Priya Bansal", "Rahul Saxena", "Riya Choudhary", "Rohit Rao", "Sakshi Agarwal",
    "Sanjay Tripathi", "Sneha Goswami", "Suraj Bose", "Tanvi Shukla", "Vishal Thakur"
]


@router.get("/", response_model=List[StudentRead])
def read_students(
    class_name: Optional[str] = None,
    division: Optional[str] = None,
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Student)
    if class_name:
        query = query.where(Student.class_name == class_name)
    if division:
        query = query.where(Student.division == division)
    query = query.offset(offset).limit(limit)
    students = session.exec(query).all()
    return students


@router.post("/", response_model=StudentRead)
def create_student(
    student: StudentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")

    if not student.student_id:
        import time
        student.student_id = f"STU{int(time.time())}"

    existing = session.exec(select(Student).where(Student.student_id == student.student_id)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student ID '{student.student_id}' already exists")

    db_student = Student.from_orm(student)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student


# !! IMPORTANT: This route MUST be defined BEFORE GET /{student_id}
# Otherwise FastAPI matches "seed-class" as a student_id and returns 405
@router.post("/seed-class", response_model=List[StudentRead])
def seed_class_students(
    seed_req: ClassSeedRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Seed 40 real named students for a given class + division.
    Allowed for both admins and teachers (needed for attendance flow).
    """

    class_name = seed_req.class_name.strip().upper()
    division = seed_req.division.strip().upper()

    # Remove existing students for this class+division to avoid duplicates
    existing = session.exec(
        select(Student).where(Student.class_name == class_name, Student.division == division)
    ).all()
    for s in existing:
        session.delete(s)
    session.commit()

    created = []
    for i, name in enumerate(SEED_NAMES, start=1):
        prefix = f"{class_name}{division}"
        student_id = f"{prefix}{i:03d}"
        db_student = Student(
            student_id=student_id,
            name=name,
            class_name=class_name,
            division=division,
            roll_no=i
        )
        session.add(db_student)
        created.append(db_student)

    session.commit()
    for s in created:
        session.refresh(s)

    return created


# !! This catch-all route must always be LAST in the file
@router.get("/{student_id}", response_model=StudentRead)
def read_student(
    student_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Student).where(Student.student_id == student_id)
    student = session.exec(statement).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
