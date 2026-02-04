import subprocess
import os

try:
    with open("git_output.txt", "w") as f:
        # Check status
        f.write("--- STATUS ---\n")
        subprocess.run(["git", "status"], stdout=f, stderr=f, shell=True)
        
        # Check remote
        f.write("\n--- REMOTE ---\n")
        subprocess.run(["git", "remote", "-v"], stdout=f, stderr=f, shell=True)
        
        # Check log
        f.write("\n--- LOG ---\n")
        subprocess.run(["git", "log", "-n", "1"], stdout=f, stderr=f, shell=True)

    print("Git check complete.")
except Exception as e:
    print(f"Error: {e}")
