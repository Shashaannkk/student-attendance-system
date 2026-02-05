import subprocess

with open("fix_verification.txt", "w") as f:
    f.write("--- GIT LOG ---\n")
    subprocess.run(["git", "log", "-n", "1"], stdout=f, stderr=f, shell=True)
    f.write("\n\n--- GIT STATUS ---\n")
    subprocess.run(["git", "status"], stdout=f, stderr=f, shell=True)
