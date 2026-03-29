export class AgentOrchestrator {
    constructor(client) {
        this.client = client;
        this.studyMaterials = [];
        this.recentActivity = [];
        this.model = "openai/gpt-oss-120b:free"; 
        this.fallbackModel = "meta-llama/llama-3.1-8b-instruct:free";
        this.ultimateFallback = "openrouter/free";
    }

    async handleChat(messages, profile, submissions) {
        this.logActivity(`Chat request received...`);

        const codingSubmissions = (submissions || []).filter(s => s.submissionType === 'coding');
        const quizSubmissions = (submissions || []).filter(s => s.submissionType === 'quiz');

        const contextPrompt = `
You are Lumina, a premium personal AI Mentor. 
User Context:
- Role: ${profile.role}
- Experience: ${profile.experience}
- Tech Stack: ${(profile.stack || []).join(", ")}
- Goal: ${profile.goal}
- Submissions: ${codingSubmissions.length} coding, ${quizSubmissions.length} quiz.

Provide helpful, personalized advice based on this context. Be concise but deep.
`;

        const openRouterOptions = {
            headers: {
                "HTTP-Referer": "https://learnpath-ai.xyz",
                "X-Title": "LearnPath-AI",
            }
        };

        try {
            const attempts = [this.model, this.fallbackModel, "google/gemma-3-27b-it:free", this.ultimateFallback];
            let completion;
            let lastError;

            for (const modelId of attempts) {
                try {
                    this.logActivity(`Attempting chat with: ${modelId}`);
                    completion = await this.client.chat.completions.create({
                        model: modelId,
                        messages: [
                            { role: "system", content: contextPrompt },
                            ...messages
                        ]
                    }, openRouterOptions);
                    if (completion && completion.choices && completion.choices[0]) break;
                } catch (err) {
                    this.logActivity(`${modelId} failed: ${err.message}`);
                    lastError = err;
                }
            }

            if (!completion) throw lastError || new Error("All chat models exhausted");

            return { success: true, response: completion.choices[0].message.content };
        } catch (error) {
            console.error("AgentOrchestrator Chat Error:", error);
            return { success: false, error: error.message };
        }
    }

    async generateAnalysis(profile, submissions, progress) {
        this.logActivity(`Generating personalized analysis for user...`);

        const codingSubmissions = (submissions || []).filter(s => s.submissionType === 'coding');
        const quizSubmissions = (submissions || []).filter(s => s.submissionType === 'quiz');

        const systemPrompt = `
You are Lumina, a premium AI Career Coach and Senior Engineering Mentor. 
Your goal is to provide a highly personalized, gamified, and actionable analysis of a student's progress and skill gaps.

User Profile:
- Role: ${profile.role}
- Experience: ${profile.experience}
- Tech Stack: ${(profile.stack || []).join(", ")}
- Goal: ${profile.goal}
- Hours/Week: ${profile.hoursPerWeek}

Real Stats:
- Daily Streak: ${progress?.dailyStreak || 0}
- Total Solved: ${progress?.totalSolved || 0}
- Coding Submissions: ${codingSubmissions.length}
- Quiz Submissions: ${quizSubmissions.length}

Recent Activity:
- Recent Problem Titles (Coding): ${codingSubmissions.slice(0, 5).map(s => s.problemTitle).join(", ")}
- Recent Quiz Scores: ${quizSubmissions.slice(0, 5).map(s => `${s.score}/${s.totalQuestions}`).join(", ")}

Task:
Analyze their performance and goal. Provide a gamified response with:
1. "Rank/Level": A creative, elite title based on their progress (e.g. "Fullstack Architect", "Quantum Debugger").
2. "Weak Areas": 3 specific technical areas where they need improvement based on their latest submissions.
3. "Improvement Suggestions": Concrete steps to improve.
4. "Best Practices": 3-4 high-level engineering best practices they should adopt now.
5. "Personalized Pitch": A short, motivating message (2-3 sentences) about their journey.
6. "Gamified Stats": XP points, level progression.

Ensure the response is formatted as valid JSON:
{
  "level": "...",
  "xp": 1200,
  "nextLevel": 2000,
  "weakAreas": ["Area 1", "Area 2", "Area 3"],
  "suggestions": ["Step 1", "Step 2", "Step 3"],
  "bestPractices": ["Advise 1", "Advise 2", "Advise 3"],
  "pitch": "...",
  "badges": ["Fast Learner", "Debugger"],
  "streak": ${progress?.dailyStreak || 0}
}
`;

        const openRouterOptions = {
            headers: {
                "HTTP-Referer": "https://learnpath-ai.xyz",
                "X-Title": "LearnPath-AI",
            }
        };

        try {
            const attempts = [this.model, this.fallbackModel, "google/gemma-3-27b-it:free", this.ultimateFallback];
            let completion;
            let lastError;

            for (const modelId of attempts) {
                try {
                    this.logActivity(`Attempting analysis with: ${modelId}`);
                    completion = await this.client.chat.completions.create({
                        model: modelId,
                        messages: [
                            { role: "system", content: "You are a personalized AI mentor. Return only JSON." },
                            { role: "user", content: systemPrompt }
                        ],
                    }, openRouterOptions);
                    if (completion && completion.choices && completion.choices[0]) break;
                } catch (err) {
                    this.logActivity(`${modelId} failed: ${err.message}`);
                    lastError = err;
                }
            }

            if (!completion) throw lastError || new Error("All analysis models exhausted");

            const raw = completion.choices[0].message.content;
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                const match = raw.match(/```json([\s\S]*?)```/);
                if (match) {
                    parsed = JSON.parse(match[1]);
                } else {
                    const possibleJson = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
                    if (possibleJson) parsed = JSON.parse(possibleJson);
                    else throw new Error("Invalid AI response format");
                }
            }
            return { success: true, analysis: parsed };
        } catch (error) {
            console.error("AgentOrchestrator Analysis Error:", error);
            return {
                success: false,
                error: "Neural synthesis encountered an anomaly. Please retry.",
                details: error.message
            };
        }
    }

    logActivity(message) {
        console.log(`[AgentOrchestrator] ${message}`);
        this.recentActivity.unshift({
            message,
            timestamp: new Date()
        });

        // Maintain a limited history in memory
        if (this.recentActivity.length > 100) {
            this.recentActivity = this.recentActivity.slice(0, 100);
        }
    }
}
