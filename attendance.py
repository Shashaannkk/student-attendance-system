import json
from datetime import datetime
from calendar_utils import is_working_day

DATA_FILE = "data/attendance.json"

def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def mark_attendance(student_id, subject, date_str, present=True):
    """
    date_str format: YYYY-MM-DD
    """
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")

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
    data = load_data()
    subject_data = data["students"].get(student_id, {}).get(subject, {})

    if not subject_data:
        return 0.0

    total = len(subject_data)
    present = sum(1 for v in subject_data.values() if v)

    return round((present / total) * 100, 2)
