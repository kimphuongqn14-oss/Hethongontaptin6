import React, { useState } from 'react';
import { UserProfile, UserRole, StudentUser } from '../types';
import { playSound } from '../utils/audio';
import { X, User, GraduationCap, ShieldCheck, Lock, AlertCircle, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  students?: StudentUser[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  students = [],
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Student Form
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('Lớp 6A');
  const [studentAvatar, setStudentAvatar] = useState<string>('🎓');
  const [studentLoginError, setStudentLoginError] = useState<string | null>(null);

  // Admin Form
  const [adminUser, setAdminUser] = useState<string>('');
  const [adminPass, setAdminPass] = useState<string>('');
  const [adminError, setAdminPassError] = useState<string | null>(null);

  // Registration Specific Form Fields
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regClass, setRegClass] = useState<string>('Lớp 6A');
  const [regAvatar, setRegAvatar] = useState<string>('🎓');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError(null);

    const inputUserKey = studentUsername.trim().toLowerCase();

    if (!inputUserKey) {
      playSound('wrong');
      setStudentLoginError('Vui lòng nhập Tên Đăng Nhập!');
      return;
    }

    // Check if account exists in registered students list
    const foundStudent = students.find((s) => {
      const uKey = (s.username || '').trim().toLowerCase();
      const nKey = (s.name || '').trim().toLowerCase();
      return uKey === inputUserKey || nKey === inputUserKey;
    });

    if (!foundStudent) {
      playSound('wrong');
      // Exact notification required by prompt
      setStudentLoginError('Bạn cần đăng kí tài khoản');
      return;
    }

    // If password exists, verify match
    if (foundStudent.password && studentPassword.trim() && foundStudent.password !== studentPassword.trim()) {
      playSound('wrong');
      setStudentLoginError('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    playSound('victory');
    const profile: UserProfile = {
      name: foundStudent.name,
      role: 'student',
      classGroup: foundStudent.classGroup || studentClass,
      avatar: foundStudent.avatar || studentAvatar,
      isLoggedIn: true,
      username: foundStudent.username || inputUserKey,
      password: foundStudent.password || studentPassword || '123456',
    };
    onSaveProfile(profile);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError(null);

    // Explicitly check credentials user: admin / pass: tinhoc6@007
    if (adminUser.trim().toLowerCase() === 'admin' && adminPass === 'tinhoc6@007') {
      playSound('victory');
      const profile: UserProfile = {
        name: 'Quản Trị Viên System',
        role: 'admin',
        classGroup: 'Hệ thống Admin',
        avatar: '🛡️',
        isLoggedIn: true,
      };
      onSaveProfile(profile);
      onClose();
    } else {
      playSound('wrong');
      setAdminPassError('Tài khoản hoặc mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Vui lòng nhập họ và tên!');
      playSound('wrong');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp!');
      playSound('wrong');
      return;
    }

    playSound('victory');
    setRegSuccess(true);

    const profile: UserProfile = {
      name: regName.trim(),
      role: 'student',
      classGroup: regClass,
      avatar: regAvatar,
      isLoggedIn: true,
      username: regUsername.trim() || regName.trim().toLowerCase().replace(/\s+/g, ''),
      password: regPassword || '123456',
    };

    setTimeout(() => {
      onSaveProfile(profile);
      onClose();
      setRegSuccess(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden space-y-5 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* System Authentication Notice Banner */}
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3 flex items-center gap-2.5 text-amber-900 text-xs font-bold shadow-sm">
          <div className="w-7 h-7 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-amber-900 font-extrabold">Yêu Cầu Đăng Nhập</p>
            <p className="text-amber-700 text-[11px] font-medium">Bạn phải đăng nhập để sử dụng hệ thống</p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex justify-center mb-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full max-w-xs text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setAuthMode('login');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setAuthMode('register');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Đăng Ký
            </button>
          </div>
        </div>

        {authMode === 'login' ? (
          <>
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Đăng Nhập Hệ Thống</h3>
              <p className="text-slate-500 text-xs">
                Chọn vai trò phù hợp để lưu trữ điểm số hoặc quản lý ngân hàng câu hỏi
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedRole('student');
                }}
                className={`flex-1 py-2.5 rounded-xl transition ${
                  selectedRole === 'student'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍🎓 Học Sinh
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedRole('admin');
                }}
                className={`flex-1 py-2.5 rounded-xl transition ${
                  selectedRole === 'admin'
                    ? 'bg-white text-rose-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛡️ Admin
              </button>
            </div>

            {/* STUDENT FORM */}
            {selectedRole === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Đăng Nhập:
                    </label>
                    <input
                      type="text"
                      value={studentUsername}
                      onChange={(e) => {
                        setStudentUsername(e.target.value);
                        if (studentLoginError) setStudentLoginError(null);
                      }}
                      placeholder="Nhập tên tài khoản..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật Khẩu:
                    </label>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => {
                        setStudentPassword(e.target.value);
                        if (studentLoginError) setStudentLoginError(null);
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lớp Học:</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Lớp 6A">Lớp 6A</option>
                      <option value="Lớp 6B">Lớp 6B</option>
                      <option value="Lớp 6C">Lớp 6C</option>
                      <option value="Lớp 6D">Lớp 6D</option>
                      <option value="Lớp 6E">Lớp 6E</option>
                      <option value="Lớp 6G">Lớp 6G</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Avatar:</label>
                    <select
                      value={studentAvatar}
                      onChange={(e) => setStudentAvatar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="🎓">🎓 Mũ Cử Nhân</option>
                      <option value="🚀">🚀 Tên Lửa</option>
                      <option value="💻">💻 Máy Tính</option>
                      <option value="🤖">🤖 Robot AI</option>
                      <option value="⭐">⭐ Ngôi Sao</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner if login fails or account does not exist */}
                {studentLoginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-2xl space-y-2 font-bold shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-black text-sm">{studentLoginError}</span>
                    </div>
                    {studentLoginError === 'Bạn cần đăng kí tài khoản' && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setAuthMode('register');
                            setRegUsername(studentUsername);
                            setRegName(studentUsername);
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Mở Trang Đăng Ký Tài Khoản Ngay
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mt-1"
                >
                  <LogIn className="w-4 h-4" /> Đăng Nhập Học Sinh
                </button>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">💡 Mẫu tài khoản học sinh đã có sẵn:</p>
                  <div className="flex flex-wrap gap-1">
                    {students.slice(0, 3).map((st, sIdx) => (
                      <button
                        type="button"
                        key={`login-st-${st.id || ''}-${sIdx}`}
                        onClick={() => {
                          setStudentUsername(st.username || st.name);
                          setStudentPassword(st.password || '123');
                          if (studentLoginError) setStudentLoginError(null);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 font-extrabold rounded text-[10px] transition"
                      >
                        {st.username || st.name} (pass: {st.password || '123'})
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* ADMIN FORM */}
            {selectedRole === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên Đăng Nhập Admin:
                  </label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Nhập: admin"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mật Khẩu Quản Trị:
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị..."
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {adminError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Đăng Nhập Quyền Admin
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline transition"
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </>
        ) : (
          /* REGISTER FORM */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-500/30">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Đăng Ký Tài Khoản</h3>
              <p className="text-slate-500 text-xs">Tạo tài khoản học sinh mới để lưu kết quả học tập</p>
            </div>

            {regSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-900 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-base">Đăng Ký Thành Công!</h4>
                <p className="text-xs text-emerald-700">Đang tự động đăng nhập vào hệ thống...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và Tên Học Sinh: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đăng Nhập:</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="hocsinh6a"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mật Khẩu:</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lớp Học:</label>
                    <select
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Lớp 6A">Lớp 6A</option>
                      <option value="Lớp 6B">Lớp 6B</option>
                      <option value="Lớp 6C">Lớp 6C</option>
                      <option value="Lớp 6D">Lớp 6D</option>
                      <option value="Lớp 6E">Lớp 6E</option>
                      <option value="Lớp 6G">Lớp 6G</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Avatar:</label>
                    <select
                      value={regAvatar}
                      onChange={(e) => setRegAvatar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="🎓">🎓 Mũ Cử Nhân</option>
                      <option value="🚀">🚀 Tên Lửa</option>
                      <option value="💻">💻 Máy Tính</option>
                      <option value="🤖">🤖 Robot AI</option>
                      <option value="⭐">⭐ Ngôi Sao</option>
                    </select>
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" /> Tạo Tài Khoản & Đăng Nhập
                </button>
              </form>
            )}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline transition"
              >
                Đã có tài khoản? Quay lại Đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

