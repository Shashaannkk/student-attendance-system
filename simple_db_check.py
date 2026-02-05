"""
Simple database check - no input required
"""
from sqlmodel import Session, select
from models import User, Organization
from database import engine

print("\n" + "="*60)
print("DATABASE STATE CHECK")
print("="*60)

with Session(engine) as session:
    # Check all organizations
    print("\n--- Organizations ---")
    orgs = session.exec(select(Organization)).all()
    if not orgs:
        print("❌ NO ORGANIZATIONS FOUND!")
    else:
        for org in orgs:
            print(f"  • {org.org_code} - {org.institution_name} ({org.institution_type})")
    
    # Check all users
    print("\n--- Users ---")
    users = session.exec(select(User)).all()
    if not users:
        print("❌ NO USERS FOUND!")
    else:
        for user in users:
            print(f"  • {user.username} @ {user.org_code} ({user.role})")
            print(f"    Hash: {user.password_hash[:60]}...")

print("\n" + "="*60)
