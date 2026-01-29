import json
from datetime import datetime

HOLIDAYS_FILE = "data/holidays.json"
DATE_FORMAT = "%d-%m-%Y"

# Cache for loaded holidays
_holidays_cache = None

def load_holidays():
    """Load holidays from JSON file."""
    global _holidays_cache
    
    if _holidays_cache is not None:
        return _holidays_cache
    
    try:
        with open(HOLIDAYS_FILE, "r") as f:
            data = json.load(f)
            # Convert list of holidays to a set of date strings for fast lookup
            _holidays_cache = {h["date"]: h["name"] for h in data.get("holidays", [])}
            return _holidays_cache
    except FileNotFoundError:
        print(f"Warning: {HOLIDAYS_FILE} not found. No holidays will be excluded.")
        _holidays_cache = {}
        return _holidays_cache

def get_holidays():
    """Get all holidays as a dict {date_str: name}."""
    return load_holidays()

def is_holiday(date_obj):
    """
    Returns True if date is a holiday.
    Also returns the holiday name if it is a holiday.
    """
    holidays = load_holidays()
    date_str = date_obj.strftime(DATE_FORMAT)
    return date_str in holidays

def get_holiday_name(date_obj):
    """Returns the holiday name if the date is a holiday, else None."""
    holidays = load_holidays()
    date_str = date_obj.strftime(DATE_FORMAT)
    return holidays.get(date_str)

def is_working_day(date_obj):
    """
    Returns True if the given date is a working day.
    Excludes Saturdays, Sundays, and Indian holidays.
    """
    # Check for weekend
    if date_obj.weekday() in (5, 6):  # Saturday, Sunday
        return False
    
    # Check for holiday
    if is_holiday(date_obj):
        return False
    
    return True

def clear_holidays_cache():
    """Clear the holidays cache (useful after updating holidays file)."""
    global _holidays_cache
    _holidays_cache = None

def list_holidays():
    """Print all holidays in a formatted way."""
    holidays = load_holidays()
    if not holidays:
        print("No holidays loaded.")
        return
    
    print("\n===== Indian Holidays 2026 =====")
    # Sort by date
    sorted_holidays = sorted(holidays.items(), 
                            key=lambda x: datetime.strptime(x[0], DATE_FORMAT))
    for date_str, name in sorted_holidays:
        print(f"  {date_str}: {name}")
    print(f"\nTotal: {len(holidays)} holidays")
