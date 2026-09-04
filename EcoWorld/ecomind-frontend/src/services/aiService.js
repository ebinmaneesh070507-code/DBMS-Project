import { api } from './api';

export const isAiConfigured = () => true; // backend decides this now; always attempt the call

/**
 * Classify an uploaded waste image via the backend (Gemini vision, or mock).
 * @param {File} file - the raw File object from an <input type="file">
 * @returns {Promise<{item:string, category:string, confidence:number, recyclable:boolean, disposal:string, mock:boolean}>}
 */
export async function classifyWasteImage(file) {
  try {
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
  } catch (err) {
    console.error('classifyWasteImage failed:', err);
    throw err; // let the Scanner page show an error state; no silent fake data
  }
}

/**
 * Ask the AI Database Assistant a natural-language question. The backend
 * grounds the answer in live MongoDB data (bins, reports, scans) rather
 * than a static snapshot.
 * @param {string} question
 * @returns {Promise<{answer: string, mock: boolean, highlights?: string[]}>}
 */
export async function askAssistant(question) {
  try {
    const result = await api.askAssistant(question);
    return {
      answer: result.answer,
      highlights: result.highlights || [],
      mock: result.source !== 'ai',
    };
  } catch (err) {
    console.error('askAssistant failed:', err);
    throw err;
  }
}

/**
 * Fetch AI-generated insight cards for the dashboard (falls back to mock
 * insights server-side if no AI key is configured).
 * @returns {Promise<Array<{icon: string, text: string, mock: boolean}>>}
 */
export async function getAiInsights() {
  try {
    const insights = await api.getAiInsights();
    return insights.map((i) => ({ icon: i.icon, text: i.text, mock: i.source !== 'ai' }));
  } catch (err) {
    console.error('getAiInsights failed:', err);
    throw err;
  }
}