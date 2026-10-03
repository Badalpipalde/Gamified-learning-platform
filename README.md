# VidyaQuest

Gamified learning platform for rural education. Built with MongoDB, Express, React (Vite), and Node.js.

## Features Built
- **Role-Based Auth System**: Admin, Teacher, Student, Parent with stateless JWTs.
- **Quizzes & Gamification**: Subject-based quizzes, server-side scoring, streaks, automated badges, and a class leaderboard.
- **Dashboards**: Full charts using Recharts for students (own progress), parents (children's progress), and teachers (class progress).
- **Parent Linking**: Secure 6-character shortcode system to link students to parents.
- **Doubts System**: Threaded Q&A allowing students to ask questions and teachers to reply/close them, with a read-only view for parents.
- **Coding Track**: Live JavaScript coding challenges securely executed in a sandboxed Node VM, complete with test cases.
- **Progressive Web App (PWA)**: Offline support, caching via Workbox, and installable as a native-like app, with an offline connection banner.
- **Security & Polish**: API rate limiting, global React error boundaries, strict MongoDB schema validations, and mobile-first responsive design.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```
   - Server runs on `http://localhost:5000`
   - Client runs on `http://localhost:5173`

## Demo Accounts

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@vidyaquest.com     | admin123    |
| Teacher | sunita@vidyaquest.com    | teacher123  |
| Teacher | rajesh@vidyaquest.com    | teacher123  |
| Student | aarav@vidyaquest.com     | student123  |
| Student | diya@vidyaquest.com      | student123  |
| Parent  | vikram@vidyaquest.com    | parent123   |
| Parent  | meera@vidyaquest.com     | parent123   |

## Project Structure

```
VidyaQuest/
├── client/          # React (Vite) frontend
│   └── src/
│       ├── assets/styles/   # CSS design system
│       ├── components/      # Reusable components
│       ├── context/         # React contexts (Auth)
│       ├── pages/           # Route pages by role
│       └── services/        # API client
├── server/          # Express backend
│   ├── config/      # DB connection
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, roles, validation
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express routes
│   └── seeds/       # Database seeding
├── .env.example
└── package.json     # Root scripts
```

## Scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start both server and client       |
| `npm run server`    | Start server only                  |
| `npm run client`    | Start client only                  |
| `npm run seed`      | Seed database with demo data       |
| `npm run install:all`| Install all dependencies          |
