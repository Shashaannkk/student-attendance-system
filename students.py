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

def normalize_name(name):
    """Normalize name to Title Case."""
    return name.strip().title()

def normalize_class(class_name):
    """Normalize class name to UPPERCASE."""
    return class_name.strip().upper()

def normalize_student_id(student_id):
    """Normalize student ID to UPPERCASE."""
    return student_id.strip().upper()

def register_student(name, class_name, roll_no):
    """
    Register a new student with roll number.
    Names are stored in Title Case, Class in UPPERCASE.
    Returns: student_id
    """
    data = load_data()

    # Normalize inputs
    name = normalize_name(name)
    class_name = normalize_class(class_name)

    data["last_id"] += 1
    student_id = generate_student_id(data["last_id"])

    data["students"][student_id] = {
        "name": name,
        "class": class_name,
        "roll_no": roll_no
    }

    save_data(data)
    return student_id

def get_student(student_id):
    """Get student by ID (case-insensitive)."""
    student_id = normalize_student_id(student_id)
    data = load_data()
    return data["students"].get(student_id)

def get_students_by_class(class_name):
    """
    Get all students in a class, sorted by roll number.
    Class name is case-insensitive.
    Returns: list of (student_id, student_info) tuples
    """
    class_name = normalize_class(class_name)
    data = load_data()
    students = []
    
    for sid, info in data["students"].items():
        if info.get("class") == class_name:
            students.append((sid, info))
    
    # Sort by roll number
    students.sort(key=lambda x: x[1].get("roll_no", 999))
    return students

def get_all_students():
    """
    Get all students grouped by class.
    Returns: dict {class_name: [(student_id, student_info), ...]}
    """
    data = load_data()
    by_class = {}
    
    for sid, info in data["students"].items():
        class_name = info.get("class", "UNKNOWN")
        if class_name not in by_class:
            by_class[class_name] = []
        by_class[class_name].append((sid, info))
    
    # Sort each class by roll number
    for class_name in by_class:
        by_class[class_name].sort(key=lambda x: x[1].get("roll_no", 999))
    
    return by_class

def get_all_classes():
    """Get list of all unique class names."""
    data = load_data()
    classes = set()
    for info in data["students"].values():
        classes.add(info.get("class", "UNKNOWN"))
    return sorted(list(classes))

def find_student_by_roll(class_name, roll_no):
    """Find student by class and roll number."""
    students = get_students_by_class(class_name)
    for sid, info in students:
        if info.get("roll_no") == roll_no:
            return sid, info
    return None, None
