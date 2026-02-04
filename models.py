from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date as dt_date, datetime

class Organization(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_code: str = Field(index=True, unique=True)  # SCH-STMARY-ABC123 or CLG-MITENG-XYZ789
    institution_name: str  # Full name: "St. Mary's School"
    institution_type: str  # 'school' or 'college'
    email: str = Field(unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_code: str = Field(foreign_key="organization.org_code", index=True)  # Links user to organization
    username: str = Field(index=True)
    password_hash: str
    role: str  # 'admin' or 'teacher'
    
    # Note: username is unique per organization, not globally
    # Composite unique constraint: (org_code, username) would be ideal

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(index=True, unique=True) # STU0001
    name: str
    class_name: str = Field(index=True)
    roll_no: int

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: str = Field(foreign_key="student.student_id", index=True)
    subject: str = Field(index=True)
    date: dt_date
    present: bool
    
    # Composite unique constraint could be nice, but simple fields for now

class Holiday(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt_date = Field(unique=True)
    name: str
    holiday_type: str # 'national' or 'gazetted'
