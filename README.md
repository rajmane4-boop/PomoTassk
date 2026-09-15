# 🍅 PomoTask — Django & Shadcn UI To-Do List with Pomodoro Timer

A full-stack, state-of-the-art productivity web application built with **Django REST Framework** (running in a dedicated Python virtual environment) and **React + Tailwind CSS + Shadcn UI**.

---

## ✨ Features

- **Advanced To-Do Management**:
  - Full CRUD operations with instant optimistic UI updates.
  - Priority levels: `Low`, `Medium`, `High`, `Urgent` with color-coded Shadcn badges.
  - Categorization: `Work`, `Study`, `Coding`, `Personal`, `Health`, `General`.
  - Due date tracking with smart `Today` and `Overdue` warning indicators.
  - Estimated Pomodoros vs. Actual completed Pomodoro bubbles (`🍅 2/3`).
  - Search by task title or description notes in real-time.
  - Filtering by status (`All`, `Pending`, `Due Today`, `Overdue`, `Completed`) and categories.
  - Interactive task completion with celebratory confetti and Web Audio chime.

- **Integrated Pomodoro Focus Station**:
  - Classic intervals: **Focus Work (25m)**, **Short Break (5m)**, **Long Break (15m)**.
  - Custom interval configurator: set your preferred durations easily.
  - Animated SVG circular progress ring with gradient indicators.
  - **Task Binding**: Click **"Focus"** on any task to bind it directly to the Pomodoro timer.
  - Completing a focus session automatically increments the bound task's pomodoro count in the Django backend and logs a session record.
  - Synthesized Web Audio bell chime (zero external audio file dependencies).
  - Controls: Start, Pause, Skip, Reset, and quick adjustment buttons (`+5m`, `-1m`).

- **Dashboard & Aesthetics**:
  - 4 Real-time Productivity KPI cards:
    - Completed Tasks & Completion Rate Progress Bar
    - Focus Sessions Logged (with today's streak)
    - Focus Hours Logged
    - High Priority Attention items
  - Modern Zinc dark/light mode toggle with theme persistence.
  - Sonner-style Toast notifications.
  - Real-time Django backend connectivity indicator.

---

## 🚀 Quick Start (One-Click Launch)

### On Windows:
Double-click `start.bat` or run:
```powershell
.\start.ps1
```
This automatically boots both the Django backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`).

---

## 🛠 Manual Setup & Running

### 1. Backend (Django REST Framework)
The backend uses an isolated virtual environment located in `backend/.venv`:

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
# (or in CMD: .venv\Scripts\activate.bat)

# Run database migrations (already completed, but for reference)
python manage.py migrate

# Optional: Seed sample tasks
python manage.py seed_data

# Start the Django development server
python manage.py runserver
```
Backend API will be accessible at: `http://127.0.0.1:8000/api/`
- Tasks: `http://127.0.0.1:8000/api/tasks/`
- Pomodoro Sessions: `http://127.0.0.1:8000/api/pomodoro/`
- Stats: `http://127.0.0.1:8000/api/stats/`
- Admin: `http://127.0.0.1:8000/admin/`

### 2. Frontend (React + Shadcn UI)
```powershell
# Navigate to frontend
cd frontend

# Install dependencies (already completed)
npm install

# Start Vite dev server
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## 📁 Project Structure

```
d:\MCA\SEM3\Djnago proj\
├── backend/
│   ├── .venv/                      # Python virtual environment
│   ├── requirements.txt            # Python dependencies (django, DRF, cors-headers)
│   ├── manage.py
│   ├── core/                       # Django project settings & URL routing
│   └── todos/                      # Todos & Pomodoro application
│       ├── models.py               # Task & PomodoroSession models
│       ├── serializers.py          # DRF serializers with computed properties
│       ├── views.py                # ViewSets, custom toggle/increment actions, stats API
│       ├── urls.py                 # API router endpoints
│       └── tests.py                # Automated backend test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI components (Button, Card, Dialog, Badge, Tabs, etc.)
│   │   │   ├── Navbar.tsx          # Brand, theme switcher, status indicator, new task button
│   │   │   ├── StatsHeader.tsx     # 4 productivity metrics cards
│   │   │   ├── PomodoroTimer.tsx   # SVG animated timer, audio chime, task sync
│   │   │   ├── TaskList.tsx        # Search, status & category filters, task cards
│   │   │   └── TaskDialog.tsx      # Create / Edit task modal dialog
│   │   ├── lib/
│   │   │   ├── api.ts              # Fetch client communicating with Django REST API
│   │   │   ├── audio.ts            # Web Audio API synthesizer for bell chimes
│   │   │   └── utils.ts            # Tailwind class merger (cn)
│   │   ├── App.tsx                 # Main application dashboard layout
│   │   └── index.css               # Shadcn UI CSS tokens & dark/light theme variables
│   ├── index.html                  # HTML template with Inter & JetBrains Mono fonts
│   └── tailwind.config.js          # Tailwind configuration with Shadcn theme tokens
├── start.bat                       # Windows Command Prompt launcher
├── start.ps1                       # Windows PowerShell launcher
└── README.md                       # Documentation
```
