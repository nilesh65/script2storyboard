import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardPanel } from "../types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const key = import.meta.env.VITE_API_KEY
export const parseScriptToStoryboard = async (scriptText: string): Promise<StoryboardPanel[]> => {
  if (!key) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  // Define the schema for the AI response to ensure strict JSON structure
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        scriptSegment: {
          type: Type.STRING,
          description: "The specific sentence or phrase from the script corresponding to this shot.",
        },
        inferredLocation: {
          type: Type.STRING,
          description: "Where this takes place (INT/EXT).",
        },
        inferredTime: {
          type: Type.STRING,
          description: "Time of day (DAY/NIGHT).",
        },
        inferredAction: {
          type: Type.STRING,
          description: "A detailed AI image generation prompt describing the visual.",
        },
        inferredCharacters: {
          type: Type.STRING,
          description: "Names of characters present in this shot.",
        },
        inferredMood: {
          type: Type.STRING,
          description: "The emotional tone of this shot.",
        },
      },
      required: ["scriptSegment", "inferredAction"],
    },
  };

  const prompt = `
    You are an expert storyboard artist and visual director. 
    Analyze the following movie script text. 
    Break it down into granular "Visual Sequences" or "Shots".
    
    STRICT RULES FOR DEFINING A SEQUENCE:
    1. A "Sequence" corresponds to a single visual beat lasting roughly 3-5 seconds.
    2. Ideally, it corresponds to a single complete sentence in the script that depicts a single picture that can be animated.
    3. If a paragraph describes multiple distinct actions, break it into multiple sequences.
    
    For each sequence, you must infer the following details:
    
    1. scriptSegment: The exact text from the script.
    2. inferredAction: Write this as a detailed **AI Image Prompt**. Do not just summarize the action. Describe the visual composition, camera angle (e.g., Close-up, Wide Shot, Low Angle), lighting (e.g., Cinematic, Dim, Harsh), style, and the specific action taking place so it is ready for image generation.
    3. inferredLocation: The setting.
    4. inferredTime: Time of day.
    5. inferredCharacters: Who is visible.
    6. inferredMood: The atmosphere or emotion.
    
    The output must be a JSON array.
    
    SCRIPT:
    ${scriptText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for consistent formatting
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    // Transform into our internal type with IDs and default empty notes if AI didn't provide them
    return rawData.map((item: any, index: number) => ({
      id: generateId(),
      sequenceNumber: index + 1,
      scriptSegment: item.scriptSegment || "",
      inferredLocation: item.inferredLocation || "",
      inferredTime: item.inferredTime || "",
      inferredAction: item.inferredAction || "",
      inferredCharacters: item.inferredCharacters || "",
      inferredMood: item.inferredMood || "",
      // Initialize editable fields with the inferred data so the user can edit them, 
      // or leave them blank if that's preferred. Here we populate them to be helpful.
      environmentNotes: `${item.inferredLocation || ''} ${item.inferredTime || ''}`.trim(),
      actionNotes: item.inferredAction || "",
      characterNotes: item.inferredCharacters || "",
      expressionNotes: "", // Usually left blank for the artist to decide specific expressions unless obvious
      moodNotes: item.inferredMood || "",
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to parse script. Please try again.");
  }
};