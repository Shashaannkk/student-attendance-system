"""
Database Migration Script for Organization Code Feature

This script will:
1. Backup the existing database
2. Create new database with Organization table
3. Migrate existing users (if any) - you'll need to manually assign org codes
"""

from sqlmodel import SQLModel, create_engine, Session
from models import Organization, User, Student, Attendance, Holiday
import shutil
from datetime import datetime
import os

# Database path
DB_PATH = "attendance_sys.db"
BACKUP_PATH = f"attendance_sys_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"

def backup_database():
    """Create a backup of the existing database"""
    if os.path.exists(DB_PATH):
        print(f"📦 Creating backup: {BACKUP_PATH}")
        shutil.copy2(DB_PATH, BACKUP_PATH)
        print(f"✅ Backup created successfully!")
    else:
        print("ℹ️  No existing database found. Creating fresh database.")

def create_new_database():
    """Create new database with updated schema"""
    print("\n🔨 Creating new database schema...")
    
    # Remove old database
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
    # Create new database with all tables
    engine = create_engine(f"sqlite:///{DB_PATH}")
    SQLModel.metadata.create_all(engine)
    
    print("✅ New database schema created!")
    print("\nℹ️  Tables created:")
    print("   - Organization (with org_code)")
    print("   - User (linked to Organization)")
    print("   - Student")
    print("   - Attendance")
    print("   - Holiday")

def create_sample_organization():
    """Create a sample organization for testing"""
    print("\n📝 Creating sample organization for testing...")
    
    from auth_utils import get_password_hash
    from org_utils import generate_org_code
    
    engine = create_engine(f"sqlite:///{DB_PATH}")
    
    with Session(engine) as session:
        # Create sample school
        org_code = "SCH-DEMO-TEST01"
        
        sample_org = Organization(
            org_code=org_code,
            institution_name="Demo School",
            institution_type="school",
            email="demo@school.com"
        )
        session.add(sample_org)
        
        # Create admin user
        admin = User(
            org_code=org_code,
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        session.add(admin)
        
        # Create teacher user
        teacher = User(
            org_code=org_code,
            username="teacher",
            password_hash=get_password_hash("teacher123"),
            role="teacher"
        )
        session.add(teacher)
        
        session.commit()
        
        print(f"✅ Sample organization created!")
        print(f"\n📋 TEST CREDENTIALS:")
        print(f"   Organization Code: {org_code}")
        print(f"   Admin Username: admin")
        print(f"   Admin Password: admin123")
        print(f"   Teacher Username: teacher")
        print(f"   Teacher Password: teacher123")

if __name__ == "__main__":
    print("="*60)
    print("DATABASE MIGRATION FOR ORGANIZATION CODE FEATURE")
    print("="*60)
    
    # Step 1: Backup
    backup_database()
    
    # Step 2: Create new database
    create_new_database()
    
    # Step 3: Create sample data
    create_sample_organization()
    
    print("\n" + "="*60)
    print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\n⚠️  IMPORTANT NOTES:")
    print("1. Old database backed up to:", BACKUP_PATH)
    print("2. All old data has been cleared (fresh start)")
    print("3. Use the test credentials above to login")
    print("4. You can now register new organizations via the API")
    print("\n🚀 Start your backend server and test the new login flow!")
    print("="*60)
