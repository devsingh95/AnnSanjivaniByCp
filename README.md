# 🍽️ Food Rescue Platform

### Zero-Hunger City: AI-Powered Food Waste Prevention & Redistribution

> **Stack Sprint Hackathon 2026** — Cloud-Native • DevOps • AI/ML • Full-Stack

---

## 🌟 The Problem

India wastes **68 million tonnes** of food annually while **190 million** go hungry. Food Rescue Platform bridges this gap with AI-powered surplus prediction, intelligent routing, and real-time coordination.

## 🚀 Features

| Feature | Tech |
|---|---|
| **Surplus Prediction** | XGBoost predicts food surplus from historical + contextual data |
| **Route Optimization** | Google OR-Tools VRP solver minimizes driver routes |
| **Food Classification** | IndicBERT NLP classifies food by type and dietary tags |
| **Real-Time Tracking** | WebSocket-powered live driver and order tracking |
| **Impact Dashboard** | Visual analytics: meals served, CO₂ saved, value recovered |
| **PWA Support** | Installable, offline-capable progressive web app |

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│              React 18 + Vite            │
│     TailwindCSS · Framer Motion         │
│     Zustand · React Router              │
├─────────────────────────────────────────┤
│             FastAPI Backend              │
│   SQLAlchemy · JWT Auth · WebSocket     │
├──────────┬──────────┬───────────────────┤
│ XGBoost  │ OR-Tools │   IndicBERT       │
│ Surplus  │  Route   │    Food           │
│ Predictor│ Optimizer│   Classifier      │
├──────────┴──────────┴───────────────────┤
│        SQLite / PostgreSQL              │
└─────────────────────────────────────────┘
```

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm / pip

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Restaurant | restaurant1@foodrescue.in | demo123 |
| NGO | ngo1@foodrescue.in | demo123 |
| Driver | driver1@foodrescue.in | demo123 |
| Admin | admin@foodrescue.in | admin123 |

### Docker

```bash
docker-compose up --build
```

## 🎨 Design System

- **Glass-morphism** cards with frosted-glass backdrop blur
- **Gradient text** with animated backgrounds
- **15+ custom animations**: float, pulse-glow, shimmer, blob, wave, truck-drive, and more
- **Responsive** mobile-first design
- **Dark-mode** optimized color palette

## 📊 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | JWT login |
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/ngos` | List NGOs |
| POST | `/api/surplus` | Create surplus request |
| POST | `/api/ml/predict` | ML surplus prediction |
| POST | `/api/ml/optimize-route` | Route optimization |
| POST | `/api/ml/classify-food` | Food classification |
| GET | `/api/impact/summary` | Impact metrics |
| WS | `/ws/{client_id}` | Real-time updates |

## 🛠️ Tech Stack

**Frontend:** React 18 · TypeScript · Vite · TailwindCSS · Framer Motion · Zustand · Recharts · Lucide Icons

**Backend:** FastAPI · SQLAlchemy · SQLite · JWT · WebSocket · NumPy

**ML/AI:** XGBoost · Google OR-Tools · IndicBERT (NLP)

**DevOps:** Docker · Docker Compose · Nginx

---

**Team:** Stack Sprint Hackathon 2026

*Building a Zero-Hunger Future, One Meal at a Time* 🌍

