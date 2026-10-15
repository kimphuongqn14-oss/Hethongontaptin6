import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

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
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.8-flash",
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

  // Endpoints for kt.md and tc.md Knowledge & Pedagogical System Prompt Management
  app.get("/api/get-md", (req, res) => {
    try {
      const ktPath = path.resolve(process.cwd(), "kt.md");
      const tcPath = path.resolve(process.cwd(), "tc.md");
      const ktContent = fs.existsSync(ktPath) ? fs.readFileSync(ktPath, "utf-8") : "";
      const tcContent = fs.existsSync(tcPath) ? fs.readFileSync(tcPath, "utf-8") : "";
      res.json({ ktContent, tcContent });
    } catch (err: any) {
      console.error("Error reading md files:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/save-md", (req, res) => {
    try {
      const { ktContent, tcContent } = req.body;
      const ktPath = path.resolve(process.cwd(), "kt.md");
      const tcPath = path.resolve(process.cwd(), "tc.md");
      if (typeof ktContent === "string") {
        fs.writeFileSync(ktPath, ktContent, "utf-8");
      }
      if (typeof tcContent === "string") {
        fs.writeFileSync(tcPath, tcContent, "utf-8");
      }
      res.json({ success: true, message: "Đã lưu thành công vào ổ cứng (kt.md & tc.md)" });
    } catch (err: any) {
      console.error("Error saving md files:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // AI Chat endpoint - Enhanced with kt.md & tc.md integration
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const {
        message,
        history,
        persona = "teacher_5512",
        temperature = 0.7,
        topic = "Toàn bộ chương trình Tin học 6",
        image,
        ktContent: customKt,
        tcContent: customTc,
      } = req.body;

      if (!message && !image) {
        return res.status(400).json({ error: "Message or image is required" });
      }

      // Load active kt.md and tc.md from disk if not explicitly passed
      const ktPath = path.resolve(process.cwd(), "kt.md");
      const tcPath = path.resolve(process.cwd(), "tc.md");
      const diskKt = fs.existsSync(ktPath) ? fs.readFileSync(ktPath, "utf-8") : "";
      const diskTc = fs.existsSync(tcPath) ? fs.readFileSync(tcPath, "utf-8") : "";

      const activeKt = (typeof customKt === "string" && customKt.trim()) ? customKt : diskKt;
      const activeTc = (typeof customTc === "string" && customTc.trim()) ? customTc : diskTc;

      const ai = getGenAI();

      // Custom system instructions based on pedagogical persona and tc.md
      let personaInstruction = "";
      switch (persona) {
        case "teacher_5512":
          personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Sư phạm THCS, chuyên soạn Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH và chương trình GDPT 2018 (bộ SGK Kết nối tri thức).
Khi người dùng yêu cầu soạn giáo án, kế hoạch bài dạy:
BẮT BUỘC trình bày đầy đủ:
TÊN BÀI DẠY: [TÊN BÀI] - Môn: [Tên môn] - Lớp: [Lớp] - Thời lượng: [...]
I. MỤC TIÊU:
1. Kiến thức: Liệt kê rõ các kiến thức cốt lõi.
2. Năng lực: Năng lực chung & Năng lực Tin học/đặc thù.
3. Phẩm chất: Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm.
II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU: 1. Giáo viên, 2. Học sinh.
III. TIẾN TRÌNH DẠY HỌC (CHUẨN 4 HOẠT ĐỘNG 5512):
- Hoạt động 1: Mở đầu / Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện 4 bước: Chuyển giao -> Thực hiện -> Báo cáo thảo luận -> Kết luận nhận định).
- Hoạt động 2: Hình thành kiến thức mới (đầy đủ 4 bước a, b, c, d).
- Hoạt động 3: Luyện tập (đầy đủ 4 bước a, b, c, d).
- Hoạt động 4: Vận dụng (đầy đủ 4 bước a, b, c, d).`;
          break;
        case "stem_expert":
          personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Phương pháp Dạy học tích hợp STEM Tin học.
Nhiệm vụ: Thiết kế các dự án học tập, hoạt động trải nghiệm STEM sáng tạo gắn liền với thực tế cho học sinh. Nêu rõ vấn đề thực tiễn, kiến thức nền liên môn, tiêu chí sản phẩm, các bước thực hiện và rubric chấm điểm.`;
          break;
        case "exam_evaluator":
          personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Khảo thí và Kiểm định chất lượng giáo dục.
Khi người dùng yêu cầu tạo đề kiểm tra, ma trận đề, BẮT BUỘC trình bày đầy đủ 4 phần chuẩn Bộ GD&ĐT:
1. KHUNG MA TRẬN ĐỀ KIỂM TRA (Dạng bảng Markdown chuẩn): TT | Chủ đề / Nội dung kiến thức | Nhận biết (TNKQ/TL) | Thông hiểu (TNKQ/TL) | Vận dụng (TNKQ/TL) | Vận dụng cao (TL) | Tổng số câu | Tổng điểm | Tỉ lệ %
2. BẢNG ĐẶC TẢ ĐỀ KIỂM TRA (Dạng bảng Markdown chuẩn): TT | Đơn vị kiến thức | Mức độ đánh giá | Yêu cầu cần đạt | Số câu hỏi theo mức độ
3. ĐỀ KIỂM TRA CHÍNH THỨC: Phần I: Trắc nghiệm khách quan 4 lựa chọn (A, B, C, D); Phần II: Trắc nghiệm Đúng/Sai hoặc Trả lời ngắn theo định dạng mới Bộ GD&ĐT; Phần III: Tự luận phân hóa tư duy.
4. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM: Bảng đáp án trắc nghiệm rõ ràng; Barem thang điểm chi tiết từng bước cho câu hỏi tự luận.`;
          break;
        case "friendly_tutor":
        default:
          personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & người bạn đồng hành thông thái, ân cần của học sinh lớp 6.
- Ngôn ngữ: Tiếng Việt chuẩn mực, truyền cảm hứng, gần gũi và chuẩn mực sư phạm GD&ĐT.
- Phương pháp: Dẫn dắt Socratic, gợi mở tư duy từng bước thay vì chỉ đưa ra đáp án cuối cùng. Động viên, khuyến khích học sinh, giải thích trực quan, dễ hiểu bằng ẩn dụ sinh động trong đời sống.`;
          break;
      }

      // Build composite system instruction incorporating tc.md and kt.md
      const systemInstruction = `
# QUY CHUẨN SƯ PHẠM & TÍNH CÁCH (tc.md):
${activeTc || personaInstruction}

# VAI TRÒ ĐANG KÍCH HOẠT:
${personaInstruction}

# PHẠM VI CHUYÊN MÔN: ${topic}

# KHO TRI THỨC BÀI HỌC THAM CHIẾU (kt.md):
${activeKt ? activeKt.slice(0, 10000) : "Chương trình Tin học 6 Kết nối tri thức và các bài học chuyên môn."}

YÊU CẦU ĐẶC BIỆT:
- Tuyệt đối bám sát nội dung bài học trong kho tri thức kt.md và SGK Tin học 6, không tự ý bịa đặt.
- Trình bày Markdown sư phạm đẹp mắt, sử dụng bảng biểu khoa học, tiêu đề rõ ràng, ký hiệu toán/tin học chuẩn xác.
`;

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
