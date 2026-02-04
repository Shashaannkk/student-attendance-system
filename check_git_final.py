import subprocess

with open("git_status_final.txt", "w") as f:
    subprocess.run(["git", "status"], stdout=f, stderr=f, shell=True)
