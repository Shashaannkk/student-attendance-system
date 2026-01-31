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
    
    # Ensure admin user exists
    from sqlmodel import Session, select
    from database import engine
    from models import User
    from auth_utils import get_password_hash
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == "admin")).first()
        if not user:
            print("Creating default admin user...")
            # Use 'admin123' as default password
            pw_hash = get_password_hash("admin123")
            admin_user = User(username="admin", password_hash=pw_hash, role="admin")
            session.add(admin_user)
            session.commit()
            print("Default admin user created: admin / admin123")
        else:
             print("Admin user check: OK")

@app.get("/")
def read_root():
    return {"message": "Welcome to Student Attendance System API"}

app.include_router(auth.router)
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
