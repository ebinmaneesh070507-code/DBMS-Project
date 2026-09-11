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
const Incident = require("../models/Incident");

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
// 2. Incident triage (area photo -> waste types, severity, dispatch decision)
// ---------------------------------------------------------------------------

const MOCK_INCIDENTS = [
  {
    wasteTypes: ["Plastic", "Paper", "Mixed Waste"],
    severity: "Medium",
    dispatchRequired: true,
    recommendedResources: ["2 sanitation staff", "waste cart", "gloves"],
    aiReport:
      "The image shows an overflowing waste bin surrounded by scattered plastic packaging and paper. Moderate accumulation — a two-person team with a cart should clear this within the hour.",
  },
  {
    wasteTypes: ["Organic", "Mixed Waste"],
    severity: "Low",
    dispatchRequired: false,
    recommendedResources: ["Standard bin swap on next scheduled round"],
    aiReport:
      "A small amount of organic waste near a bin, likely from a missed pickup. Not urgent — can be handled on the next scheduled collection round rather than a dedicated dispatch.",
  },
  {
    wasteTypes: ["Hazardous Waste", "E-Waste"],
    severity: "Critical",
    dispatchRequired: true,
    recommendedResources: ["Trained hazmat-aware staff", "protective gloves", "hazard signage", "sealed containers"],
    aiReport:
      "Potentially hazardous material (e-waste/batteries) is visible in the open. This poses a safety risk and should be dispatched immediately with a team trained to handle hazardous items.",
  },
  {
    wasteTypes: ["Mixed Waste", "Glass", "Metal"],
    severity: "High",
    dispatchRequired: true,
    recommendedResources: ["2-3 sanitation staff", "wheelbarrow", "broom and dustpan", "puncture-resistant gloves"],
    aiReport:
      "A significant pile of mixed waste including broken glass and metal scraps is blocking part of the walkway. This needs prompt attention due to injury risk from sharp debris.",
  },
];

function mockClassifyIncident() {
  const pick = MOCK_INCIDENTS[Math.floor(Math.random() * MOCK_INCIDENTS.length)];
  return {
    ...pick,
    aiConfidence: Math.floor(82 + Math.random() * 16), // 82-98
    source: "mock",
  };
}

/**
 * Analyze a photo of an area/spot on campus that a user flagged as messy.
 * Returns everything needed to both dispatch a response team AND show the
 * reporter a real-time, human-readable report of what the AI found.
 * @param {string} filePath - absolute path to the uploaded image on disk
 */
async function classifyIncidentImage(filePath) {
  if (!isAiEnabled) return mockClassifyIncident();

  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash" });
    const imagePart = fileToGenerativePart(filePath, mimeFromExt(filePath));
    const wasteTypes = Incident.WASTE_TYPES.join(", ");
    const severities = Incident.SEVERITIES.join(", ");

    const prompt = `You are the AI triage system for EcoMind, a campus waste-incident response system.
A student or staff member has photographed an area on campus (not a single item — a spot, bin, or
patch of ground) that they believe is messy or needs cleanup. Analyze the image as a site inspector
would and decide how to respond. Respond with ONLY a raw JSON object (no markdown fences, no extra text)
in exactly this shape:
{
  "wasteTypes": string[] (one or more of [${wasteTypes}], every type visibly present),
  "severity": one of [${severities}],
  "dispatchRequired": boolean (true if a response team should be sent now rather than waiting for a routine round),
  "recommendedResources": string[] (2-5 short items the response team should bring, e.g. "gloves", "waste cart"),
  "aiReport": string (2-3 sentences, written directly to the person who reported it, describing what you see and what happens next),
  "aiConfidence": number (0-100)
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const parsed = extractJson(result.response.text());

    return { ...parsed, source: "ai" };
  } catch (err) {
    console.error("[aiService] classifyIncidentImage failed, falling back to mock:", err.message);
    return mockClassifyIncident();
  }
}

// ---------------------------------------------------------------------------
// 3. AI Database Assistant (natural language -> answer over dashboard data)
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

    const prompt = `You are the AI Assistant inside EcoMind, a campus waste-incident response app for a
university. You can do two kinds of things:

1. Answer questions about LIVE APP DATA (incidents, zones, response-team activity) using the JSON
   snapshot below. When you do this, be specific and cite real numbers/zone names from the data —
   never invent data that isn't there.
2. Answer general questions related to waste management, recycling, disposal, or how the EcoMind
   app works, using your own knowledge. These don't need to reference the data at all.

Use judgment on which kind of question this is. Only say the data doesn't cover something if the
question was actually asking about live app data specifically — never say that for a general
knowledge question.

DATA SNAPSHOT (for data questions only):
${JSON.stringify(contextData, null, 2)}

QUESTION: ${question}

Respond with ONLY a raw JSON object (no markdown fences) in exactly this shape:
{
  "answer": string (a clear, direct natural-language answer),
  "highlights": string[] (0-4 short bullet-style key facts, only when answering from the data — leave empty for general questions)
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
  { icon: "⚠️", text: "Plastic waste incidents are trending up this week — worth a closer look." },
  { icon: "🚨", text: "One or more zones have unresolved incidents older than 24 hours." },
  { icon: "🧑‍🤝‍🧑", text: "Response teams are covering incidents steadily across zones." },
  { icon: "✅", text: "Resolution rate has been holding steady this week." },
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

    const prompt = `You are the AI Insights engine for EcoMind, a campus waste-incident dashboard.
Given this JSON snapshot of real incident and response-team data, generate 3-5 short, actionable
insight cards (warnings about unresolved/severe incidents, response-time observations, zone
patterns, positive trends). Never invent numbers that aren't in the data.

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
  classifyIncidentImage,
  askAssistant,
  generateInsights,
};
