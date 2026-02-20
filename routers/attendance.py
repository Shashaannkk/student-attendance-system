from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import date as dt_date, timedelta
from collections import defaultdict

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

    # Upsert: check if already marked for this date+student+subject
    statement = select(Attendance).where(
        Attendance.student_id == attendance.student_id,
        Attendance.date == attendance.date,
        Attendance.subject == attendance.subject
    )
    existing = session.exec(statement).first()

    if existing:
        existing.status = attendance.status
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    db_attendance = Attendance(
        student_id=attendance.student_id,
        subject=attendance.subject,
        date=attendance.date,
        status=attendance.status
    )
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
    for item in bulk_data.items:
        statement = select(Attendance).where(
            Attendance.student_id == item.student_id,
            Attendance.date == bulk_data.date,
            Attendance.subject == bulk_data.subject
        )
        existing = session.exec(statement).first()

        if existing:
            existing.status = item.status
            session.add(existing)
        else:
            new_record = Attendance(
                student_id=item.student_id,
                subject=bulk_data.subject,
                date=bulk_data.date,
                status=item.status
            )
            session.add(new_record)

    session.commit()
    return {"message": "Bulk attendance marked successfully"}


@router.get("/stats")
def get_attendance_stats(
    target_date: Optional[dt_date] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Return today's (or a specific date's) P/A/L counts and total students."""
    if target_date is None:
        target_date = dt_date.today()

    records = session.exec(
        select(Attendance).where(Attendance.date == target_date)
    ).all()

    present = sum(1 for r in records if r.status == "P")
    absent = sum(1 for r in records if r.status == "A")
    late = sum(1 for r in records if r.status == "L")

    total_students = session.exec(select(func.count(Student.id))).one()

    return {
        "date": str(target_date),
        "total_students": total_students,
        "present": present,
        "absent": absent,
        "late": late,
        "records_today": len(records)
    }


@router.get("/weekly")
def get_weekly_attendance(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Return attendance counts for the last 7 days."""
    today = dt_date.today()
    result = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        records = session.exec(
            select(Attendance).where(Attendance.date == day)
        ).all()
        present = sum(1 for r in records if r.status == "P")
        absent = sum(1 for r in records if r.status == "A")
        late = sum(1 for r in records if r.status == "L")
        result.append({
            "date": str(day),
            "label": day.strftime("%a"),
            "present": present,
            "absent": absent,
            "late": late,
            "total": present + absent + late
        })

    return result


@router.get("/defaulters")
def get_defaulters(
    threshold: float = 75.0,
    subject: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Return students with attendance below the threshold percentage."""
    query = select(Attendance)
    if subject:
        query = query.where(Attendance.subject == subject)

    all_records = session.exec(query).all()

    # Group by student_id + subject
    student_subject: dict = defaultdict(lambda: {"P": 0, "A": 0, "L": 0, "total": 0})
    for r in all_records:
        key = (r.student_id, r.subject)
        student_subject[key][r.status] += 1
        student_subject[key]["total"] += 1

    defaulters = []
    for (student_id, subj), counts in student_subject.items():
        if counts["total"] == 0:
            continue
        present_count = counts["P"] + counts["L"]  # Late counts as present for %
        percentage = (present_count / counts["total"]) * 100
        if percentage < threshold:
            student = session.exec(
                select(Student).where(Student.student_id == student_id)
            ).first()
            defaulters.append({
                "student_id": student_id,
                "name": student.name if student else "Unknown",
                "class_name": student.class_name if student else "",
                "division": student.division if student else "",
                "roll_no": student.roll_no if student else 0,
                "subject": subj,
                "present": counts["P"],
                "late": counts["L"],
                "absent": counts["A"],
                "total": counts["total"],
                "percentage": round(percentage, 1)
            })

    defaulters.sort(key=lambda x: x["percentage"])
    return defaulters


@router.get("/student/{student_id}", response_model=List[AttendanceRead])
def get_student_attendance(
    student_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Attendance).where(Attendance.student_id == student_id)
    results = session.exec(statement).all()
    return results


@router.get("/subjects")
def get_distinct_subjects(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Return all distinct subjects that have attendance records."""
    records = session.exec(select(Attendance.subject)).all()
    subjects = sorted(set(records))
    return subjects


@router.get("/report")
def get_attendance_report(
    start_date: Optional[dt_date] = None,
    end_date: Optional[dt_date] = None,
    subject: Optional[str] = None,
    class_name: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Filterable attendance report joined with student info."""
    today = dt_date.today()

    # Default: today
    if start_date is None and end_date is None:
        start_date = today
        end_date = today

    query = select(Attendance)

    if start_date:
        query = query.where(Attendance.date >= start_date)
    if end_date:
        query = query.where(Attendance.date <= end_date)
    if subject:
        query = query.where(Attendance.subject == subject)
    if status:
        query = query.where(Attendance.status == status)

    query = query.order_by(Attendance.date.desc()).offset(offset).limit(limit)
    records = session.exec(query).all()

    result = []
    for r in records:
        student = session.exec(
            select(Student).where(Student.student_id == r.student_id)
        ).first()

        # Filter by class_name if provided
        if class_name and (not student or student.class_name != class_name):
            continue

        result.append({
            "id": r.id,
            "student_id": r.student_id,
            "name": student.name if student else "Unknown",
            "roll_no": student.roll_no if student else 0,
            "class_name": student.class_name if student else "",
            "division": student.division if student else "",
            "subject": r.subject,
            "date": str(r.date),
            "status": r.status,
        })

    return result
