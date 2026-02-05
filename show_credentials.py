"""Quick script to show login credentials"""
from sqlmodel import Session, select
from database import engine
from models import User, Organization

with Session(engine) as session:
    orgs = session.exec(select(Organization)).all()
    
    if not orgs:
        print("❌ No organizations found!")
        print("You need to register first at: http://localhost:5173/#/register")
    else:
        print("\n" + "="*60)
        print("🔑 YOUR LOGIN CREDENTIALS")
        print("="*60 + "\n")
        
        for org in orgs:
            print(f"📋 Organization: {org.institution_name}")
            print(f"🔢 Org Code: {org.org_code}")
            print(f"📧 Email: {org.email}")
            print()
            
            users = session.exec(select(User).where(User.org_code == org.org_code)).all()
            
            if users:
                print("👥 Users:")
                for user in users:
                    print(f"   • Username: {user.username} | Role: {user.role}")
            
            print("\n" + "-"*60 + "\n")
        
        print("🔐 To Login:")
        print("1. Go to: http://localhost:5173")
        print("2. Enter your Org Code")
        print("3. Enter your Username")
        print("4. Enter your Password (set during registration)")
        print("\n⚠️  Note: Passwords are encrypted and can't be displayed.")
        print("   Common passwords: admin123, test123")
        print("="*60 + "\n")
