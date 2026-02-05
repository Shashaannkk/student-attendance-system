# Student Attendance System

A modern, full-stack student attendance management system for schools and colleges with real-time tracking, analytics, and multi-organization support.

## 🚀 Features

### Authentication & Authorization
- Multi-organization support with unique organization codes
- Role-based access control (Admin, Teacher)
- Secure JWT authentication
- Profile picture support

### Attendance Management
- Subject-wise attendance tracking
- Automatic working day calculation
- Excludes weekends and holidays
- Real-time attendance statistics
- Export attendance reports (Excel)

### Student Management
- Add, edit, and delete students
- Bulk import via Excel
- Student profiles with photos
- Search and filter capabilities

### Dashboard & Analytics
- Real-time attendance overview
- Subject-wise statistics
- Student performance metrics
- Modern, responsive UI

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM
- **PostgreSQL** - Production database
- **SQLite** - Local development
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 📦 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shashaannkk/student-attendance-system.git
   cd student-attendance-system
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment variables
   copy .env.example .env
   # Edit .env with your configuration
   
   # Run the server
   python -m uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   copy .env.example .env
   # Edit .env with your backend URL
   
   # Run development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- **Backend**: Render (with PostgreSQL)
- **Frontend**: GitHub Pages

## 📝 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@host:port/database
ALLOWED_ORIGINS=https://yourusername.github.io
SECRET_KEY=your-secure-random-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🚧 Project Status

✅ **Production Ready** - Deployed and actively maintained
