# 🚀 Deploy Updated Code to Production

## Step 1: Commit and Push Changes to GitHub

Open a terminal in your project directory and run these commands:

```bash
# Navigate to your project directory
cd "c:\Users\Shashank Poojari\Documents\student-attendance-system"

# Check what files have changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Add profile picture upload logging and improve error handling"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy Frontend to GitHub Pages

**The frontend will deploy automatically!**

1. After pushing to GitHub, go to your repository on GitHub
2. Click the **"Actions"** tab
3. You'll see a new workflow running: **"Deploy to GitHub Pages"**
4. Wait for it to complete (usually 2-3 minutes)
5. Once complete, your frontend is live at:
   ```
   https://shashaannkk.github.io/student-attendance-system/
   ```

---

## Step 3: Deploy Backend to Render

**The backend will also deploy automatically!**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your web service (e.g., `student-attendance-backend`)
3. Render will detect the new commit and start deploying automatically
4. Watch the **"Logs"** tab to see the deployment progress
5. Wait for the status to show **"Live"** (usually 2-5 minutes)

### If Auto-Deploy is Disabled:

If Render doesn't auto-deploy, manually trigger it:

1. In your Render service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

---

## Step 4: Verify Deployment

### ✅ Check Backend

1. Visit your backend URL:
   ```
   https://your-backend-name.onrender.com
   ```
2. You should see:
   ```json
   {"message": "Welcome to Student Attendance System API"}
   ```

### ✅ Check Frontend

1. Visit your frontend URL:
   ```
   https://shashaannkk.github.io/student-attendance-system/
   ```
2. The login page should load

### ✅ Test Profile Upload

1. Log in to your production site
2. Go to **Settings**
3. Try uploading a profile picture
4. Check Render logs to see the detailed logging:
   - Go to Render Dashboard → Your Service → **Logs**
   - You should see the `📸 PROFILE PICTURE UPLOAD` messages

---

## Troubleshooting

### If Git Push Fails:

```bash
# If you get "no changes" error
git status

# If you need to pull first
git pull origin main

# Then push again
git push origin main
```

### If GitHub Actions Fails:

1. Go to GitHub → Actions tab
2. Click on the failed workflow
3. Check the error logs
4. Common fix: Ensure `VITE_API_URL` secret is set in repository settings

### If Render Deploy Fails:

1. Check Render logs for errors
2. Verify environment variables are set:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ALLOWED_ORIGINS`
3. Try manual deploy if auto-deploy didn't trigger

---

## Expected Timeline

- **Git push**: Instant
- **GitHub Pages deploy**: 2-3 minutes
- **Render deploy**: 2-5 minutes (first request may take 30-60s if service was sleeping)

**Total time**: ~5-8 minutes for full deployment

---

## Quick Command Summary

```bash
# All in one go:
cd "c:\Users\Shashank Poojari\Documents\student-attendance-system"
git add .
git commit -m "Add profile picture upload logging and improve error handling"
git push origin main
```

Then just wait and watch the deployments happen automatically! 🎉
