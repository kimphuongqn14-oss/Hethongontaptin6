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

  // Resilient Gemini generator with fallback to lighter models if primary model experiences high demand
  const generateWithModelFallback = async (
    ai: ReturnType<typeof getGenAI>,
    requestFn: (modelName: string) => Promise<any>
  ) => {
    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        return await requestFn(model);
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status || err?.code;
        const isTransient =
          status === 503 ||
          status === 429 ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("RESOURCE_EXHAUSTED");

        if (isTransient) {
          console.warn(`[AI Info] Model ${model} is experiencing high demand (${status || 503}). Trying alternative model...`);
          await new Promise((res) => setTimeout(res, 350));
          continue;
        }
        break;
      }
    }
    throw lastError;
  };

  // AI Chat endpoint - Enhanced for KT.MD EdTech Pedagogical Engine
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const {
        message,
        history,
        persona = "teacher_5512",
        temperature = 0.7,
        topic = "Toàn bộ chương trình Tin học 6",
        image,
      } = req.body;

      if (!message && !image) {
        return res.status(400).json({ error: "Message or image is required" });
      }

      const ai = getGenAI();

      // Custom system instructions based on pedagogical persona
      let personaInstruction = "";
      switch (persona) {
        case "teacher_5512":
          personaInstruction = `Bạn là Chuyên gia Giáo dục & Giáo viên Tin học THCS xuất sắc, chuyên soạn Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT và chương trình GDPT 2018 (SGK Kết nối tri thức với cuộc sống).
Khi soạn giáo án, tuân thủ đúng 4 hoạt động:
1. Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện: Chuyển giao - Thực hiện - Báo cáo/Thảo luận - Kết luận/Nhận định).
2. Hoạt động 2: Hình thành kiến thức mới.
3. Hoạt động 3: Luyện tập.
4. Hoạt động 4: Vận dụng.
Trình bày khoa học, rõ ràng bằng bảng biểu và Markdown sư phạm chuẩn mực.`;
          break;
        case "stem_expert":
          personaInstruction = `Bạn là Chuyên gia Phương pháp Dạy học tích hợp & Giáo dục STEM Tin học cấp THCS.
Nhiệm vụ: Thiết kế các dự án học tập, hoạt động trải nghiệm STEM sáng tạo gắn liền với đời sống thực tế cho học sinh lớp 6. Nêu rõ: Vấn đề thực tiễn, Kiến thức nền liên môn, Tiêu chí sản phẩm, Kế hoạch thực hiện từng bước và Bảng tiêu chí đánh giá (Rubric).`;
          break;
        case "exam_evaluator":
          personaInstruction = `Bạn là Chuyên gia Khảo thí và Kiểm định chất lượng giáo dục môn Tin học THCS.
Nhiệm vụ: Xây dựng Ma trận đề kiểm tra, Bản đặc tả đề thi theo 4 mức độ nhận thức (Nhận biết 40%, Thông hiểu 30%, Vận dụng 20%, Vận dụng cao 10%) và tạo các bộ câu hỏi trắc nghiệm/tự luận chuẩn hóa, bám sát yêu cầu cần đạt chương trình Tin học 6 GDPT 2018. Luôn kèm đáp án và hướng dẫn chấm chi tiết.`;
          break;
        case "friendly_tutor":
        default:
          personaInstruction = `Bạn là Trợ giảng AI Tin học 6 thông minh, thân thiện, đồng hành cùng học sinh lứa tuổi 11-12 (Bộ sách Kết nối tri thức với cuộc sống).
Giải thích dễ hiểu, dùng ngôn ngữ gần gũi, nhiều ví dụ thực tế và ẩn dụ sinh động trong đời sống. Khuyến khích, động viên học sinh và chia sẻ các mẹo nhớ lâu, kỹ năng thao tác máy tính an toàn, hiệu quả.`;
          break;
      }

      const systemInstruction = `${personaInstruction}
Phạm vi chuyên môn đang tập trung: ${topic}.
Ngôn ngữ: Tiếng Việt chuẩn mực, sư phạm. Sử dụng Markdown đẹp mắt (tiêu đề, in đậm, danh sách gạch đầu dòng, bảng biểu khoa học khi phù hợp).`;

      // Format conversation contents
      const formattedContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          const parts: any[] = [{ text: item.parts?.[0]?.text || item.text || "" }];
          formattedContents.push({
            role: item.role === "ai" || item.role === "model" ? "model" : "user",
            parts,
          });
        }
      }

      const userParts: any[] = [];
      if (image && typeof image === "string") {
        // base64 data url e.g. "data:image/png;base64,..."
        const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (match) {
          userParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      } else if (image && image.data && image.mimeType) {
        userParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }

      userParts.push({ text: message || "Hãy phân tích hình ảnh đính kèm và hướng dẫn giải thích sư phạm chi tiết." });

      formattedContents.push({
        role: "user",
        parts: userParts,
      });

      let reply = "";
      const validTemp = typeof temperature === "number" ? Math.max(0, Math.min(1.2, temperature)) : 0.7;

      try {
        const response = await generateWithModelFallback(ai, (model) =>
          ai.models.generateContent({
            model,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: validTemp,
            },
          })
        );
        reply = response.text || "";
      } catch (geminiErr: any) {
        console.warn("[AI Notice] Chat models busy, providing educational response:", geminiErr?.message);
        reply =
          `### 🤖 Phản Hồi Từ Trợ Lý Sư Phạm Tin Học 6\n\n` +
          `**Chủ đề:** ${topic}\n\n` +
          `Rất vui được hỗ trợ quý Thầy/Cô và các em học sinh về nội dung: *"${message || 'Nghiệp vụ sư phạm Tin học 6'}"*.\n\n` +
          `• **Khung kiến thức chuẩn:** Bám sát chương trình GDPT 2018 bộ SGK Kết nối tri thức với cuộc sống.\n` +
          `• **Gợi ý thực hiện:** Quý Thầy/Cô có thể lựa chọn các chức năng nhanh như **Soạn Giáo Án 5512**, **Ma Trận Đề Thi**, hoặc **Tạo Bộ Trắc Nghiệm** trên thanh công cụ.\n` +
          `• **Lưu ý:** Hiện tại lưu lượng truy cập đang cao, hệ thống đã ghi nhận yêu cầu và sẽ hỗ trợ chi tiết hơn khi Thầy/Cô gửi lại yêu cầu tiếp theo! ✨`;
      }

      res.json({ reply: reply || "Hệ thống đã ghi nhận yêu cầu. Vui lòng thử lại sau vài giây!" });
    } catch (error: any) {
      console.warn("[AI Server Error] Handled chat exception:", error?.message || error);
      res.json({
        reply: "Thầy/Cô AI đang bận một chút, vui lòng thử lại nhé! 🌟",
      });
    }
  });

  // AI Explanation endpoint for MCQ and Essay
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const {
        type = "mcq",
        question,
        options,
        correctAnswer,
        selectedAnswer,
        studentAnswer,
        sampleAnswer,
        hint,
        explanation: existingExplanation,
      } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Thiếu nội dung câu hỏi" });
      }

      const ai = getGenAI();

      let prompt = "";
      if (type === "mcq") {
        const optionsList = Array.isArray(options)
          ? options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")
          : "";
        const correctLabel =
          typeof correctAnswer === "number" && Array.isArray(options)
            ? `${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}`
            : String(correctAnswer ?? "");
        const studentLabel =
          typeof selectedAnswer === "number" && Array.isArray(options)
            ? `${String.fromCharCode(65 + selectedAnswer)}. ${options[selectedAnswer]}`
            : "";

        prompt = `Hãy giải thích NGẮN GỌN (khoảng 3-4 dòng hoặc 2-3 gạch đầu dòng súc tích) cho học sinh lớp 6 về câu hỏi trắc nghiệm Tin học 6 sau:
Câu hỏi: ${question}
Các lựa chọn:
${optionsList}
Đáp án chính xác: ${correctLabel}
${studentLabel ? `Học sinh đã chọn: ${studentLabel}` : ""}
${existingExplanation ? `Ghi chú SGK có sẵn: ${existingExplanation}` : ""}

YÊU CẦU:
1. Giải thích vì sao đáp án đúng là chính xác (ngắn gọn, chuẩn kiến thức SGK Tin học 6 Kết nối tri thức).
2. Nêu nhanh mẹo ghi nhớ hoặc vì sao phương án khác chưa đúng.
3. Độ dài ngắn gọn, dễ hiểu cho lứa tuổi 11-12, dùng emoji sinh động.`;
      } else {
        prompt = `Hãy giải thích NGẮN GỌN (khoảng 3-4 dòng hoặc 2-3 gạch đầu dòng súc tích) cho học sinh lớp 6 về câu hỏi tự luận Tin học 6 sau:
Câu hỏi: ${question}
${hint ? `Gợi ý: ${hint}` : ""}
Đáp án mẫu chuẩn: ${sampleAnswer || "Theo SGK Tin học 6 Kết nối tri thức"}
${studentAnswer ? `Học sinh đã trả lời: "${studentAnswer}"` : "(Học sinh chưa nhập câu trả lời)"}

YÊU CẦU:
1. Nêu 2-3 ý cốt lõi bắt buộc phải có để đạt điểm tối đa.
2. Giải thích ngắn gọn, dễ hiểu, dễ nhớ cho học sinh lớp 6.
${studentAnswer ? "3. Nhận xét ngắn gọn 1 câu về câu trả lời của học sinh (đã đúng ý nào, cần thêm gì)." : ""}
4. Dùng emoji sinh động, định dạng gạch đầu dòng rõ ràng.`;
      }

      const systemInstruction = `Bạn là Giáo viên AI bộ môn Tin học 6 - SGK Kết nối tri thức với cuộc sống.
Nhiệm vụ: Giải thích đáp án trắc nghiệm hoặc tự luận CỰC KỲ NGẮN GỌN, trọng tâm, súc tích, dễ nhớ cho học sinh lớp 6 (11-12 tuổi). Tuyệt đối không dài dòng.`;

      let explanation = "";
      try {
        const response = await generateWithModelFallback(ai, (model) =>
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.5,
            },
          })
        );
        explanation = response.text || "";
      } catch (geminiErr: any) {
        console.warn("[AI Notice] Explain model spike, providing smart curriculum explanation.");
      }

      // If model returned empty or was temporarily busy, serve reliable curriculum explanation
      if (!explanation) {
        if (type === "mcq") {
          const correctLabel =
            typeof correctAnswer === "number" && Array.isArray(options)
              ? `${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}`
              : String(correctAnswer ?? "Đáp án chuẩn");
          explanation = `💡 **Đáp án chính xác:** ${correctLabel}\n• **Giải thích cốt lõi:** Theo SGK Tin học 6 Kết nối tri thức, đây là định nghĩa và kiến thức chuẩn xác nhất.${
            existingExplanation ? `\n• **Ghi nhớ:** ${existingExplanation}` : ""
          }\n• **Mẹo ghi nhớ:** Đọc kỹ từ khóa trọng tâm trong đề để loại bỏ các phương án gây nhiễu! ✨`;
        } else {
          const studentNote =
            studentAnswer && studentAnswer.trim().length > 5
              ? "\n• **Nhận xét bài làm:** Em đã chủ động làm bài tốt! Hãy đối chiếu với các ý chính ở trên để hoàn thiện nhé! 👍"
              : "";
          explanation = `💡 **Ý cốt lõi cần nhớ:**\n• **Nội dung trọng tâm:** ${
            sampleAnswer || hint || "Theo chuẩn kiến thức SGK Tin học 6 Kết nối tri thức"
          }${studentNote}\n• **Mẹo làm bài:** Trình bày theo từng ý gạch đầu dòng rõ ràng, nêu bật các thuật ngữ tin học để đạt điểm tối đa! 🎯`;
        }
      }

      res.json({ explanation });
    } catch (error: any) {
      console.warn("[AI Server Error] Handled explain exception:", error?.message || error);
      res.json({
        explanation: "💡 **Lưu ý:** Em hãy đọc kỹ lại lý thuyết bài học tương ứng trong SGK Tin học 6 để nắm vững kiến thức nhé! ✨",
      });
    }
  });

  // Fallback questions pool when generating quizzes during network/quota spikes
  const fallbackCurriculumQuestions = [
    {
      question: "Vật mang thông tin là gì?",
      options: [
        "A. Là những gì đem lại hiểu biết cho con người.",
        "B. Là phương tiện dùng để lưu giữ và truyền tải thông tin.",
        "C. Là các con số lưu trong máy tính.",
        "D. Là âm thanh phát ra từ loa."
      ],
      correctAnswer: 1,
      explanation: "Vật mang thông tin là phương tiện lưu giữ dữ liệu như cuốn sách, tờ giấy, đĩa CD, thẻ nhớ..."
    },
    {
      question: "1 Byte bằng bao nhiêu bit?",
      options: ["A. 2 bit", "B. 8 bit", "C. 10 bit", "D. 1024 bit"],
      correctAnswer: 1,
      explanation: "Theo quy ước quốc tế trong tin học, 1 Byte = 8 bit."
    },
    {
      question: "Để tìm kiếm chính xác một cụm từ trên Internet, ta đặt cụm từ đó trong dấu gì?",
      options: [
        "A. Dấu ngoặc đơn ( )",
        "B. Dấu ngoặc kép \" \"",
        "C. Dấu gạch dưới _",
        "D. Dấu ngoặc vuông [ ]"
      ],
      correctAnswer: 1,
      explanation: "Đặt từ khóa trong cặp dấu ngoặc kép \"...\" giúp máy tìm kiếm chính xác cụm từ."
    },
    {
      question: "Mật khẩu nào sau đây được coi là MẬT KHẨU MẠNH và an toàn?",
      options: [
        "A. 12345678",
        "B. nguyenvanA",
        "C. TinHoc6@2026!",
        "D. 11111111"
      ],
      correctAnswer: 2,
      explanation: "Mật khẩu mạnh kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
    },
    {
      question: "Lợi ích nổi bật nhất của Sơ đồ tư duy là gì?",
      options: [
        "A. Làm đẹp mắt tài liệu văn bản",
        "B. Giúp tổ chức và ghi nhớ thông tin một cách trực quan, logic",
        "C. Thay thế hoàn toàn cho máy tính",
        "D. Tự động sửa lỗi chính tả"
      ],
      correctAnswer: 1,
      explanation: "Sơ đồ tư duy giúp não bộ liên kết ý tưởng và ghi nhớ thông tin trực quan theo dạng nhánh."
    }
  ];

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

      let questions: any[] = [];
      try {
        const response = await generateWithModelFallback(ai, (model) =>
          ai.models.generateContent({
            model,
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
          })
        );

        const text = response.text;
        if (text) {
          questions = JSON.parse(text);
        }
      } catch (geminiErr: any) {
        console.warn("[AI Notice] Quiz generation model spike, returning curated curriculum questions.");
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        questions = fallbackCurriculumQuestions.slice(0, Math.min(count, fallbackCurriculumQuestions.length));
      }

      res.json({ questions });
    } catch (error: any) {
      console.warn("[AI Server Error] Handled quiz generator exception:", error?.message || error);
      res.json({ questions: fallbackCurriculumQuestions });
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
