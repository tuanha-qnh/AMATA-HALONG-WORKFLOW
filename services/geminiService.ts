import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const suggestTaskDetails = async (title: string): Promise<string> => {
  if (!apiKey) return "API Key not configured. Please add Gemini API Key.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am creating a task management system. The task title is "${title}". 
      Please generate a concise but professional description and a checklist of 3-5 subtasks for this job. 
      Format it as Markdown.`,
    });
    return response.text || "Could not generate suggestions.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export const analyzeProgress = async (reports: string[]): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Here are the progress reports for a task: ${JSON.stringify(reports)}. 
        Summarize the overall progress, highlight any major blockers mentioned, and estimate if the task is on track.`
    });
    return response.text || "No analysis available.";
  } catch (error) {
     return "Error analyzing progress.";
  }
};
