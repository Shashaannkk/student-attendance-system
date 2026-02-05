"""
Test script to verify profile picture upload functionality.
Run this after starting the server to test the upload endpoint directly.
"""

import requests
import os
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
ORG_CODE = "TSEC01"  # Update with your org code
USERNAME = "admin"   # Update with your username
PASSWORD = "admin123"  # Update with your password

def test_upload():
    print("="*60)
    print("🧪 TESTING PROFILE PICTURE UPLOAD")
    print("="*60)
    
    # Step 1: Login to get token
    print("\n1️⃣ Logging in...")
    login_data = {
        "org_code": ORG_CODE,
        "username": USERNAME,
        "password": PASSWORD
    }
    
    response = requests.post(f"{API_URL}/token", data=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return
    
    token = response.json()["access_token"]
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    # Step 2: Create a test image
    print("\n2️⃣ Creating test image...")
    test_image_path = Path("test_profile.jpg")
    
    # Create a small test image (1x1 pixel JPEG)
    # This is a valid minimal JPEG file
    jpeg_data = bytes.fromhex(
        "FFD8FFE000104A46494600010100000100010000FFDB004300080606070605080707"
        "07090909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C23"
        "1C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C18"
        "0D0D1832211C213232323232323232323232323232323232323232323232323232323"
        "2323232323232323232323232323232323232323232323232FFC00011080001000103"
        "012200021101031101FFC4001500010100000000000000000000000000000000FFC40"
        "014100100000000000000000000000000000000FFDA000C03010002110311003F00BF"
        "800FFFD9"
    )
    
    with open(test_image_path, "wb") as f:
        f.write(jpeg_data)
    print(f"✅ Test image created: {test_image_path}")
    
    # Step 3: Upload the image
    print("\n3️⃣ Uploading profile picture...")
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(test_image_path, "rb") as f:
        files = {"file": ("test_profile.jpg", f, "image/jpeg")}
        response = requests.post(
            f"{API_URL}/users/me/profile-picture",
            headers=headers,
            files=files
        )
    
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Upload successful!")
        print(f"Profile picture URL: {data['profile_picture_url']}")
        
        # Step 4: Verify the file exists
        print("\n4️⃣ Verifying file was saved...")
        uploaded_file = Path("uploads") / data['profile_picture_url'].split('/')[-1]
        if uploaded_file.exists():
            print(f"✅ File exists: {uploaded_file}")
            print(f"File size: {uploaded_file.stat().st_size} bytes")
        else:
            print(f"❌ File not found: {uploaded_file}")
    else:
        print(f"❌ Upload failed!")
        print(f"Error: {response.text}")
    
    # Cleanup
    print("\n5️⃣ Cleaning up test file...")
    if test_image_path.exists():
        test_image_path.unlink()
        print(f"✅ Test file deleted")
    
    print("\n" + "="*60)
    print("🏁 TEST COMPLETED")
    print("="*60)

if __name__ == "__main__":
    test_upload()
