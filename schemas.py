from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from models import Student, Attendance

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class StudentCreate(BaseModel):
    name: str
    class_name: str
    roll_no: int
    student_id: Optional[str] = None # Optional, if not provided, backend generates it

class StudentRead(Student):
    pass

class AttendanceCreate(BaseModel):
    student_id: str
    subject: str
    date: date
    present: bool

class AttendanceRead(Attendance):
    pass

class BulkAttendanceItem(BaseModel):
    student_id: str
    present: bool

class BulkAttendanceCreate(BaseModel):
    class_name: str
    subject: str
    date: date
    items: List[BulkAttendanceItem]
