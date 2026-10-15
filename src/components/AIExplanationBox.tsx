import React, { useState } from 'react';
import { Sparkles, Bot, Loader2, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchAIExplanation, ExplainRequestParams } from '../utils/aiExplainer';
import { playSound } from '../utils/audio';

interface AIExplanationBoxProps extends ExplainRequestParams {
  buttonText?: string;
  className?: string;
  variant?: 'inline' | 'card' | 'badge';
  defaultOpen?: boolean;
}

export const AIExplanationBox: React.FC<AIExplanationBoxProps> = ({
  type,
  question,
  options,
  correctAnswer,
  selectedAnswer,
  studentAnswer,
  sampleAnswer,
  hint,
  explanation: existingExplanation,
  buttonText = 'AI Giải Thích Ngắn Gọn',
  className = '',
  variant = 'card',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string | null>(null);

  const loadExplanation = async (forceRefresh = false) => {
    if (content && !forceRefresh) {
      setIsOpen(!isOpen);
      playSound('click');
      return;
    }

    playSound('click');
    setIsOpen(true);
    setLoading(true);

    try {
      const result = await fetchAIExplanation({
        type,
        question,
        options,
        correctAnswer,
        selectedAnswer,
        studentAnswer,
        sampleAnswer,
        hint,
        explanation: existingExplanation,
      });
      setContent(result);
      playSound('correct');
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setContent('Chưa thể kết nối tới Trợ lý AI. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!content && !loading) {
      loadExplanation();
    } else {
      playSound('click');
      setIsOpen((prev) => !prev);
    }
  };

  const renderFormattedText = (raw: string) => {
    // Process markdown bold and line breaks
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1" />;

      // Parse bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className="leading-relaxed text-slate-800 text-xs sm:text-sm">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-purple-950">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{p}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 font-bold transition rounded-xl text-xs shadow-sm cursor-pointer ${
          variant === 'badge'
            ? 'px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
            : variant === 'inline'
            ? 'px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200'
            : 'px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-300" />
        )}
        <span>{buttonText}</span>
        {content && !loading && (
          isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Expanded Content Box */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/70 to-blue-50/90 border-2 border-purple-200/80 shadow-md space-y-2.5 animate-fade-in relative">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs text-purple-900 uppercase tracking-wide">
                Thầy/Cô AI Giải Thích Ngắn Gọn
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadExplanation(true)}
                disabled={loading}
                title="Yêu cầu AI giải thích lại"
                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng giải thích"
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-3 flex items-center gap-2.5 text-xs text-purple-700 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>AI đang soạn giải thích súc tích, dễ nhớ cho học sinh lớp 6...</span>
            </div>
          ) : content ? (
            <div className="space-y-1.5 pt-1 text-slate-800">
              {renderFormattedText(content)}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
