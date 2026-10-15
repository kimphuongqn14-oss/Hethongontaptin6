import React, { useState, useRef, useEffect } from 'react';
import { MCQQuestion, UserProfile } from '../types';
import { playSound } from '../utils/audio';
import {
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  FileText,
  Sliders,
  Image as ImageIcon,
  X,
  ChevronDown,
  Layers,
  GraduationCap,
  Target,
  PlayCircle,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { AdminKnowledgeModal } from './AdminKnowledgeModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  image?: string;
  parsedQuestions?: MCQQuestion[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  persona: 'teacher_5512' | 'stem_expert' | 'exam_evaluator' | 'friendly_tutor';
  topic: string;
}

interface TabAIAssistantProps {
  onStartGeneratedAIQuiz: (questions: MCQQuestion[]) => void;
  currentUser?: UserProfile;
}

const PEDAGOGY_PERSONAS = [
  {
    id: 'teacher_5512' as const,
    name: 'Giáo viên Tin học 6 (CV 5512)',
    roleTitle: 'Chuyên gia Kế hoạch bài dạy chuẩn CV 5512',
    icon: '👨‍🏫',
    desc: 'Soạn Kế hoạch bài dạy (Giáo án) 4 hoạt động chuẩn Công văn 5512/BGDĐT, bám sát SGK Kết nối tri thức.',
  },
  {
    id: 'stem_expert' as const,
    name: 'Chuyên gia Phương pháp & STEM',
    roleTitle: 'Tích hợp liên môn & Dự án học tập số',
    icon: '🔬',
    desc: 'Thiết kế dự án học tập STEM, hoạt động trải nghiệm thực tế, phát triển phẩm chất và năng lực số.',
  },
  {
    id: 'exam_evaluator' as const,
    name: 'Chuyên gia Khảo thí & Đề thi',
    roleTitle: 'Ma trận, đặc tả & ngân hàng câu hỏi 4 mức độ',
    icon: '⚖️',
    desc: 'Lập ma trận 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), xây dựng câu hỏi chuẩn hóa.',
  },
  {
    id: 'friendly_tutor' as const,
    name: 'Trợ giảng AI Thân thiện (Học sinh)',
    roleTitle: 'Đồng hành hỏi đáp & giải thích trực quan 24/7',
    icon: '🤖',
    desc: 'Giải thích dễ hiểu cho học sinh 11-12 tuổi, ẩn dụ đời sống sinh động, hướng dẫn thao tác máy tính.',
  },
];

const CURRICULUM_TOPICS = [
  'Toàn bộ chương trình Tin học 6 Kết nối tri thức',
  'Chủ đề A: Máy tính và cộng đồng (Thông tin & dữ liệu, Lưu trữ & biểu diễn)',
  'Chủ đề B: Mạng máy tính và Internet (Khái niệm mạng, Lợi ích Internet)',
  'Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin (Thư mục, Web, Email)',
  'Chủ đề D: Đạo đức, pháp luật và văn hóa trong môi trường số (An toàn thông tin)',
  'Chủ đề E: Ứng dụng tin học (Sơ đồ tư duy, Soạn thảo văn bản cơ bản)',
  'Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính (Thuật toán & Mô tả)',
  '📚 [kt.md] Mầm non (5-6 tuổi): Sự kỳ diệu của đường (Khám phá khoa học)',
  '📚 [kt.md] Toán học 9: Hệ thức Vi-ét và ứng dụng (Đại số 9 - GDPT 2018)',
  '📚 [kt.md] Khoa học tự nhiên: Quang hợp ở thực vật (Sinh học & Tự nhiên)',
];


// Helper to extract MCQ questions from AI output
function parseMCQFromText(text: string): MCQQuestion[] {
  const questions: MCQQuestion[] = [];
  const regex = /(?:Câu\s*(\d+)[:.]\s*)([\s\S]*?)(?=Câu\s*\d+[:.]|$)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const qBlock = match[2];
    const lines = qBlock.split('\n').map((l) => l.trim()).filter(Boolean);

    let questionTitle = '';
    const options: string[] = [];
    let correctIdx = 0;
    let explanation = '';

    for (const line of lines) {
      if (/^[A-D]\.\s*/i.test(line)) {
        options.push(line.replace(/^[A-D]\.\s*/i, ''));
      } else if (/^Đáp\s*án\s*[:=]\s*([A-D])/i.test(line)) {
        const letterMatch = line.match(/^Đáp\s*án\s*[:=]\s*([A-D])/i);
        if (letterMatch) {
          const letter = letterMatch[1].toUpperCase();
          correctIdx = letter.charCodeAt(0) - 65;
        }
      } else if (/^Giải\s*thích\s*[:=]/i.test(line)) {
        explanation = line.replace(/^Giải\s*thích\s*[:=]\s*/i, '');
      } else if (options.length === 0) {
        questionTitle += (questionTitle ? ' ' : '') + line;
      } else if (options.length > 0 && !explanation && !line.startsWith('Đáp')) {
        explanation += (explanation ? ' ' : '') + line;
      }
    }

    if (questionTitle && options.length >= 4) {
      questions.push({
        id: 9500 + questions.length,
        lessonId: 1,
        chapterId: 1,
        level: 'AI Phòng Lab Sư Phạm',
        question: questionTitle,
        options: options.slice(0, 4),
        correctAnswer: correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0,
        explanation: explanation || 'Theo chuẩn kiến thức SGK Tin học 6 Kết nối tri thức.',
      });
    }
  }

  return questions;
}

