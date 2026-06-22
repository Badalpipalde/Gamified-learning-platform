# 🎓 GramSiksha - Gamified Learning Platform for Rural Education

A modern, responsive, gamified learning platform built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Designed to improve education accessibility for rural students through gamification, offline-friendly design, multilingual support, and interactive content.

![GramSiksha](https://img.shields.io/badge/GramSiksha-Rural%20Education-2D6A4F?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-00B4D8?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)

---

## ✨ Features

### 🎮 Gamification System
- **XP Points & Levels** — Earn experience for completing lessons and quizzes
- **Achievement Badges** — Unlock badges (Common → Legendary) for milestones
- **Daily Streaks** — Maintain learning consistency with streak tracking
- **Coins System** — Earn virtual coins for rewards
- **Leaderboard** — Real-time ranking among students
- **Daily Challenges** — Special tasks for bonus rewards

### 👨‍🎓 Student Dashboard
- Personalized learning stats (XP, Level, Streak, Coins)
- Animated progress bars and level tracking
- Recommended lessons based on subjects
- Quick access to leaderboard and achievements

### 📚 Learning Modules
- **Video Lessons** — Embedded video content
- **Interactive Quizzes** — MCQ, True/False, Fill-in-the-blank with scoring
- **Exercises** — Practice activities
- **Progress Tracking** — Per-lesson completion tracking

### 👩‍🏫 Teacher Dashboard
- Upload and manage lessons
- Create quizzes with multiple question types
- Track student progress and performance
- Analytics overview

### 👨‍👩‍👧 Parent Dashboard
- Monitor child's learning progress
- Weekly performance summaries
- Score and time tracking

### 💬 Community
- Discussion forum with categories
- Post likes and threaded replies
- Achievement sharing

### 🌐 Additional Features
- **Multilingual** — English + Hindi with easy toggle
- **Dark/Light Mode** — Persistent theme with smooth transitions
- **Responsive** — Mobile-first, tablet, and desktop layouts
- **JWT Authentication** — Secure role-based access
- **PWA Support** — Offline-ready manifest

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS 3 | Styling |
| Redux Toolkit | State Management |
| React Router | Routing |
| Framer Motion | Animations |
| Axios | HTTP Client |
| Chart.js | Data Visualization |
| React Icons | Icon Library |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Socket.io | Real-time Features |
| Cloudinary | File Storage |
| Bcrypt.js | Password Hashing |

---

## 📁 Project Structure

```
Major/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Navbar, Sidebar, Footer, etc.
│   │   │   └── landing/    # Landing page sections
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Redux slices
│   │   ├── i18n/           # Translations (EN/HI)
│   │   ├── utils/          # API client, helpers
│   │   ├── App.jsx         # Main app with routing
│   │   └── index.css       # Global styles
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Express Backend
│   ├── config/             # DB & Cloudinary config
│   ├── models/             # Mongoose schemas
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── middleware/          # Auth, role check, errors
│   ├── socket/             # Socket.io setup
│   ├── utils/              # Token generation, seed data
│   └── server.js           # Entry point
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gramsiksha.git
cd gramsiksha
```

### 2. Setup Backend
```bash
cd server
npm install

# Create .env file (or edit the existing one)
# MONGODB_URI=mongodb://localhost:27017/gramsiksha
# JWT_SECRET=your_secret_key
# PORT=5000
# CLIENT_URL=http://localhost:5173

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in Browser
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@gramsiksha.com | password123 |
| Teacher | teacher@gramsiksha.com | password123 |
| Parent | parent@gramsiksha.com | password123 |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify-otp` | Verify OTP |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/lessons` | Get all lessons |
| GET | `/api/lessons/:id` | Get single lesson |
| POST | `/api/lessons` | Create lesson (teacher) |
| GET | `/api/quizzes` | Get quizzes |
| POST | `/api/quizzes/:id/submit` | Submit quiz |
| GET | `/api/progress` | Get progress |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/achievements` | Get achievements |
| GET | `/api/forum` | Get forum posts |
| POST | `/api/forum` | Create forum post |
| GET | `/api/notifications` | Get notifications |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary (Earth Green) | `#2D6A4F` / `#40916C` / `#52B788` |
| Accent (Blue) | `#0077B6` / `#00B4D8` / `#48CAE4` |
| XP Gold | `#F59E0B` / `#FBBF24` |
| Font (Body) | Inter |
| Font (Headings) | Outfit |
| Border Radius | 12px cards, 8px buttons |
| Dark Mode | Class-based with localStorage persistence |

---

## 📜 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<p align="center">
  Made with ❤️ for Rural India 🇮🇳
</p>
