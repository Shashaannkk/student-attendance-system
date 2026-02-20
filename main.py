from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_db_and_tables
from routers import auth, attendance, students
from auto_setup import auto_setup_default_account
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Student Attendance System API",
    description="Backend API for managing student attendance",
    version="1.0.0"
)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Configuration
# Allow all origins for simplicity in this demo, but restrict in production
origins_str = os.getenv("ALLOWED_ORIGINS", "*")

# Handle wildcard or specific origins
if origins_str == "*":
    origins = ["*"]
else:
    # Split by comma and strip whitespace
    origins = [origin.strip() for origin in origins_str.split(",")]

print(f"[CORS] Allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("Database initialized.")
    
    # Auto-migrate: add new columns if they don't exist (safe to run multiple times)
    try:
        import sqlite3
        db_path = os.getenv("DATABASE_URL", "attendance_sys.db")
        # Strip sqlite:/// prefix if present
        if db_path.startswith("sqlite:///"):
            db_path = db_path[len("sqlite:///"):]
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Add division column to student if missing
        try:
            cursor.execute("ALTER TABLE student ADD COLUMN division TEXT NOT NULL DEFAULT 'A'")
            print("[AutoMigrate] Added division column to student")
        except Exception:
            pass  # Already exists
        # Add status column to attendance if missing
        try:
            cursor.execute("ALTER TABLE attendance ADD COLUMN status TEXT NOT NULL DEFAULT 'P'")
            print("[AutoMigrate] Added status column to attendance")
        except Exception:
            pass  # Already exists
        conn.commit()
        conn.close()
        print("[AutoMigrate] Schema check complete.")
    except Exception as e:
        print("[AutoMigrate] Warning: " + str(e))
    
    # Auto-create default admin account if database is empty
    auto_setup_default_account()



@app.get("/")
def read_root():
    return {"message": "Welcome to Student Attendance System API"}

app.include_router(auth.router)
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
