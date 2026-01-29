import json
from datetime import datetime
from calendar_utils import is_working_day

DATA_FILE = "data/attendance.json"

# Date format: DD-MM-YYYY
DATE_FORMAT = "%d-%m-%Y"

def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def parse_date(date_str):
    """Parse date from DD-MM-YYYY format."""
    return datetime.strptime(date_str, DATE_FORMAT)

def format_date(date_obj):
    """Format date to DD-MM-YYYY."""
    return date_obj.strftime(DATE_FORMAT)

def mark_attendance(student_id, subject, date_str, present=True):
    """
    Mark attendance for a student.
    date_str format: DD-MM-YYYY
    Subject names and student IDs are case-insensitive (normalized to uppercase)
    """
    # Normalize inputs to uppercase
    student_id = student_id.strip().upper()
    subject = subject.strip().upper()
    
    try:
        date_obj = parse_date(date_str)
    except ValueError:
        return "Invalid date format. Use DD-MM-YYYY"

    if not is_working_day(date_obj):
        return "Not a working day"

    data = load_data()

    students = data["students"]
    students.setdefault(student_id, {})
    students[student_id].setdefault(subject, {})
    students[student_id][subject][date_str] = present

    save_data(data)
    return "Attendance marked"

def calculate_percentage(student_id, subject):
    """Calculate attendance percentage for a student in a subject."""
    # Normalize inputs to uppercase
    student_id = student_id.strip().upper()
    subject = subject.strip().upper()
    
    data = load_data()
    subject_data = data["students"].get(student_id, {}).get(subject, {})

    if not subject_data:
        return 0.0

    total = len(subject_data)
    present = sum(1 for v in subject_data.values() if v)

    return round((present / total) * 100, 2)

def get_student_attendance(student_id, subject=None):
    """
    Get attendance records for a student.
    If subject is provided, returns only that subject's attendance.
    """
    # Normalize student_id to uppercase
    student_id = student_id.strip().upper()
    
    data = load_data()
    student_data = data["students"].get(student_id, {})
    
    if subject:
        # Normalize subject to uppercase
        subject = subject.strip().upper()
        return student_data.get(subject, {})
    return student_data

def mark_bulk_attendance(attendance_list, subject, date_str):
    """
    Mark attendance for multiple students at once.
    attendance_list: list of (student_id, present_bool)
    date_str format: DD-MM-YYYY
    Returns: count of marked, count of skipped, message
    """
    # Normalize subject to uppercase
    subject = subject.strip().upper()
    
    try:
        date_obj = parse_date(date_str)
    except ValueError:
        return 0, len(attendance_list), "Invalid date format. Use DD-MM-YYYY"
    
    if not is_working_day(date_obj):
        return 0, len(attendance_list), "Not a working day"
    
    data = load_data()
    students = data["students"]
    marked = 0
    
    for student_id, present in attendance_list:
        students.setdefault(student_id, {})
        students[student_id].setdefault(subject, {})
        students[student_id][subject][date_str] = present
        marked += 1
    
    save_data(data)
    return marked, 0, "Success"
