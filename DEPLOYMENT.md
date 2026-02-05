# Deployment Guide - Student Attendance System

This guide walks you through deploying the Student Attendance System with the backend on **Render** and the frontend on **GitHub Pages**.

## Prerequisites

Before you begin, ensure you have:

- ✅ A [GitHub](https://github.com) account
- ✅ A [Render](https://render.com) account (free tier available)
- ✅ Git installed locally
- ✅ Your code pushed to a GitHub repository

## Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐
│   GitHub Pages      │────────▶│   Render Backend     │
│   (Frontend)        │  API    │   (FastAPI)          │
│                     │ Calls   │                      │
└─────────────────────┘         └──────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │  PostgreSQL Database │
                                │  (Render Managed)    │
                                └──────────────────────┘
```

## Part 1: Deploy Backend to Render

### Step 1: Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `student-attendance-backend` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` (or your preferred tier)

### Step 2: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure the database:
   - **Name**: `attendance-db`
   - **Database**: `attendance_sys`
   - **User**: `attendance_user`
   - **Instance Type**: `Free`
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (you'll need this in the next step)

### Step 3: Configure Environment Variables

In your web service settings, go to **"Environment"** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `<Internal Database URL from Step 2>` | Paste the PostgreSQL connection string |
| `SECRET_KEY` | `<generate a secure key>` | Run: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Or your preferred token expiration time |
| `ALLOWED_ORIGINS` | `https://yourusername.github.io` | Replace with your GitHub Pages URL |
| `SMTP_HOST` | `smtp.gmail.com` | For Gmail; adjust for other services |
| `SMTP_PORT` | `587` | Standard TLS port |
| `SMTP_USERNAME` | `your-email@gmail.com` | Your email address |
| `SMTP_PASSWORD` | `your-app-password` | Gmail App Password (see below) |
| `EMAIL_FROM` | `noreply@attendance-system.com` | Sender email address |

#### Setting up Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Copy the 16-character password and use it as `SMTP_PASSWORD`

> [!TIP]
> For production, consider using [SendGrid](https://sendgrid.com/) or [AWS SES](https://aws.amazon.com/ses/) instead of Gmail for better deliverability.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy your backend
3. Wait for the deployment to complete (check the logs)
4. **Copy your backend URL** (e.g., `https://student-attendance-backend.onrender.com`)

> [!IMPORTANT]
> Free tier services on Render may spin down after inactivity. The first request after inactivity may take 30-60 seconds.

## Part 2: Deploy Frontend to GitHub Pages

### Step 1: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secret:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://student-attendance-backend.onrender.com` (your Render backend URL)

### Step 2: Update CORS on Backend

1. Go back to your Render web service
2. Update the `ALLOWED_ORIGINS` environment variable:
   ```
   https://yourusername.github.io,https://your-custom-domain.com
   ```
   Replace `yourusername` with your actual GitHub username
3. Save and redeploy if necessary

### Step 3: Enable GitHub Pages

1. In your GitHub repository, go to **Settings** → **Pages**
2. Under **"Source"**, select **"GitHub Actions"**
3. The workflow is already configured in `.github/workflows/deploy.yml`

### Step 4: Deploy

1. Push your changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```
2. GitHub Actions will automatically build and deploy your frontend
3. Check the **Actions** tab to monitor the deployment
4. Once complete, your site will be available at:
   ```
   https://yourusername.github.io/student-attendance-system/
   ```

## Part 3: Verify Deployment

### Backend Verification

1. Visit your backend URL: `https://student-attendance-backend.onrender.com`
2. You should see: `{"message": "Welcome to Student Attendance System API"}`
3. Check API docs: `https://student-attendance-backend.onrender.com/docs`

### Frontend Verification

1. Visit your frontend URL: `https://yourusername.github.io/student-attendance-system/`
2. Try to register a new organization
3. Check your email for the organization code
4. Test login functionality
5. Verify all features work correctly

## Troubleshooting

### Backend Issues

**Problem**: Database connection errors
- **Solution**: Verify `DATABASE_URL` is set correctly in Render environment variables
- Check that the database is running and accessible

**Problem**: CORS errors in browser console
- **Solution**: Update `ALLOWED_ORIGINS` to include your frontend URL
- Make sure there are no trailing slashes

**Problem**: Email not sending
- **Solution**: Verify SMTP credentials are correct
- Check Render logs for email-related errors
- Test with Mailtrap first before using production email

### Frontend Issues

**Problem**: API calls failing (404 or network errors)
- **Solution**: Verify `VITE_API_URL` secret is set in GitHub
- Check that the backend URL is correct and accessible
- Rebuild and redeploy the frontend

**Problem**: Blank page or routing issues
- **Solution**: Verify `base` in `vite.config.ts` matches your repository name
- Check browser console for errors

**Problem**: GitHub Actions deployment failing
- **Solution**: Check the Actions tab for error logs
- Verify Node.js version compatibility
- Ensure all dependencies are in `package.json`

## Environment Variables Reference

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# CORS
ALLOWED_ORIGINS=https://yourusername.github.io

# JWT
SECRET_KEY=your-secure-random-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@attendance-system.com
```

### Frontend (.env)

```bash
# API URL
VITE_API_URL=https://student-attendance-backend.onrender.com
```

## Post-Deployment Tasks

- [ ] Test all features thoroughly
- [ ] Set up monitoring (Render provides basic monitoring)
- [ ] Configure custom domain (optional)
- [ ] Set up backup strategy for database
- [ ] Review and optimize performance
- [ ] Set up error tracking (e.g., Sentry)

## Updating Your Application

### Backend Updates

1. Make changes to your code
2. Commit and push to GitHub
3. Render will automatically detect changes and redeploy

### Frontend Updates

1. Make changes to your code
2. Commit and push to the `main` branch
3. GitHub Actions will automatically rebuild and redeploy

## Support

If you encounter issues:

1. Check Render logs: Dashboard → Your Service → Logs
2. Check GitHub Actions logs: Repository → Actions tab
3. Review browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Congratulations!** 🎉 Your Student Attendance System is now live and ready to use!
