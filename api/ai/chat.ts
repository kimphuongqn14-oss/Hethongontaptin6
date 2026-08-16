import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    const systemInstruction = `Bạn là Trợ lý AI giáo dục chuyên môn môn Tin học lớp 6 bộ sách "Kết nối tri thức với cuộc sống". 
Giải thích rõ ràng, sinh động, dễ hiểu, chuẩn xác cho học sinh 11-12 tuổi.
Dùng tiếng Việt chuẩn, sử dụng các biểu tượng (emoji) thích hợp và gạch đầu dòng để học sinh dễ tiếp thu.`;

    const formattedContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history) {
        formattedContents.push({
          role: item.role === 'ai' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.parts?.[0]?.text || item.text || '' }],
        });
      }
    }
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Xin lỗi, hiện tại thầy/cô AI chưa thể trả lời câu hỏi này.';
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Gemini AI Chat Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message || String(error),
    });
  }
}
