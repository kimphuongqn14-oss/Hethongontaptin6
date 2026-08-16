import React, { useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  Award,
  Calendar,
  Clock,
  User,
  School,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { MCQQuestion, EssayQuestion } from '../types';

export interface QuizResultData {
  title: string;
  studentName: string;
  classGroup: string;
  avatar?: string;
  date: string;
  score: string;
  maxScore?: number;
  pct: number;
  correctCount: number;
  totalQuestions: number;
  timeSpent: string;
  rank: string;
  questions: MCQQuestion[];
  userAnswers: Record<number, { selected: number; isCorrect: boolean }>;
  essayAnswers?: Record<number, string>;
  essayQuestions?: EssayQuestion[];
}

interface ExportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuizResultData;
}

export const ExportResultModal: React.FC<ExportResultModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `==============================
🎓 KẾT QUẢ KIỂM TRA TIN HỌC 6
Trường THCS Nguyễn Bá Loan
Giáo viên: Phạm Thị Kim Phượng
------------------------------
👤 Học sinh: ${data.studentName}
🏫 Lớp: ${data.classGroup}
📅 Ngày làm bài: ${data.date}
📝 Chế độ: ${data.title}
⏱️ Thời gian: ${data.timeSpent}
------------------------------
🎯 ĐIỂM SỐ: ${data.score}/${data.maxScore || 10} điểm
📊 Tỉ lệ đúng: ${data.pct}% (${data.correctCount}/${data.totalQuestions} câu)
🏆 Xếp loại: ${data.rank}
==============================`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHTMLReport = () => {
    const questionsHtml = data.questions
      .map((q, idx) => {
        const ans = data.userAnswers[idx];
        const isCorrect = ans?.isCorrect;
        const selectedOpt =
          ans && ans.selected !== undefined && ans.selected >= 0
            ? q.options[ans.selected]
            : 'Chưa chọn';
        const correctOpt = q.options[q.correctAnswer];

        return `
        <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${
          isCorrect ? '#f0fdf4' : '#fff1f2'
        };">
          <td style="padding: 10px; font-weight: bold; text-align: center; width: 45px;">${idx + 1}</td>
          <td style="padding: 10px;">
            <div style="font-weight: 600; color: #0f172a;">${q.question}</div>
            <div style="margin-top: 6px; font-size: 13px;">
              <span style="color: ${isCorrect ? '#166534' : '#991b1b'}; font-weight: bold;">
                Lựa chọn của học sinh: ${selectedOpt}
              </span>
            </div>
            ${
              !isCorrect
                ? `<div style="margin-top: 2px; font-size: 13px; color: #166534; font-weight: bold;">
                    Đáp án đúng: ${correctOpt}
                   </div>`
                : ''
            }
            ${
              q.explanation
                ? `<div style="margin-top: 4px; font-size: 12px; color: #475569; font-style: italic;">
                    Giải thích: ${q.explanation}
                   </div>`
                : ''
            }
          </td>
          <td style="padding: 10px; text-align: center; font-weight: bold; width: 80px; color: ${
            isCorrect ? '#16a34a' : '#e11d48'
          };">
            ${isCorrect ? '✔ ĐÚNG' : '✘ SAI'}
          </td>
        </tr>`;
      })
      .join('');

    let essayHtml = '';
    if (data.essayQuestions && data.essayQuestions.length > 0) {
      essayHtml = `
        <h3 style="margin-top: 24px; font-size: 16px; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">
          PHẦN BÀI LÀM TỰ LUẬN
        </h3>
        <div style="margin-top: 12px;">
          ${data.essayQuestions
            .map((eq, eIdx) => {
              const studentAnswer =
                (data.essayAnswers && data.essayAnswers[eIdx]) || 'Học sinh chưa trả lời';
              return `
              <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fafafa;">
                <div style="font-weight: bold; color: #1e293b;">Câu ${eIdx + 1}: ${eq.title || ''} - ${eq.question}</div>
                <div style="margin-top: 8px; font-size: 13px; color: #334155; white-space: pre-wrap; background: #fff; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;"><strong>Bài làm của học sinh:</strong><br/>${studentAnswer}</div>
                ${
                  eq.sampleAnswer
                    ? `<div style="margin-top: 6px; font-size: 12px; color: #047857;"><strong>Đáp án / Hướng dẫn chấm tham khảo:</strong><br/>${eq.sampleAnswer}</div>`
                    : ''
                }
              </div>`;
            })
            .join('')}
        </div>
      `;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu Kết Quả Kiểm Tra - ${data.studentName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .sheet {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
    }
    .title-box {
      text-align: center;
      margin: 20px 0;
    }
    .title-box h1 {
      font-size: 22px;
      color: #1e3a8a;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .score-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
      text-align: center;
    }
    .score-card {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }
    .score-card .val {
      font-size: 22px;
      font-weight: 800;
      color: #2563eb;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th {
      background-color: #1e293b;
      color: #ffffff;
      padding: 10px;
      font-size: 13px;
      text-align: left;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      text-align: center;
      font-size: 13px;
    }
    @media print {
      body { background: white; padding: 0; }
      .sheet { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #475569;">Trường THCS Nguyễn Bá Loan</div>
        <div style="font-size: 11px; color: #64748b;">Xã Long Phụng - Tỉnh Quảng Ngãi</div>
        <div style="font-size: 11px; color: #64748b;">Giáo viên: <strong>Phạm Thị Kim Phượng</strong></div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; font-weight: bold; color: #2563eb;">HỆ THỐNG ÔN TẬP TIN HỌC 6</div>
        <div style="font-size: 11px; color: #64748b;">Bộ sách Kết nối tri thức với cuộc sống</div>
        <div style="font-size: 11px; color: #64748b;">Ngày in: ${new Date().toLocaleString('vi-VN')}</div>
      </div>
    </div>

    <div class="title-box">
      <h1>PHIẾU BÁO KẾT QUẢ HỌC TẬP & KIỂM TRA</h1>
      <div style="font-size: 14px; color: #64748b;">Nội dung: <strong>${data.title}</strong></div>
    </div>

    <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
      <div style="display: flex; justify-content: space-between;">
        <div>👤 Học sinh: <strong>${data.studentName}</strong></div>
        <div>🏫 Lớp: <strong>${data.classGroup}</strong></div>
        <div>📅 Thời gian làm: <strong>${data.timeSpent}</strong></div>
      </div>
    </div>

    <div class="score-banner">
      <div class="score-card">
        <div style="font-size: 11px; color: #64748b; font-weight: bold;">ĐIỂM SỐ</div>
        <div class="val" style="color: #2563eb;">${data.score}/${data.maxScore || 10}</div>
      </div>
      <div class="score-card">
        <div style="font-size: 11px; color: #64748b; font-weight: bold;">TỈ LỆ ĐÚNG</div>
        <div class="val" style="color: #16a34a;">${data.pct}%</div>
      </div>
      <div class="score-card">
        <div style="font-size: 11px; color: #64748b; font-weight: bold;">SỐ CÂU ĐÚNG</div>
        <div class="val" style="color: #0d9488;">${data.correctCount}/${data.totalQuestions}</div>
      </div>
      <div class="score-card">
        <div style="font-size: 11px; color: #64748b; font-weight: bold;">XẾP LOẠI</div>
        <div class="val" style="color: #d97706; font-size: 16px; margin-top: 8px;">${data.rank}</div>
      </div>
    </div>

    <h3 style="margin-top: 20px; font-size: 15px; color: #1e293b;">BẢNG CHI TIẾT CÂU HỎI TRẮC NGHIỆM</h3>
    <table>
      <thead>
        <tr>
          <th style="width: 45px; text-align: center;">STT</th>
          <th>Nội Dung Câu Hỏi & Đáp Án</th>
          <th style="width: 80px; text-align: center;">Kết Quả</th>
        </tr>
      </thead>
      <tbody>
        ${questionsHtml}
      </tbody>
    </table>

    ${essayHtml}

    <div class="signatures">
      <div>
        <p><strong>Học sinh</strong></p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 35px;">(Ký và ghi rõ họ tên)</p>
      </div>
      <div>
        <p><strong>Giáo viên bộ môn / Phụ huynh</strong></p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 35px;">(Ký và ghi rõ họ tên)</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KetQua_TinHoc6_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Actions Header (Hidden when printing) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Xuất Kết Quả & In Phiếu Điểm</h3>
              <p className="text-xs text-slate-300">
                Phiếu điểm chuẩn Trường THCS Nguyễn Bá Loan - Tin Học 6
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="In trực tiếp hoặc Lưu dạng PDF"
            >
              <Printer className="w-4 h-4" /> In Phiếu / PDF
            </button>

            <button
              onClick={handleDownloadHTMLReport}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Tải tệp báo cáo chi tiết về máy"
            >
              <Download className="w-4 h-4" /> Tải Báo Cáo (.html)
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Sao chép kết quả gửi Zalo"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Đã chép
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Chép Zalo
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate & Report Sheet */}
        <div id="printable-result-sheet" className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white print:p-0 print:overflow-visible">
          {/* Header Info */}
          <div className="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">
                <School className="w-4 h-4 text-blue-600" /> Trường THCS Nguyễn Bá Loan
              </div>
              <p className="text-xs text-slate-500">Xã Long Phụng - Tỉnh Quảng Ngãi</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Giáo viên phụ trách: <strong>Phạm Thị Kim Phượng</strong> (Zalo: 0968430379)
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-200 uppercase">
                Tin Học 6 - Kết Nối Tri Thức
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Ngày làm bài: <strong>{data.date}</strong>
              </p>
            </div>
          </div>

          {/* Title Box */}
          <div className="text-center space-y-1 py-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              PHIẾU BÁO KẾT QUẢ HỌC TẬP & BÀI LÀM
            </h2>
            <p className="text-sm font-semibold text-blue-700">{data.title}</p>
          </div>

          {/* Student Profile Ribbon */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{data.avatar || '🎓'}</span>
              <div>
                <span className="text-slate-500 text-xs block">Họ và tên học sinh</span>
                <strong className="text-slate-900 text-sm sm:text-base">{data.studentName}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                🏫
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Lớp học</span>
                <strong className="text-slate-900">{data.classGroup}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                ⏱️
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Thời gian hoàn thành</span>
                <strong className="text-slate-900">{data.timeSpent}</strong>
              </div>
            </div>
          </div>

          {/* Scoreboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <div className="text-[11px] font-bold text-blue-700 uppercase">Điểm Số</div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-0.5">
                {data.score}/{data.maxScore || 10}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Tỉ Lệ Đúng</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                {data.pct}%
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">Số Câu Đúng</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-0.5">
                {data.correctCount}/{data.totalQuestions}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Xếp Loại</div>
              <div className="text-base sm:text-lg font-black text-amber-800 mt-1">
                {data.rank}
              </div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center justify-between border-b pb-2">
              <span>Chi Tiết Từng Câu Hỏi & Đáp Án ({data.questions.length} câu)</span>
              <span className="text-xs font-normal text-slate-500">
                Đúng: <strong className="text-emerald-600">{data.correctCount}</strong> | Sai:{' '}
                <strong className="text-rose-600">{data.totalQuestions - data.correctCount}</strong>
              </span>
            </h4>

            <div className="space-y-3">
              {data.questions.map((q, idx) => {
                const ans = data.userAnswers[idx];
                const isCorrect = ans?.isCorrect;
                const selectedOpt =
                  ans && ans.selected !== undefined && ans.selected >= 0
                    ? q.options[ans.selected]
                    : 'Chưa chọn đáp án';
                const correctOpt = q.options[q.correctAnswer];

                return (
                  <div
                    key={`exp-q-${q.id || ''}-${idx}`}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900">
                        Câu {idx + 1}: {q.question}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <p>
                        <span className="text-slate-500">Lựa chọn của học sinh:</span>{' '}
                        <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {selectedOpt}
                        </strong>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="text-slate-500">Đáp án chuẩn:</span>{' '}
                          <strong className="text-emerald-700">{correctOpt}</strong>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-slate-500 italic pt-0.5">
                          💡 Giải thích: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Essay part if any */}
          {data.essayQuestions && data.essayQuestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                Phần Tự Luận ({data.essayQuestions.length} câu)
              </h4>
              <div className="space-y-3">
                {data.essayQuestions.map((eq, eIdx) => {
                  const studentAns =
                    (data.essayAnswers && data.essayAnswers[eIdx]) || '(Chưa làm bài tự luận)';
                  return (
                    <div
                      key={`exp-eq-${eq.id || ''}-${eIdx}`}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs sm:text-sm"
                    >
                      <div className="font-bold text-slate-900">
                        Câu {eIdx + 1} ({eq.title}): {eq.question}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap">
                        <strong className="text-slate-500 block text-xs mb-1">
                          Bài làm của học sinh:
                        </strong>
                        {studentAns}
                      </div>
                      {eq.sampleAnswer && (
                        <div className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                          <strong>Gợi ý / Đáp án tham khảo:</strong> {eq.sampleAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signatures Area */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
            <div>
              <p className="font-bold uppercase">Học Sinh Làm Bài</p>
              <p className="text-[11px] text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold uppercase">Xác Nhận Của Giáo Viên / Phụ Huynh</p>
              <p className="text-[11px] text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden when printing) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-slate-500 hidden sm:block">
            * Mẹo: Chọn <strong>&quot;Lưu dưới dạng PDF&quot;</strong> trong hộp thoại in để lưu file vào máy tính hoặc điện thoại.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In Phiếu Điểm / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
