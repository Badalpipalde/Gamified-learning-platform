const User = require('../models/User');
const Attempt = require('../models/Attempt');
const PointsLedger = require('../models/PointsLedger');
const Badge = require('../models/Badge');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const ParentLink = require('../models/ParentLink');

// @desc    Student dashboard data
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, recentAttempts, subjectProgress, quizzesCompleted, pointsBySource] = await Promise.all([
      // User with badges
      User.findById(userId).populate('badges'),

      // Recent attempts
      Attempt.find({ userId })
        .populate({
          path: 'quizId',
          select: 'title level subjectId',
          populate: { path: 'subjectId', select: 'name slug icon' },
        })
        .sort({ createdAt: -1 })
        .limit(10),

      // Subject-wise progress (avg score per subject)
      Attempt.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz',
          },
        },
        { $unwind: '$quiz' },
        {
          $lookup: {
            from: 'subjects',
            localField: 'quiz.subjectId',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $group: {
            _id: '$subject._id',
            subjectName: { $first: '$subject.name' },
            subjectIcon: { $first: '$subject.icon' },
            totalAttempts: { $sum: 1 },
            totalScore: { $sum: '$score' },
            totalQuestions: { $sum: '$totalQuestions' },
          },
        },
        {
          $project: {
            subjectName: 1,
            subjectIcon: 1,
            totalAttempts: 1,
            avgPercent: {
              $round: [
                { $multiply: [{ $divide: ['$totalScore', '$totalQuestions'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { 'subjectName.en': 1 } },
      ]),

      // Total quizzes completed
      Attempt.countDocuments({ userId }),

      // Points breakdown by source
      PointsLedger.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$source', total: { $sum: '$points' } } },
      ])
    ]);

    res.json({
      totalPoints: user.totalPoints,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      quizzesCompleted,
      subjectProgress,
      recentAttempts,
      pointsBySource,
    });
  } catch (err) {
    console.error('GetStudentDashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Parent dashboard — children's progress
// @route   GET /api/dashboard/parent
// @access  Private/Parent
const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user._id;

    // Get linked children
    const links = await ParentLink.find({ parentId, active: true });
    const childIds = links.map((l) => l.studentId);

    if (childIds.length === 0) {
      return res.json({ children: [], message: 'No linked children' });
    }

    // Get each child's data
    const children = await Promise.all(
      childIds.map(async (childId) => {
        const child = await User.findById(childId)
          .select('name rollNo classId totalPoints level streak badges active')
          .populate('classId', 'name section')
          .populate('badges');

        if (!child || !child.active) return null;

        // Run independent queries for the child in parallel
        const [recentAttempts, subjectProgress, quizzesCompleted] = await Promise.all([
          // Recent attempts
          Attempt.find({ userId: childId })
            .populate({
              path: 'quizId',
              select: 'title level',
              populate: { path: 'subjectId', select: 'name icon' },
            })
            .sort({ createdAt: -1 })
            .limit(5),

          // Subject progress
          Attempt.aggregate([
            { $match: { userId: childId } },
            {
              $lookup: {
                from: 'quizzes',
                localField: 'quizId',
                foreignField: '_id',
                as: 'quiz',
              },
            },
            { $unwind: '$quiz' },
            {
              $lookup: {
                from: 'subjects',
                localField: 'quiz.subjectId',
                foreignField: '_id',
                as: 'subject',
              },
            },
            { $unwind: '$subject' },
            {
              $group: {
                _id: '$subject._id',
                subjectName: { $first: '$subject.name' },
                subjectIcon: { $first: '$subject.icon' },
                totalAttempts: { $sum: 1 },
                totalScore: { $sum: '$score' },
                totalQuestions: { $sum: '$totalQuestions' },
              },
            },
            {
              $project: {
                subjectName: 1,
                subjectIcon: 1,
                totalAttempts: 1,
                avgPercent: {
                  $round: [
                    { $multiply: [{ $divide: ['$totalScore', '$totalQuestions'] }, 100] },
                    0,
                  ],
                },
              },
            },
          ]),

          // Total quizzes completed
          Attempt.countDocuments({ userId: childId })
        ]);

        return {
          _id: child._id,
          name: child.name,
          rollNo: child.rollNo,
          className: child.classId
            ? `${child.classId.name}${child.classId.section ? ' - ' + child.classId.section : ''}`
            : '',
          totalPoints: child.totalPoints,
          level: child.level,
          streak: child.streak,
          badges: child.badges,
          quizzesCompleted,
          subjectProgress,
          recentAttempts,
        };
      })
    );

    res.json({ children: children.filter(Boolean) });
  } catch (err) {
    console.error('GetParentDashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Teacher dashboard — class overview
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get teacher's classes
    const classes = await Class.find({ teacherId });

    if (classes.length === 0) {
      return res.json({ classes: [], students: [], topPerformers: [], subjectStats: [] });
    }

    const classIds = classes.map((c) => c._id);

    // Get all students in teacher's classes
    const students = await User.find({
      classId: { $in: classIds },
      role: 'student',
    })
      .select('name rollNo classId totalPoints level streak active')
      .sort({ totalPoints: -1 });

    const activeStudents = students.filter((s) => s.active);
    const studentIds = activeStudents.map((s) => s._id);

    // Top 5 performers
    const topPerformers = activeStudents.slice(0, 5).map((s, i) => ({
      rank: i + 1,
      _id: s._id,
      name: s.name,
      rollNo: s.rollNo,
      totalPoints: s.totalPoints,
      level: s.level,
    }));

    // Class averages
    const totalPoints = activeStudents.reduce((sum, s) => sum + s.totalPoints, 0);
    const avgPoints = activeStudents.length > 0 ? Math.round(totalPoints / activeStudents.length) : 0;

    // Subject-wise class performance and Recent activity count in parallel
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [subjectStats, recentActivity] = await Promise.all([
      Attempt.aggregate([
        { $match: { userId: { $in: studentIds } } },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz',
          },
        },
        { $unwind: '$quiz' },
        {
          $lookup: {
            from: 'subjects',
            localField: 'quiz.subjectId',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        {
          $group: {
            _id: '$subject._id',
            subjectName: { $first: '$subject.name' },
            subjectIcon: { $first: '$subject.icon' },
            totalAttempts: { $sum: 1 },
            totalScore: { $sum: '$score' },
            totalQuestions: { $sum: '$totalQuestions' },
            uniqueStudents: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            subjectName: 1,
            subjectIcon: 1,
            totalAttempts: 1,
            studentCount: { $size: '$uniqueStudents' },
            avgPercent: {
              $round: [
                { $multiply: [{ $divide: ['$totalScore', '$totalQuestions'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { avgPercent: 1 } }, // weakest first
      ]),
      Attempt.countDocuments({
        userId: { $in: studentIds },
        createdAt: { $gte: weekAgo },
      })
    ]);

    res.json({
      classes: classes.map((c) => ({ _id: c._id, name: c.name, section: c.section })),
      summary: {
        totalStudents: activeStudents.length,
        inactiveStudents: students.length - activeStudents.length,
        avgPoints,
        recentActivity,
      },
      topPerformers,
      subjectStats,
    });
  } catch (err) {
    console.error('GetTeacherDashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run independent database counts and aggregations in parallel
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalQuizzes,
      totalSubjects,
      pointsData,
      recentAttempts
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'parent' }),
      Class.countDocuments(),
      Quiz.countDocuments(),
      Subject.countDocuments(),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: null, totalPoints: { $sum: "$totalPoints" } } }
      ]),
      Attempt.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const platformPoints = pointsData[0]?.totalPoints || 0;

    res.json({
      users: {
        students: totalStudents,
        teachers: totalTeachers,
        parents: totalParents,
      },
      content: {
        classes: totalClasses,
        subjects: totalSubjects,
        quizzes: totalQuizzes,
      },
      engagement: {
        platformPoints,
        recentAttempts,
      }
    });
  } catch (err) {
    console.error('GetAdminDashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentDashboard, getParentDashboard, getTeacherDashboard, getAdminDashboard };
