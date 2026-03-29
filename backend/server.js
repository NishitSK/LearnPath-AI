import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { clerkMiddleware } from "./middleware/clerkMiddleware.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import { client, agentOrchestrator } from "./config/aiClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Assessment Routes
app.use("/api/assessment", assessmentRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send("Welcome to LearnPath-AI!");
});

// AI Generation Endpoint
app.post("/generate", async (req, res) => {
  try {
    const { role } = req.body;

    const systemPrompt = `
You are a Technical Interviewer.
Generate a scenario-based question for a ${role}.
Return JSON in this format:

{
  "question": "...",
  "options": [{ "id": "A", "text": "..." }],
  "correctOptionId": "A",
  "skillCategory": "...",
  "explanation": "..."
}
`;

    const completion = await client.chat.completions.create({
      model: "zai-org/GLM-4.7-Flash:novita",
      messages: [{ role: "user", content: systemPrompt }],
    });

    const raw = completion.choices[0].message.content;
    console.log("Raw AI Response:", raw);

    // Attempt to parse JSON content
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn("Retrying parse or sending raw:", e);
      // Sometimes models wrap JSON in markdown blocks
      const match = raw.match(/```json([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        parsed = { raw: raw }; // Fallback
      }
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error generating question:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============ AI AGENT ENDPOINTS ============

// Process study event (highlight, scroll, idle)
app.post("/agent/event", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Event type is required" });
    }

    const result = await agentOrchestrator.processEvent({ type, data });
    res.json(result);
  } catch (err) {
    console.error("Error processing event:", err);
    res.status(500).json({ error: err.message });
  }
});

// Manual help request
app.post("/agent/help", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const result = await agentOrchestrator.requestHelp(text);
    res.json(result);
  } catch (err) {
    console.error("Error requesting help:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add study material
app.post("/agent/materials", async (req, res) => {
  try {
    const { topic, content, keywords } = req.body;

    if (!topic || !content) {
      return res.status(400).json({ error: "Topic and content are required" });
    }

    agentOrchestrator.addStudyMaterial({
      topic,
      content,
      keywords: keywords || []
    });

    res.json({ success: true, message: "Material added successfully" });
  } catch (err) {
    console.error("Error adding material:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all study materials
app.get("/agent/materials", (req, res) => {
  try {
    const materials = agentOrchestrator.getStudyMaterials();
    res.json({ materials });
  } catch (err) {
    console.error("Error getting materials:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get recent activity (for debugging)
app.get("/agent/activity", (req, res) => {
  try {
    const activity = agentOrchestrator.getRecentActivity();
    res.json({ activity });
  } catch (err) {
    console.error("Error getting activity:", err);
    res.status(500).json({ error: err.message });
  }
});

// Database Connection and Server Start
const PORT = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (MONGOURL) {
  mongoose
    .connect(MONGOURL)
    .then(() => {
      console.log("Connected to MONGODB");
      startServer();
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err);
      // Optional: Start server anyway if you want AI to work without DB
      // startServer(); 
    });
} else {
  console.warn("No MONGOURL provided in .env. Starting server without Database connection.");
  startServer();
}
