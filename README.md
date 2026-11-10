# VertexLearn AI 🚀
### AI-Powered Learning Management Platform

<p align="center">
  <strong>Learn Smarter. Go Further.</strong>
</p>

<p align="center">
  An intelligent learning platform designed to make education more interactive, personalized, and accessible through AI-powered assistance.
</p>

<p align="center">
  <a href="https://vertexlearn-ai-theta.vercel.app/">🌐 Live Demo</a> •
  <a href="https://github.com/Amank002/VertexLearn-AI">📂 GitHub Repository</a>
</p>

---

## 📌 About the Project

**VertexLearn AI** is a modern AI-powered learning platform that brings together course discovery, personalized learning, assignment management, and an AI learning companion in one place.

The platform provides an organized learning environment where learners can explore educational content, monitor their progress, manage assignments, and get assistance from an AI tutor.

The application uses a React and TypeScript frontend with a Django REST Framework backend.

## ✨ Features

### 🎓 Learning Dashboard
- Personalized learner dashboard.
- Learning progress overview.
- Course statistics and learning activity.
- Quick access to platform features.

### 📚 Explore Courses
- Browse available courses.
- Search and filter courses.
- Explore course categories and difficulty levels.
- Course enrollment interface.

### 🤖 AI Learning Assistant
- AI-powered tutoring experience.
- Ask questions about technical and academic topics.
- Get explanations and learning guidance.
- Conversational learning assistance powered by Groq.

### 📝 Assignment Management
- Create and manage assignments.
- Set due dates and priorities.
- Track pending and completed assignments.
- Monitor upcoming deadlines.

### 👤 User Authentication
- User registration and login.
- JWT-based authentication.
- User profile management.
- Persistent profile information.

### 💬 Learning Community
- Dedicated community interface for learners.
- Space for learning-related interaction.

### ⚙️ Account Settings
- Manage personal information.
- Update profile details.
- Configure account preferences.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, TypeScript |
| Build Tool | Vite |
| Styling | CSS |
| Backend | Python, Django |
| API | Django REST Framework |
| Authentication | JWT, Simple JWT |
| AI Integration | Groq API |
| Database | SQLite (local development) |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |

## 🏗️ Project Architecture

```text
VertexLearn-AI/
│
├── backend/
│   ├── accounts/
│   ├── assignments/
│   ├── config/
│   ├── tutor/
│   ├── manage.py
│   └── .env
│
├── public/
│
├── src/
│   ├── assets/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 💻 Getting Started

Follow these instructions to run VertexLearn AI locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Python
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Amank002/VertexLearn-AI.git
```

Navigate into the project:

```bash
cd VertexLearn-AI
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Configure Django Backend

Navigate to the backend:

```bash
cd backend
```

Create and activate a Python virtual environment:

**Windows:**

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Install the backend dependencies from your project's requirements file, if provided:

```bash
pip install -r requirements.txt
```

Create a `backend/.env` file containing your own secret configuration:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_configured_groq_model
DJANGO_SECRET_KEY=your_django_secret_key
DJANGO_DEBUG=True
FRONTEND_URL=http://localhost:5173
```

**Important:** Never commit real API keys, Django secret keys, passwords, or environment files to GitHub.

### 5. Run Database Migrations

```bash
python manage.py migrate
```

### 6. Start Django Backend

```bash
python manage.py runserver
```

Backend development server:

```text
http://127.0.0.1:8000/
```

### 7. Start React Frontend

Open another terminal in the project root:

```bash
npm run dev
```

Frontend development server:

```text
http://localhost:5173/
```

## 🔐 Security

- JWT authentication for protected API endpoints.
- API credentials stored in backend environment variables.
- Environment files excluded from version control.
- User-specific data protected through authenticated backend access.

For production deployment, configure secure environment variables, HTTPS, production database settings, and appropriate CORS and CSRF trusted origins.

## 🌐 Deployment

### Frontend — Vercel

VertexLearn AI frontend is deployed on Vercel.

**Live Website:**  
https://vertexlearn-ai-theta.vercel.app/

### Backend — Django

The Django backend must be deployed separately to a production hosting provider.

Configure the frontend environment variable with the deployed backend URL:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

The backend should use a production database and secure environment configuration.

## 🔮 Future Improvements

- Database-backed course management.
- Enhanced admin dashboard and platform analytics.
- Real-time notifications.
- Advanced learner progress tracking.
- Course content and lesson management.
- Improved AI-powered personalized learning recommendations.

## 👨‍💻 Author

**Aman Kumar**

Computer Science & Engineering  
Full Stack Developer | React.js | Python | Django

GitHub: https://github.com/Amank002

---

<p align="center">
  <strong>VertexLearn AI — Learn Smarter. Go Further. 🚀</strong>
</p>
