# Production Test Login Setup

Since your local database and production database are separate, you need to create test credentials in your Render PostgreSQL database.

## Option 1: Create Test User via Script (Recommended)

### Step 1: Get Your Database URL

1. Go to Render Dashboard: https://dashboard.render.com/
2. Click on your **PostgreSQL database** (not the web service)
3. Scroll down to **"Connections"**
4. Copy the **"External Database URL"**
   - It looks like: `postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/dbname`

### Step 2: Install Required Package

```bash
pip install psycopg2-binary
```

### Step 3: Run the Script

```bash
python create_production_user.py
```

When prompted, paste your database URL.

### Step 4: Use the Test Credentials

The script will create:
- **Organization Code:** `TEST01`
- **Username:** `admin`
- **Password:** `admin123`

Use these to login at: https://shashaannkk.github.io/student-attendance-system/

---

## Option 2: Register New Organization (Easier)

Since CORS is now fixed, you can simply:

1. Go to: https://shashaannkk.github.io/student-attendance-system/#/register
2. Fill in the registration form
3. Check your Mailtrap inbox for credentials
4. Login with those credentials

---

## Option 3: Use Render Shell (Advanced)

1. In Render Dashboard, go to your **web service** (not database)
2. Click **"Shell"** tab
3. Run these commands:

```bash
python
```

Then in the Python shell:

```python
from sqlmodel import Session, select
from database import engine
from models import User, Organization
from auth_utils import get_password_hash

with Session(engine) as session:
    # Create organization
    org = Organization(
        org_code="TEST01",
        institution_name="Test Institution",
        institution_type="college",
        email="test@example.com"
    )
    session.add(org)
    
    # Create admin user
    user = User(
        org_code="TEST01",
        username="admin",
        password_hash=get_password_hash("admin123"),
        role="admin"
    )
    session.add(user)
    session.commit()
    print("✅ Test user created!")
```

Login with:
- Organization Code: `TEST01`
- Username: `admin`
- Password: `admin123`

---

## Recommended Approach

**Use Option 2** (Register New Organization) - it's the easiest since CORS is now working!
