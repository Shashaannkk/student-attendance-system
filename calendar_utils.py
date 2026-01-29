from datetime import datetime

# Indian National Holidays (can be expanded later)
INDIAN_HOLIDAYS = {
    "01-26",  # Republic Day
    "08-15",  # Independence Day
    "10-02",  # Gandhi Jayanti
}

def is_holiday(date_obj):
    """Returns True if date is a national holiday."""
    key = date_obj.strftime("%m-%d")
    return key in INDIAN_HOLIDAYS

def is_working_day(date_obj):
    """
    Returns True if the given date is a working day.
    Excludes Saturdays, Sundays, and Indian national holidays.
    """
    if date_obj.weekday() in (5, 6):  # Saturday, Sunday
        return False
    if is_holiday(date_obj):
        return False
    return True
