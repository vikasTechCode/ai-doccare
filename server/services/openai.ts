import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file");
}

const gemini = new GoogleGenAI({ apiKey });

export interface SymptomAnalysisResult {
  possibleCauses: string[];
  recommendation: string;
  urgencyLevel: "low" | "medium" | "high";
  whenToSeeDoctor: string;
  disclaimer: string;
}


export async function analyzeSymptoms(
  symptoms: string
): Promise<SymptomAnalysisResult> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are a cautious health information assistant.
Analyze these symptoms: ${symptoms}

Do not diagnose the user. Mention possible causes only as possibilities.
Give general safety guidance and recommend consulting a healthcare professional.
If symptoms may indicate an emergency, clearly advise urgent medical care.
Return ONLY valid JSON with this exact structure:
{
  "possibleCauses": ["possibility 1", "possibility 2"],
  "recommendation": "general safety guidance",
  "urgencyLevel": "low",
  "whenToSeeDoctor": "specific guidance",
  "disclaimer": "This is not a diagnosis or a substitute for professional medical advice."
}
urgencyLevel must be exactly one of: low, medium, high.`,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      const cleanedText = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(cleanedText);

      const urgencyLevel: "low" | "medium" | "high" =
        ["low", "medium", "high"].includes(result.urgencyLevel)
          ? result.urgencyLevel
          : "medium";

      return {
        possibleCauses: Array.isArray(result.possibleCauses)
          ? result.possibleCauses
          : [],
        recommendation:
          result.recommendation ||
          "Please consult a healthcare professional.",
        urgencyLevel,
        whenToSeeDoctor:
          result.whenToSeeDoctor ||
          "Seek medical advice if symptoms persist or worsen.",
        disclaimer:
          result.disclaimer ||
          "This is not a diagnosis or a substitute for professional medical advice.",
      };
    } catch (error) {
      console.error(`Symptom analysis attempt ${attempt} failed:`, error);

      if (attempt === maxAttempts) {
        throw new Error(
          "Symptom analysis is temporarily unavailable. Please try again shortly."
        );
      }

      // Wait 1 second, then 2 seconds before retrying.
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 1000)
      );
    }
  }

  throw new Error("Failed to analyze symptoms. Please try again.");
}


export async function generateHealthScore(
  vitals: any[],
  medications: any[],
  recentActivity: any
): Promise<number> {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Estimate a health indicator score from 0 to 100 using the available data.
Do not treat this score as a medical diagnosis. Missing data should not automatically imply poor health.
Return ONLY valid JSON: {"score": number}

Vitals: ${JSON.stringify(vitals)}
Medications: ${JSON.stringify(medications)}
Activity: ${JSON.stringify(recentActivity)}`,
    });

    const text = response.text;
    if (!text) {
      return 75;
    }

    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    const score = Number(result.score);

    return Number.isFinite(score)
      ? Math.max(0, Math.min(100, score))
      : 75;
  } catch (error) {
    console.error("Failed to generate Gemini health score:", error);
    return 75;
  }
}