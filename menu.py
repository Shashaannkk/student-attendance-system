from students import register_student, get_student
from attendance import mark_attendance, calculate_percentage
from auth import login, register_user, is_admin, get_all_users

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
            username = input("New Username: ")
            password = input("Password: ")
            role = input("Role (teacher/admin): ").lower()
            
            user, message = register_user(username, password, role)
            if user:
                print(f"✓ {message}")
            else:
                print(f"✗ {message}")
        
        elif choice == "2":
            users = get_all_users()
            print("\n--- All Users ---")
            for username, role in users.items():
                print(f"  {username}: {role}")
        
        elif choice == "3":
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
        print("2. Mark Attendance")
        print("3. View Attendance Percentage")
        if is_admin(current_user):
            print("4. User Management (Admin)")
        print("5. Logout")
        print("6. Exit")

        choice = input("Choose option: ")

        if choice == "1":
            name = input("Student Name: ")
            class_name = input("Class: ")
            sid = register_student(name, class_name)
            print("✓ Student Registered. ID:", sid)

        elif choice == "2":
            sid = input("Student ID: ")
            subject = input("Subject: ")
            date = input("Date (YYYY-MM-DD): ")
            present = input("Present? (y/n): ").lower() == "y"
            result = mark_attendance(sid, subject, date, present)
            print(f"✓ {result}")

        elif choice == "3":
            sid = input("Student ID: ")
            subject = input("Subject: ")
            percentage = calculate_percentage(sid, subject)
            print(f"Attendance: {percentage}%")

        elif choice == "4" and is_admin(current_user):
            user_management_menu()
        
        elif choice == "5":
            print("Logging out...")
            current_user = None
            if not login_menu():
                print("Exiting...")
                break

        elif choice == "6":
            print("Exiting...")
            break

        else:
            print("Invalid choice")

if __name__ == "__main__":
    main_menu()
