import React from 'react';
import { UserProfile } from '../types';
import { Laptop, GraduationCap, Volume2, VolumeX, Presentation, LogOut, Database } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  presenterMode: boolean;
  audioEnabled: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onTogglePresenter: () => void;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  presenterMode,
  audioEnabled,
  onOpenLogin,
  onLogout,
  onTogglePresenter,
  onToggleAudio,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Branding */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl flex-shrink-0 text-amber-300">
            <Laptop className="w-10 h-10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/30 uppercase tracking-widest">
                <GraduationCap className="w-4 h-4" /> Bộ Sách Kết Nối Tri Thức
              </span>
              <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full text-xs font-bold border border-cyan-400/30">
                <Database className="w-3.5 h-3.5 text-cyan-300" /> Supabase Cloud
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              HỆ THỐNG ÔN TẬP TIN HỌC 6
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
              Nền tảng học tập, ôn luyện trắc nghiệm, tự luận và thi thử tương tác thông minh
            </p>
          </div>
        </div>

        {/* Right Controls & Login */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-xl transition text-left"
              title="Click để đăng nhập / đổi tài khoản"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-900 flex items-center justify-center font-bold text-xl shadow-md">
                {currentUser.avatar || "🎓"}
              </div>
              <div>
                <div className="text-sm font-extrabold text-white truncate max-w-[150px] flex items-center gap-1.5">
                  {currentUser.isLoggedIn ? currentUser.name : "Đăng Nhập"}
                  {currentUser.role === 'admin' && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded font-black uppercase">Admin</span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-blue-200">
                  {currentUser.isLoggedIn
                    ? currentUser.role === 'admin'
                      ? 'Quản trị viên hệ thống'
                      : currentUser.role === 'teacher'
                      ? 'Giáo viên'
                      : currentUser.classGroup
                    : "Chưa đăng nhập"}
                </div>
              </div>
            </button>

            {currentUser.isLoggedIn && (
              <button
                onClick={onLogout}
                className="p-2 text-rose-300 hover:text-white hover:bg-rose-500/30 rounded-xl transition"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-white/20"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAudio}
              title={audioEnabled ? "Tắt Âm Thanh" : "Bật Âm Thanh"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                audioEnabled ? 'bg-white/10 text-amber-300 hover:bg-white/20' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={onTogglePresenter}
              title="Bật/Tắt Chế Độ Máy Chiếu"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                presenterMode
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                  : 'bg-white/10 text-emerald-300 hover:bg-white/20'
              }`}
            >
              <Presentation className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
