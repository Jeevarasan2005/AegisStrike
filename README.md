# AegisStrike 🛡️

**AegisStrike** is a modern, full-stack defensive cybersecurity platform designed for real-time Web Application Firewall (WAF) rule enforcement, Static Application Security Testing (SAST) vulnerability scanning, and dynamic payload execution sandboxing.

---

## ✨ Features

- 🛡️ **Web Application Firewall (WAF)**
  - Toggle, configure, and manage active security rules (SQLi, XSS, Path Traversal, Rate Limiting).
  - Live inspection and log history of incoming request payloads with instant `ALLOWED` / `BLOCKED` status.

- 🔍 **Static Application Security Testing (SAST)**
  - Analyze code files or snippets for potential security vulnerabilities before deployment.
  - Automated severity scoring, line-level location markers, and mitigation recommendations.

- 🧪 **Dynamic Execution Sandbox**
  - Isolated payload evaluation environment powered by asynchronous background task queues (Celery/Redis).
  - Inspect execution logs, outputs, and threat levels safely.

- ⚡ **Real-Time Threat Monitoring**
  - WebSockets push instant traffic updates and threat detections directly to the interactive dashboard.
  - Built-in analytics charts powered by Recharts.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Database**: PostgreSQL / SQLite with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **Task Queue**: [Celery](https://docs.celeryq.dev/) + [Redis](https://redis.io/)
- **Real-Time**: WebSockets

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: Tailwind CSS & Framer Motion
- **Icons & Visualization**: Lucide React & Recharts

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

Run the full stack (Database, Redis, Backend, Worker, Frontend) with a single command:

```bash
docker-compose up --build
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate on Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Activate on Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend FastAPI server
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 API Documentation

When the backend server is running, explore interactive OpenAPI swagger docs at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📁 Repository Structure

```
AegisStrike/
├── backend/
│   ├── core/            # Database & Celery configs
│   ├── models/          # SQLAlchemy database models
│   ├── routes/          # API endpoints (WAF, SAST, Sandbox)
│   ├── main.py          # FastAPI application entrypoint
│   ├── worker.py        # Celery worker task runner
│   └── Dockerfile
├── frontend/
│   ├── app/             # Next.js pages & components
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml   # Multi-container orchestration
└── README.md
```
