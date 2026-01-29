from students import register_student, get_student
from attendance import mark_attendance, calculate_percentage

def main_menu():
    while True:
        print("\n===== Attendance System =====")
        print("1. Register Student")
        print("2. Mark Attendance")
        print("3. View Attendance Percentage")
        print("4. Exit")

        choice = input("Choose option: ")

        if choice == "1":
            name = input("Student Name: ")
            class_name = input("Class: ")
            sid = register_student(name, class_name)
            print("Student Registered. ID:", sid)

        elif choice == "2":
            sid = input("Student ID: ")
            subject = input("Subject: ")
            date = input("Date (YYYY-MM-DD): ")
            present = input("Present? (y/n): ").lower() == "y"
            print(mark_attendance(sid, subject, date, present))

        elif choice == "3":
            sid = input("Student ID: ")
            subject = input("Subject: ")
            print("Attendance %:", calculate_percentage(sid, subject))

        elif choice == "4":
            print("Exiting...")
            break

        else:
            print("Invalid choice")

if __name__ == "__main__":
    main_menu()
