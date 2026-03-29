import express from "express";
import { requireAuth } from "../middleware/clerkMiddleware.js";
import {
  getAssessment,
  submitAssessment,
  getProgress,
  submitCode,
  submitQuiz,
  getSubmissions,
  getDashboard,
  updateUserProfile,
  getUserProfile,
  getAiAnalysis,
  aiChat
} from "../controllers/assessmentController.js";

const router = express.Router();

router.get("/get", requireAuth, getAssessment);
router.post("/submit", requireAuth, submitAssessment);
router.get("/progress", requireAuth, getProgress);
router.post("/submit-code", requireAuth, submitCode);
router.post("/submit-quiz", requireAuth, submitQuiz);
router.get("/submissions", requireAuth, getSubmissions);
router.get("/dashboard", requireAuth, getDashboard);
router.post("/user-profile", requireAuth, updateUserProfile);
router.get("/user-profile", requireAuth, getUserProfile);
router.get("/ai-analysis", requireAuth, getAiAnalysis);
router.post("/ai-chat", requireAuth, aiChat);

export default router;
