import os
import subprocess

files = [
    "check_health.py", "debug_db.py", "verify_login_local.py", 
    "verify_login_file.py", "verify_robust.py", "test_write.py", 
    "test_demo.py", "seed_data.py", "reset_admin.py", 
    "final_seed.py", "init_admin.py", "server_debug.log",
    "server_startup.log", "server_app.log", "health.txt",
    "login_robust_log.txt", "login_test_output.txt",
    "login_verification_result.txt", "test_echo.txt",
    "test_write_verification.txt"
]

print("Starting cleanup...")
for f in files:
    try:
        if os.path.exists(f):
            os.remove(f)
            print(f"Deleted {f}")
        else:
            print(f"Skipped {f} (not found)")
    except Exception as e:
        print(f"Failed to delete {f}: {e}")

# Generate requirements.txt
print("Generating requirements.txt...")
try:
    with open("requirements.txt", "w") as f:
        subprocess.check_call([sys.executable, "-m", "pip", "freeze"], stdout=f)
    print("requirements.txt created")
except Exception as e:
    print(f"Failed to create requirements.txt: {e}")
    # Fallback try generic pip
    try:
        with open("requirements.txt", "w") as f:
            subprocess.check_call(["pip", "freeze"], stdout=f)
        print("requirements.txt created (fallback)")
    except Exception as e2:
         print(f"Failed fallback: {e2}")

import sys
# Self delete isn't reliable in windows usually while running, 
# but we can leave cleanup.py or user can delete it.
