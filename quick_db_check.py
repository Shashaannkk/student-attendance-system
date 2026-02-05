from sqlmodel import Session, select
from models import Organization, User
from database import engine

print("=" * 60)
print("DATABASE CHECK")
print("=" * 60)

with Session(engine) as session:
    # Check organizations
    orgs = session.exec(select(Organization)).all()
    print(f"\nOrganizations: {len(orgs)}")
    for org in orgs:
        print(f"  - {org.institution_name} ({org.org_code})")
    
    # Check users
    users = session.exec(select(User)).all()
    print(f"\nUsers: {len(users)}")
    for user in users:
        print(f"  - {user.username} ({user.role}) - Org: {user.org_code}")

print("\n" + "=" * 60)
