from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import Attendance, User, Student
from schemas import AttendanceCreate, AttendanceRead, BulkAttendanceCreate
from routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=AttendanceRead)
def mark_attendance(
    attendance: AttendanceCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Verify student exists
    statement = select(Student).where(Student.student_id == attendance.student_id)
    student = session.exec(statement).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if already marked?
    # For simplicity, allow key-value overwrite logic if we want, or create new record.
    # Let's check if exists for that day+student+subject
    statement = select(Attendance).where(
        Attendance.student_id == attendance.student_id,
        Attendance.date == attendance.date,
        Attendance.subject == attendance.subject
    )
    existing = session.exec(statement).first()
    
    if existing:
        existing.present = attendance.present
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    
    db_attendance = Attendance.from_orm(attendance)
    session.add(db_attendance)
    session.commit()
    session.refresh(db_attendance)
    return db_attendance

@router.post("/bulk")
def mark_bulk_attendance(
    bulk_data: BulkAttendanceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    results = []
    
    for item in bulk_data.items:
        # Check if student in class? (Optional validation)
        
        # Upsert logic
        statement = select(Attendance).where(
            Attendance.student_id == item.student_id,
            Attendance.date == bulk_data.date,
            Attendance.subject == bulk_data.subject
        )
        existing = session.exec(statement).first()
        
        if existing:
            existing.present = item.present
            session.add(existing)
        else:
            new_record = Attendance(
                student_id=item.student_id,
                subject=bulk_data.subject,
                date=bulk_data.date,
                present=item.present
            )
            session.add(new_record)
        
    session.commit()
    return {"message": "Bulk attendance marked successfully"}

@router.get("/student/{student_id}", response_model=List[AttendanceRead])
def get_student_attendance(
    student_id: str, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Attendance).where(Attendance.student_id == student_id)
    results = session.exec(statement).all()
    return results
