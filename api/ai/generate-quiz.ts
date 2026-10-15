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

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let questions: any[] = [];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
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
        if (text) {
          questions = JSON.parse(text);
          if (Array.isArray(questions) && questions.length > 0) {
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Vercel AI Info] Model ${model} busy for quiz generation...`);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = [
        {
          question: 'Vật mang thông tin là gì?',
          options: [
            'A. Là những gì đem lại hiểu biết cho con người.',
            'B. Là phương tiện dùng để lưu giữ và truyền tải thông tin.',
            'C. Là các con số lưu trong máy tính.',
            'D. Là âm thanh phát ra từ loa.',
          ],
          correctAnswer: 1,
          explanation: 'Vật mang thông tin là phương tiện lưu giữ dữ liệu như cuốn sách, tờ giấy, đĩa CD, thẻ nhớ...',
        },
        {
          question: '1 Byte bằng bao nhiêu bit?',
          options: ['A. 2 bit', 'B. 8 bit', 'C. 10 bit', 'D. 1024 bit'],
          correctAnswer: 1,
          explanation: 'Theo quy ước quốc tế trong tin học, 1 Byte = 8 bit.',
        },
        {
          question: 'Để tìm kiếm chính xác một cụm từ trên Internet, ta đặt cụm từ đó trong dấu gì?',
          options: [
            'A. Dấu ngoặc đơn ( )',
            'B. Dấu ngoặc kép " "',
            'C. Dấu gạch dưới _',
            'D. Dấu ngoặc vuông [ ]',
          ],
          correctAnswer: 1,
          explanation: 'Đặt từ khóa trong cặp dấu ngoặc kép "..." giúp máy tìm kiếm chính xác cụm từ.',
        },
      ];
    }

    return res.status(200).json({ questions });
  } catch (error: any) {
    console.warn('[Vercel AI Quiz Error]:', error?.message || error);
    return res.status(200).json({
      questions: [
        {
          question: '1 Byte bằng bao nhiêu bit?',
          options: ['A. 2 bit', 'B. 8 bit', 'C. 10 bit', 'D. 1024 bit'],
          correctAnswer: 1,
          explanation: '1 Byte = 8 bit theo chuẩn tin học.',
        },
      ],
    });
  }
}
