from sqlmodel import Session, select
from database import engine
from models import User, Organization

def get_login_info():
    with Session(engine) as session:
        # Get all organizations
        orgs = session.exec(select(Organization)).all()
        
        if not orgs:
            print("No organizations found in database.")
            print("You need to register an organization first.")
            return
        
        print("\n" + "="*70)
        print("LOGIN CREDENTIALS")
        print("="*70 + "\n")
        
        for org in orgs:
            print(f"Institution: {org.institution_name}")
            print(f"Organization Code: {org.org_code}")
            print(f"Admin Email: {org.email}")
            print("-" * 70)
            
            # Get users for this organization
            users = session.exec(
                select(User).where(User.org_code == org.org_code)
            ).all()
            
            if users:
                print(f"\nUsers in {org.org_code}:")
                print(f"{'Username':<20} | {'Role':<10}")
                print("-" * 70)
                for user in users:
                    print(f"{user.username:<20} | {user.role:<10}")
            else:
                print(f"No users found for {org.org_code}")
            
            print("\n" + "="*70 + "\n")
        
        print("To login:")
        print("1. Use the Organization Code")
        print("2. Use the Username")
        print("3. Use the password you set during registration")
        print("4. Select the appropriate Role (admin/teacher/student)")
        print("\nNote: Passwords are hashed and cannot be displayed.")
        print("   If you forgot your password, use the reset_admin.py script.\n")

if __name__ == "__main__":
    get_login_info()

