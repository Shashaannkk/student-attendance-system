"""
Script to create a test organization and admin user directly in production database.
Run this script locally with your Render database URL to create test credentials.
"""

from sqlmodel import SQLModel, create_engine, Session, select
from models import User, Organization
from auth_utils import get_password_hash
import sys

def create_test_user(database_url: str):
    """Create a test organization and admin user in the production database."""
    
    # Create engine with production database
    engine = create_engine(database_url, echo=True)
    
    # Create tables if they don't exist
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Test credentials
        org_code = "TEST01"
        institution_name = "Test Institution"
        institution_type = "college"
        admin_username = "admin"
        admin_password = "admin123"  # Change this to whatever you want
        
        # Check if organization already exists
        org_statement = select(Organization).where(Organization.org_code == org_code)
        existing_org = session.exec(org_statement).first()
        
        if existing_org:
            print(f"❌ Organization {org_code} already exists!")
            print(f"✅ You can login with:")
            print(f"   Organization Code: {org_code}")
            print(f"   Username: {admin_username}")
            print(f"   Password: {admin_password}")
            return
        
        # Create organization
        organization = Organization(
            org_code=org_code,
            institution_name=institution_name,
            institution_type=institution_type,
            email="test@example.com"
        )
        session.add(organization)
        
        # Create admin user
        admin_user = User(
            org_code=org_code,
            username=admin_username,
            password_hash=get_password_hash(admin_password),
            role="admin"
        )
        session.add(admin_user)
        
        session.commit()
        
        print("\n" + "="*60)
        print("✅ Test user created successfully!")
        print("="*60)
        print(f"Organization Code: {org_code}")
        print(f"Institution Name: {institution_name}")
        print(f"Username: {admin_username}")
        print(f"Password: {admin_password}")
        print("="*60)
        print("\n🔑 Use these credentials to login to your production site!")
        print(f"   URL: https://shashaannkk.github.io/student-attendance-system/")
        print("="*60)

if __name__ == "__main__":
    print("\n🚀 Production User Creation Script")
    print("="*60)
    
    if len(sys.argv) > 1:
        database_url = sys.argv[1]
    else:
        print("\n📝 Please enter your Render PostgreSQL Database URL:")
        print("   (Get this from: Render Dashboard → Your Database → Connection String)")
        print("   (Use the EXTERNAL connection string)")
        print()
        database_url = input("Database URL: ").strip()
    
    if not database_url:
        print("❌ No database URL provided!")
        sys.exit(1)
    
    # Fix postgres:// to postgresql:// if needed
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    try:
        create_test_user(database_url)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. The database URL is correct")
        print("2. You have psycopg2-binary installed: pip install psycopg2-binary")
        sys.exit(1)
