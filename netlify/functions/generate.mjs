import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

// Same rules and temperatures as copywriter.py
const PLATFORMS = {
  linkedin: {
    rules:
      "Write a LinkedIn post. Start with a strong hook line. Use short paragraphs. Maximum 150 words. End with a question or call to action. Use at most 3 hashtags. No emojis.",
    temperature: 0.5,
  },
  instagram: {
    rules:
      "Write an Instagram caption. Catchy first line, casual and punchy. Maximum 60 words. Use 3 to 5 emojis and 5 to 8 hashtags at the end.",
    temperature: 1.0,
  },
  email: {
    rules:
      "Write a marketing email. Format: a 'Subject:' line, then a body of 80 to 120 words, then one call-to-action button text in square brackets.",
    temperature: 0.3,
  },
};
const TONES = ["professional", "funny", "luxury"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    const productName = String(body.productName || "").trim().slice(0, 100);
    const description = String(body.description || "").trim().slice(0, 600);
    const platform = String(body.platform || "").toLowerCase();
    const tone = String(body.tone || "").toLowerCase();

    if (!productName || !description) {
      return json({ error: "Product name and description are required." }, 400);
    }
    if (!PLATFORMS[platform] || !TONES.includes(tone)) {
      return json({ error: "Invalid platform or tone." }, 400);
    }

    // Use the slider value if valid, else the platform default
    let temperature = Number(body.temperature);
    if (!Number.isFinite(temperature)) temperature = PLATFORMS[platform].temperature;
    temperature = Math.min(1.5, Math.max(0, temperature));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: "Server is missing GEMINI_API_KEY." }, 500);

    // Dynamic prompt template (same idea as the f-string in Python)
    const prompt = `You are a professional marketing copywriter.

${PLATFORMS[platform].rules}
Tone: ${tone}

Product name: ${productName}
Product description: ${description}

Return only the final copy. No explanations, no placeholders like [link].`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { temperature, topP: 0.9 },
    });

    return json({ copy: response.text, temperature });
  } catch (err) {
    console.error("Error:", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config = { path: "/api/generate" };