from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date as dt_date, datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    role: str  # 'admin' or 'teacher'

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
