# ⛏️ MineGuard: AI-Powered Mine Worker Safety Management & Emergency Response Platform

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite)
![OpenCV](https://img.shields.io/badge/OpenCV-HSV_ROI-5C3EE8?style=for-the-badge&logo=opencv)
![Gemini AI](https://img.shields.io/badge/Gemini_Vision-1.5_Flash-8E75FF?style=for-the-badge&logo=google)
![Languages](https://img.shields.io/badge/Languages-11_Supported-FF6B6B?style=for-the-badge)

> **MineGuard** is a comprehensive enterprise software & AI analytics platform engineered for underground mining operations. It combines real-time worker telemetry, computer vision PPE verification, AI-driven hazard reporting, dynamic personal safety scoring, real-time WebSocket distress dispatch (SOS), cross-role team communications, unified leave management, and an Emergency Officer command center for disaster evacuation and rescue operations.

---

## 📌 Table of Contents
- [✨ Key Features](#-key-features)
  - [👷 Worker Module](#-worker-module)
  - [🦺 Supervisor Module](#-supervisor-module)
  - [🚨 Emergency Officer Command Suite](#-emergency-officer-command-suite)
  - [👑 Admin Command Center](#-admin-command-center)
  - [💬 Unified Team Communications](#-unified-team-communications)
  - [🏖️ Cross-Role Leave Request System](#️-cross-role-leave-request-system)
- [🌐 Multi-Language Support (i18n)](#-multi-language-support-i18n)
- [🔑 Default Test Credentials](#-default-test-credentials)
- [🧠 AI & Vision Model Architecture](#-ai--vision-model-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Installation & Local Setup](#️-installation--local-setup)
- [📊 System Architecture & Data Flow](#-system-architecture--data-flow)
- [📄 License & Author](#-license--author)

---

## ✨ Key Features

### 👷 Worker Module
- **AI Camera PPE Verification**: Real-time camera scan verifying safety hard hats, high-vis vests, respirators, and goggles using OpenCV computer vision.
- **Dynamic Personal Safety Score**: Algorithmic safety rating (0–100) dynamically computed from pre-shift checklists, PPE verification, punctuality, and incident history.
- **Instant Emergency SOS Panic Button**: 1-click distress beacon broadcasting real-time coordinates and heart-rate telemetry to control rooms via WebSockets.
- **AI Multimodal Hazard Reporting**: Submit underground hazards via photo capture, voice notes, or text with automatic AI severity classification.
- **Worker Leave Requests**: Apply for shift leave (`/worker/leave`) with real-time status tracking (Pending, Approved, Rejected).
- **Real-Time Team Chat**: Direct 1-to-1 chat with supervisors, admins, and rescue officers with photo and voice note attachments (`/worker/chat`).
- **Offline Hazard Sync**: Progressive Web App (PWA) offline storage using `IndexedDB` that auto-syncs logs when connection is restored.
- **Safe Zone Evacuation Navigation**: Interactive mine grid map showing evacuation routes, safe havens, and hazard overlays.

### 🦺 Supervisor Module
- **Assigned Team Monitoring**: Real-time telemetry, productivity ratings, and live tracking of all underground workers (`/supervisor/workers`).
- **Real Mine Zones & Geofencing**: Complete CRUD management for mine zones, danger boundaries, and geofence alerts (`/supervisor/zones`).
- **Live Environmental Telemetry**: Real-time IoT sensor readings (Methane CH₄, Carbon Monoxide CO, Oxygen O₂, Temp, AQI) with manual sensor override tools (`/supervisor/environment`).
- **Leave Request Approvals**: Review team leave applications with 1-click Approve/Reject controls, plus supervisor leave application portal (`/supervisor/leave`).
- **Shift Handover & Task Management**: Digital shift handover logbook and real-time task assignments for underground personnel.
- **Safety Analytics Dashboard**: Daily incident trends, safety score distributions, gas concentration historical graphs, and hazard categorization (`/supervisor/analytics`).

### 🚨 Emergency Officer Command Suite
- **Dedicated Emergency Role (`emergency_officer`)**: Specialized high-priority command console for disaster management and rescue operations (`/emergency/dashboard`).
- **Live Rescue Map & SOS Center**: Real-time distress map pinpointing worker distress beacons with 1-click squad deployment and status resolution (`/emergency/sos-center`).
- **Rescue Squad Dispatch**: Assign and track specialized underground rescue teams with live ETA and status updates (`/emergency/dispatch`).
- **Emergency Broadcast Sirens**: Mine-wide siren activation, voice evacuation broadcasts, and toxic gas alarms (`/emergency/broadcast`).
- **Incident Audit Logs**: Comprehensive incident logs and post-disaster audit reporting (`/emergency/incidents`).
- **Emergency Officer Leave Portal**: Manage officer availability and log emergency officer coverage (`/emergency/leave`).

### 👑 Admin Command Center
- **Executive Safety Dashboard**: High-level real-time overview displaying active workforce numbers, gas sensor alerts, hazard distribution, and emergency statuses.
- **Site-Wide Leave Management**: Executive leave management dashboard (`/admin/leave`) with role filtering (Worker, Supervisor, Emergency Officer, Admin) and approval authority.
- **Role-Based Access Control (RBAC)**: Manage credentials, roles, and status for Workers, Supervisors, Emergency Officers, and Administrators (`/admin/users`).
- **Audit Logging & Report Exports**: Downloadable safety audit logs, shift records, and PDF report generation.

### 💬 Unified Team Communications
- **Cross-Role Interoperability**: Real-time communication hub linking Workers, Supervisors, Emergency Officers, and Admins via WebSockets.
- **Group Broadcast Channels**: Send target broadcasts to specific roles (`workers`, `supervisors`, `admins`, `emergency_officers`) or mine-wide announcements (`all`).
- **Multimodal Sharing**: Send text, images, voice notes, and documents across all roles.

### 🏖️ Cross-Role Leave Request System
- **Universal Application Portal**: Workers, Supervisors, Emergency Officers, and Admins can submit leave applications with start date, end date, and rationale.
- **Hierarchical Approval Workflow**: Supervisors, Emergency Officers, and Admins can review, approve, or reject pending requests in real-time.

---

## 🌐 Multi-Language Support (i18n)

MineGuard features **100% full UI translation** powered by `i18next`. Switching languages updates sidebars, headers, dynamic widgets, status badges, buttons, and charts **instantly without page reloads**.

| Language | Code | Native Script |
| :--- | :--- | :--- |
| **English** | `en` | English |
| **Tamil** | `ta` | தமிழ் |
| **Hindi** | `hi` | हिंदी |
| **Telugu** | `te` | తెలుగు |
| **Kannada** | `kn` | ಕನ್ನಡ |
| **Malayalam** | `ml` | മലയാളം |
| **Marathi** | `mr` | मराठी |
| **Bengali** | `bn` | বাংলা |
| **Gujarati** | `gu` | ગુજરાતી |
| **Punjabi** | `pa` | ਪੰਜਾਬੀ |
| **Urdu** | `ur` | اردو |

---

## 🔑 Default Test Credentials

| Role | Username | Password | Default Dashboard |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | `/admin/dashboard` |
| **Supervisor** | `supervisor` | `supervisorpassword` | `/supervisor/dashboard` |
| **Emergency Officer** | `emergency_officer` | `emergency123` | `/emergency/dashboard` |
| **Worker** | `worker` | `worker123` | `/worker/dashboard` |

---

## 🧠 AI & Vision Model Architecture

| Component | Architecture / Model | Purpose |
| :--- | :--- | :--- |
| **Primary PPE Detection** | OpenCV HSV ROI Color Segmentation | Fast, deterministic bounding-box detection of Hard Hats (Yellow/Orange/Blue) & High-Vis Vests (Green/Yellow). |
| **Vision Fallback** | Gemini 1.5 Flash Vision API | High-accuracy multimodal fallback for complex lighting or multi-gear verification. |
| **Face Verification** | OpenCV Haar Cascade + Histogram Matching | Punctuality check-in authentication. |
| **Safety Score Index** | Multi-factor Risk Scoring Algorithm | Calculates real-time personal safety scores based on weighted daily metrics. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, Vite
- **UI Library**: Material UI (MUI v5), Emotion
- **State & Router**: React Router v6, React Context API
- **Internationalization**: `i18next`, `react-i18next`
- **Charts & Motion**: Recharts, Framer Motion
- **Networking**: Axios, Native WebSockets (`websockets`)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite / MySQL via SQLAlchemy ORM
- **Authentication**: OAuth2 JWT Tokens + Passlib (Bcrypt)
- **Real-Time Messaging**: FastAPI WebSockets Manager (`websockets`, `uvicorn[standard]`)
- **Computer Vision**: OpenCV (`opencv-python`), Pillow, Google Generative AI (`google-generativeai`)

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- Python 3.10+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Gowshika-RS/mine_work.git
cd mine_work
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies including uvicorn standard & websockets
pip install -r requirements.txt
pip install websockets uvicorn[standard]

# Seed initial database records
python seed.py

# Run FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Frontend Web App will be accessible at: `http://localhost:5173`

---

## 📊 System Architecture & Data Flow

```
[ Worker App / PWA ] ──── (REST API / JWT) ────> [ FastAPI Server ] ────> [ SQLite / MySQL DB ]
        │                                              │
        ├──────────── (WebSocket Feed) ────────────────┤
        │                                              │
[ AI Camera Stream ] ─── (OpenCV / Gemini AI) ─────────┴─────────> [ Emergency & Control Telemetry ]
```

---

## 📄 License & Author

Developed by **Gowshika R S** as an advanced Mine Worker Safety & Emergency Analytics platform.

*For inquiries or collaboration, please visit the repository at [Gowshika-RS/mine_work](https://github.com/Gowshika-RS/mine_work).*
