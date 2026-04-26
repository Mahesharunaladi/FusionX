import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getGeminiResponse(prompt: string, imageBase64?: string) {
  const model = "gemini-3-flash-preview";
  
  if (imageBase64) {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]
      }
    });
    return response.text;
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  return response.text;
}

export async function parseGeospatialQuery(query: string) {
  const prompt = `
    You are a Geospatial Intelligence Parser. Convert the following natural language satellite search query into a structured JSON search parameter.
    
    Query: "${query}"
    
    Return a JSON object with:
    - semantic_feature: (string) The core visual pattern being looked for (e.g., "deforestation", "swimming pools")
    - confidence_threshold: (number, 0-1)
    - area_type: (string: "urban", "rural", "forest", "coastal", "any")
    - temporal_context: (string: "recent", "historical", "any")
    - explanation: (string) short analytical reason for these params.
    
    Only return JSON.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
}
