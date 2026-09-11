// ---------------------------------------------------------------------------
// aiService.js
//
// Thin normalization layer over the backend's AI-backed endpoints. The
// Gemini key lives only in the backend .env — this file never talks to
// Gemini directly, so nothing here can leak an API key to the browser.
// ---------------------------------------------------------------------------

import { api } from './api';

/**
 * Classify a single item photo via the AI Waste Scanner.
 * @param {File} file
 */
export async function classifyWasteImage(file) {
  const scan = await api.analyzeWasteImage(file);
  return {
    item: scan.detectedItem,
    category: scan.category,
    confidence: scan.confidence,
    recyclable: scan.recyclable,
    disposal: scan.disposalRecommendation,
    imageUrl: scan.imageUrl,
    mock: scan.source !== 'ai',
  };
}

/**
 * Ask the AI Database Assistant a natural-language question, grounded in
 * live incident/zone/responder data.
 * @param {string} question
 */
export async function askAssistant(question) {
  const result = await api.askAssistant(question);
  return {
    answer: result.answer,
    highlights: result.highlights || [],
    mock: result.source !== 'ai',
  };
}

/**
 * Fetch AI-generated dashboard insight cards (mock fallback happens
 * server-side if no Gemini key is configured).
 */
export async function getAiInsights() {
  const insights = await api.getAiInsights();
  return insights.map((i) => ({ icon: i.icon, text: i.text, mock: i.source !== 'ai' }));
}
