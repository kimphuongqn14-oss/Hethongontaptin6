export interface ExplainRequestParams {
  type: 'mcq' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: number | string;
  selectedAnswer?: number;
  studentAnswer?: string;
  sampleAnswer?: string;
  hint?: string;
  explanation?: string;
}

export async function fetchAIExplanation(params: ExplainRequestParams): Promise<string> {
  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.explanation) {
        return data.explanation;
      }
    }
  } catch (err) {
    console.warn('AI Explanation network request error, using smart fallback:', err);
  }

  // Smart fallback if network or API key is unavailable
  if (params.type === 'mcq') {
    const optLabel =
      typeof params.correctAnswer === 'number' && params.options
        ? `${String.fromCharCode(65 + params.correctAnswer)}. ${params.options[params.correctAnswer]}`
        : String(params.correctAnswer || 'Đáp án chính xác');

    const basicExpl = params.explanation ? `\n• ${params.explanation}` : '';

    return `💡 **Đáp án chuẩn:** ${optLabel}
• **Lý do ngắn gọn:** Kiến thức SGK Tin học 6 Kết nối tri thức quy định chuẩn xác nội dung này.${basicExpl}
• **Mẹo nhớ nhanh:** Đọc kỹ từ khóa trong câu hỏi để loại bỏ các phương án gây nhiễu! ✨`;
  } else {
    const keyHint = params.hint ? `\n• **Gợi ý trọng tâm:** ${params.hint}` : '';
    const sample = params.sampleAnswer ? `\n• **Ý cốt lõi cần có:** ${params.sampleAnswer}` : '';
    const studentFeedback = params.studentAnswer && params.studentAnswer.trim().length > 5
      ? '\n• **Nhận xét bài làm:** Em đã chủ động làm bài, hãy đối chiếu với các ý cốt lõi trên để bổ sung đầy đủ thuật ngữ tin học nhé! 👍'
      : '';

    return `💡 **Tóm tắt cốt lõi câu tự luận:**${sample}${keyHint}${studentFeedback}
• **Mẹo làm bài:** Trình bày rõ ràng theo gạch đầu dòng để đạt điểm tối đa! 🎯`;
  }
}
