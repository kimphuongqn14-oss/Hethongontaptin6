import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count = 5 } = req.body || {};
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    const prompt = `Hãy tạo ${count} câu hỏi trắc nghiệm Tin học 6 bộ sách Kết nối tri thức.
Chủ đề / phạm vi: ${topic || 'Tổng hợp toàn bộ chương trình Tin học 6'}.
Yêu cầu:
- Mỗi câu gồm 4 đáp án (A, B, C, D)
- 1 đáp án đúng (chỉ số 0=A, 1=B, 2=C, 3=D)
- Lời giải thích ngắn gọn, chính xác theo SGK.
- Đảm bảo câu hỏi chất lượng, sát với kiến thức SGK Tin học 6 Kết nối tri thức.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: 'Nội dung câu hỏi' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 4 lựa chọn A, B, C, D',
              },
              correctAnswer: {
                type: Type.INTEGER,
                description: 'Chỉ số đáp án đúng: 0=A, 1=B, 2=C, 3=D',
              },
              explanation: {
                type: Type.STRING,
                description: 'Lời giải thích chi tiết cho đáp án đúng',
              },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Không nhận được dữ liệu từ Gemini AI');
    }

    const questions = JSON.parse(text);
    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Gemini AI Quiz Generation Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message || String(error),
    });
  }
}
