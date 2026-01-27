from datetime import datetime

def is_working_day(date_obj):
    """
    Returns True if the given date is a working day.
    Excludes Saturday and Sunday.
    """
    # Monday = 0, Sunday = 6
    if date_obj.weekday() == 5:  # Saturday
        return False
    if date_obj.weekday() == 6:  # Sunday
        return False
    return True
