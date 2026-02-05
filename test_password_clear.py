"""
Clearer password verification test
This separates correct password tests from wrong password tests
"""
from auth_utils import get_password_hash, verify_password

print("="*60)
print("PASSWORD VERIFICATION TEST")
print("="*60)

test_password = "admin123"
wrong_password = "wrong_password"

print(f"\nTest Password: '{test_password}'")
print(f"Wrong Password: '{wrong_password}'")

# Generate 3 different hashes
print("\n1. Generating 3 hashes for the same password:")
hash1 = get_password_hash(test_password)
hash2 = get_password_hash(test_password)
hash3 = get_password_hash(test_password)

print(f"   Hash 1: {hash1[:60]}...")
print(f"   Hash 2: {hash2[:60]}...")
print(f"   Hash 3: {hash3[:60]}...")

# Test CORRECT password verification
print("\n2. Testing CORRECT password verification:")
result1 = verify_password(test_password, hash1)
result2 = verify_password(test_password, hash2)
result3 = verify_password(test_password, hash3)

print(f"   ✓ Correct password vs Hash 1: {result1} {'✅' if result1 else '❌ FAILED'}")
print(f"   ✓ Correct password vs Hash 2: {result2} {'✅' if result2 else '❌ FAILED'}")
print(f"   ✓ Correct password vs Hash 3: {result3} {'✅' if result3 else '❌ FAILED'}")

all_correct = result1 and result2 and result3
print(f"\n   All correct password tests passed: {all_correct} {'✅' if all_correct else '❌ PROBLEM!'}")

# Test WRONG password verification
print("\n3. Testing WRONG password verification (should be False):")
wrong_result = verify_password(wrong_password, hash1)
print(f"   ✓ Wrong password vs Hash 1: {wrong_result} {'❌ PROBLEM!' if wrong_result else '✅ Correctly rejected'}")

print("\n" + "="*60)
if all_correct and not wrong_result:
    print("✅ ALL TESTS PASSED - Password verification is working correctly!")
else:
    print("❌ TESTS FAILED - There is a problem with password verification")
print("="*60)
