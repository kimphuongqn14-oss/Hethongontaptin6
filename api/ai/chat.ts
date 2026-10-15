import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      history,
      persona = 'teacher_5512',
      temperature = 0.7,
      topic = 'Toàn bộ chương trình Tin học 6',
      image,
    } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    let personaInstruction = '';
    switch (persona) {
      case 'teacher_5512':
        personaInstruction = `Bạn là Chuyên gia Giáo dục & Giáo viên Tin học THCS xuất sắc, chuyên soạn Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT và chương trình GDPT 2018 (SGK Kết nối tri thức với cuộc sống).
Khi soạn giáo án, tuân thủ đúng 4 hoạt động:
1. Hoạt động 1: Khởi động.
2. Hoạt động 2: Hình thành kiến thức mới.
3. Hoạt động 3: Luyện tập.
4. Hoạt động 4: Vận dụng.
Trình bày khoa học, rõ ràng bằng bảng biểu và Markdown sư phạm chuẩn mực.`;
        break;
      case 'stem_expert':
        personaInstruction = `Bạn là Chuyên gia Phương pháp Dạy học tích hợp & Giáo dục STEM Tin học cấp THCS.
Nhiệm vụ: Thiết kế các dự án học tập, hoạt động trải nghiệm STEM sáng tạo gắn liền với đời sống thực tế cho học sinh lớp 6.`;
        break;
      case 'exam_evaluator':
        personaInstruction = `Bạn là Chuyên gia Khảo thí và Kiểm định chất lượng giáo dục môn Tin học THCS.
Nhiệm vụ: Xây dựng Ma trận đề kiểm tra, Bản đặc tả đề thi theo 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và câu hỏi chuẩn hóa bám sát chuẩn đầu ra GDPT 2018.`;
        break;
      case 'friendly_tutor':
      default:
        personaInstruction = `Bạn là Trợ giảng AI Tin học 6 thông minh, thân thiện, đồng hành cùng học sinh lứa tuổi 11-12 (Bộ sách Kết nối tri thức với cuộc sống).
Giải thích dễ hiểu, dùng ngôn ngữ gần gũi, nhiều ví dụ thực tế và ẩn dụ sinh động trong đời sống.`;
        break;
    }

    const systemInstruction = `${personaInstruction}\nPhạm vi chuyên môn đang tập trung: ${topic}.\nNgôn ngữ: Tiếng Việt chuẩn mực, sư phạm. Trình bày Markdown đẹp mắt.`;

    const formattedContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        formattedContents.push({
          role: item.role === 'ai' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.parts?.[0]?.text || item.text || '' }],
        });
      }
    }

    const userParts: any[] = [];
    if (image && typeof image === 'string') {
      const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        userParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    userParts.push({ text: message || 'Hãy phân tích hình ảnh đính kèm và hướng dẫn giải thích sư phạm chi tiết.' });
    formattedContents.push({
      role: 'user',
      parts: userParts,
    });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let reply = '';
    const validTemp = typeof temperature === 'number' ? Math.max(0, Math.min(1.2, temperature)) : 0.7;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: validTemp,
          },
        });
        reply = response.text || '';
        if (reply) break;
      } catch (err: any) {
        console.warn(`[Vercel AI Info] Model ${model} busy, trying alternative...`);
      }
    }

    if (!reply) {
      reply =
        'Chào em! Hiện tại hệ thống đang có nhiều bạn cùng ôn tập. Em hãy thử gửi lại câu hỏi sau vài giây hoặc xem lý thuyết trong mục **Bài Học** nhé! 🌟';
    }

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.warn('[Vercel AI Chat Error]:', error?.message || error);
    return res.status(200).json({
      reply: 'Thầy/Cô AI đang bận một chút, em hãy thử gửi lại câu hỏi nhé! 🌟',
    });
  }
}
