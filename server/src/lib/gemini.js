import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const SYSTEM_PROMPT = `You summarize personal notes. Write a clear 2-3 sentence summary
and exactly 3 short lowercase single-word tags that describe the topic. Base everything
only on the note's content. Never invent facts.`;

const geminiOutputSchema = z.object({
  summary: z.string().trim().min(1, "Summary cannot be empty"),
  tags: z.array(z.string()).min(1, "Tags must be a non-empty array of strings"),
});

export async function summarizeNote(title, content) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    contents: `Title: ${title}\n\nContent:\n${content}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: { thinkingLevel: "LOW" },
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["summary", "tags"],
      },
    },
  });

  const parsed = JSON.parse(res.text);
  const validated = geminiOutputSchema.parse(parsed);

  // Lowercase, trim, sanitize to single words, and keep only the first 3 tags
  const cleanedTags = validated.tags
    .map(t => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))
    .filter(Boolean)
    .slice(0, 3);

  return {
    summary: validated.summary.trim(),
    tags: cleanedTags,
  };
}

