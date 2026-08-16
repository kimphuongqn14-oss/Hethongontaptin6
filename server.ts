import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI SDK lazily/safely
  const getGenAI = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGenAI();
      const systemInstruction = `Bạn là Trợ lý AI giáo dục chuyên môn môn Tin học lớp 6 bộ sách "Kết nối tri thức với cuộc sống". 
Giải thích rõ ràng, sinh động, dễ hiểu, chuẩn xác cho học sinh 11-12 tuổi.
Dùng tiếng Việt chuẩn, sử dụng các biểu tượng (emoji) thích hợp và gạch đầu dòng để học sinh dễ tiếp thu.`;

      // Format conversation contents
      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          formattedContents.push({
            role: item.role === "ai" || item.role === "model" ? "model" : "user",
            parts: [{ text: item.parts?.[0]?.text || item.text || "" }],
          });
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Xin lỗi, hiện tại thầy/cô AI chưa thể trả lời câu hỏi này.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Gemini AI Chat Error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error?.message || String(error),
      });
    }
  });

  // AI Quiz Generation endpoint
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { topic, count = 5 } = req.body;
      const ai = getGenAI();

      const prompt = `Hãy tạo ${count} câu hỏi trắc nghiệm Tin học 6 bộ sách Kết nối tri thức.
Chủ đề / phạm vi: ${topic || "Tổng hợp toàn bộ chương trình Tin học 6"}.
Yêu cầu:
- Mỗi câu gồm 4 đáp án (A, B, C, D)
- 1 đáp án đúng (chỉ số 0=A, 1=B, 2=C, 3=D)
- Lời giải thích ngắn gọn, chính xác theo SGK.
- Đảm bảo câu hỏi chất lượng, sát với kiến thức SGK Tin học 6 Kết nối tri thức.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Nội dung câu hỏi" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Danh sách 4 lựa chọn A, B, C, D",
                },
                correctAnswer: {
                  type: Type.INTEGER,
                  description: "Chỉ số đáp án đúng: 0=A, 1=B, 2=C, 3=D",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Lời giải thích chi tiết cho đáp án đúng",
                },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Không nhận được dữ liệu từ Gemini AI");
      }

      const questions = JSON.parse(text);
      res.json({ questions });
    } catch (error: any) {
      console.error("Gemini AI Quiz Generation Error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error?.message || String(error),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
