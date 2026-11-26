const crypto = require('crypto');
const LinkCode = require('../models/LinkCode');
const ParentLink = require('../models/ParentLink');
const User = require('../models/User');

const CODE_TTL_MINUTES = 30;

function generateCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// @desc    Generate a parent-link code (student)
// @route   POST /api/link/generate
// @access  Private/Student
const generateLinkCode = async (req, res) => {
  try {
    const studentId = req.user._id;

    await LinkCode.updateMany(
      { studentId, used: false },
      { $set: { expiresAt: new Date() } }
    );

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await LinkCode.create({ studentId, code, expiresAt });

    res.status(201).json({
      code,
      expiresAt,
      ttlMinutes: CODE_TTL_MINUTES,
    });
  } catch (err) {
    console.error('GenerateLinkCode error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Redeem a link code (parent)
// @route   POST /api/link/redeem
// @access  Private/Parent
const redeemLinkCode = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({ message: 'Please enter a valid 6-character code' });
    }

    const linkCode = await LinkCode.findOne({
      code: code.toUpperCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!linkCode) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const [existing, student] = await Promise.all([
      ParentLink.findOne({
        parentId,
        studentId: linkCode.studentId,
      }),
      User.findById(linkCode.studentId).select('name rollNo').lean(),
    ]);

    if (existing) {
      if (existing.active) {
        return res.status(400).json({ message: 'You are already linked to this student' });
      }
      existing.active = true;
      linkCode.used = true;
      await Promise.all([existing.save(), linkCode.save()]);
    } else {
      linkCode.used = true;
      await Promise.all([
        ParentLink.create({
          parentId,
          studentId: linkCode.studentId,
        }),
        linkCode.save(),
      ]);
    }

    res.json({
      message: 'Successfully linked!',
      student: { name: student.name, rollNo: student.rollNo },
    });
  } catch (err) {
    console.error('RedeemLinkCode error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get linked children (parent)
// @route   GET /api/link/children
// @access  Private/Parent
const getLinkedChildren = async (req, res) => {
  try {
    const links = await ParentLink.find({ parentId: req.user._id, active: true })
      .populate('studentId', 'name rollNo classId totalPoints level streak')
      .sort({ linkedAt: -1 })
      .lean();

    const children = links
      .filter((l) => l.studentId)
      .map((l) => ({
        _id: l.studentId._id,
        name: l.studentId.name,
        rollNo: l.studentId.rollNo,
        totalPoints: l.studentId.totalPoints,
        level: l.studentId.level,
        streak: l.studentId.streak,
        linkedAt: l.linkedAt,
      }));

    res.json(children);
  } catch (err) {
    console.error('GetLinkedChildren error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unlink a child (parent)
// @route   DELETE /api/link/children/:studentId
// @access  Private/Parent
const unlinkChild = async (req, res) => {
  try {
    const link = await ParentLink.findOneAndUpdate(
      {
        parentId: req.user._id,
        studentId: req.params.studentId,
        active: true,
      },
      { $set: { active: false } },
      { new: true }
    ).lean();

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Child unlinked' });
  } catch (err) {
    console.error('UnlinkChild error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { generateLinkCode, redeemLinkCode, getLinkedChildren, unlinkChild };
