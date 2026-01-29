"""
Data Validation Module
Provides validation functions for user inputs.
"""

import re
from datetime import datetime

DATE_FORMAT = "%d-%m-%Y"

class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass

def validate_date(date_str, allow_empty=False):
    """
    Validate date string in DD-MM-YYYY format.
    Returns parsed date object if valid.
    Raises ValidationError if invalid.
    """
    if not date_str or date_str.strip() == "":
        if allow_empty:
            return None
        raise ValidationError("Date cannot be empty")
    
    date_str = date_str.strip()
    
    # Check format with regex first
    pattern = r"^\d{2}-\d{2}-\d{4}$"
    if not re.match(pattern, date_str):
        raise ValidationError(f"Invalid date format. Use DD-MM-YYYY (e.g., 29-01-2026)")
    
    try:
        date_obj = datetime.strptime(date_str, DATE_FORMAT)
        
        # Check for reasonable year range
        if date_obj.year < 2020 or date_obj.year > 2100:
            raise ValidationError(f"Year must be between 2020 and 2100")
        
        return date_obj
    except ValueError as e:
        raise ValidationError(f"Invalid date: {date_str}. Please check day/month values.")

def validate_student_id(student_id, allow_empty=False):
    """
    Validate student ID format (STU followed by digits).
    Returns normalized (uppercase) student ID.
    """
    if not student_id or student_id.strip() == "":
        if allow_empty:
            return None
        raise ValidationError("Student ID cannot be empty")
    
    student_id = student_id.strip().upper()
    
    # Check format: STU followed by digits
    pattern = r"^STU\d{4}$"
    if not re.match(pattern, student_id):
        raise ValidationError(f"Invalid Student ID format. Expected format: STU0001, STU0002, etc.")
    
    return student_id

def validate_name(name, field_name="Name"):
    """
    Validate a name (student name, username, etc.)
    Returns trimmed name.
    """
    if not name or name.strip() == "":
        raise ValidationError(f"{field_name} cannot be empty")
    
    name = name.strip()
    
    if len(name) < 2:
        raise ValidationError(f"{field_name} must be at least 2 characters")
    
    if len(name) > 100:
        raise ValidationError(f"{field_name} must be less than 100 characters")
    
    # Check for valid characters (letters, spaces, dots, hyphens)
    pattern = r"^[a-zA-Z\s.\-']+$"
    if not re.match(pattern, name):
        raise ValidationError(f"{field_name} can only contain letters, spaces, dots, and hyphens")
    
    return name

def validate_class_name(class_name):
    """
    Validate class name.
    Returns normalized (uppercase) class name.
    """
    if not class_name or class_name.strip() == "":
        raise ValidationError("Class name cannot be empty")
    
    class_name = class_name.strip().upper()
    
    if len(class_name) < 2:
        raise ValidationError("Class name must be at least 2 characters")
    
    if len(class_name) > 20:
        raise ValidationError("Class name must be less than 20 characters")
    
    # Alphanumeric with optional hyphen/underscore
    pattern = r"^[A-Z0-9\-_]+$"
    if not re.match(pattern, class_name):
        raise ValidationError("Class name can only contain letters, numbers, hyphens, and underscores")
    
    return class_name

def validate_subject(subject):
    """
    Validate subject name.
    Returns normalized (uppercase) subject name.
    """
    if not subject or subject.strip() == "":
        raise ValidationError("Subject cannot be empty")
    
    subject = subject.strip().upper()
    
    if len(subject) < 2:
        raise ValidationError("Subject must be at least 2 characters")
    
    if len(subject) > 50:
        raise ValidationError("Subject must be less than 50 characters")
    
    # Alphanumeric with spaces
    pattern = r"^[A-Z0-9\s\-_]+$"
    if not re.match(pattern, subject):
        raise ValidationError("Subject can only contain letters, numbers, spaces, hyphens, and underscores")
    
    return subject

def validate_roll_number(roll_no):
    """
    Validate roll number.
    Returns integer roll number.
    """
    if roll_no is None or (isinstance(roll_no, str) and roll_no.strip() == ""):
        raise ValidationError("Roll number cannot be empty")
    
    try:
        roll_no = int(str(roll_no).strip())
    except ValueError:
        raise ValidationError("Roll number must be a number")
    
    if roll_no < 1:
        raise ValidationError("Roll number must be positive")
    
    if roll_no > 9999:
        raise ValidationError("Roll number must be less than 10000")
    
    return roll_no

def validate_yes_no(value, default=None):
    """
    Validate yes/no input.
    Returns True for yes, False for no.
    """
    if not value or value.strip() == "":
        if default is not None:
            return default
        raise ValidationError("Please enter 'y' for yes or 'n' for no")
    
    value = value.strip().lower()
    
    if value in ('y', 'yes', '1', 'true'):
        return True
    elif value in ('n', 'no', '0', 'false'):
        return False
    else:
        raise ValidationError("Please enter 'y' for yes or 'n' for no")

def validate_password(password):
    """
    Validate password strength.
    Returns password if valid.
    """
    if not password or password.strip() == "":
        raise ValidationError("Password cannot be empty")
    
    if len(password) < 4:
        raise ValidationError("Password must be at least 4 characters")
    
    if len(password) > 100:
        raise ValidationError("Password must be less than 100 characters")
    
    return password

def validate_role(role):
    """
    Validate user role.
    Returns normalized role.
    """
    if not role or role.strip() == "":
        raise ValidationError("Role cannot be empty")
    
    role = role.strip().lower()
    
    valid_roles = ('admin', 'teacher')
    if role not in valid_roles:
        raise ValidationError(f"Role must be one of: {', '.join(valid_roles)}")
    
    return role

def safe_input(prompt, validator_func, *args, max_attempts=3, **kwargs):
    """
    Wrapper for input with validation and retry logic.
    Returns validated value or None if max attempts exceeded.
    """
    attempts = 0
    while attempts < max_attempts:
        try:
            value = input(prompt)
            return validator_func(value, *args, **kwargs)
        except ValidationError as e:
            print(f"✗ {e}")
            attempts += 1
            if attempts < max_attempts:
                print(f"  Please try again ({max_attempts - attempts} attempts remaining)")
    
    return None
