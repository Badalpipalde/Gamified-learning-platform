const QnA = require('../models/QnA');

// @desc    Get questions (with filters)
// @route   GET /api/qna
exports.getQuestions = async (req, res, next) => {
  try {
    const { subject, grade, resolved, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (subject) query.subject = subject;
    if (grade) query.grade = parseInt(grade);
    if (resolved === 'true') query.isResolved = true;
    if (resolved === 'false') query.isResolved = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const questions = await QnA.find(query)
      .populate('author', 'name avatar role xp level')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await QnA.countDocuments(query);

    res.json({
      success: true,
      count: questions.length,
      total,
      pages: Math.ceil(total / limit),
      questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question with answers
// @route   GET /api/qna/:id
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await QnA.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar role xp level')
      .populate('answers.author', 'name avatar role xp level');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a question
// @route   POST /api/qna
exports.createQuestion = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const question = await QnA.create(req.body);
    await question.populate('author', 'name avatar role');

    res.status(201).json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an answer to a question
// @route   POST /api/qna/:id/answer
exports.addAnswer = async (req, res, next) => {
  try {
    const question = await QnA.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.answers.push({
      author: req.user._id,
      content: req.body.content
    });
    await question.save();
    await question.populate('answers.author', 'name avatar role xp level');

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an answer (question author only)
// @route   PUT /api/qna/:id/accept/:answerId
exports.acceptAnswer = async (req, res, next) => {
  try {
    const question = await QnA.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only question author can accept answers' });
    }

    // Unmark all answers first
    question.answers.forEach(a => { a.isAccepted = false; });

    // Mark the selected answer as accepted
    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    answer.isAccepted = true;
    question.isResolved = true;
    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote an answer
// @route   PUT /api/qna/:id/upvote/:answerId
exports.upvoteAnswer = async (req, res, next) => {
  try {
    const question = await QnA.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const index = answer.upvotes.indexOf(req.user._id);
    if (index > -1) {
      answer.upvotes.splice(index, 1);
    } else {
      answer.upvotes.push(req.user._id);
    }

    await question.save();

    res.json({
      success: true,
      upvotes: answer.upvotes.length,
      upvoted: index === -1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/qna/:id
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await QnA.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await question.deleteOne();
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};
