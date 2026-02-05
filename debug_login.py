"""
Debug script to check login issues
"""
from sqlmodel import Session, select, create_engine
from models import User, Organization
from auth_utils import verify_password, get_password_hash
from database import engine

def debug_login():
    print("\n" + "="*60)
    print("DEBUG: Checking Database State")
    print("="*60)
    
    with Session(engine) as session:
        # Check all organizations
        print("\n--- Organizations in Database ---")
        orgs = session.exec(select(Organization)).all()
        if not orgs:
            print("❌ NO ORGANIZATIONS FOUND!")
        for org in orgs:
            print(f"  Org Code: {org.org_code}")
            print(f"  Name: {org.institution_name}")
            print(f"  Type: {org.institution_type}")
            print(f"  Email: {org.email}")
            print()
        
        # Check all users
        print("\n--- Users in Database ---")
        users = session.exec(select(User)).all()
        if not users:
            print("❌ NO USERS FOUND!")
        for user in users:
            print(f"  Username: {user.username}")
            print(f"  Org Code: {user.org_code}")
            print(f"  Role: {user.role}")
            print(f"  Password Hash: {user.password_hash[:50]}...")
            print()
        
        # Test password verification
        if users:
            print("\n--- Password Verification Test ---")
            test_user = users[0]
            print(f"Testing user: {test_user.username}")
            
            # Ask for password to test
            test_password = input(f"Enter password to test for '{test_user.username}': ")
            
            result = verify_password(test_password, test_user.password_hash)
            if result:
                print(f"✅ Password MATCHES!")
            else:
                print(f"❌ Password DOES NOT MATCH!")
                
                # Show what the hash would be for this password
                new_hash = get_password_hash(test_password)
                print(f"\nIf we hash '{test_password}' now, we get:")
                print(f"  {new_hash[:50]}...")
                print(f"\nStored hash:")
                print(f"  {test_user.password_hash[:50]}...")
                print(f"\nThey are {'SAME' if new_hash == test_user.password_hash else 'DIFFERENT'}")

if __name__ == "__main__":
    debug_login()
