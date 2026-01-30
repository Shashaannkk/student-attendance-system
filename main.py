from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from routers import auth, students, attendance

app = FastAPI(title="Student Attendance System", version="2.0")

# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to Student Attendance System API"}

app.include_router(auth.router)
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
