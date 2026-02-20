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
    division: str = "A"
    roll_no: int
    student_id: Optional[str] = None  # Optional, if not provided, backend generates it

class StudentRead(Student):
    pass

class AttendanceCreate(BaseModel):
    student_id: str
    subject: str
    date: date
    status: str = "P"  # "P", "A", "L"

class AttendanceRead(Attendance):
    pass

class BulkAttendanceItem(BaseModel):
    student_id: str
    status: str = "P"  # "P" = Present, "A" = Absent, "L" = Late

class BulkAttendanceCreate(BaseModel):
    class_name: str
    division: str = "A"
    subject: str
    date: date
    items: List[BulkAttendanceItem]

class ClassSeedRequest(BaseModel):
    class_name: str
    division: str = "A"

# Organization Registration Schemas
class OrganizationRegister(BaseModel):
    institution_name: str
    institution_type: str  # 'school' or 'college'
    email: str
    admin_username: str
    admin_password: str

class OrganizationResponse(BaseModel):
    org_code: str
    institution_name: str
    institution_type: str
    email: str
    admin_username: str
    message: str
