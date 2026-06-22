const User = require('../models/User');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user to their own room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Request leaderboard update
    socket.on('requestLeaderboard', async () => {
      try {
        const students = await User.find({ role: 'student' })
          .select('name avatar xp level coins streak.current')
          .sort({ xp: -1 })
          .limit(20);

        const leaderboard = students.map((student, index) => ({
          rank: index + 1,
          _id: student._id,
          name: student.name,
          avatar: student.avatar,
          xp: student.xp,
          level: student.level,
          streak: student.streak.current
        }));

        socket.emit('leaderboardUpdate', leaderboard);
      } catch (error) {
        console.error('Leaderboard socket error:', error);
      }
    });

    // Broadcast XP update
    socket.on('xpUpdate', (data) => {
      io.emit('leaderboardChanged', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;
