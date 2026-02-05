"""
Detailed password verification debugging
"""
from auth_utils import get_password_hash, verify_password
import bcrypt

print("="*60)
print("DETAILED PASSWORD VERIFICATION DEBUG")
print("="*60)

test_password = "admin123"

print(f"\n1. Testing with password: '{test_password}'")

# Hash the password
hashed = get_password_hash(test_password)
print(f"\n2. Generated hash: {hashed}")
print(f"   Hash length: {len(hashed)} characters")
print(f"   Hash type: {type(hashed)}")

# Try to verify
print(f"\n3. Attempting to verify...")
result = verify_password(test_password, hashed)
print(f"   Result: {result}")

if not result:
    print(f"\n4. DEBUGGING THE FAILURE:")
    
    # Manual verification
    print(f"\n   Manual bcrypt verification:")
    password_bytes = test_password.encode('utf-8')[:72]
    hashed_bytes = hashed.encode('utf-8')
    
    print(f"   - Password bytes: {password_bytes}")
    print(f"   - Hash bytes (first 60): {hashed_bytes[:60]}")
    
    try:
        manual_result = bcrypt.checkpw(password_bytes, hashed_bytes)
        print(f"   - Manual bcrypt.checkpw result: {manual_result}")
    except Exception as e:
        print(f"   - Manual bcrypt.checkpw ERROR: {e}")
    
    # Check if hash is valid bcrypt format
    print(f"\n   Checking hash format:")
    print(f"   - Starts with '$2b$': {hashed.startswith('$2b$')}")
    print(f"   - Hash structure: {hashed[:29]}...")
    
    # Try creating a fresh hash and verifying
    print(f"\n   Creating fresh hash for comparison:")
    fresh_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    print(f"   - Fresh hash: {fresh_hash}")
    fresh_verify = bcrypt.checkpw(password_bytes, fresh_hash.encode('utf-8'))
    print(f"   - Fresh verify result: {fresh_verify}")

print("\n" + "="*60)
