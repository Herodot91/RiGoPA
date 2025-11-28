import { GoogleGenAI } from "@google/genai";
import { Contract } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeContractWithGemini = async (contract: Contract): Promise<string> => {
  if (!ai) {
    return "Gemini API Key is missing. Please configure the environment variable to enable AI insights.";
  }

  try {
    const prompt = `
      You are an expert Legal Risk Auditor. Analyze the following contract details for potential risks.
      
      Title: ${contract.title}
      Value: $${contract.value}
      Duration: ${contract.startDate} to ${contract.endDate}
      Clauses Present: ${contract.clauses.join(', ')}

      Please provide a brief, professional summary (max 100 words) highlighting:
      1. Any unusual risks based on the value or duration.
      2. Critical missing clauses standard for this type of contract.
      3. An assessment of the specific clauses provided.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Analysis failed to load. Please try again later.";
  }
};

export const chatWithCivicAI = async (contracts: Contract[], question: string): Promise<string> => {
  if (!ai) return "I am currently offline or the API key is missing. Please try again later.";

  // Simplify data for the context to ensure privacy and token efficiency
  // Only expose public fields suitable for citizens
  const publicContext = contracts
    .filter(c => c.status !== 'Draft' && c.status !== 'Legal Review')
    .map(c => ({
      project: c.title,
      type: c.type,
      budget: c.value,
      status: c.status,
      timeline: `${c.startDate} to ${c.endDate}`
    }));

  const prompt = `
    You are the "City Council AI Assistant", a helpful and transparent bot for the CivicTech Citizen Portal.
    Your goal is to answer citizen questions about public spending and projects based strictly on the open data provided below.

    DATA CONTEXT (Active Public Projects):
    ${JSON.stringify(publicContext, null, 2)}

    USER QUESTION: "${question}"

    INSTRUCTIONS:
    1. Answer politely and simply (plain English, no jargon).
    2. Use the data provided to give specific answers (e.g., specific budgets, names, dates).
    3. If the answer is not in the data, state: "I don't have that information in the current public records."
    4. If the user asks about the total budget, calculate it from the data.
    5. Be concise (under 3 sentences usually).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Civic AI Chat Error:", error);
    return "I'm having trouble connecting to the city servers right now. Please try again.";
  }
};
