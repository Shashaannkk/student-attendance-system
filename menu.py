from students import register_student, get_student, get_students_by_class, get_all_students, get_all_classes
from attendance import mark_attendance, calculate_percentage, mark_bulk_attendance, get_student_attendance
from auth import login, register_user, is_admin, get_all_users
from calendar_utils import list_holidays
from reports import print_student_report, print_class_report, export_class_report_csv, export_student_report_csv
from validators import (
    ValidationError, validate_date, validate_student_id, validate_name,
    validate_class_name, validate_subject, validate_roll_number,
    validate_password, validate_role
)
from datetime import date

# Current logged-in user
current_user = None

def login_menu():
    """Handle login/authentication."""
    global current_user
    
    print("\n===== Student Attendance System =====")
    print("Please login to continue\n")
    
    while True:
        username = input("Username: ")
        password = input("Password: ")
        
        user, message = login(username, password)
        
        if user:
            current_user = user
            print(f"\n✓ {message}! Welcome, {user['username']} ({user['role']})")
            return True
        else:
            print(f"✗ {message}")
            retry = input("Try again? (y/n): ").lower()
            if retry != 'y':
                return False

def user_management_menu():
    """Admin-only: Manage users."""
    if not is_admin(current_user):
        print("Access denied. Admin only.")
        return
    
    while True:
        print("\n===== User Management =====")
        print("1. Register New User")
        print("2. View All Users")
        print("3. Back to Main Menu")
        
        choice = input("Choose option: ")
        
        if choice == "1":
            try:
                username = input("New Username: ")
                username = validate_name(username, "Username")
                password = input("Password: ")
                password = validate_password(password)
                role = input("Role (teacher/admin): ")
                role = validate_role(role)
                
                user, message = register_user(username, password, role)
                if user:
                    print(f"✓ {message}")
                else:
                    print(f"✗ {message}")
            except ValidationError as e:
                print(f"✗ {e}")
        
        elif choice == "2":
            users = get_all_users()
            print("\n--- All Users ---")
            for username, role in users.items():
                print(f"  {username}: {role}")
        
        elif choice == "3":
            break
        
        else:
            print("Invalid choice")

def list_students_menu():
    """List all students by class."""
    print("\n===== Student List =====")
    
    all_students = get_all_students()
    
    if not all_students:
        print("No students registered.")
        return
    
    for class_name, students in all_students.items():
        print(f"\n--- {class_name} ({len(students)} students) ---")
        print(f"{'Roll':<6} {'ID':<10} {'Name':<20}")
        print("-" * 36)
        for sid, info in students:
            roll = info.get('roll_no', '-')
            print(f"{roll:<6} {sid:<10} {info['name']:<20}")

def get_today_date():
    """Get today's date in DD-MM-YYYY format."""
    return date.today().strftime("%d-%m-%Y")

def bulk_attendance_menu():
    """Mark attendance for entire class at once."""
    print("\n===== Bulk Attendance =====")
    
    # Show available classes
    classes = get_all_classes()
    if not classes:
        print("No students registered.")
        return
    
    print("Available classes:", ", ".join(classes))
    class_name = input("Enter Class: ").strip()
    
    if class_name not in classes:
        print(f"✗ Class '{class_name}' not found.")
        return
    
    subject = input("Subject: ")
    try:
        subject = validate_subject(subject)
    except ValidationError as e:
        print(f"✗ {e}")
        return
    
    date_str = input(f"Date (DD-MM-YYYY) [Today: {get_today_date()}]: ").strip()
    
    if not date_str:
        date_str = get_today_date()
    else:
        try:
            validate_date(date_str)
        except ValidationError as e:
            print(f"✗ {e}")
            return
    
    # Get students in class
    students = get_students_by_class(class_name)
    
    if not students:
        print("No students in this class.")
        return
    
    print(f"\nMarking attendance for {class_name} - {subject} - {date_str}")
    print("-" * 50)
    
    attendance_list = []
    
    for sid, info in students:
        roll = info.get('roll_no', '?')
        name = info['name']
        present_input = input(f"Roll {roll}: {name:<20} (y/n/a=absent all after): ").lower()
        
        if present_input == 'a':
            # Mark remaining as absent
            attendance_list.append((sid, False))
            for remaining_sid, remaining_info in students[students.index((sid, info)) + 1:]:
                attendance_list.append((remaining_sid, False))
            break
        else:
            present = present_input == 'y'
            attendance_list.append((sid, present))
    
    # Mark bulk attendance
    marked, skipped, message = mark_bulk_attendance(attendance_list, subject, date_str)
    
    if marked > 0:
        present_count = sum(1 for _, p in attendance_list if p)
        absent_count = len(attendance_list) - present_count
        print(f"\n✓ Attendance marked for {marked} students")
        print(f"   Present: {present_count}, Absent: {absent_count}")
    else:
        print(f"\n✗ {message}")

