require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const quizRoutes = require('./routes/quizzes');
const attemptRoutes = require('./routes/attempts');
const pointsRoutes = require('./routes/points');
const dashboardRoutes = require('./routes/dashboard');
const linkRoutes = require('./routes/link');
const doubtRoutes = require('./routes/doubts');
const codingRoutes = require('./routes/coding');
const gamesRoutes = require('./routes/games');
const chatRoutes = require('./routes/chat');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/link', linkRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
