"""
Complete login flow test
This simulates the exact flow: register -> login -> login again
"""
from sqlmodel import Session, select
from models import Organization, User
from database import engine
from auth_utils import get_password_hash, verify_password
import sys

print("="*60)
print("COMPLETE LOGIN FLOW TEST")
print("="*60)

# Test credentials
TEST_ORG_CODE = "TEST-LOGIN-001"
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"

with Session(engine) as session:
    # Clean up any existing test data
    print("\n1. Cleaning up old test data...")
    old_org = session.exec(select(Organization).where(Organization.org_code == TEST_ORG_CODE)).first()
    if old_org:
        # Delete users first
        old_users = session.exec(select(User).where(User.org_code == TEST_ORG_CODE)).all()
        for user in old_users:
            session.delete(user)
        session.delete(old_org)
        session.commit()
        print("   ✓ Cleaned up old test data")
    
    # Step 1: Create organization (simulating registration)
    print(f"\n2. Creating test organization: {TEST_ORG_CODE}")
    test_org = Organization(
        org_code=TEST_ORG_CODE,
        institution_name="Test Institution",
        institution_type="school",
        email="test@example.com"
    )
    session.add(test_org)
    session.commit()
    print("   ✓ Organization created")
    
    # Step 2: Create user (simulating registration)
    print(f"\n3. Creating test user: {TEST_USERNAME}")
    password_hash = get_password_hash(TEST_PASSWORD)
    print(f"   Password hash: {password_hash[:60]}...")
    
    test_user = User(
        org_code=TEST_ORG_CODE,
        username=TEST_USERNAME,
        password_hash=password_hash,
        role="admin"
    )
    session.add(test_user)
    session.commit()
    session.refresh(test_user)
    print(f"   ✓ User created with ID: {test_user.id}")
    print(f"   Stored hash: {test_user.password_hash[:60]}...")
    
    # Step 3: First login attempt (simulating immediate login after registration)
    print(f"\n4. FIRST LOGIN ATTEMPT (immediate after registration)")
    user_lookup = session.exec(
        select(User).where(
            User.org_code == TEST_ORG_CODE,
            User.username == TEST_USERNAME
        )
    ).first()
    
    if not user_lookup:
        print("   ❌ ERROR: User not found!")
        sys.exit(1)
    
    print(f"   ✓ User found: {user_lookup.username}")
    print(f"   Retrieved hash: {user_lookup.password_hash[:60]}...")
    
    password_valid = verify_password(TEST_PASSWORD, user_lookup.password_hash)
    if password_valid:
        print(f"   ✅ Password verification PASSED")
    else:
        print(f"   ❌ Password verification FAILED")
        sys.exit(1)

# Create a NEW session (simulating a second login attempt later)
print(f"\n5. SECOND LOGIN ATTEMPT (new session, simulating later login)")
with Session(engine) as session2:
    user_lookup2 = session2.exec(
        select(User).where(
            User.org_code == TEST_ORG_CODE,
            User.username == TEST_USERNAME
        )
    ).first()
    
    if not user_lookup2:
        print("   ❌ ERROR: User not found in second session!")
        sys.exit(1)
    
    print(f"   ✓ User found: {user_lookup2.username}")
    print(f"   Retrieved hash: {user_lookup2.password_hash[:60]}...")
    
    password_valid2 = verify_password(TEST_PASSWORD, user_lookup2.password_hash)
    if password_valid2:
        print(f"   ✅ Password verification PASSED")
    else:
        print(f"   ❌ Password verification FAILED")
        print(f"\n   DEBUGGING INFO:")
        print(f"   - Password being tested: '{TEST_PASSWORD}'")
        print(f"   - Hash in database: {user_lookup2.password_hash}")
        
        # Test if we can hash and verify in one go
        test_hash = get_password_hash(TEST_PASSWORD)
        test_verify = verify_password(TEST_PASSWORD, test_hash)
        print(f"   - Fresh hash/verify test: {test_verify}")
        sys.exit(1)

print("\n" + "="*60)
print("✅ ALL TESTS PASSED - Login flow is working correctly!")
print("="*60)

# Cleanup
print("\n6. Cleaning up test data...")
with Session(engine) as session:
    test_org = session.exec(select(Organization).where(Organization.org_code == TEST_ORG_CODE)).first()
    if test_org:
        test_users = session.exec(select(User).where(User.org_code == TEST_ORG_CODE)).all()
        for user in test_users:
            session.delete(user)
        session.delete(test_org)
        session.commit()
        print("   ✓ Test data cleaned up")
