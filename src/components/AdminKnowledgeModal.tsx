import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Sparkles,
  UploadCloud,
  Save,
  Download,
  X,
  LogIn,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface AdminKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (ktContent: string, tcContent: string) => void;
  isAdminOrTeacher?: boolean;
}

export const AdminKnowledgeModal: React.FC<AdminKnowledgeModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isAdminOrTeacher = false,
}) => {
  // Authentication: auto-authenticated if user is teacher/admin, otherwise prompt for password 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isAdminOrTeacher || sessionStorage.getItem('admin_logged') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: kt (Kho tri thức), tc (Tính cách & vai trò sư phạm), deploy (Hướng dẫn & triển khai)
  const [activeTab, setActiveTab] = useState<'kt' | 'tc' | 'deploy'>('kt');

  // Content states
  const [ktContent, setKtContent] = useState<string>('');
  const [tcContent, setTcContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fetch initial content from /api/get-md or fallback to localStorage
  useEffect(() => {
    if (!isOpen) return;

    if (isAdminOrTeacher) {
      setIsAuthenticated(true);
    }

    const loadData = async () => {
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

    loadData();
  }, [isOpen, isAdminOrTeacher]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'admin' || isAdminOrTeacher) {
      sessionStorage.setItem('admin_logged', 'true');
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Mật khẩu không chính xác! (Mặc định: admin)');
    }
  };

  // Word count helper
  const countWords = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Upload Word (.docx) or Markdown (.md)
  const handleUploadFile = async (target: 'kt' | 'tc', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let extractedText = '';
      if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value.trim();
      } else {
        extractedText = await file.text();
      }

      if (target === 'kt') {
        setKtContent(extractedText);
      } else {
        setTcContent(extractedText);
      }

      alert(`✅ Đã nạp thành công "${file.name}" (${countWords(extractedText).toLocaleString()} từ)! Nhấn "Lưu Vào Ổ CỨNG" để cập nhật.`);
    } catch (err: any) {
      alert(`❌ Lỗi nạp tệp: ${err.message || err}`);
    }
    e.target.value = '';
  };

  // Download .md file
  const handleDownloadMd = (target: 'kt' | 'tc') => {
    const content = target === 'kt' ? ktContent : tcContent;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = target === 'kt' ? 'kt.md' : 'tc.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save all data
  const handleSaveAll = async () => {
    localStorage.setItem('ai_studio_kt_content', ktContent);
    localStorage.setItem('ai_studio_tc_content', tcContent);

    let diskSaved = false;
    try {
      const res = await fetch('/api/save-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ktContent, tcContent }),
      });
      if (res.ok) diskSaved = true;
    } catch (e) {
      console.warn('Save to server endpoint failed, saved to browser storage.');
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    setSaveStatus(
      diskSaved
        ? '🎉 ĐÃ LƯU TRỰC TIẾP VÀO Ổ CỨNG (kt.md & tc.md) VÀ HỆ THỐNG TRỢ LÝ AI!'
        : '💾 ĐÃ LƯU VÀO BỘ NHỚ TRÌNH DUYỆT & CẬP NHẬT TRỢ LÝ AI THÀNH CÔNG!'
    );

    if (onSaved) {
      onSaved(ktContent, tcContent);
    }

    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {!isAuthenticated ? (
        /* LOGIN MODAL */
        <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-slate-200 flex items-center justify-center text-2xl mx-auto shadow-xs">
              🔒
            </div>
            <h2 className="font-extrabold text-base text-slate-900">Quản Trị: Giáo Dục Hiện Đại</h2>
            <p className="text-xs text-slate-500">
              Mật khẩu mặc định: <code className="font-mono font-bold text-blue-600">admin</code>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu quản trị:</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Nhập mật khẩu (Mặc định: admin)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition"
                autoFocus
              />
              {authError && <p className="text-xs text-rose-600 mt-1 font-medium">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Vào Bảng Quản Trị Tri Thức</span>
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              ← Quay lại trang Trợ lý AI
            </button>
          </div>
        </div>
      ) : (
        /* MAIN ADMIN DASHBOARD */
        <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                    Quản Trị Tri Thức & Tính Cách Sư Phạm AI
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                    kt.md & tc.md
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Quản lý kho tri thức bài học (kt.md) và tính cách & quy chuẩn sư phạm (tc.md)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Vào Ổ Cứng</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Đóng bảng quản trị"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Alert if saved */}
          {saveStatus && (
            <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="px-6 pt-3 shrink-0">
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex gap-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('kt')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'kt'
                    ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                    : 'text-slate-600 font-medium hover:bg-slate-200/70'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Kho Tri Thức Bài Học (kt.md)</span>
              </button>

              <button
                onClick={() => setActiveTab('tc')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'tc'
                    ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                    : 'text-slate-600 font-medium hover:bg-slate-200/70'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Tính Cách & Quy Chuẩn (tc.md)</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'deploy'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : 'text-slate-600 font-medium hover:bg-slate-200/70'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Hướng Dẫn & Triển Khai</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {/* TAB 1: KHO TRI THỨC (kt.md) */}
            {activeTab === 'kt' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Kho Tri Thức Bài Học & Chuyên Môn (kt.md)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                      {countWords(ktContent).toLocaleString()} từ
                    </span>
                    <button
                      onClick={() => handleDownloadMd('kt')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải kt.md</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Nạp nội dung từ tệp Word (.docx) hoặc Markdown (.md):
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Bóc tách và nạp thẳng các bài học (Mầm non, Toán 9 Vi-ét, Sinh học quang hợp, Tin học 6...)
                    </p>
                  </div>
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs shrink-0 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Chọn File Word / MD</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.md,.txt"
                      onChange={(e) => handleUploadFile('kt', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  value={ktContent}
                  onChange={(e) => setKtContent(e.target.value)}
                  rows={15}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs outline-none focus:border-blue-500 focus:bg-white transition leading-relaxed resize-y"
                  placeholder="Nội dung file kt.md (Giáo án mẫu, kiến thức Toán 9 Vi-ét, Sinh học quang hợp, Tin học 6 Kết nối tri thức...)"
                />
              </div>
            )}

            {/* TAB 2: TÍNH CÁCH SƯ PHẠM (tc.md) */}
            {activeTab === 'tc' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Tính Cách & Quy Chuẩn Sư Phạm (tc.md)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                      {countWords(tcContent).toLocaleString()} từ
                    </span>
                    <button
                      onClick={() => handleDownloadMd('tc')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải tc.md</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Quy chuẩn xưng hô, thái độ Socratic và chuẩn CV 5512 / Ma trận Bộ GD&ĐT:
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Có thể nạp từ tệp Word (.docx) hoặc chỉnh sửa trực tiếp quy chuẩn sư phạm
                    </p>
                  </div>
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-purple-700 border border-purple-300 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs shrink-0 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Chọn File Word / MD</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.md,.txt"
                      onChange={(e) => handleUploadFile('tc', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  value={tcContent}
                  onChange={(e) => setTcContent(e.target.value)}
                  rows={15}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs outline-none focus:border-purple-500 focus:bg-white transition leading-relaxed resize-y"
                  placeholder="Nội dung file tc.md (Chuẩn soạn giáo án 5512, ma trận đề kiểm tra 4 mức độ, phương pháp Socratic...)"
                />
              </div>
            )}

            {/* TAB 3: HƯỚNG DẪN TRIỂN KHAI */}
            {activeTab === 'deploy' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Hướng Dẫn Tích Hợp & Triển Khai</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                    <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Đồng Bộ Trực Tiếp Vào Hệ Thống</span>
                    </h4>
                    <p className="text-slate-700">
                      Mọi sửa đổi đối với <code className="font-mono text-blue-700">kt.md</code> và{' '}
                      <code className="font-mono text-blue-700">tc.md</code> khi bấm nút{' '}
                      <strong>"Lưu Vào Ổ Cứng"</strong> sẽ được lưu trực tiếp vào file vật lý trong máy chủ và áp dụng ngay lập tức cho các cuộc trò chuyện của Trợ lý AI.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Quy Chuẩn Giáo Dục Chuẩn Mực</span>
                    </h4>
                    <p className="text-slate-700">
                      Kho tri thức <code className="font-mono text-emerald-700">kt.md</code> bao gồm các bài học mẫu (Mầm non, Toán 9 Vi-ét, Khoa học tự nhiên, Tin học 6) và quy chuẩn soạn giáo án chuẩn Công văn 5512/BGDĐT, ma trận 4 mức độ tư duy.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveAll}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lưu Cả 2 File Vào Ổ Cứng</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Quay lại trang Trợ Lý AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
