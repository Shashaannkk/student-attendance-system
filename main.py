from attendance import mark_attendance, calculate_percentage

print(mark_attendance("STU001", "Maths", "2026-01-04", True))   # Sunday
print(mark_attendance("STU001", "Maths", "2026-01-05", True))   # Working day
print(mark_attendance("STU001", "Maths", "2026-01-06", False))  # Absent
print(mark_attendance("STU001", "Maths", "2026-01-26", True))   # Holiday

percentage = calculate_percentage("STU001", "Maths")
print("Attendance %:", percentage)
