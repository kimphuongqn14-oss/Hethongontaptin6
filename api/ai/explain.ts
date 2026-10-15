import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      type = 'mcq',
      question,
      options,
      correctAnswer,
      selectedAnswer,
      studentAnswer,
      sampleAnswer,
      hint,
      explanation: existingExplanation,
    } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: 'Thiếu nội dung câu hỏi' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

    let prompt = '';
    if (type === 'mcq') {
      const optionsList = Array.isArray(options)
        ? options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')
        : '';
      const correctLabel =
        typeof correctAnswer === 'number' && Array.isArray(options)
          ? `${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}`
          : String(correctAnswer ?? '');
      const studentLabel =
        typeof selectedAnswer === 'number' && Array.isArray(options)
          ? `${String.fromCharCode(65 + selectedAnswer)}. ${options[selectedAnswer]}`
          : '';

      prompt = `Hãy giải thích NGẮN GỌN (khoảng 3-4 dòng hoặc 2-3 gạch đầu dòng súc tích) cho học sinh lớp 6 về câu hỏi trắc nghiệm Tin học 6 sau:
Câu hỏi: ${question}
Các lựa chọn:
${optionsList}
Đáp án chính xác: ${correctLabel}
${studentLabel ? `Học sinh đã chọn: ${studentLabel}` : ''}
${existingExplanation ? `Ghi chú SGK có sẵn: ${existingExplanation}` : ''}

YÊU CẦU:
1. Giải thích vì sao đáp án đúng là chính xác (ngắn gọn, chuẩn kiến thức SGK Tin học 6 Kết nối tri thức).
2. Nêu nhanh mẹo ghi nhớ hoặc vì sao phương án khác chưa đúng.
3. Độ dài ngắn gọn, dễ hiểu cho lứa tuổi 11-12, dùng emoji sinh động.`;
    } else {
      prompt = `Hãy giải thích NGẮN GỌN (khoảng 3-4 dòng hoặc 2-3 gạch đầu dòng súc tích) cho học sinh lớp 6 về câu hỏi tự luận Tin học 6 sau:
Câu hỏi: ${question}
${hint ? `Gợi ý: ${hint}` : ''}
Đáp án mẫu chuẩn: ${sampleAnswer || 'Theo SGK Tin học 6 Kết nối tri thức'}
${studentAnswer ? `Học sinh đã trả lời: "${studentAnswer}"` : '(Học sinh chưa nhập câu trả lời)'}

YÊU CẦU:
1. Nêu 2-3 ý cốt lõi bắt buộc phải có để đạt điểm tối đa.
2. Giải thích ngắn gọn, dễ hiểu, dễ nhớ cho học sinh lớp 6.
${studentAnswer ? '3. Nhận xét ngắn gọn 1 câu về câu trả lời của học sinh (đã đúng ý nào, cần thêm gì).' : ''}
4. Dùng emoji sinh động, định dạng gạch đầu dòng rõ ràng.`;
    }

    const systemInstruction = `Bạn là Giáo viên AI bộ môn Tin học 6 - SGK Kết nối tri thức với cuộc sống.
Nhiệm vụ: Giải thích đáp án trắc nghiệm hoặc tự luận CỰC KỲ NGẮN GỌN, trọng tâm, súc tích, dễ nhớ cho học sinh lớp 6 (11-12 tuổi). Tuyệt đối không dài dòng.`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let explanation = '';

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        });
        explanation = response.text || '';
        if (explanation) break;
      } catch (err: any) {
        console.warn(`[Vercel AI Info] Explain model ${model} busy...`);
      }
    }

    if (!explanation) {
      if (type === 'mcq') {
        const correctLabel =
          typeof correctAnswer === 'number' && Array.isArray(options)
            ? `${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}`
            : String(correctAnswer ?? 'Đáp án chuẩn');
        explanation = `💡 **Đáp án chính xác:** ${correctLabel}\n• **Giải thích cốt lõi:** Theo SGK Tin học 6 Kết nối tri thức, đây là định nghĩa và kiến thức chuẩn xác nhất.${
          existingExplanation ? `\n• **Ghi nhớ:** ${existingExplanation}` : ''
        }\n• **Mẹo ghi nhớ:** Đọc kỹ từ khóa trọng tâm trong đề để loại bỏ các phương án gây nhiễu! ✨`;
      } else {
        const studentNote =
          studentAnswer && studentAnswer.trim().length > 5
            ? '\n• **Nhận xét bài làm:** Em đã chủ động làm bài tốt! Hãy đối chiếu với các ý chính ở trên để hoàn thiện nhé! 👍'
            : '';
        explanation = `💡 **Ý cốt lõi cần nhớ:**\n• **Nội dung trọng tâm:** ${
          sampleAnswer || hint || 'Theo chuẩn kiến thức SGK Tin học 6 Kết nối tri thức'
        }${studentNote}\n• **Mẹo làm bài:** Trình bày theo từng ý gạch đầu dòng rõ ràng, nêu bật các thuật ngữ tin học để đạt điểm tối đa! 🎯`;
      }
    }

    return res.status(200).json({ explanation });
  } catch (error: any) {
    console.warn('[Vercel AI Explain Error]:', error?.message || error);
    return res.status(200).json({
      explanation: '💡 **Lưu ý:** Em hãy đọc kỹ lại lý thuyết bài học tương ứng trong SGK Tin học 6 để nắm vững kiến thức nhé! ✨',
    });
  }
}