// Convert Markdown-like text to formatted HTML for Word export (.doc)
function markdownToWordHTML(text: string, title: string = 'TÀI LIỆU SƯ PHẠM TIN HỌC 6') {
  // Convert basic markdown to clean HTML
  let html = text
    .replace(/^### (.*$)/gim, '<h3 style="color:#1e3a8a; margin-top:14pt; margin-bottom:4pt; font-size:14pt;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#1e3a8a; margin-top:16pt; margin-bottom:6pt; font-size:16pt; border-bottom:1px solid #94a3b8; padding-bottom:3pt;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; text-align:center; font-size:18pt; margin-bottom:12pt;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code style="background-color:#f1f5f9; padding:2px 4px; border-radius:3px; font-family:Courier New;">$1</code>')
    .replace(/^\s*[-•*]\s+(.*$)/gim, '<li style="margin-bottom:3pt;">$1</li>')
    .replace(/(<li>.*<\/li>)/gims, '<ul style="margin-top:4pt; margin-bottom:8pt; padding-left:20pt;">$1</ul>');

  // Handle tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const finalLines: string[] = [];

  for (const line of lines) {
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; margin:10pt 0; font-size:12pt; border:1px solid #475569;">';
      }
      if (line.includes('---')) {
        // Separator line
        continue;
      }
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableHtml += '<tr>';
      cells.forEach((cell) => {
        tableHtml += `<td style="border:1px solid #cbd5e1; padding:6pt 8pt;">${cell.trim()}</td>`;
      });
      tableHtml += '</tr>';
    } else {
      if (inTable) {
        tableHtml += '</table>';
        finalLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      finalLines.push(line ? `<p style="margin:4pt 0; line-height:1.45;">${line}</p>` : '<br/>');
    }
  }
  if (inTable) {
    tableHtml += '</table>';
    finalLines.push(tableHtml);
  }

  const contentHtml = finalLines.join('\n');

  return `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: A4 portrait;
        margin: 2cm 2cm 2.5cm 2cm;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 13pt;
        line-height: 1.45;
        color: #000;
        margin: 0;
        padding: 0;
      }
      .header-table {
        width: 100%;
        margin-bottom: 20pt;
        border: none;
      }
      .header-table td {
        border: none;
        vertical-align: top;
        font-size: 12pt;
      }
      h1, h2, h3, h4 {
        font-family: 'Times New Roman', Times, serif;
        font-weight: bold;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12pt 0;
      }
      table, th, td {
        border: 1px solid #000;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        text-align: center;
        padding: 6pt;
      }
      td {
        padding: 5pt 8pt;
      }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td style="width: 50%; text-align: center;">
          <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
          <strong>TRƯỜNG THCS</strong><br/>
          Số: ..... /KHBD-THCS
        </td>
        <td style="width: 50%; text-align: center;">
          <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
          <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
          <em>.............., ngày .... tháng .... năm 202...</em>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-bottom: 16pt;">
      <h2 style="margin: 0; text-transform: uppercase;">${title}</h2>
      <p style="margin: 4pt 0 0 0; font-style: italic;">Chương trình GDPT 2018 - SGK Tin học 6 (Kết nối tri thức)</p>
      <p style="margin: 2pt 0 0 0; font-size: 11pt; color: #444;">Xuất bản từ: KT.MD Engine • EdTech Modern AI Phòng Lab Sư Phạm Số</p>
    </div>

    <hr style="border: none; border-top: 1px solid #000; margin-bottom: 16pt;"/>

    <div class="content">
      ${contentHtml}
    </div>

    <div style="margin-top: 30pt; width: 100%;">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="border: none; text-align: center; width: 50%;">
            <strong>TỔ TRƯỞNG CHUYÊN MÔN</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
          <td style="border: none; text-align: center; width: 50%;">
            <strong>GIÁO VIÊN SOẠN BÀI</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;
}

export const TabAIAssistant: React.FC<TabAIAssistantProps> = ({ onStartGeneratedAIQuiz, currentUser }) => {
  const isStudent = currentUser?.role === 'student';
  const storageKey = isStudent ? 'kt_md_sessions_student' : 'kt_md_sessions_teacher';

  // Session state stored in LocalStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local sessions');
    }
    if (isStudent) {
      return [
        {
          id: 'session-student-default',
          title: 'Hỏi đáp Tin học 6 cùng AI',
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          persona: 'friendly_tutor',
          topic: 'Toàn bộ chương trình Tin học 6 Kết nối tri thức',
          messages: [
            {
              id: 'init-student-msg',
              role: 'ai',
              timestamp: new Date().toLocaleTimeString('vi-VN'),
              text: `👋 **Chào em! Trợ lý AI Tin học 6 sẵn sàng hỗ trợ!**\n\nEm đang gặp khó khăn ở bài học nào, cần giải thích khái niệm gì (như *Bit, Byte, Mạng Internet, Sơ đồ tư duy, Thuật toán...*) hay muốn hỏi đáp bài tập trong sách giáo khoa? Em hãy nhập câu hỏi hoặc chọn một trong các gợi ý bên dưới để cùng học nhé! 🌟`,
            },
          ],
        },
      ];
    }
    return [
      {
        id: 'session-default',
        title: 'Kế hoạch bài dạy Tin học 6',
        createdAt: new Date().toLocaleTimeString('vi-VN'),
        persona: 'teacher_5512',
        topic: 'Toàn bộ chương trình Tin học 6 Kết nối tri thức',
        messages: [
          {
            id: 'init-msg',
            role: 'ai',
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            text: `👋 **Kính chào Quý Thầy/Cô!**\n\nChào mừng đến với **Phòng Lab Sư Phạm Số - EdTech Modern AI (KT.MD Engine v3.5)**!\n\nTôi là Trợ lý Sư phạm chuyên sâu môn **Tin học lớp 6 (Bộ sách Kết nối tri thức với cuộc sống)**, được trang bị đầy đủ các nghiệp vụ sư phạm số:\n• 📋 **Soạn Giáo Án 5512:** Kế hoạch bài dạy chi tiết 4 hoạt động chuẩn Công văn 5512/BGDĐT.\n• 📊 **Ma Trận & Đặc Tả Đề:** Lập ma trận đề kiểm tra 4 mức độ nhận thức kèm biểu điểm chuẩn.\n• 🎯 **Tạo Bộ Trắc Nghiệm Thông Minh:** Tự động tạo câu hỏi trắc nghiệm và nạp ngay vào App để thi thử trực tiếp.\n• 🚀 **Dự Án STEM & Kịch Bản Khởi Động:** Thiết kế hoạt động tích hợp, trò chơi học tập sinh động.\n• 📄 **Xuất File Word Chuẩn:** Tải về máy tính dưới định dạng Microsoft Word (.doc) căn chỉnh chuẩn văn bản sư phạm.\n• 🔊 **Đọc Giọng Tiếng Việt:** Đọc to tài liệu bằng giọng chuẩn Web Speech.\n\nQuý Thầy/Cô hãy nhập yêu cầu bài dạy hoặc bấm vào Tham Số Sư Phạm để cấu hình! ✨`,
          },
        ],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    sessions[0]?.id || (isStudent ? 'session-student-default' : 'session-default')
  );
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Config parameters
  const [activePersona, setActivePersona] = useState<'teacher_5512' | 'stem_expert' | 'exam_evaluator' | 'friendly_tutor'>(
    isStudent ? 'friendly_tutor' : (currentSession?.persona || 'teacher_5512')
  );
  const [activeTopic, setActiveTopic] = useState<string>(
    currentSession?.topic || CURRICULUM_TOPICS[0]
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // Knowledge Base & Pedagogy Rules (kt.md & tc.md)
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
  const [ktContent, setKtContent] = useState<string>('');
  const [tcContent, setTcContent] = useState<string>('');

  // Load active kt.md and tc.md
  useEffect(() => {
    const loadKnowledge = async () => {
      let loaded = false;
      try {
        const res = await fetch('/api/get-md');
        if (res.ok) {
          const data = await res.json();
          if (data.ktContent) setKtContent(data.ktContent);
          if (data.tcContent) setTcContent(data.tcContent);
          loaded = true;
        }
      } catch (e) {
        console.warn('API get-md unavailable, checking localStorage');
      }

      if (!loaded) {
        const localKt = localStorage.getItem('ai_studio_kt_content');
        const localTc = localStorage.getItem('ai_studio_tc_content');
        if (localKt) setKtContent(localKt);
        if (localTc) setTcContent(localTc);
      }
    };
    loadKnowledge();
  }, []);

  // Input & Status
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync session changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }
  }, [sessions, storageKey]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, loading]);

  // Clean up speech when unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCreateNewSession = () => {
    playSound('click');
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: isStudent ? `Buổi học ${sessions.length + 1}` : `Phiên mới ${sessions.length + 1}`,
      createdAt: new Date().toLocaleTimeString('vi-VN'),
      persona: isStudent ? 'friendly_tutor' : activePersona,
      topic: activeTopic,
      messages: [
        {
          id: `init-${Date.now()}`,
          role: 'ai',
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          text: isStudent
            ? `Chào em! Buổi học mới đã sẵn sàng. Em muốn tìm hiểu hay hỏi bài gì hôm nay?`
            : `Chào Quý Thầy/Cô! Phiên làm việc mới đã sẵn sàng. Thầy/Cô cần hỗ trợ nội dung nào trong chương trình Tin học 6?`,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert('Không thể xóa phiên duy nhất. Hãy dùng nút Xóa Lịch Sử để làm mới.');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa phiên trò chuyện này?')) {
      playSound('click');
      const filtered = sessions.filter((s) => s.id !== id);
      setSessions(filtered);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
    }
  };

  const handleClearCurrentSession = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong phiên này?')) {
      playSound('click');
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [
                  {
                    id: `cleared-${Date.now()}`,
                    role: 'ai',
                    timestamp: new Date().toLocaleTimeString('vi-VN'),
                    text: 'Lịch sử phiên đã được làm mới. Mời Quý Thầy/Cô và các em nhập yêu cầu tiếp theo!',
                  },
                ],
              }
            : s
        )
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên tệp hình ảnh (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setImageAttachment(loadEvt.target?.result as string);
      playSound('click');
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customPrompt?: string, presetPersona?: typeof activePersona, presetTemp?: number) => {
    const messageToSend = (customPrompt || input).trim();
    if ((!messageToSend && !imageAttachment) || loading) return;

    playSound('click');
    setInput('');
    const attachedImage = imageAttachment;
    setImageAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      image: attachedImage || undefined,
    };

    // Update session title on first user message if default
    const isFirstUserMsg = !currentSession.messages.some((m) => m.role === 'user');
    const newTitle = isFirstUserMsg && messageToSend ? messageToSend.slice(0, 32) + '...' : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: newTitle, messages: updatedMessages }
          : s
      )
    );

    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          persona: isStudent ? 'friendly_tutor' : (presetPersona || activePersona),
          temperature: isStudent ? 0.7 : (presetTemp !== undefined ? presetTemp : temperature),
          topic: activeTopic,
          image: attachedImage,
          ktContent,
          tcContent,
          history: updatedMessages.slice(-6).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Hệ thống đã nhận thông tin. Vui lòng thử lại!';

      // Parse potential MCQ questions in reply
      const extractedMCQs = parseMCQFromText(replyText);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        parsedQuestions: extractedMCQs.length > 0 ? extractedMCQs : undefined,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, aiMsg] }
            : s
        )
      );

      playSound('correct');
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        text: isStudent
          ? `### 💡 Trợ Lý AI Giải Thích\n\nNội dung em hỏi: *"${messageToSend}"*\n\n• **Khái niệm trọng tâm:** Nội dung này thuộc chương trình Tin học lớp 6 SGK Kết nối tri thức với cuộc sống.\n• **Gợi ý tự học:** Em hãy mở mục **Ôn Tập Theo Bài** trên thanh menu để xem lý thuyết chi tiết và làm thử các câu trắc nghiệm nhé! 🌟`
          : `### 💡 Hướng Dẫn Sư Phạm Tin Học 6\n\nNội dung: *"${messageToSend}"*\n\n• **Lý thuyết trọng tâm:** Bám sát chuẩn kiến thức kĩ năng chương trình GDPT 2018 bộ SGK Kết nối tri thức.\n• Quý Thầy/Cô có thể tham khảo mục **Ôn Tập Theo Bài** để được phản hồi chi tiết nhất!`,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, fallbackAiMsg] }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    playSound('click');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportWord = (content: string, title: string = 'Kế hoạch bài dạy Tin học 6') => {
    playSound('click');
    const wordHtml = markdownToWordHTML(content, title);
    const blob = new Blob(['\ufeff', wordHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KTMD_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleToggleSpeak = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản (Web Speech API).');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner voice
    const cleanSpeechText = text
      .replace(/[#*_`|>\-\+]/g, ' ')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
    playSound('click');
  };

  const handleLoadQuestionsToQuiz = (questions: MCQQuestion[]) => {
    playSound('victory');
    onStartGeneratedAIQuiz(questions);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner Header */}
      {isStudent ? (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/30 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30 shrink-0 ring-4 ring-white/20">
                <Bot className="w-9 h-9 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-cyan-400/25 text-cyan-200 border border-cyan-400/30 text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Trợ Lý AI Học Tập
                  </span>
                  <span className="bg-white/15 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Tin Học 6 - Kết Nối Tri Thức
                  </span>
                  <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Hỏi Đáp & Giải Thích Trực Quan
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Trợ Lý AI Hỏi Đáp & Học Tập Tin Học 6
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Đồng hành giải đáp kiến thức, giải thích thuật ngữ (Bit, Byte, Mạng máy tính, Sơ đồ tư duy, Thuật toán...), phân tích ảnh bài tập và hướng dẫn tự học trực quan 24/7.
                </p>
              </div>
            </div>

            {/* Student Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end">
              <button
                onClick={handleCreateNewSession}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold shadow-md transition flex items-center gap-2 border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>Hỏi Đoạn Mới</span>
              </button>

              <button
                onClick={handleClearCurrentSession}
                className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher & Admin: Phòng Lab Sư Phạm Số Header */
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/30 shrink-0 ring-4 ring-white/10">
                <Bot className="w-9 h-9 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    KT.MD Engine v3.5
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Chuẩn GDPT 2018
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Công văn 5512/BGDĐT
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Phòng Lab Sư Phạm Số - EdTech Modern AI
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Trợ lý Giáo dục & Sư phạm số: Soạn Kế hoạch bài dạy 5512, Thiết kế Ma trận đề kiểm tra 4 mức độ, Dự án STEM, Ngân hàng câu hỏi thông minh & Xuất văn bản Word.
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end">
              <button
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 border border-blue-400/30"
                title="Quản lý kho tri thức bài học (kt.md) và quy chuẩn sư phạm (tc.md)"
              >
                <BookOpen className="w-4 h-4 text-cyan-300" />
                <span>Tri Thức kt.md & tc.md</span>
              </button>

              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border shadow-sm ${
                  showConfigPanel
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                <Sliders className="w-4 h-4 text-purple-300" />
                <span>Tham Số Sư Phạm</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConfigPanel ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleCreateNewSession}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Phiên Mới</span>
              </button>

              <button
                onClick={handleClearCurrentSession}
                className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                title="Làm mới phiên trò chuyện hiện tại"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            </div>
          </div>

          {/* Collapsible Config & Persona Drawer (Teachers Only) */}
          {showConfigPanel && (
            <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {/* Persona Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Vai Trò Sư Phạm (Persona)
                </label>
                <div className="space-y-1.5">
                  {PEDAGOGY_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        playSound('click');
                        setActivePersona(p.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center gap-2.5 ${
                        activePersona === p.id
                          ? 'bg-purple-600/30 border-purple-400 text-white font-bold ring-1 ring-purple-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <div className="flex-1 truncate">
                        <div className="font-bold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.roleTitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope / Curriculum Topic */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Phạm Vi Chủ Đề Tin Học 6
                </label>
                <select
                  value={activeTopic}
                  onChange={(e) => setActiveTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {CURRICULUM_TOPICS.map((topic, idx) => (
                    <option key={idx} value={topic} className="bg-slate-900 text-white">
                      {topic}
                    </option>
                  ))}
                </select>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Chuẩn Bộ Sách:
                  </div>
                  <div>Tin học 6 - Kết nối tri thức với cuộc sống (Chủ đề A đến F).</div>
                </div>
              </div>

              {/* Temperature Slider & Word Export All */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Chỉ Số Sáng Tạo (Temperature)
                  </label>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono font-bold text-cyan-300">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.2: Chuẩn mực 5512</span>
                  <span>0.7: Cân bằng sư phạm</span>
                  <span>1.0: Ý tưởng STEM</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const allText = currentSession.messages
                        .map((m) => `## ${m.role === 'user' ? 'Yêu Cầu Từ Người Dùng' : 'Phản Hồi Sư Phạm'}\n${m.text}`)
                        .join('\n\n---\n\n');
                      handleExportWord(allText, currentSession.title);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Xuất Toàn Bộ Phiên Ra Word (.doc)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Quick Question Chips */}
      {isStudent && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Gợi ý câu hỏi ôn tập nhanh:
            </span>
            <span className="text-[11px] text-slate-400">Bấm để hỏi ngay</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              '💡 Bit và Byte khác nhau thế nào?',
              '🌱 Quang hợp ở thực vật diễn ra như thế nào?',
              '📐 Định lý Vi-ét trong Toán 9 dùng để làm gì?',
              '🌈 Thí nghiệm cầu vồng nước đường hoạt động ra sao?',
              '🌐 Mạng Internet là gì và đem lại lợi ích gì?',
              '⚙️ Thuật toán là gì? Cho ví dụ trong đời sống',
              '🧠 Sơ đồ tư duy giúp ích gì khi ôn tập?',
              '🛡️ Mẹo đặt mật khẩu an toàn và tránh mã độc?',
              '🔍 Cách tìm kiếm thông tin hiệu quả trên Google?',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.replace(/^[^a-zA-ZÀ-ỹ0-9]+/, '').trim())}
                disabled={loading}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition shadow-sm hover:shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout: Sidebar Sessions + Chat Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sessions Drawer (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>{isStudent ? 'Các Cuộc Trò Chuyện' : 'Các Phiên Làm Việc'}</span>
            </h3>
            <button
              onClick={handleCreateNewSession}
              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
              title={isStudent ? 'Hỏi cuộc trò chuyện mới' : 'Thêm phiên mới'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
            {sessions.map((sess) => {
              const isSelected = sess.id === currentSessionId;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    playSound('click');
                    setCurrentSessionId(sess.id);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition text-xs flex items-center justify-between group ${
                    isSelected
                      ? (isStudent ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20')
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex-1 truncate mr-2">
                    <div className="truncate font-semibold">{sess.title}</div>
                    <div className={`text-[10px] ${isSelected ? (isStudent ? 'text-blue-200' : 'text-purple-200') : 'text-slate-400'}`}>
                      {sess.messages.length} tin nhắn • {sess.createdAt}
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                        isSelected ? (isStudent ? 'hover:bg-blue-700 text-white' : 'hover:bg-purple-700 text-white') : 'hover:bg-slate-200 text-rose-500'
                      }`}
                      title="Xóa đoạn chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <BookOpen className={`w-3.5 h-3.5 ${isStudent ? 'text-blue-600' : 'text-purple-600'}`} />
              <span>{isStudent ? 'Hỏi đáp trực quan cùng AI' : 'Sư phạm số KT.MD'}</span>
            </div>
            <div>
              {isStudent
                ? 'Mọi câu hỏi và giải đáp được lưu tự động trên thiết bị của bạn.'
                : 'Mọi cuộc trò chuyện được lưu tự động trên thiết bị của bạn.'}
            </div>
          </div>
        </div>

        {/* Right Chat & Response Suite (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          {/* Chat Window Header */}
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                isStudent ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {isStudent ? '🤖' : (PEDAGOGY_PERSONAS.find((p) => p.id === activePersona)?.icon || '👨‍🏫')}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-xs sm:max-w-md">
                  {currentSession.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{isStudent ? 'Trợ giảng AI Thân thiện' : PEDAGOGY_PERSONAS.find((p) => p.id === activePersona)?.name}</span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">
                    {isStudent ? 'Giải thích trực quan Tin học 6' : activeTopic.split(':')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher Only Header Actions */}
            {!isStudent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lastAIMsg = [...currentSession.messages].reverse().find((m) => m.role === 'ai');
                    if (lastAIMsg) {
                      handleExportWord(lastAIMsg.text, currentSession.title);
                    } else {
                      alert('Chưa có nội dung phản hồi để xuất.');
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Tải phản hồi cuối cùng về máy tính dưới dạng Word (.doc)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Xuất Word (.doc)</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[560px] bg-slate-50/40">
            {currentSession.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in group`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                        : isStudent
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 text-white'
                          : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-slate-900 text-white'
                    }`}
                  >
                    {isUser ? '👤' : '🤖'}
                  </div>

                  {/* Bubble Content */}
                  <div className={`space-y-3 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Header info */}
                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                      <span className="font-bold text-slate-600">
                        {isUser
                          ? (isStudent ? 'Học sinh' : 'Giáo viên')
                          : (isStudent ? 'Trợ Lý AI Tin Học 6' : 'Trợ Lý Sư Phạm KT.MD')}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Image if attached */}
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-sm shadow-sm bg-white p-1">
                        <img src={msg.image} alt="Tài liệu đính kèm" className="rounded-xl w-full max-h-60 object-contain" />
                      </div>
                    )}

                    {/* Message Box */}
                    <div
                      className={`p-4 sm:p-5 rounded-3xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-normal'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Quick Action Suite on AI messages */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        {/* Word Export Button (Teachers Only) */}
                        {!isStudent && (
                          <button
                            onClick={() => handleExportWord(msg.text, currentSession.title)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold transition flex items-center gap-1 shadow-sm text-[11px]"
                            title="Xuất nội dung này ra file Word .doc"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Tải File Word</span>
                          </button>
                        )}

                        {/* Text to Speech */}
                        <button
                          onClick={() => handleToggleSpeak(msg.text, msg.id)}
                          className={`px-2.5 py-1.5 rounded-xl border font-bold transition flex items-center gap-1 shadow-sm text-[11px] ${
                            speakingMsgId === msg.id
                              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                          title="Đọc bằng giọng nói tiếng Việt"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                              <span>Dừng Đọc</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className={`w-3.5 h-3.5 ${isStudent ? 'text-blue-600' : 'text-purple-600'}`} />
                              <span>Đọc Giọng Nói</span>
                            </>
                          )}
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold transition flex items-center gap-1 shadow-sm text-[11px]"
                          title="Sao chép toàn bộ văn bản"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Đã Chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Sao Chép</span>
                            </>
                          )}
                        </button>

                        {/* Special Action: If questions are detected, offer to load directly into the quiz system */}
                        {msg.parsedQuestions && msg.parsedQuestions.length > 0 && (
                          <button
                            onClick={() => handleLoadQuestionsToQuiz(msg.parsedQuestions!)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 text-[11px] animate-bounce"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-amber-300" />
                            <span>Nạp {msg.parsedQuestions.length} Câu Vào Bài Thi Ngay</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3.5 animate-fade-in">
                <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${
                  isStudent
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                }`}>
                  🤖
                </div>
                <div className={`bg-white border p-4 rounded-3xl rounded-tl-none shadow-sm space-y-2 ${
                  isStudent ? 'border-blue-200' : 'border-purple-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold ${
                    isStudent ? 'text-blue-700' : 'text-purple-700'
                  }`}>
                    <Loader2 className={`w-4 h-4 animate-spin ${isStudent ? 'text-blue-600' : 'text-purple-600'}`} />
                    <span>{isStudent ? 'Trợ lý AI đang suy nghĩ và chuẩn bị giải thích...' : 'Trợ lý Sư phạm KT.MD đang biên soạn giáo án & nội dung...'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isStudent
                      ? 'Đang chuẩn bị câu trả lời trực quan, dễ hiểu theo SGK Tin học 6.'
                      : 'Đang bám sát SGK Kết nối tri thức và thể thức văn bản sư phạm chuẩn mực.'}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input & Form Tray */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
            {/* Attachment preview if any */}
            {imageAttachment && (
              <div className={`relative inline-block border-2 rounded-2xl overflow-hidden p-1 ${
                isStudent ? 'border-blue-500 bg-blue-50' : 'border-purple-500 bg-purple-50'
              }`}>
                <img src={imageAttachment} alt="Preview" className="h-16 w-24 object-cover rounded-xl" />
                <button
                  onClick={() => setImageAttachment(null)}
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 transition"
                  title="Gỡ ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-2xl bg-slate-100 border border-slate-200 transition shrink-0 ${
                  isStudent
                    ? 'hover:bg-blue-100 text-slate-600 hover:text-blue-700'
                    : 'hover:bg-purple-100 text-slate-600 hover:text-purple-700'
                }`}
                title="Đính kèm hình ảnh bài tập / sơ đồ SGK để phân tích"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Textarea input */}
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={
                    isStudent
                      ? 'Em hãy nhập câu hỏi Tin học 6 hoặc dán nội dung bài tập tại đây... (Nhấn Enter để gửi)'
                      : 'Nhập câu hỏi, tên bài học Tin học 6 cần soạn giáo án hoặc dán nội dung tại đây... (Nhấn Enter để gửi)'
                  }
                  className={`w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white resize-none shadow-inner ${
                    isStudent ? 'focus:ring-blue-500' : 'focus:ring-purple-500'
                  }`}
                />
              </div>

              {/* Submit send button */}
              <button
                type="submit"
                disabled={loading || (!input.trim() && !imageAttachment)}
                className={`px-6 py-4 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isStudent
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                }`}
              >
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>
                {isStudent
                  ? 'Hỗ trợ hỏi bài, tải ảnh chụp bài tập SGK để được giải thích và nghe đọc to bằng giọng tiếng Việt'
                  : 'Hỗ trợ tải ảnh bài tập (OCR), xuất Word chuẩn A4 và đọc to giọng tiếng Việt'}
              </span>
              <span className="hidden sm:inline">Shift + Enter để xuống dòng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin / Teacher Knowledge Modal */}
      <AdminKnowledgeModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        isAdminOrTeacher={!isStudent}
        onSaved={(newKt, newTc) => {
          setKtContent(newKt);
          setTcContent(newTc);
        }}
      />
    </div>
  );
};
