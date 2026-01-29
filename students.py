import json

DATA_FILE = "data/students.json"

def load_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def generate_student_id(last_id):
    return f"STU{last_id + 1:04d}"

def register_student(name, class_name):
    data = load_data()

    data["last_id"] += 1
    student_id = generate_student_id(data["last_id"])

    data["students"][student_id] = {
        "name": name,
        "class": class_name
    }

    save_data(data)
    return student_id

def get_student(student_id):
    data = load_data()
    return data["students"].get(student_id)
