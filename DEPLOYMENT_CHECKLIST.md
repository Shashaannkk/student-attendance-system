# Quick Deployment Checklist

## Before You Deploy

### 1. Generate Secret Key
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output - you'll need this for Render environment variables.

### 2. Set Up Email Service (Choose One)

#### Option A: Gmail (Easiest for Testing)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Visit https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password

#### Option B: SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com/
2. Create an API key
3. Use these settings:
   - SMTP_HOST: `smtp.sendgrid.net`
   - SMTP_PORT: `587`
   - SMTP_USERNAME: `apikey`
   - SMTP_PASSWORD: `<your-api-key>`

## Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create PostgreSQL Database**
   - Go to https://dashboard.render.com/
   - Click "New +" → "PostgreSQL"
   - Name: `attendance-db`
   - Click "Create Database"
   - **Copy the Internal Database URL**

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `Shashaannkk/student-attendance-system`
   - Name: `student-attendance-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `<paste Internal Database URL>` |
   | `SECRET_KEY` | `<paste generated secret key>` |
   | `ALLOWED_ORIGINS` | `https://Shashaannkk.github.io` |
   | `SMTP_HOST` | `smtp.gmail.com` (or SendGrid) |
   | `SMTP_PORT` | `587` |
   | `SMTP_USERNAME` | `<your-email@gmail.com>` |
   | `SMTP_PASSWORD` | `<your-app-password>` |
   | `EMAIL_FROM` | `noreply@attendance-system.com` |

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - **Copy your backend URL** (e.g., `https://student-attendance-backend.onrender.com`)

### Step 2: Configure GitHub for Frontend

1. **Add GitHub Secret**
   - Go to your repo: https://github.com/Shashaannkk/student-attendance-system
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VITE_API_URL`
   - Value: `<paste your Render backend URL>`
   - Click "Add secret"

2. **Update CORS on Render**
   - Go back to Render web service
   - Environment tab
   - Update `ALLOWED_ORIGINS` to:
     ```
     https://Shashaannkk.github.io
     ```
   - Save changes

### Step 3: Deploy Frontend

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to your repo → Actions tab
   - Watch the deployment progress
   - Once complete, visit: https://Shashaannkk.github.io/student-attendance-system/

### Step 4: Test Your Deployment

1. **Test Backend**
   - Visit: `https://student-attendance-backend.onrender.com`
   - Should see: `{"message": "Welcome to Student Attendance System API"}`
   - Check API docs: `https://student-attendance-backend.onrender.com/docs`

2. **Test Frontend**
   - Visit: `https://Shashaannkk.github.io/student-attendance-system/`
   - Register a new organization
   - Check your email for organization code
   - Test login with the credentials

## Troubleshooting

### Backend Issues
- **Database connection error**: Check `DATABASE_URL` is correct
- **CORS error**: Verify `ALLOWED_ORIGINS` includes your GitHub Pages URL
- **Email not sending**: Verify SMTP credentials, check Render logs

### Frontend Issues
- **API calls failing**: Check `VITE_API_URL` secret is set correctly
- **Blank page**: Check browser console for errors
- **Build failing**: Check Actions tab for error logs

## Need Help?

See the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions and troubleshooting.
