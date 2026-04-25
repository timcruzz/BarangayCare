import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function routeHealthQuery(query: string, medicines: any[]) {
  const prompt = `
    You are a triage AI for a rural telehealth platform in the Philippines called Barangay Link.
    User Query: "${query}"
    
    Available Medicines in Inventory:
    ${JSON.stringify(medicines)}
    
    Tasks:
    1. Identify potential symptoms.
    2. Suggest if they need a specialist (e.g., Pediatrician, OB-GYN, General Physician).
    3. Check if any available medicines might be relevant (disclaimer: always state this is NOT a prescription).
    4. Provide a empathetic response in English or Taglish.
    
    Return a JSON object:
    {
      "analysis": "string",
      "specialistNeeded": "string",
      "relevantMedicines": ["string"],
      "empatheticResponse": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      analysis: "Unable to analyze at this time.",
      specialistNeeded: "General Physician",
      relevantMedicines: [],
      empatheticResponse: "I'm sorry, I'm having trouble processing your request. Please consult a doctor immediately if this is an emergency."
    };
  }
}
