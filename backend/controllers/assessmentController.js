import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import Progress from "../models/Progress.js";

// Get Assessment
export const getAssessment = async (req, res) => {
  try {
    const { skill, type } = req.query;

    const assessment = await Assessment.findOne({ skill, type });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Assessment
export const submitAssessment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);

    let score = 0;

    assessment.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    const aiFeedback =
      score > assessment.questions.length / 2
        ? "Great performance! You're improving fast."
        : "Needs improvement. Focus more on fundamentals.";

    await Submission.create({
      userId,
      assessmentId,
      answers,
      score,
      aiFeedback
    });

    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();

    if (!progress) {
      progress = await Progress.create({
        userId,
        totalSolved: 1,
        dailyStreak: 1,
        lastSolvedDate: new Date()
      });
    } else {
      progress.totalSolved += 1;

      if (
        new Date(progress.lastSolvedDate).toDateString() !== today
      ) {
        progress.dailyStreak += 1;
      }

      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    res.json({
      message: "Submission successful",
      score,
      aiFeedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Progress
export const getProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const progress = await Progress.findOne({ userId });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Code
export const submitCode = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { code, language, problemTitle } = req.body;

    if (!code || !language || !problemTitle) {
      return res.status(400).json({ error: 'code, language, and problemTitle are required' });
    }

    await Submission.create({
      userId,
      submissionType: 'coding',
      code,
      language,
      problemTitle,
      status: 'accepted',
    });

    // Update progress
    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();
    if (!progress) {
      await Progress.create({ userId, totalSolved: 1, dailyStreak: 1, lastSolvedDate: new Date() });
    } else {
      progress.totalSolved += 1;
      if (new Date(progress.lastSolvedDate).toDateString() !== today) {
        progress.dailyStreak += 1;
      }
      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    res.json({ message: 'Code submission saved', status: 'accepted' });
  } catch (error) {
    console.error("submitCode error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Submit Quiz
export const submitQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { answers, score, totalQuestions } = req.body;

    if (score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'score and totalQuestions are required' });
    }

    await Submission.create({
      userId,
      submissionType: 'quiz',
      answers,
      score,
      totalQuestions,
      status: 'accepted',
    });

    // Update progress
    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();
    if (!progress) {
      await Progress.create({ userId, totalSolved: 1, dailyStreak: 1, lastSolvedDate: new Date() });
    } else {
      progress.totalSolved += 1;
      if (new Date(progress.lastSolvedDate).toDateString() !== today) {
        progress.dailyStreak += 1;
      }
      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    res.json({ message: 'Quiz submission saved', score, totalQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Submissions
export const getSubmissions = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Dashboard (aggregated progress data for charts)
export const getDashboard = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Fetch all submissions for this user
    const submissions = await Submission.find({ userId }).sort({ createdAt: 1 });

    // Fetch progress summary
    const progress = await Progress.findOne({ userId });

    // --- Helper: format a date as "MMM D" (e.g. "Mar 27") ---
    const fmtDate = (d) => {
      const dt = new Date(d);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[dt.getMonth()]} ${dt.getDate()}`;
    };

    // --- 1. Main chart: daily score (cumulative solved count per day) ---
    const dailyScoreMap = {};
    let cumulativeScore = 0;
    for (const sub of submissions) {
      const key = fmtDate(sub.createdAt);
      cumulativeScore += (sub.score || 1);
      dailyScoreMap[key] = cumulativeScore;
    }
    const mainChartData = Object.entries(dailyScoreMap).map(([date, score]) => ({ date, score }));

    // --- 2. Daily coding questions solved ---
    const codingMap = {};
    for (const sub of submissions) {
      if (sub.submissionType === 'coding') {
        const key = fmtDate(sub.createdAt);
        codingMap[key] = (codingMap[key] || 0) + 1;
      }
    }
    const codingQuestionsData = Object.entries(codingMap).map(([day, solved]) => ({ day, solved }));

    // --- 3. Daily MCQ / quiz questions solved ---
    const mcqMap = {};
    for (const sub of submissions) {
      if (sub.submissionType === 'quiz' || sub.assessmentId) {
        const key = fmtDate(sub.createdAt);
        mcqMap[key] = (mcqMap[key] || 0) + 1;
      }
    }
    const mcqData = Object.entries(mcqMap).map(([day, solved]) => ({ day, solved }));

    // --- 4. Recent quiz scores ---
    const quizSubs = submissions.filter(s => s.submissionType === 'quiz' || s.assessmentId);
    const quizData = quizSubs.slice(-7).map((s, i) => ({
      name: `Quiz ${i + 1}`,
      score: s.score || 0,
    }));

    // --- 5. Summary stats ---
    const totalSolved = progress?.totalSolved || submissions.length;
    const dailyStreak = progress?.dailyStreak || 0;
    const totalCoding = submissions.filter(s => s.submissionType === 'coding').length;
    const totalQuiz = submissions.filter(s => s.submissionType === 'quiz' || s.assessmentId).length;

    res.json({
      mainChartData,
      codingQuestionsData,
      mcqData,
      quizData,
      stats: {
        totalSolved,
        dailyStreak,
        totalCoding,
        totalQuiz,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};
