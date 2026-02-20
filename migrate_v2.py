"""
Migration script: Adds division to Student and status to Attendance.
Run once: python migrate_v2.py
"""
import sqlite3
import os

DB_PATH = "attendance_sys.db"

if not os.path.exists(DB_PATH):
    DB_PATH = "attendance.db"

print("[Migration] Using database: " + DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# -- Student: add division column
try:
    cursor.execute("ALTER TABLE student ADD COLUMN division TEXT NOT NULL DEFAULT 'A'")
    print("[Migration] OK: Added division column to student table")
except sqlite3.OperationalError as e:
    if "duplicate column" in str(e).lower():
        print("[Migration] SKIP: division column already exists in student")
    else:
        print("[Migration] ERROR in student: " + str(e))

# -- Attendance: add status column
try:
    cursor.execute("ALTER TABLE attendance ADD COLUMN status TEXT NOT NULL DEFAULT 'P'")
    print("[Migration] OK: Added status column to attendance table")
except sqlite3.OperationalError as e:
    if "duplicate column" in str(e).lower():
        print("[Migration] SKIP: status column already exists in attendance")
    else:
        print("[Migration] ERROR in attendance: " + str(e))

# -- Backfill status from present column
try:
    cursor.execute("UPDATE attendance SET status = CASE WHEN present = 1 THEN 'P' ELSE 'A' END")
    count = cursor.rowcount
    print("[Migration] OK: Backfilled " + str(count) + " records")
except sqlite3.OperationalError as e:
    print("[Migration] SKIP backfill: " + str(e))

conn.commit()
conn.close()
print("[Migration] DONE!")
