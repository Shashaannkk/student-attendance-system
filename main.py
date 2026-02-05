from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_db_and_tables
from routers import auth, attendance, students
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
    print("Database initialized. Use migration script to create organizations and users.")

@app.get("/")
def read_root():
    return {"message": "Welcome to Student Attendance System API"}

app.include_router(auth.router)
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
