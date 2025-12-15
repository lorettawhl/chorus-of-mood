import { GoogleGenAI } from "@google/genai";
import { ArousalLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPoeticInterpretation = async (activeLevels: ArousalLevel[]) => {
  if (activeLevels.length === 0) return "Silence awaits human touch.";

  const levelsString = activeLevels.join(', ');
  
  const prompt = `
    The art installation 'Chorus of Mood' translates biometric data into sound.
    Current active layers: ${levelsString}.
    
    Mappings:
    - LOW: Natural ambient sounds (Green light).
    - MID: Rhythmic beats (Blue light).
    - HIGH: Relaxing textures (Red light).

    Write a single, abstract, poetic sentence (max 20 words) describing the feeling of this specific combination of sounds merging together. Focus on harmony and emotion. Do not be technical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini interpretation failed:", error);
    return "The sounds merge into a unique, fleeting harmony.";
  }
};
