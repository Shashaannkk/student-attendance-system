from students import register_student, get_student
from attendance import mark_attendance, calculate_percentage

# Register students
sid1 = register_student("Rahul Sharma", "FYBCA")
sid2 = register_student("Aman Verma", "FYBCA")

print("Generated IDs:", sid1, sid2)

# Mark attendance
mark_attendance(sid1, "Maths", "2026-01-05", True)
mark_attendance(sid1, "Maths", "2026-01-06", False)

# Calculate percentage
print("Attendance %:", calculate_percentage(sid1, "Maths"))

# Fetch student info
print("Student Info:", get_student(sid1))
