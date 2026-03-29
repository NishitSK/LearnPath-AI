import OpenAI from "openai";
import dotenv from "dotenv";
import { AgentOrchestrator } from "../agents/agentOrchestrator.js";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.HF_API_KEY,
});

const agentOrchestrator = new AgentOrchestrator(client);

export { client, agentOrchestrator };
