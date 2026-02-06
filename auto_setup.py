"""
Auto-setup script for creating default organization and admin user.
This runs automatically on server startup to handle database resets on free tier hosting.
"""

from sqlmodel import Session, select
from database import get_session
from models import User, Organization
from auth_utils import get_password_hash
import os

def auto_setup_default_account():
    """
    Creates a default organization and admin account if they don't exist.
    This is useful for free tier hosting where databases get reset periodically.
    """
    print("\n" + "="*60)
    print("AUTO-SETUP: Checking for default organization...")
    print("="*60)
    
    try:
        session = next(get_session())
        
        # Check if any organization exists
        existing_org = session.exec(select(Organization)).first()
        
        if existing_org:
            print("Organization already exists. Skipping auto-setup.")
            print(f"   Found: {existing_org.institution_name} ({existing_org.org_code})")
            print("="*60 + "\n")
            return
        
        # No organization exists - create default one
        print("No organizations found. Creating default setup...")
        
        # Default credentials (you can customize these)
        # Using the same format as generate_org_code: SCH-{SHORTNAME}-{6CHARS}
        DEFAULT_ORG_CODE = "SCH-DEMOIN-ABC123"  # Matches SCH-SHORTNAME-UNIQUE format
        DEFAULT_INSTITUTION = "Demo Institution"
        DEFAULT_EMAIL = "admin@demo.com"
        DEFAULT_USERNAME = "admin"
        DEFAULT_PASSWORD = "admin123"
        DEFAULT_TYPE = "school"
        
        # Create organization
        org = Organization(
            org_code=DEFAULT_ORG_CODE,
            institution_name=DEFAULT_INSTITUTION,
            institution_type=DEFAULT_TYPE,
            email=DEFAULT_EMAIL
        )
        session.add(org)
        
        # Create admin user
        admin = User(
            org_code=DEFAULT_ORG_CODE,
            username=DEFAULT_USERNAME,
            password_hash=get_password_hash(DEFAULT_PASSWORD),
            role="admin"
        )
        session.add(admin)
        
        session.commit()
        
        print("Default organization and admin created successfully!")
        print("\nDEFAULT LOGIN CREDENTIALS:")
        print("   " + "-"*37)
        print(f"   | Organization Code: {DEFAULT_ORG_CODE:<16} |")
        print(f"   | Username:          {DEFAULT_USERNAME:<16} |")
        print(f"   | Password:          {DEFAULT_PASSWORD:<16} |")
        print(f"   | Role:              admin             |")
        print("   " + "-"*37)
        print("\nIMPORTANT: Change these credentials after first login!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"Error during auto-setup: {e}")
        print("="*60 + "\n")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Can be run standalone for testing
    auto_setup_default_account()
