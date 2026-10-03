const vm = require('vm');
const CodeProblem = require('../models/CodeProblem');
const CodeAttempt = require('../models/CodeAttempt');
const PointsLedger = require('../models/PointsLedger');
const User = require('../models/User');

// @desc    Get all coding problems
// @route   GET /api/coding/problems
// @access  Private/Student
const getProblems = async (req, res) => {
  try {
    const studentId = req.user._id;
    const problems = await CodeProblem.find().select('-testCases.hidden');
    const attempts = await CodeAttempt.find({ studentId, status: 'passed' }).select('problemId');

    const solvedIds = attempts.map((a) => a.problemId.toString());

    const annotated = problems.map((p) => ({
      ...p.toObject(),
      solved: solvedIds.includes(p._id.toString()),
    }));

    res.json(annotated);
  } catch (err) {
    console.error('GetProblems error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get problem by ID
// @route   GET /api/coding/problems/:id
// @access  Private/Student
const getProblem = async (req, res) => {
  try {
    const problem = await CodeProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    
    // Mask hidden test cases from student view
    const pObj = problem.toObject();
    pObj.testCases = pObj.testCases.map(tc => tc.hidden ? { hidden: true } : tc);
    
    res.json(pObj);
  } catch (err) {
    console.error('GetProblem error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Execute code and evaluate test cases
// @route   POST /api/coding/execute/:id
// @access  Private/Student
const executeCode = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { code } = req.body;
    const problem = await CodeProblem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const testResults = [];
    let allPassed = true;

    // We assume the user's code defines a function called `solution`
    // We will append a call to this function for each test case
    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const sandbox = { result: null, console: { log: () => {} } };
      vm.createContext(sandbox);

      const executableCode = `
        ${code}
        result = solution(${tc.input});
      `;

      try {
        // Run with a 1-second timeout to prevent infinite loops
        vm.runInContext(executableCode, sandbox, { timeout: 1000 });

        const actualOutput = String(sandbox.result);
        const expected = String(tc.expectedOutput);
        const passed = actualOutput === expected;

        if (!passed) allPassed = false;

        testResults.push({
          index: i + 1,
          input: tc.hidden ? 'Hidden Test Case' : tc.input,
          expected: tc.hidden ? '?' : expected,
          actual: actualOutput,
          passed,
          hidden: tc.hidden
        });
      } catch (err) {
        allPassed = false;
        testResults.push({
          index: i + 1,
          input: tc.hidden ? 'Hidden Test Case' : tc.input,
          expected: tc.hidden ? '?' : String(tc.expectedOutput),
          actual: err.message,
          passed: false,
          error: true,
          hidden: tc.hidden
        });
      }
    }

    const status = allPassed ? 'passed' : 'failed';
    
    // Check if already solved
    const existingPassed = await CodeAttempt.findOne({ studentId, problemId: problem._id, status: 'passed' });
    let pointsEarned = 0;

    if (allPassed && !existingPassed) {
      pointsEarned = problem.points;
      
      // Award points
      await PointsLedger.create({
        userId: studentId,
        points: pointsEarned,
        source: 'coding',
        referenceId: problem._id,
        description: `Solved coding problem: ${problem.title}`,
      });

      await User.findByIdAndUpdate(studentId, {
        $inc: { totalPoints: pointsEarned },
      });
    }

    await CodeAttempt.create({
      studentId,
      problemId: problem._id,
      code,
      status,
      pointsEarned,
    });

    res.json({
      success: allPassed,
      results: testResults,
      pointsEarned,
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed.',
    });
  } catch (err) {
    console.error('ExecuteCode error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProblems, getProblem, executeCode };
