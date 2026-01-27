from datetime import datetime, timedelta
from calendar_utils import is_working_day

start_date = datetime(2026, 1, 1)
end_date = datetime(2026, 1, 10)

working_days = 0

current = start_date
while current <= end_date:
    if is_working_day(current):
        print(current.strftime("%Y-%m-%d"), "-> Working Day")
        working_days += 1
    else:
        print(current.strftime("%Y-%m-%d"), "-> Holiday (Weekend)")
    current += timedelta(days=1)

print("\nTotal Working Days:", working_days)
