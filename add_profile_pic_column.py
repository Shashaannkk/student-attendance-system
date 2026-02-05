"""
Migration script to add profile_picture_url column to User table.
"""
import sqlite3
import os

DB_PATH = "attendance_sys.db"

def migrate_db():
    if not os.path.exists(DB_PATH):
        print(f"Database at {DB_PATH} not found.")
        return

    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(user)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "profile_picture_url" in columns:
            print("Column 'profile_picture_url' already exists.")
        else:
            print("Adding 'profile_picture_url' column to 'user' table...")
            cursor.execute("ALTER TABLE user ADD COLUMN profile_picture_url TEXT")
            conn.commit()
            print("Migration successful!")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
