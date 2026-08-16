import React, { useState, useRef } from 'react';
import { ExamAttachment, UserProfile } from '../types';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import {
  X,
  Upload,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface ExamAttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAttachment: (attachment: ExamAttachment) => void;
  currentUser?: UserProfile;
}

export const ExamAttachmentUploadModal: React.FC<ExamAttachmentUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveAttachment,
  currentUser,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [totalPoints, setTotalPoints] = useState<number>(10);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = (selectedFile: File) => {
    // Check size under 8MB
    if (selectedFile.size > 8 * 1024 * 1024) {
      setErrorMessage('Kích thước tệp quá lớn! Vui lòng chọn tệp nhỏ hơn 8MB.');
      return;
    }

    setErrorMessage('');
    setFile(selectedFile);

    // Default title if empty
    if (!title.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
      setTitle(`Đề Thi: ${cleanName}`);
    }

    const reader = new FileReader();

    if (
      selectedFile.type.startsWith('text/') ||
      selectedFile.name.endsWith('.txt') ||
      selectedFile.name.endsWith('.md')
    ) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTextContent(text);
        setFileDataUrl('');
      };
      reader.readAsText(selectedFile);
    } else {
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFileDataUrl(base64);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const toggleChapter = (chapterId: number) => {
    playSound('click');
    setSelectedChapters((prev) => {
      if (prev.includes(chapterId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== chapterId);
      } else {
        return [...prev, chapterId].sort((a, b) => a - b);
      }
    });
  };

  const selectAllChapters = () => {
    playSound('click');
    setSelectedChapters([1, 2, 3, 4, 5, 6]);
  };

  const getFileType = (fileName: string): ExamAttachment['fileType'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'doc') return 'doc';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'image';
    if (['txt', 'md'].includes(ext || '')) return 'txt';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      playSound('wrong');
      setErrorMessage('Quyền truy cập bị từ chối: Chỉ tài khoản Quản trị viên (Admin) mới có quyền đính kèm tệp đề thi mới!');
      return;
    }

    if (!file && !textContent.trim()) {
      setErrorMessage('Vui lòng đính kèm một tệp tin đề thi hoặc nhập nội dung đề!');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho đề thi!');
      return;
    }

    playSound('victory');

    const fileName = file ? file.name : `${title.replace(/\s+/g, '_')}.txt`;
    const fileSize = file ? formatFileSize(file.size) : `${Math.ceil(textContent.length / 1024)} KB`;
    const fileType = file ? getFileType(file.name) : 'txt';

    const newAttachment: ExamAttachment = {
      id: `exam-att-${Date.now()}`,
      name: fileName,
      title: title.trim(),
      fileType,
      fileSize,
      uploadedAt: new Date().toLocaleString('vi-VN'),
      uploadedBy: currentUser?.name || 'Quản Trị Viên Hệ Thống',
      targetChapters: selectedChapters,
      description: description.trim() || 'Tài liệu đề thi thử môn Tin học 6 - THCS Nguyễn Bá Loan.',
      dataUrl: fileDataUrl || undefined,
      textContent: textContent || undefined,
      durationMinutes,
      totalPoints,
    };

    onSaveAttachment(newAttachment);
    onClose();
  };

  return (
    <div
      id="examAttachmentUploadModalOverlay"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="examAttachmentUploadModalContent"
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Đính Kèm Tệp Tin Đề Thi Thử Mới
              </h3>
              <p className="text-xs text-blue-100">
                Tải lên tệp đề thi (PDF, DOCX, DOC, Ảnh hoặc TXT) cho học sinh ôn luyện
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {currentUser?.role !== 'admin' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Chức năng này chỉ dành cho <strong>Quản Trị Viên (Admin)</strong>. Vui lòng đăng nhập tài khoản Admin để có quyền tải lên đề thi.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Tệp Tin Đề Thi Đính Kèm (Hỗ trợ PDF, Word .docx/.doc, Hình ảnh, Text):
            </label>
            <div
              id="fileDropZone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-800 line-clamp-1">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      Dung lượng: {formatFileSize(file.size)} | Định dạng: {getFileType(file.name).toUpperCase()}
                    </p>
                  </div>
                  <span className="inline-block text-[11px] font-bold text-blue-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    Bấm để chọn tệp khác hoặc kéo thả tệp mới
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-800">
                      Kéo thả tệp tin vào đây hoặc bấm để chọn tệp
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ tệp <strong>.PDF, .DOCX, .DOC, .PNG, .JPG, .TXT</strong> (Tối đa 8MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Tiêu Đề Đề Thi <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề Kiểm Tra Định Kỳ 45 Phút - Học Kỳ 1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Chủ Đề Liên Quan:
              </label>
              <button
                type="button"
                onClick={selectAllChapters}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                Chọn tất cả 6 chủ đề
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CURRICULUM_CHAPTERS.map((ch) => {
                const isSelected = selectedChapters.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapter(ch.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="truncate">CĐ {ch.id}: {ch.title.replace(/^CHỦ ĐỀ \d+:\s*/, '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Total points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Thời Gian Làm Bài (Phút):
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Thang Điểm Tối Đa:
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes / Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Ghi Chú / Dặn Dò Học Sinh:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Học sinh tải đề về làm trước trong 45 phút, sau đó đối chiếu kết quả..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Optional Text Content preview */}
          {textContent && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Nội Dung Văn Bản Đã Nhận Diện:
              </label>
              <textarea
                rows={4}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-700"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" /> Lưu Tệp Đính Kèm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
