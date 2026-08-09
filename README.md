# ⛏️ MineGuard: AI-Powered Mine Worker Safety Management & Emergency Response Platform

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite)
![OpenCV](https://img.shields.io/badge/OpenCV-HSV_ROI-5C3EE8?style=for-the-badge&logo=opencv)
![Gemini AI](https://img.shields.io/badge/Gemini_Vision-1.5_Flash-8E75FF?style=for-the-badge&logo=google)
![Languages](https://img.shields.io/badge/Languages-11_Supported-FF6B6B?style=for-the-badge)

> **MineGuard** is a comprehensive software simulation & AI analytics platform engineered for underground mining operations. It combines real-time worker telemetry, computer vision PPE gear verification, AI-driven hazard reporting, dynamic personal safety scoring, emergency distress dispatch (SOS), and real-time environment gas monitoring (CH₄, CO, AQI).

---

## 📌 Table of Contents
- [✨ Key Features](#-key-features)
  - [👷 Worker Module](#-worker-module)
  - [🦺 Supervisor Module](#-supervisor-module)
  - [👑 Admin Command Center](#-admin-command-center)
- [🌐 Multi-Language Support (i18n)](#-multi-language-support-i18n)
- [🧠 AI & Vision Model Architecture](#-ai--vision-model-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Installation & Local Setup](#️-installation--local-setup)
- [📊 System Architecture & Data Flow](#-system-architecture--data-flow)
- [📄 License & Author](#-license--author)

---

## ✨ Key Features

### 👷 Worker Module
- **AI Camera PPE Verification**: Real-time camera scan checking safety hard hats, high-vis vests, respirators, and goggles using computer vision.
- **Dynamic Personal Safety Score**: Algorithmic safety rating (0–100) dynamically computed from pre-shift checklists, PPE verification, attendance punctuality, and incident-free history.
- **Instant Emergency SOS Panic Button**: 1-click GPS distress beacon broadcasting worker coordinates and telemetry to control rooms and supervisors via WebSockets.
- **AI Multimodal Hazard Reporting**: Submit underground hazards via photo capture, voice notes, or text description with automatic AI severity classification.
- **Offline Hazard Sync**: Seamless PWA offline storage using `IndexedDB` / `LocalStorage` that automatically syncs hazard logs when internet connection is restored.
- **Safe Zone Evacuation Navigation**: Interactive underground mine grid map showing evacuation routes, safe zones, and hazard overlays.
- **Camera Facial Attendance**: Automated check-in/check-out verification using facial embedding matching.

### 🦺 Supervisor Module
- **Shift Control Center**: Real-time underground telemetry monitoring workers inside/outside shafts.
- **Emergency SOS Dispatch Center**: Active alert monitoring with quick-dispatch emergency response actions.
- **Team Safety Analytics**: Group safety score breakdown, overtime threshold alerts, and compliance trends.
- **Shift Handover Logs**: Digital logbook for operational transitions between mining shifts.
- **Geofence Violation Alerts**: Real-time warnings when workers breach restricted or hazardous mine sectors.

### 👑 Admin Command Center
- **Mine Safety Command Dashboard**: Aggregate real-time telemetry displaying worker counts, gas sensor levels (Methane CH₄, Carbon Monoxide CO), air quality (AQI), and critical alerts.
- **Role-Based Access Control (RBAC)**: Comprehensive user management for Admin, Supervisor, and Worker accounts.
- **Audit Logging & Report Exports**: Generate downloadable safety audit logs and compliance PDF reports.
- **Environmental Threshold Calibration**: Configure mine zone safety thresholds for ambient temperature, humidity, and gas concentrations.

---

## 🌐 Multi-Language Support (i18n)

MineGuard features **100% full application UI translation** using `i18next` and `react-i18next`. Switching languages updates all navigation sidebars, page headers, dynamic widgets, status badges, buttons, and chart labels **instantly without page reload**.

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
- **Networking**: Axios, Native WebSockets

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite / MySQL via SQLAlchemy ORM
- **Authentication**: OAuth2 JWT Tokens + Passlib (Bcrypt)
- **Real-Time Messaging**: FastAPI WebSockets Manager
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

# Install dependencies
pip install -r requirements.txt

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
[ AI Camera Stream ] ─── (OpenCV / Gemini AI) ─────────┴─────────> [ Control Room Telemetry ]
```

---

## 📄 License & Author

Developed by **Gowshika R S** as an advanced Mine Worker Safety & Emergency Analytics platform.

*For inquiries or collaboration, please visit the repository at [Gowshika-RS/mine_work](https://github.com/Gowshika-RS/mine_work).*
