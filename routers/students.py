from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from database import get_session
from models import Student, User
from schemas import StudentCreate, StudentRead
# Import get_current_user from auth router or dependencies
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[StudentRead])
def read_students(
    class_name: Optional[str] = None, 
    offset: int = 0, 
    limit: int = 100, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Student)
    if class_name:
        query = query.where(Student.class_name == class_name)
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
        
    # Generate ID if not provided?
    # For now assume backend generation logic or user provides it.
    # Let's simple check if exists
    if not student.student_id:
        # Simple ID generation logic for prototype: find max ID
        # query = select(Student) ... this is complex to do robustly in SQLModel quickly without autoincrement int ID logic.
        # But we have 'id' (int pk) and 'student_id' (str).
        # Let's rely on user providing it or generate random.
        # Let's auto-generate STU<id> after commit? No.
        # Let's just generate a simple one based on timestamp or something for now if empty.
        import time
        student.student_id = f"STU{int(time.time())}" 
    
    db_student = Student.from_orm(student)
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

@router.get("/{student_id}", response_model=StudentRead)
def read_student(student_id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Student).where(Student.student_id == student_id)
    student = session.exec(statement).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
