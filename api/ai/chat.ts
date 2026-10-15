import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

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
      ktContent: customKt,
      tcContent: customTc,
    } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    // Read kt.md and tc.md from disk if not explicitly passed
    let diskKt = '';
    let diskTc = '';
    try {
      const ktPath = path.resolve(process.cwd(), 'kt.md');
      const tcPath = path.resolve(process.cwd(), 'tc.md');
      if (fs.existsSync(ktPath)) diskKt = fs.readFileSync(ktPath, 'utf-8');
      if (fs.existsSync(tcPath)) diskTc = fs.readFileSync(tcPath, 'utf-8');
    } catch (e) {
      // Ignored if on read-only or serverless without cwd file
    }

    const ktContent = (typeof customKt === 'string' && customKt.trim()) ? customKt : diskKt;
    const tcContent = (typeof customTc === 'string' && customTc.trim()) ? customTc : diskTc;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        reply: `⚠️ **Chưa cấu hình biến môi trường GEMINI_API_KEY trên Vercel!**\n\nĐể kích hoạt Trợ lý AI trên Vercel:\n1. Mở **Vercel Dashboard** → Chọn dự án của bạn.\n2. Vào mục **Settings** → **Environment Variables**.\n3. Thêm biến mới:\n   • **Key:** \`GEMINI_API_KEY\`\n   • **Value:** *(Dán API Key Gemini của bạn từ [Google AI Studio](https://aistudio.google.com/apikey))*\n4. Sau đó vào **Deployments** → bấm nút **Redeploy** để Vercel cập nhật biến mới.\n\nSau khi redeploy, Trợ lý AI sẽ hoạt động ngay lập tức! ✨`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    let personaInstruction = '';
    switch (persona) {
      case 'teacher_5512':
        personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Sư phạm THCS, chuyên soạn Kế hoạch bài dạy (Giáo án) theo chuẩn Công văn 5512/BGDĐT-GDTrH.
Tuân thủ đầy đủ: Tên bài dạy, I. Mục tiêu (Kiến thức, Năng lực, Phẩm chất), II. Thiết bị dạy học và học liệu, III. Tiến trình dạy học chuẩn 4 hoạt động 5512 (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng), mỗi hoạt động đủ 4 bước (Chuyển giao, Thực hiện, Báo cáo thảo luận, Kết luận nhận định).`;
        break;
      case 'stem_expert':
        personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Phương pháp Dạy học tích hợp STEM Tin học cấp THCS.`;
        break;
      case 'exam_evaluator':
        personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại & Chuyên gia Khảo thí và Kiểm định chất lượng giáo dục.
Xây dựng khung ma trận đề kiểm tra, bảng đặc tả, đề kiểm tra chính thức (3 phần: Trắc nghiệm khách quan, Trắc nghiệm Đúng/Sai hoặc Trả lời ngắn, Tự luận) và barem thang điểm chi tiết.`;
        break;
      case 'friendly_tutor':
      default:
        personaInstruction = `Bạn là Trợ Lý Giáo Dục Hiện Đại, người bạn đồng hành thông thái và ân cần của học sinh.
Phương pháp: Dẫn dắt Socratic, gợi mở tư duy từng bước thay vì chỉ đưa ra đáp án cuối cùng.`;
        break;
    }

    const systemInstruction = `
# QUY CHUẨN SƯ PHẠM (tc.md):
${tcContent || personaInstruction}

# VAI TRÒ ĐANG KÍCH HOẠT:
${personaInstruction}

# PHẠM VI CHUYÊN MÔN: ${topic}

# KHO TRI THỨC BÀI HỌC (kt.md):
${ktContent ? ktContent.slice(0, 10000) : "Chương trình Tin học 6 Kết nối tri thức và các bài học chuyên môn."}

YÊU CẦU:
- Bám sát kho tri thức kt.md và SGK Tin học 6, không tự ý bịa đặt.
- Trình bày Markdown đẹp mắt, sư phạm chuẩn mực.
`;

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

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];
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
