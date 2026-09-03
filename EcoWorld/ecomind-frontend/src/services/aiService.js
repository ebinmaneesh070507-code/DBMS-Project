// ---------------------------------------------------------------------------
// aiService.js
//
// Thin wrapper around Google's Gemini API (it has a free tier, which is why
// we picked it over OpenAI for now). Every function here degrades to a mock
// response when no API key is configured, so the rest of the app never has
// to know or care whether real AI is wired up yet.
//
// To go live:
//   1. Get a free key at https://aistudio.google.com/app/apikey
//   2. Put it in a .env file at the project root:
//        VITE_GEMINI_API_KEY=your_key_here
//   3. Restart the dev server. That's it — no other code changes needed.
//
// Swapping to OpenAI later just means rewriting the two `fetch` calls below;
// every page in the app calls these two exported functions and nothing else.
// ---------------------------------------------------------------------------

import { mockScanResults, dashboardStats, smartBins, wasteByZone, aiInsights } from '../data/mockData';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

export const isAiConfigured = () => Boolean(GEMINI_KEY);

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function stripToJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in AI response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Classify an uploaded waste image.
 * @param {string} base64Image - raw base64 (no data: prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<{item:string, category:string, confidence:number, recyclable:boolean, disposal:string}>}
 */
export async function classifyWasteImage(base64Image, mimeType = 'image/jpeg') {
  if (!GEMINI_KEY) {
    await sleep(1400);
    const r = mockScanResults[Math.floor(Math.random() * mockScanResults.length)];
    return { ...r, mock: true };
  }

  const prompt = `You are the AI waste classifier inside EcoMind, a smart waste management app.
Look at the attached image and identify the primary waste item.
Respond with ONLY a JSON object, no markdown, no preamble, in this exact shape:
{"item": "short item name", "category": "one of Plastic, Organic, Paper, Glass, Metal, E-Waste, Hazardous Waste, Mixed Waste", "confidence": <integer 0-100>, "recyclable": <true|false>, "disposal": "one short sentence of disposal advice"}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64Image } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2 },
  };

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = stripToJson(text);
    return { ...parsed, mock: false };
  } catch (err) {
    console.error('classifyWasteImage failed, falling back to mock:', err);
    const r = mockScanResults[Math.floor(Math.random() * mockScanResults.length)];
    return { ...r, mock: true, error: true };
  }
}

/**
 * Ask the AI Database Assistant a natural-language question about the
 * city's waste data. We feed it a compact snapshot of the current mock
 * dataset as context so answers stay grounded in what's on screen.
 * @param {string} question
 * @returns {Promise<{answer: string, mock: boolean}>}
 */
export async function askAssistant(question) {
  if (!GEMINI_KEY) {
    await sleep(1200);
    return { answer: mockAssistantAnswer(question), mock: true };
  }

  const context = {
    stats: dashboardStats,
    binsAtRisk: smartBins.filter((b) => b.status === 'High' || b.status === 'Critical'),
    wasteByZone,
    insights: aiInsights.map((i) => i.text),
  };

  const prompt = `You are the AI Database Assistant inside EcoMind, a smart-city waste management dashboard.
Answer the administrator's question using ONLY the JSON data snapshot below. Be concise (2-4 sentences), specific, and cite zone/bin names when relevant.

Data snapshot:
${JSON.stringify(context)}

Question: ${question}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3 },
  };

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return { answer: text.trim(), mock: false };
  } catch (err) {
    console.error('askAssistant failed, falling back to mock:', err);
    return { answer: mockAssistantAnswer(question), mock: true, error: true };
  }
}

function mockAssistantAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('plastic') && q.includes('zone')) {
    return 'Zone C generated the most plastic waste this month at roughly 1,640 kg, about 26% above the city average. Zone A follows closely, driven by packaging waste near the market district.';
  }
  if (q.includes('recycl')) {
    return `The city-wide recycling rate this month is ${dashboardStats.recyclingRate.value}, up ${dashboardStats.recyclingRate.delta} from last month. Zone A and Zone C have the highest recycled volumes.`;
  }
  if (q.includes('overflow') || q.includes('bin')) {
    const risky = smartBins.filter((b) => b.status === 'High' || b.status === 'Critical');
    return `${risky.length} bins are likely to overflow soon: ${risky.map((b) => `${b.id} (${b.zone}, predicted in ${b.predicted})`).join(', ')}.`;
  }
  return "Based on current data, waste volumes are trending upward in Zone A and Zone C, while recycling efficiency is improving city-wide. Ask me about a specific zone, bin, or category for more detail.";
}
