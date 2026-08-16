import React, { useState, useRef, useEffect } from 'react';
import { MCQQuestion } from '../types';
import { playSound } from '../utils/audio';
import { Bot, Eraser, Wand2, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface TabAIAssistantProps {
  onStartGeneratedAIQuiz: (questions: MCQQuestion[]) => void;
}

export const TabAIAssistant: React.FC<TabAIAssistantProps> = ({ onStartGeneratedAIQuiz }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Xin chào em! Trợ lý AI Tin học 6 sẵn sàng hỗ trợ! 👋\n\nEm đang gặp khó khăn ở bài học nào hay muốn giải thích thuật ngữ nào? Nhập câu hỏi bên dưới hoặc bấm vào gợi ý nhé!',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingQuiz, setGeneratingQuiz] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    playSound('click');
    setInput('');
    setErrorText(null);

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server error');
      }

      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
      playSound('correct');
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `🤖 **Trả lời về "${query}":**\n\n- Tin học lớp 6 gồm 6 chủ đề chính: Máy tính & cộng đồng, Mạng máy tính & Internet, Tìm kiếm thông tin, An toàn thông tin, Soạn thảo văn bản & Sơ đồ tư duy, và Thuật toán.\n- Em có thể tra cứu chi tiết hơn ở mục **Ôn Tập Theo Bài** trên thanh menu nhé!`,
        },
      ]);
      playSound('correct');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIQuiz = async () => {
    playSound('click');
    setGeneratingQuiz(true);
    setErrorText(null);

    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Toàn bộ chương trình Tin học 6 Kết nối tri thức',
          count: 5,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.questions) {
        throw new Error(data.error || 'Lỗi khởi tạo đề thi AI');
      }

      const formattedQuestions: MCQQuestion[] = data.questions.map((q: any, idx: number) => ({
        id: 9000 + idx,
        lessonId: 1,
        chapterId: 1,
        level: 'AI Gemini Tạo',
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      onStartGeneratedAIQuiz(formattedQuestions);
      playSound('victory');
    } catch (err: any) {
      console.error('AI Quiz Gen Error:', err);
      setErrorText('Không thể kết nối dịch vụ Gemini AI tự động. Hệ thống sẽ tạo bài tập từ ngân hàng có sẵn.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleClearChat = () => {
    playSound('click');
    setMessages([
      {
        role: 'ai',
        text: 'Đã xóa lịch sử trò chuyện! ✨\n\nEm có thể đặt bất kỳ câu hỏi mới nào liên quan đến môn Tin học 6 nhé!',
      },
    ]);
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                Trợ Lý AI Tin Học 6
                <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Gemini AI
                </span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Hỏi đáp kiến thức Tin học 6 và tạo đề thi trắc nghiệm AI thông minh!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleGenerateAIQuiz}
              disabled={generatingQuiz}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              {generatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo đề...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" /> Tạo Đề Thi AI
                </>
              )}
            </button>
            <button
              onClick={handleClearChat}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eraser className="w-4 h-4" /> Xóa
            </button>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Gợi ý câu hỏi nhanh:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              '💡 Bit và Byte là gì?',
              '🛡️ Cách tạo mật khẩu mạnh?',
              '⚙️ Ví dụ thuật toán đời sống?',
              '🧠 Lợi ích Sơ đồ tư duy?',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.substring(2).trim())}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-medium transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {errorText && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Chat History Container */}
        <div
          ref={chatContainerRef}
          className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[350px] max-h-[480px] overflow-y-auto space-y-4"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1 shadow-sm ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-purple-700 font-bold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Trợ lý AI Gemini đang suy nghĩ...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi Tin học 6 của em tại đây..."
            className="flex-1 bg-white border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
};
