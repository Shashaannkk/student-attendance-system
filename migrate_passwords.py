"""
Migration script to rehash all existing passwords with the new byte-based hashing.
This is needed after fixing the password hashing to use bytes instead of strings.
"""
from sqlmodel import Session, select
from database import engine
from models import User
import bcrypt

def migrate_passwords():
    """Rehash all existing passwords to be compatible with new hashing method."""
    
    print("\n" + "="*70)
    print("PASSWORD MIGRATION SCRIPT")
    print("="*70)
    print("\nThis will reset all user passwords to a default value.")
    print("Users will need to use the password reset script to set new passwords.")
    print("\nDefault password for all users: 'admin123'")
    print("="*70)
    
    response = input("\nDo you want to proceed? (yes/no): ")
    if response.lower() != 'yes':
        print("Migration cancelled.")
        return
    
    # New default password
    default_password = "admin123"
    
    # Hash it properly with bytes
    password_bytes = default_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    new_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        
        if not users:
            print("\nNo users found in database.")
            return
        
        print(f"\nFound {len(users)} users. Updating passwords...")
        
        for user in users:
            user.password_hash = new_hash
            session.add(user)
            print(f"  ✓ Updated password for: {user.username} ({user.org_code})")
        
        session.commit()
        
        print("\n" + "="*70)
        print("✓ Migration completed successfully!")
        print("="*70)
        print("\nAll users can now login with password: 'admin123'")
        print("Please advise users to change their passwords after logging in.")
        print("="*70 + "\n")

if __name__ == "__main__":
    migrate_passwords()
