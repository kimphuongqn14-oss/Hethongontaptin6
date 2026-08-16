import React, { useState } from 'react';
import { ExamAttachment, UserProfile } from '../types';
import { CURRICULUM_CHAPTERS } from '../data/curriculum';
import {
  FileText,
  Paperclip,
  Download,
  Eye,
  Printer,
  Plus,
  Trash2,
  Search,
  BookOpen,
  Calendar,
  User,
  Clock,
  Sparkles,
  RotateCcw,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface ExamAttachmentSectionProps {
  attachments: ExamAttachment[];
  currentUser?: UserProfile;
  onPreviewAttachment: (attachment: ExamAttachment) => void;
  onOpenUploadModal: () => void;
  onDeleteAttachment: (id: string) => void;
  onResetDefaultAttachments: () => void;
}

export const ExamAttachmentSection: React.FC<ExamAttachmentSectionProps> = ({
  attachments,
  currentUser,
  onPreviewAttachment,
  onOpenUploadModal,
  onDeleteAttachment,
  onResetDefaultAttachments,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<number | 'all'>('all');

  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const filteredAttachments = attachments.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchChapter =
      selectedChapterFilter === 'all' || item.targetChapters.includes(selectedChapterFilter);

    return matchSearch && matchChapter;
  });

  const handleDownload = (attachment: ExamAttachment, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    if (attachment.dataUrl) {
      const link = document.createElement('a');
      link.href = attachment.dataUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
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

  const getFormatBadge = (fileType: ExamAttachment['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return <span className="bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md">PDF</span>;
      case 'docx':
      case 'doc':
        return <span className="bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md">WORD</span>;
      case 'image':
        return <span className="bg-amber-100 text-amber-700 border border-amber-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md">ẢNH</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-2 py-0.5 rounded-md">TXT</span>;
    }
  };

  return (
    <div
      id="examAttachmentsSection"
      className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
            <Paperclip className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Tệp Tin Đề Thi Thử Đính Kèm
              </h3>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {attachments.length} tệp
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tải về máy hoặc xem trực tiếp các đề thi thử định kỳ, đề cương ôn tập kèm đáp án chuẩn A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdminOrTeacher && (
            <button
              id="btnResetDefaultExamAttachments"
              type="button"
              onClick={onResetDefaultAttachments}
              className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Khôi phục các đề thi mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi Phục Mẫu
            </button>
          )}

          <button
            id="btnOpenUploadExamAttachment"
            type="button"
            onClick={onOpenUploadModal}
            className="text-xs px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Đính Kèm Tệp Đề Mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đề, tệp tin..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1">Chủ đề:</span>
          <button
            type="button"
            onClick={() => setSelectedChapterFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedChapterFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất Cả
          </button>
          {CURRICULUM_CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setSelectedChapterFilter(ch.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedChapterFilter === ch.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CĐ {ch.id}
            </button>
          ))}
        </div>
      </div>

      {/* Attachments Grid List */}
      {filteredAttachments.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Không tìm thấy tệp đề thi nào phù hợp.</p>
          <button
            type="button"
            onClick={onResetDefaultAttachments}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            Bấm để tải lại các tệp đề thi mẫu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAttachments.map((att, idx) => (
            <div
              key={`att-card-${att.id}-${idx}`}
              id={`examAttachmentCard-${att.id}`}
              onClick={() => {
                playSound('click');
                onPreviewAttachment(att);
              }}
              className="bg-white border border-slate-200 hover:border-indigo-400/80 hover:shadow-md transition-all rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 cursor-pointer group"
            >
              {/* Card Top */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getFormatBadge(att.fileType)}
                    <span className="text-[11px] text-slate-400 font-semibold">{att.fileSize}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{att.durationMinutes || 45}P</span>
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                  {att.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {att.description}
                </p>
              </div>

              {/* Target Chapters badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {att.targetChapters.length === 6 ? (
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                    Toàn bộ 6 Chủ đề
                  </span>
                ) : (
                  att.targetChapters.map((cid) => (
                    <span
                      key={`ch-tag-${att.id}-${cid}`}
                      className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md"
                    >
                      CĐ {cid}
                    </span>
                  ))
                )}
              </div>

              {/* Card Bottom Meta & Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  <span className="font-semibold text-slate-600">{att.uploadedBy}</span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      onPreviewAttachment(att);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Xem trước đề thi"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Xem</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(att, e)}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Tải tệp về máy"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tải</span>
                  </button>

                  {isAdminOrTeacher && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        if (confirm(`Bạn có chắc chắn muốn xóa tệp đính kèm "${att.title}"?`)) {
                          onDeleteAttachment(att.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Xóa tệp đính kèm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
