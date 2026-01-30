import subprocess

def run_git(args):
    try:
        result = subprocess.run(["git"] + args, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error running git {' '.join(args)}: {e}\n{e.stderr}"
    except FileNotFoundError:
        return "Error: git command not found."

with open("git_info.txt", "w") as f:
    f.write("--- STATUS ---\n")
    f.write(run_git(["status"]))
    f.write("\n--- REMOTE ---\n")
    f.write(run_git(["remote", "-v"]))
