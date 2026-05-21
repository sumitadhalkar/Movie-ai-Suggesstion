import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/recommend", async (req, res) => {
  const { favoriteMovies, mood, genre, excludeTitles = [] } = req.body;

  if (!favoriteMovies || !mood || !genre) {
    return res.status(400).json({ error: "favoriteMovies, mood, and genre are required." });
  }

  const excludeClause = excludeTitles.length > 0
    ? `\nDo NOT recommend any of these already-shown films: ${excludeTitles.join(", ")}.`
    : "";

  const prompt = `You are a world-class film curator with encyclopedic knowledge of cinema.

A user loves these movies: ${favoriteMovies}
Their current mood: ${mood}
Preferred genre: ${genre}
${excludeClause}

Recommend exactly 5 movies tailored to them. For each movie, provide a JSON object in this exact format:
{
  "title": "Movie Title",
  "year": 1999,
  "genre": "Genre",
  "director": "Director Name",
  "isHiddenGem": true or false,
  "matchTags": ["tag1", "tag2"],
  "whyYoullLoveIt": "A compelling 2-3 sentence explanation referencing specific elements from their favorite movies and how this film connects to those."
}

Return ONLY a valid JSON array of exactly 5 movie objects. No markdown, no extra text, just the JSON array.

Rules:
- Include at least 1 hidden gem (less mainstream film)
- Match the mood and genre
- Reference specific themes, scenes, or elements from their favorite movies in the explanations
- matchTags should be 2-4 short tags like "slow-burn tension", "mind-bending", "similar director style", "hidden gem", "cult classic", "award winner"`;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContentStream(prompt);

    let fullText = "";

    for await (const chunk of result.stream) {
      const delta = chunk.text();
      fullText += delta;
      res.write(`data: ${JSON.stringify({ chunk: delta })}\n\n`);
    }

    try {
      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const movies = JSON.parse(jsonMatch[0]);
        res.write(`data: ${JSON.stringify({ done: true, movies })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ done: true, movies: [] })}\n\n`);
      }
    } catch {
      res.write(`data: ${JSON.stringify({ done: true, movies: [] })}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      if (err.status === 429) {
        res.status(429).json({ error: "Gemini API quota exceeded. Wait a minute and try again, or check your quota at aistudio.google.com." });
      } else {
        res.status(500).json({ error: "Failed to get recommendations." });
      }
    }
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
