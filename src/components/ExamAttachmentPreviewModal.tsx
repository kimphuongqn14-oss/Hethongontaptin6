import React, { useState } from 'react';
import { ExamAttachment } from '../types';
import {
  X,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Calendar,
  User,
  BookOpen,
  Eye,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface ExamAttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: ExamAttachment | null;
}

export const ExamAttachmentPreviewModal: React.FC<ExamAttachmentPreviewModalProps> = ({
  isOpen,
  onClose,
  attachment,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !attachment) return null;

  const handleCopyText = () => {
    playSound('click');
    const content = attachment.textContent || `${attachment.title}\n${attachment.description}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playSound('click');
    if (attachment.dataUrl) {
      const link = document.createElement('a');
      link.href = attachment.dataUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create text file or html blob download
      const content = attachment.textContent || attachment.description;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name.endsWith('.txt')
        ? attachment.name
        : `${attachment.name.replace(/\.[^/.]+$/, '')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  return (
    <div
      id="examAttachmentPreviewModalOverlay"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="examAttachmentPreviewModalContent"
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {attachment.fileType.toUpperCase()}
                </span>
                <span className="text-xs text-slate-300 font-medium">{attachment.fileSize}</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                {attachment.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btnPrintAttachedExam"
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold border border-slate-700 cursor-pointer"
              title="In đề thi"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">In Đề</span>
            </button>
            <button
              id="btnDownloadAttachedExam"
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
              title="Tải tệp về máy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải Về</span>
            </button>
            <button
              id="btnClosePreviewModal"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata info banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Người đăng: <strong className="text-slate-800">{attachment.uploadedBy}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Ngày đăng: <strong className="text-slate-800">{attachment.uploadedAt}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Chủ đề áp dụng:{' '}
              <strong className="text-blue-700">
                {attachment.targetChapters.length === 6
                  ? 'Tất cả 6 chủ đề'
                  : `Chủ đề ${attachment.targetChapters.join(', ')}`}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã sao chép nội dung
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Sao chép văn bản
              </>
            )}
          </button>
        </div>

        {/* Paper Body Content (Printable A4 layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-slate-800 font-sans">
            {/* Header School format */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                  TRƯỜNG THCS NGUYỄN BÁ LOAN
                </p>
                <p className="text-xs font-semibold text-slate-500">Tổ Khoa Học Tự Nhiên - Tin Học 6</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-slate-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[11px] text-slate-500 italic">Độc lập - Tự do - Hạnh phúc</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1 py-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-wide">
                {attachment.title}
              </h2>
              <p className="text-xs text-slate-600 italic">
                Thời gian làm bài: {attachment.durationMinutes || 45} phút | Tên tệp đính kèm:{' '}
                <span className="font-semibold text-blue-700">{attachment.name}</span>
              </p>
            </div>

            {/* Note / Description */}
            {attachment.description && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>📝 Hướng dẫn / Dặn dò: </strong>
                {attachment.description}
              </div>
            )}

            {/* Render formatted text content or image */}
            {attachment.textContent ? (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono bg-slate-50/50 p-4 sm:p-6 rounded-xl border border-slate-200 text-slate-800">
                {attachment.textContent}
              </div>
            ) : attachment.dataUrl && attachment.fileType === 'image' ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2 bg-slate-50">
                <img
                  src={attachment.dataUrl}
                  alt={attachment.title}
                  className="max-h-[500px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center py-8 space-y-3 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <FileText className="w-12 h-12 text-blue-500 mx-auto opacity-80" />
                <h4 className="font-extrabold text-slate-800 text-sm">Tệp đính kèm đã sẵn sàng tải về</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tệp đính kèm định dạng <strong>.{attachment.fileType}</strong> có thể tải về trực tiếp
                  để mở trên máy tính bằng Word, Adobe PDF Reader hoặc các ứng dụng chuyên dụng.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Tải Tệp Về Máy ({attachment.fileSize})
                </button>
              </div>
            )}

            {/* Footer Teacher Sign */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="italic">Lưu ý: Học sinh làm bài nghiêm túc</p>
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-slate-800">Giáo viên phụ trách môn</p>
                <p className="pt-8 font-extrabold text-blue-900">{attachment.uploadedBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" /> In Đề Thi
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" /> Tải File Đề Thi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
