import React from 'react';
import { Lock, LogIn, ShieldAlert, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';

interface LockedSystemOverlayProps {
  onOpenLogin: () => void;
  message?: string;
  featureTitle?: string;
}

export const LockedSystemOverlay: React.FC<LockedSystemOverlayProps> = ({
  onOpenLogin,
  message = "Bạn phải đăng nhập để sử dụng hệ thống",
  featureTitle = "Các chức năng học tập & thi thử đã bị khóa",
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 max-w-2xl mx-auto my-8 animate-fade-in relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 text-white flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-amber-500/30 relative">
        <Lock className="w-10 h-10 animate-pulse" />
        <span className="absolute -bottom-1 -right-1 bg-white text-rose-600 rounded-full p-1 shadow-md">
          <ShieldAlert className="w-4 h-4" />
        </span>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Hệ Thống Khóa Tính Năng
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {message}
        </h3>
        <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed font-medium">
          {featureTitle}. Vui lòng đăng nhập bằng tài khoản Học sinh hoặc Quản trị viên để mở khóa toàn bộ nội dung học tập, luyện trắc nghiệm, thi thử 45 phút, trợ lý AI và xem bảng xếp hạng.
        </p>
      </div>

      {/* Feature List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left text-xs text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> 15 Bài học SGK Tin 6
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> 6 Chủ đề Sơ đồ tư duy
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> Luyện tập Trắc nghiệm
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> Đề Thi thử 45 phút
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> Trợ Lý AI Gemini
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-extrabold text-sm">✓</span> Bảng Xếp Hạng Top 10
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onOpenLogin();
          }}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" /> ĐĂNG NHẬP ĐỂ MỞ KHÓA
        </button>
      </div>
    </div>
  );
};
