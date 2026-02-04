from sqlmodel import SQLModel, create_engine, Session
import os

# Default to SQLite with ABSOLUTE path to avoid CWD ambiguity
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "attendance_sys.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Fix for Render/Heroku which use 'postgres://' but SQLAlchemy requires 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine
# echo=True prints SQL queries to console (useful for debugging)
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create all tables defined in SQLModel metadata."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to provide a database session."""
    with Session(engine) as session:
        yield session