def reports_menu():
    """Generate and export attendance reports."""
    while True:
        print("\n===== Reports =====")
        print("1. Student Report (View)")
        print("2. Student Report (Export CSV)")
        print("3. Class Report (View)")
        print("4. Class Report (Export CSV)")
        print("5. Back to Main Menu")
        
        choice = input("Choose option: ")
        
        if choice == "1":
            sid = input("Student ID: ").strip().upper()
            print_student_report(sid)
        
        elif choice == "2":
            sid = input("Student ID: ").strip().upper()
            filepath, message = export_student_report_csv(sid)
            if filepath:
                print(f"✓ {message}")
            else:
                print(f"✗ {message}")
        
        elif choice == "3":
            classes = get_all_classes()
            if not classes:
                print("No classes found.")
                continue
            print("Available classes:", ", ".join(classes))
            class_name = input("Enter Class: ").strip()
            subject = input("Subject (leave blank for overall): ").strip() or None
            print_class_report(class_name, subject)
        
        elif choice == "4":
            classes = get_all_classes()
            if not classes:
                print("No classes found.")
                continue
            print("Available classes:", ", ".join(classes))
            class_name = input("Enter Class: ").strip()
            subject = input("Subject (leave blank for overall): ").strip() or None
            filepath, message = export_class_report_csv(class_name, subject)
            if filepath:
                print(f"✓ {message}")
            else:
                print(f"✗ {message}")
        
        elif choice == "5":
            break
        
        else:
            print("Invalid choice")

def main_menu():
    """Main application menu."""
    global current_user
    
    # Require login first
    if not login_menu():
        print("Exiting...")
        return
    
    while True:
        print(f"\n===== Attendance System ({current_user['username']}) =====")
        print("1. Register Student")
        print("2. Mark Attendance (Single)")
        print("3. Bulk Attendance (Class)")
        print("4. View Attendance Percentage")
        print("5. List Students")
        print("6. View Holidays")
        print("7. Reports")
        if is_admin(current_user):
            print("8. User Management (Admin)")
        print("9. Logout")
        print("0. Exit")

        choice = input("Choose option: ")

        if choice == "1":
            try:
                name = input("Student Name: ")
                name = validate_name(name, "Student Name")
                class_name = input("Class: ")
                class_name = validate_class_name(class_name)
                roll_no = input("Roll Number: ")
                roll_no = validate_roll_number(roll_no)
                
                sid = register_student(name, class_name, roll_no)
                print(f"✓ Student Registered. ID: {sid}, Roll: {roll_no}")
            except ValidationError as e:
                print(f"✗ {e}")

        elif choice == "2":
            sid = input("Student ID: ").strip().upper()
            
            # Show student name for confirmation
            student = get_student(sid)
            if not student:
                print(f"✗ Student '{sid}' not found.")
                continue
            
            print(f"  → Student: {student['name']} (Class: {student['class']}, Roll: {student.get('roll_no', '-')})")
            
            try:
                subject = input("Subject: ")
                subject = validate_subject(subject)
                date_input = input(f"Date (DD-MM-YYYY) [Today: {get_today_date()}]: ").strip()
                if not date_input:
                    date_input = get_today_date()
                else:
                    validate_date(date_input)
                present = input("Present? (y/n): ").lower() == "y"
                result = mark_attendance(sid, subject, date_input, present)
                print(f"✓ {result}")
            except ValidationError as e:
                print(f"✗ {e}")

        elif choice == "3":
            bulk_attendance_menu()

        elif choice == "4":
            sid = input("Student ID: ").strip().upper()
            
            # Show student name for confirmation
            student = get_student(sid)
            if not student:
                print(f"✗ Student '{sid}' not found.")
                continue
            
            print(f"  → Student: {student['name']} (Class: {student['class']}, Roll: {student.get('roll_no', '-')})")
            
            subject = input("Subject: ")
            percentage = calculate_percentage(sid, subject)
            
            # Show detailed attendance
            attendance = get_student_attendance(sid, subject)
            if attendance:
                present_count = sum(1 for v in attendance.values() if v)
                total_count = len(attendance)
                print(f"\nAttendance: {percentage}% ({present_count}/{total_count} days)")
            else:
                print(f"\nNo attendance records for {subject}")

        elif choice == "5":
            list_students_menu()

        elif choice == "6":
            list_holidays()

        elif choice == "7":
            reports_menu()

        elif choice == "8" and is_admin(current_user):
            user_management_menu()
        
        elif choice == "9":
            print("Logging out...")
            current_user = None
            if not login_menu():
                print("Exiting...")
                break

        elif choice == "0":
            print("Exiting...")
            break

        else:
            print("Invalid choice")

if __name__ == "__main__":
    main_menu()
