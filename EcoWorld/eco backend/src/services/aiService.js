/**
 * aiService.js
 * -------------------------------------------------------------------------
 * Central place where all AI calls happen. Everything else in the codebase
 * (controllers) calls functions from here and never talks to the AI
 * provider directly. That means:
 *   - Swapping providers (Gemini -> OpenRouter -> your own model later)
 *     only requires editing this one file.
 *   - If no API key is configured, every function falls back to realistic
 *     mock data so the frontend keeps working during development/demos.
 * -------------------------------------------------------------------------
 */

const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ScanResult = require("../models/ScanResult");

const AI_PROVIDER = process.env.AI_PROVIDER || "none";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const isAiEnabled = AI_PROVIDER === "gemini" && !!GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here";

let genAI = null;
if (isAiEnabled) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fileToGenerativePart = (filePath, mimeType) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString("base64"),
    mimeType,
  },
});

const mimeFromExt = (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

// Extract the first {...} JSON block from a model's text response,
// since models sometimes wrap JSON in prose or markdown fences.
const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  return JSON.parse(match[0]);
};

// ---------------------------------------------------------------------------
// 1. Waste image classification (AI Waste Scanner)
// ---------------------------------------------------------------------------

const MOCK_ITEMS = [
  { detectedItem: "Plastic Bottle", category: "Plastic", recyclable: true, disposalRecommendation: "Put it in the plastic recycling bin." },
  { detectedItem: "Banana Peel", category: "Organic", recyclable: true, disposalRecommendation: "Put it in the organic/compost bin." },
  { detectedItem: "Cardboard Box", category: "Paper", recyclable: true, disposalRecommendation: "Flatten and place in the paper recycling bin." },
  { detectedItem: "Glass Jar", category: "Glass", recyclable: true, disposalRecommendation: "Rinse and place in the glass recycling bin." },
  { detectedItem: "Aluminium Can", category: "Metal", recyclable: true, disposalRecommendation: "Place in the metal recycling bin." },
  { detectedItem: "Old Smartphone", category: "E-Waste", recyclable: true, disposalRecommendation: "Drop off at a certified e-waste collection point." },
  { detectedItem: "Used Battery", category: "Hazardous Waste", recyclable: false, disposalRecommendation: "Do not place in regular bins; take to a hazardous waste facility." },
];

function mockClassifyWaste() {
  const pick = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
  return {
    ...pick,
    confidence: Math.floor(85 + Math.random() * 14), // 85-99
    source: "mock",
  };
}

/**
 * Classify an uploaded waste image.
 * @param {string} filePath - absolute path to the uploaded image on disk
 * @returns {Promise<object>} classification result
 */
async function classifyWasteImage(filePath) {
  if (!isAiEnabled) return mockClassifyWaste();

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash" });
    const imagePart = fileToGenerativePart(filePath, mimeFromExt(filePath));

    const categories = ScanResult.CATEGORIES.join(", ");
    const prompt = `You are a waste classification AI for a smart city waste management system.
Look at the attached image of a piece of waste and respond with ONLY a raw JSON object
(no markdown fences, no extra text) in exactly this shape:
{
  "detectedItem": string,
  "category": one of [${categories}],
  "confidence": number (0-100, your confidence in the classification),
  "recyclable": boolean,
  "disposalRecommendation": string (one short, actionable sentence)
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const parsed = extractJson(text);

    return { ...parsed, source: "ai" };
  } catch (err) {
    console.error("[aiService] classifyWasteImage failed, falling back to mock:", err.message);
    return mockClassifyWaste();
  }
}

// ---------------------------------------------------------------------------
// 2. AI Database Assistant (natural language -> answer over dashboard data)
// ---------------------------------------------------------------------------

function mockAssistantAnswer(question) {
  return {
    answer: `Here's a mock answer for "${question}". Connect a Gemini API key in .env to get real AI-generated answers grounded in your live MongoDB data.`,
    source: "mock",
  };
}

/**
 * Ask a natural-language question, grounded in a snapshot of app data.
 * @param {string} question
 * @param {object} contextData - relevant data pulled from MongoDB (bins, zones, reports, etc.)
 */
async function askAssistant(question, contextData = {}) {
  if (!isAiEnabled) return mockAssistantAnswer(question);

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash" });

    const prompt = `You are the AI Database Assistant inside EcoMind, a smart waste management admin dashboard.
Answer the admin's question using ONLY the JSON data provided below. Be concise, specific,
and use real numbers from the data. If the data doesn't contain the answer, say so plainly.

DATA:
${JSON.stringify(contextData, null, 2)}

QUESTION: ${question}

Respond with ONLY a raw JSON object (no markdown fences) in exactly this shape:
{
  "answer": string (a clear, direct natural-language answer),
  "highlights": string[] (0-4 short bullet-style key facts used to answer)
}`;

    const result = await model.generateContent(prompt);
    const parsed = extractJson(result.response.text());
    return { ...parsed, source: "ai" };
  } catch (err) {
    console.error("[aiService] askAssistant failed, falling back to mock:", err.message);
    return mockAssistantAnswer(question);
  }
}

// ---------------------------------------------------------------------------
// 3. AI Insights (dashboard recommendation cards)
// ---------------------------------------------------------------------------

const MOCK_INSIGHTS = [
  { icon: "⚠️", text: "Plastic waste increased by 18% this month." },
  { icon: "🚛", text: "Zone C may require an additional collection vehicle." },
  { icon: "🗑️", text: "4 bins are predicted to reach capacity within 48 hours." },
  { icon: "♻️", text: "Recycling efficiency has improved by 12%." },
];

function mockInsights() {
  return MOCK_INSIGHTS.map((i) => ({ ...i, source: "mock" }));
}

/**
 * Generate insight cards from a snapshot of dashboard data.
 */
async function generateInsights(contextData = {}) {
  if (!isAiEnabled) return mockInsights();

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash" });

    const prompt = `You are the AI Insights engine for EcoMind, a smart waste management dashboard.
Given this JSON snapshot of current data, generate 3-5 short, actionable insight cards
(warnings, predictions, recommendations, positive trends).

DATA:
${JSON.stringify(contextData, null, 2)}

Respond with ONLY a raw JSON array (no markdown fences) in exactly this shape:
[
  { "icon": string (one emoji), "text": string (one short sentence) }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in AI response");
    const parsed = JSON.parse(match[0]);

    return parsed.map((i) => ({ ...i, source: "ai" }));
  } catch (err) {
    console.error("[aiService] generateInsights failed, falling back to mock:", err.message);
    return mockInsights();
  }
}

module.exports = {
  isAiEnabled,
  classifyWasteImage,
  askAssistant,
  generateInsights,
};
