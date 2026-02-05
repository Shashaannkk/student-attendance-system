"""
Test password hashing and verification
This will help us understand if the issue is with password hashing
"""
from auth_utils import get_password_hash, verify_password

print("="*60)
print("PASSWORD HASHING TEST")
print("="*60)

# Test with a sample password
test_password = "admin123"

print(f"\nTest Password: '{test_password}'")
print("\n1. Hashing the password 3 times:")

hash1 = get_password_hash(test_password)
hash2 = get_password_hash(test_password)
hash3 = get_password_hash(test_password)

print(f"   Hash 1: {hash1[:60]}...")
print(f"   Hash 2: {hash2[:60]}...")
print(f"   Hash 3: {hash3[:60]}...")

print(f"\n2. Are all hashes different? {hash1 != hash2 != hash3} (This is NORMAL for bcrypt)")

print(f"\n3. Testing verification against Hash 1:")
print(f"   verify_password('{test_password}', hash1) = {verify_password(test_password, hash1)}")
print(f"   verify_password('wrong_password', hash1) = {verify_password('wrong_password', hash1)}")

print(f"\n4. Testing verification against Hash 2:")
print(f"   verify_password('{test_password}', hash2) = {verify_password(test_password, hash2)}")

print(f"\n5. Testing verification against Hash 3:")
print(f"   verify_password('{test_password}', hash3) = {verify_password(test_password, hash3)}")

print("\n" + "="*60)
print("✅ If all verifications return True, password hashing is working correctly")
print("="*60)
