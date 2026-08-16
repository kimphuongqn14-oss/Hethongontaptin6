import React, { useState, useEffect, useRef } from 'react';
import { AttemptRecord, StudentUser, UserProfile } from '../types';
import { playSound } from '../utils/audio';
import { exportStatsToExcel, exportStudentsToExcel } from '../utils/excelExport';
import { LeaderboardBoard } from './LeaderboardBoard';
import {
  BarChart3,
  Award,
  Target,
  Trash2,
  LineChart,
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  GraduationCap,
  Sparkles,
  PlusCircle,
  UserCheck,
  UserPlus,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Trophy,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  Star,
  Lock,
  ShieldCheck,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface TabStatsProps {
  currentUser?: UserProfile;
  history: AttemptRecord[];
  students?: StudentUser[];
  onClearHistory: () => void;
  onAddSampleHistory?: () => void;
  onDeleteStudent?: (id: string) => void;
  onClearStudents?: () => void;
  onAddSampleStudents?: () => void;
  onOpenLoginModal?: () => void;
}

export const TabStats: React.FC<TabStatsProps> = ({
  currentUser,
  history,
  students = [],
  onClearHistory,
  onAddSampleHistory,
  onDeleteStudent,
  onClearStudents,
  onAddSampleStudents,
  onOpenLoginModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Admin Security Pin State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin' || isAdminUnlocked;

  // Tab section state: 'leaderboard' | 'scores' | 'students'
  const [viewSection, setViewSection] = useState<'leaderboard' | 'scores' | 'students'>(
    'scores'
  );

  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const val = adminPinInput.trim().toLowerCase();
    if (val === 'admin' || val === '123456' || val === 'admin123' || val === '123') {
      playSound('victory');
      setIsAdminUnlocked(true);
      setAdminPinInput('');
    } else {
      playSound('wrong');
      setPinError('Mật khẩu Admin không đúng! (Mặc định: admin hoặc 123456)');
    }
  };

  // Search & Filter state for Scores
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');

  // Search & Filter state for Students Directory
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');

  // Add Student Modal State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentUsername, setNewStudentUsername] = useState<string>('');
  const [newStudentPassword, setNewStudentPassword] = useState<string>('123456');
  const [newStudentClass, setNewStudentClass] = useState<string>('Lớp 6A');
  const [newStudentAvatar, setNewStudentAvatar] = useState<string>('🎓');

  // Password Visibility Toggle State
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(true);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (viewSection === 'scores') {
      drawStatsChart();
    }
  }, [history, selectedClassFilter, selectedModeFilter, searchTerm, viewSection]);

  // Filter history records
  const filteredHistory = history.filter((item) => {
    const studentName = (item.studentName || 'Học Sinh Lớp 6').toLowerCase();
    const classGroup = item.classGroup || 'Lớp 6A';
    const mode = item.mode || '';

    const matchesSearch = studentName.includes(searchTerm.toLowerCase().trim());
    const matchesClass =
      selectedClassFilter === 'all' || classGroup === selectedClassFilter;
    const matchesMode =
      selectedModeFilter === 'all' || mode.includes(selectedModeFilter);

    return matchesSearch && matchesClass && matchesMode;
  });

  // Filter student directory
  const filteredStudents = students.filter((st) => {
    const nameMatch = st.name.toLowerCase().includes(studentSearchTerm.toLowerCase().trim());
    const userMatch = (st.username || '').toLowerCase().includes(studentSearchTerm.toLowerCase().trim());
    const matchesSearch = nameMatch || userMatch;
    const matchesClass = studentClassFilter === 'all' || st.classGroup === studentClassFilter;

    return matchesSearch && matchesClass;
  });

  const drawStatsChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 220;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartItems = [...filteredHistory].reverse().slice(-10);
    if (chartItems.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Lexend, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Chưa có dữ liệu biểu đồ phù hợp với bộ lọc',
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    const padding = 40;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    // Draw horizontal grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (graphHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Lexend, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${10 - i * 2}`, padding - 8, y + 3);
    }

    const points = chartItems.map((item, idx) => {
      const score = parseFloat(item.score) || 0;
      const x =
        padding +
        (graphWidth / Math.max(1, chartItems.length - 1)) * idx;
      const y = padding + graphHeight - (score / 10) * graphHeight;
      return { x, y, score, name: item.studentName || 'HS' };
    });

    // Fill Gradient
    if (points.length > 0) {
      const grad = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, canvas.height - padding);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Dots & Labels
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#047857';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Score above dot
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Lexend, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.score}`, p.x, p.y - 10);

      // Student name under bottom axis
      ctx.fillStyle = '#475569';
      ctx.font = '500 10px Lexend, sans-serif';
      const displayName = p.name.length > 9 ? p.name.substring(0, 8) + '…' : p.name;
      ctx.fillText(displayName, p.x, canvas.height - 8);
    });
  };

  // Metric aggregates for scores
  let maxScore = 0;
  let totalCorrect = 0;
  let totalQuestionsSum = 0;
  let excellentCount = 0;

  filteredHistory.forEach((item) => {
    const numericScore = parseFloat(item.score) || 0;
    if (numericScore > maxScore) maxScore = numericScore;
    if (numericScore >= 8.5) excellentCount++;
    totalCorrect += item.correctCount || 0;
    totalQuestionsSum += item.totalQuestions || 0;
  });

  const avgAccuracy =
    totalQuestionsSum > 0 ? Math.round((totalCorrect / totalQuestionsSum) * 100) : 0;
  const avgScore =
    filteredHistory.length > 0
      ? (
          filteredHistory.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0) /
          filteredHistory.length
        ).toFixed(1)
      : '0';

  // Group by Class for Class Breakdown Table
  const classBreakdownMap: Record<
    string,
    { count: number; totalScore: number; excellent: number }
  > = {};

  filteredHistory.forEach((item) => {
    const cls = item.classGroup || 'Lớp 6A';
    const score = parseFloat(item.score) || 0;

    if (!classBreakdownMap[cls]) {
      classBreakdownMap[cls] = { count: 0, totalScore: 0, excellent: 0 };
    }
    classBreakdownMap[cls].count += 1;
    classBreakdownMap[cls].totalScore += score;
    if (score >= 8.5) classBreakdownMap[cls].excellent += 1;
  });

  // Leaderboard Calculation (Top 10 Students by Average Score)
  const leaderboardMap: Record<
    string,
    {
      name: string;
      classGroup: string;
      avatar: string;
      attemptsCount: number;
      totalScore: number;
      maxScore: number;
      perfectCount: number;
    }
  > = {};

  history.forEach((record) => {
    const name = record.studentName || 'Học Sinh Lớp 6';
    const classGroup = record.classGroup || 'Lớp 6A';
    const avatar = record.avatar || '🎓';
    const key = `${name}_${classGroup}`;
    const score = parseFloat(record.score) || 0;

    if (!leaderboardMap[key]) {
      leaderboardMap[key] = {
        name,
        classGroup,
        avatar,
        attemptsCount: 0,
        totalScore: 0,
        maxScore: 0,
        perfectCount: 0,
      };
    }

    const st = leaderboardMap[key];
    st.attemptsCount += 1;
    st.totalScore += score;
    if (score > st.maxScore) st.maxScore = score;
    if (score === 10) st.perfectCount += 1;
  });

  const top10Leaderboard = Object.values(leaderboardMap)
    .map((st) => ({
      ...st,
      avgScore: Math.round((st.totalScore / st.attemptsCount) * 10) / 10,
    }))
    .sort((a, b) => {
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
      if (b.perfectCount !== a.perfectCount) return b.perfectCount - a.perfectCount;
      return b.attemptsCount - a.attemptsCount;
    })
    .slice(0, 10);

  const handleExportExcelScores = () => {
    playSound('click');
    if (filteredHistory.length === 0) {
      alert('Không có dữ liệu thỏa mãn bộ lọc để xuất Excel!');
      return;
    }
    exportStatsToExcel(filteredHistory, `Bao_Cao_Thong_Ke_Diem_TinHoc6.xlsx`, students);
  };

  const handleExportExcelStudents = () => {
    playSound('click');
    if (filteredStudents.length === 0) {
      alert('Không có học sinh nào phù hợp bộ lọc để xuất Excel!');
      return;
    }
    exportStudentsToExcel(filteredStudents, `Danh_Sach_Hoc_Sinh_Tham_Gia_TinHoc6.xlsx`);
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử kết quả học sinh?')) {
      playSound('click');
      onClearHistory();
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    playSound('victory');
    const now = new Date().toLocaleString('vi-VN');
    const username = newStudentUsername.trim() || newStudentName.trim().toLowerCase().replace(/\s+/g, '');

    const newStudent: StudentUser = {
      id: Date.now().toString(),
      username,
      password: newStudentPassword.trim() || '123456',
      name: newStudentName.trim(),
      classGroup: newStudentClass,
      avatar: newStudentAvatar,
      registeredAt: now,
      lastLoginAt: now,
      status: 'Hoạt động',
    };

    if (students) {
      students.unshift(newStudent);
      localStorage.setItem('tinhoc6_students', JSON.stringify(students));
    }

    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('123456');
    setIsAddStudentOpen(false);
  };

  return (
    <section className="space-y-6 animate-fade-in">
      {!isAdmin ? (
        /* PUBLIC STUDENT VIEW FOR NON-ADMIN USERS */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" /> Bảng Vinh Danh Học Sinh
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Cập nhật tự động từ kết quả thi thử & luyện tập
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                <Trophy className="w-7 h-7 text-amber-500" /> Bảng Xếp Hạng Top 10 Học Sinh Xuất Sắc
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Toàn thể học sinh có thể theo dõi vị trí xếp hạng thi đua học tập trên hệ thống
              </p>
            </div>
          </div>

          {/* Top 10 Leaderboard Component */}
          <LeaderboardBoard
            history={history}
            title="BẢNG XẾP HẠNG TOP 10 HỌC SINH XUẤT SẮC 🏆"
            subtitle="Tự động tính từ điểm trung bình & số bài thi đạt kết quả cao nhất"
          />

          {/* Admin Lock Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Khu Vực Quản Trị & Danh Sách Mật Khẩu</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Bảng điểm chi tiết từng bài thi, biểu đồ phân tích lớp và danh sách mật khẩu học sinh chỉ dành cho Giáo viên / Admin.
              </p>
            </div>

            <form onSubmit={handleAdminPinSubmit} className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="Nhập mật khẩu Admin (mặc định: admin)..."
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" /> Mở Khóa Admin
                </button>
              </div>
              {pinError && <p className="text-xs text-rose-600 font-semibold">{pinError}</p>}
            </form>

            {onOpenLoginModal && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onOpenLoginModal();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
                >
                  Hoặc Đăng nhập bằng Tài khoản Quản Trị Viên hệ thống
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FULL ADMIN VIEW FOR ADMIN / TEACHER USERS */
        <div className="space-y-6">
          {/* Header Banner & Section Switcher */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Chế Độ Quản Trị Viên (Admin)
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {students.length} học sinh | {history.length} lượt bài thi
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                <BarChart3 className="w-7 h-7 text-emerald-600" /> Quản Lý Học Sinh & Báo Cáo Điểm
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Theo dõi danh sách học sinh, quản lý khôi phục mật khẩu và xuất báo cáo Excel
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {/* View Toggle Tabs */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 text-xs font-bold shadow-inner">
                <button
                  onClick={() => {
                    playSound('click');
                    setViewSection('leaderboard');
                  }}
                  className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    viewSection === 'leaderboard'
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Top 10
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    setViewSection('scores');
                  }}
                  className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    viewSection === 'scores'
                      ? 'bg-emerald-600 text-white font-black shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Thống Kê Điểm ({history.length})
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    setViewSection('students');
                  }}
                  className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    viewSection === 'students'
                      ? 'bg-blue-600 text-white font-black shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Mật Khẩu HS ({students.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsAdminUnlocked(false);
                }}
                className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
                title="Khóa lại chế độ Admin"
              >
                <LogOut className="w-3.5 h-3.5" /> Khóa Admin
              </button>
            </div>
          </div>

          {/* SECTION 0: LEADERBOARD IN ADMIN VIEW */}
          {viewSection === 'leaderboard' && (
            <LeaderboardBoard
              history={history}
              title="BẢNG XẾP HẠNG TOP 10 HỌC SINH XUẤT SẮC 🏆"
              subtitle="Giao diện xem trước Bảng vinh danh dành cho toàn thể học sinh"
            />
          )}

      {/* SECTION 1: SCORES STATS */}
      {viewSection === 'scores' && (
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Báo Cáo Kết Quả Luyện Tập
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcelScores}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Xuất Báo Cáo Excel Tổng Hợp
              </button>

              {history.length === 0 && onAddSampleHistory && (
                <button
                  onClick={() => {
                    playSound('click');
                    onAddSampleHistory();
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Thêm Mẫu Dữ Liệu
                </button>
              )}

              <button
                onClick={handleClear}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200 flex items-center gap-1.5"
                title="Xóa lịch sử điểm"
              >
                <Trash2 className="w-4 h-4" /> Xóa Điểm
              </button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Lượt Tham Gia</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {filteredHistory.length} Lượt
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Điểm Trung Bình</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{avgScore} / 10</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Bài Giỏi (≥ 8.5)</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {excellentCount} bài
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Độ Chính Xác TB</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{avgAccuracy}%</div>
              </div>
            </div>
          </div>

          {/* LEADERBOARD TOP 10 */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/30 space-y-6 relative overflow-hidden">
            {/* Ambient glowing background effects */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Leaderboard Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wide flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Thi Đua Học Tập
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Lịch sử làm bài thi</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                    BẢNG XẾP HẠNG TOP 10 HỌC SINH XUẤT SẮC 🏆
                  </h3>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Xếp hạng theo Điểm Trung Bình</span>
              </div>
            </div>

            {top10Leaderboard.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2 relative z-10">
                <Trophy className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm font-medium">Chưa có dữ liệu bài thi để xếp hạng. Hãy tham gia luyện tập và thi thử ngay!</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                {/* Top 3 Podiums */}
                {top10Leaderboard.length >= 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Rank 2 (Silver) */}
                    {top10Leaderboard[1] ? (
                      <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl p-4 border border-slate-600/60 shadow-lg flex flex-col items-center text-center relative transform md:translate-y-2">
                        <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-200 text-slate-950 font-black text-[11px] shadow flex items-center gap-1">
                          <Medal className="w-3.5 h-3.5 text-slate-700" /> HẠNG 2 (Á KHOA) 🥈
                        </div>
                        <div className="text-4xl mt-3 mb-1">{top10Leaderboard[1].avatar}</div>
                        <h4 className="font-extrabold text-white text-base line-clamp-1">{top10Leaderboard[1].name}</h4>
                        <span className="text-xs font-bold text-slate-300 bg-slate-700/80 px-2.5 py-0.5 rounded-md mt-1 border border-slate-600">
                          {top10Leaderboard[1].classGroup}
                        </span>

                        <div className="mt-3 pt-3 border-t border-slate-700/80 w-full flex items-center justify-around text-xs">
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Điểm TB</div>
                            <div className="text-lg font-black text-emerald-400">{top10Leaderboard[1].avgScore}</div>
                          </div>
                          <div className="w-px h-6 bg-slate-700"></div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Điểm Cao Nhất</div>
                            <div className="text-sm font-extrabold text-amber-300">{top10Leaderboard[1].maxScore}</div>
                          </div>
                          <div className="w-px h-6 bg-slate-700"></div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Lượt Thi</div>
                            <div className="text-sm font-extrabold text-sky-300">{top10Leaderboard[1].attemptsCount}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="order-2 md:order-1 hidden md:block opacity-0"></div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {top10Leaderboard[0] && (
                      <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-slate-900/95 to-slate-900 rounded-2xl p-5 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center relative transform md:-translate-y-2">
                        <div className="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 animate-bounce">
                          <Crown className="w-4 h-4 text-amber-950 fill-amber-950" /> HẠNG 1 (THỦ KHOA) 🥇
                        </div>
                        <div className="text-5xl mt-3 mb-1 drop-shadow-md">{top10Leaderboard[0].avatar}</div>
                        <h4 className="font-black text-amber-300 text-lg line-clamp-1">{top10Leaderboard[0].name}</h4>
                        <span className="text-xs font-bold text-amber-950 bg-amber-300 px-3 py-0.5 rounded-md mt-1">
                          {top10Leaderboard[0].classGroup}
                        </span>

                        <div className="mt-4 pt-3 border-t border-amber-500/30 w-full flex items-center justify-around text-xs">
                          <div>
                            <div className="text-[10px] uppercase text-amber-200/80 font-bold">Điểm TB</div>
                            <div className="text-2xl font-black text-emerald-400">{top10Leaderboard[0].avgScore}</div>
                          </div>
                          <div className="w-px h-8 bg-amber-500/30"></div>
                          <div>
                            <div className="text-[10px] uppercase text-amber-200/80 font-bold">Điểm Cao Nhất</div>
                            <div className="text-base font-black text-amber-300">{top10Leaderboard[0].maxScore}</div>
                          </div>
                          <div className="w-px h-8 bg-amber-500/30"></div>
                          <div>
                            <div className="text-[10px] uppercase text-amber-200/80 font-bold">Lượt Thi</div>
                            <div className="text-base font-black text-sky-300">{top10Leaderboard[0].attemptsCount}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {top10Leaderboard[2] ? (
                      <div className="order-3 bg-gradient-to-b from-amber-950/40 to-slate-900/90 rounded-2xl p-4 border border-amber-700/50 shadow-lg flex flex-col items-center text-center relative transform md:translate-y-2">
                        <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-700 text-amber-100 font-black text-[11px] shadow flex items-center gap-1">
                          <Medal className="w-3.5 h-3.5 text-amber-300" /> HẠNG 3 🥉
                        </div>
                        <div className="text-4xl mt-3 mb-1">{top10Leaderboard[2].avatar}</div>
                        <h4 className="font-extrabold text-white text-base line-clamp-1">{top10Leaderboard[2].name}</h4>
                        <span className="text-xs font-bold text-slate-300 bg-slate-700/80 px-2.5 py-0.5 rounded-md mt-1 border border-slate-600">
                          {top10Leaderboard[2].classGroup}
                        </span>

                        <div className="mt-3 pt-3 border-t border-slate-700/80 w-full flex items-center justify-around text-xs">
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Điểm TB</div>
                            <div className="text-lg font-black text-emerald-400">{top10Leaderboard[2].avgScore}</div>
                          </div>
                          <div className="w-px h-6 bg-slate-700"></div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Điểm Cao Nhất</div>
                            <div className="text-sm font-extrabold text-amber-300">{top10Leaderboard[2].maxScore}</div>
                          </div>
                          <div className="w-px h-6 bg-slate-700"></div>
                          <div>
                            <div className="text-[10px] uppercase text-slate-400 font-bold">Lượt Thi</div>
                            <div className="text-sm font-extrabold text-sky-300">{top10Leaderboard[2].attemptsCount}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="order-3 hidden md:block opacity-0"></div>
                    )}
                  </div>
                )}

                {/* Ranks 4 - 10 Table */}
                {top10Leaderboard.length > 3 && (
                  <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 overflow-x-auto">
                    <div className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-extrabold">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Top Tiếp Theo (Hạng 4 – 10)
                      </span>
                      <span className="text-[11px] text-emerald-400 font-normal">Cập nhật tự động</span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 border-b border-slate-800 text-[11px] uppercase font-bold">
                        <tr>
                          <th className="p-2.5">Thứ Hạng</th>
                          <th className="p-2.5">Họ và Tên Học Sinh</th>
                          <th className="p-2.5">Lớp</th>
                          <th className="p-2.5 text-center">Số Lượt Thi</th>
                          <th className="p-2.5 text-center">Điểm Cao Nhất</th>
                          <th className="p-2.5 text-right">Điểm TB</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {top10Leaderboard.slice(3).map((st, idx) => {
                          const rankNum = idx + 4;
                          return (
                            <tr key={`top-rank-${st.name}-${st.classGroup}-${idx}`} className="hover:bg-slate-800/40 transition">
                              <td className="p-2.5 font-black text-slate-300">
                                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center justify-center font-bold text-xs">
                                  {rankNum}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{st.avatar}</span>
                                  <span className="font-extrabold text-white">{st.name}</span>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {st.classGroup}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-bold text-slate-300">
                                {st.attemptsCount} lượt
                              </td>
                              <td className="p-2.5 text-center font-bold text-amber-300">
                                {st.maxScore}/10
                              </td>
                              <td className="p-2.5 text-right font-black text-emerald-400 text-sm">
                                {st.avgScore}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" /> Bộ Lọc Báo Cáo Thống Kê
              </h3>
              <span className="text-xs font-medium text-slate-500">
                Hiển thị {filteredHistory.length} / {history.length} bản ghi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên học sinh..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Lớp:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">Tất cả các lớp</option>
                  <option value="Lớp 6A">Lớp 6A</option>
                  <option value="Lớp 6B">Lớp 6B</option>
                  <option value="Lớp 6C">Lớp 6C</option>
                  <option value="Lớp 6D">Lớp 6D</option>
                  <option value="Lớp 6E">Lớp 6E</option>
                  <option value="Lớp 6G">Lớp 6G</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Hình thức:</span>
                <select
                  value={selectedModeFilter}
                  onChange={(e) => setSelectedModeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">Tất cả bài ôn tập & thi</option>
                  <option value="Thi Thử">Thi Thử Tổng Hợp</option>
                  <option value="Trắc Nghiệm">Trắc Nghiệm Bài Học</option>
                </select>
              </div>
            </div>
          </div>

          {/* Class Breakdown Table */}
          {Object.keys(classBreakdownMap).length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Thống Kê Tỉ Lệ Đạt Theo Lớp
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-bold rounded-xl">
                    <tr>
                      <th className="p-3">STT</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">Số Lượt Bài Thi</th>
                      <th className="p-3">Điểm Trung Bình</th>
                      <th className="p-3">Tỉ Lệ Bài Giỏi (≥ 8.5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {Object.keys(classBreakdownMap).map((clsKey, index) => {
                      const stat = classBreakdownMap[clsKey];
                      const classAvg = (stat.totalScore / stat.count).toFixed(1);
                      return (
                        <tr key={`cls-stat-${clsKey}-${index}`} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-400">{index + 1}</td>
                          <td className="p-3 font-extrabold text-slate-900">{clsKey}</td>
                          <td className="p-3 font-bold text-blue-600">{stat.count} lượt</td>
                          <td className="p-3 font-black text-emerald-600">{classAvg} điểm</td>
                          <td className="p-3 font-bold text-amber-600">
                            {stat.excellent} bài ({Math.round((stat.excellent / stat.count) * 100)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Line Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-600" /> Biểu Đồ Điểm 10 Lượt Thi Gần Nhất
            </h3>
            <div className="w-full h-60 relative flex items-end justify-center pt-2">
              <canvas ref={canvasRef} className="w-full h-full max-h-56"></canvas>
            </div>
          </div>

          {/* Detailed Student Scores Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Lịch Sử Điểm Luyện Tập & Thi Thử
                </h3>
                <p className="text-xs text-slate-500">
                  Chi tiết điểm số từng học sinh qua các đợt làm bài
                </p>
              </div>

              <button
                onClick={handleExportExcelScores}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Xuất Báo Cáo Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-800 uppercase text-xs font-bold rounded-xl">
                  <tr>
                    <th className="p-3">STT</th>
                    <th className="p-3">Họ và Tên Học Sinh</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Chế Độ Thi</th>
                    <th className="p-3">Số Câu Đúng</th>
                    <th className="p-3">Điểm Số</th>
                    <th className="p-3">Xếp Loại</th>
                    <th className="p-3">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <div className="space-y-2">
                          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-medium text-slate-500">Chưa tìm thấy kết quả phù hợp!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item, idx) => (
                      <tr key={`hist-${item.id || ''}-${idx}`} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{item.avatar || '🎓'}</span>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {item.studentName || 'Học Sinh Lớp 6'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {item.classGroup || 'Lớp 6A'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-xs text-indigo-600">{item.mode}</td>
                        <td className="p-3 font-bold text-xs text-slate-700">
                          {item.correctCount}/{item.totalQuestions}
                        </td>
                        <td className="p-3 font-black text-xs sm:text-sm text-emerald-600">
                          {item.score}/10
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {item.rank}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-xs text-slate-500">{item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: REGISTERED STUDENTS DIRECTORY */}
      {viewSection === 'students' && (
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Danh Sách Học Sinh Đã Đăng Ký & Tham Gia
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các tài khoản học sinh đã đăng ký hoặc đăng nhập làm bài trong hệ thống
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportExcelStudents}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Xuất Excel Danh Sách Học Sinh (.xlsx)
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setIsAddStudentOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Thêm Học Sinh
              </button>

              {students.length === 0 && onAddSampleStudents && (
                <button
                  onClick={() => {
                    playSound('click');
                    onAddSampleStudents();
                  }}
                  className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-2xl border border-blue-200 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Thêm Học Sinh Mẫu
                </button>
              )}

              {onClearStudents && (
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa toàn bộ danh sách học sinh?')) {
                      playSound('click');
                      onClearStudents();
                    }
                  }}
                  className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition border border-rose-200 flex items-center gap-1.5"
                  title="Xóa tất cả danh sách học sinh"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              )}
            </div>
          </div>

          {/* Directory Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc tên đăng nhập học sinh..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Lọc Lớp:</span>
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">Tất cả các lớp</option>
                  <option value="Lớp 6A">Lớp 6A</option>
                  <option value="Lớp 6B">Lớp 6B</option>
                  <option value="Lớp 6C">Lớp 6C</option>
                  <option value="Lớp 6D">Lớp 6D</option>
                  <option value="Lớp 6E">Lớp 6E</option>
                  <option value="Lớp 6G">Lớp 6G</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowAllPasswords((prev) => !prev);
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap"
            >
              {showAllPasswords ? (
                <>
                  <EyeOff className="w-4 h-4 text-slate-500" /> Ẩn Tất Cả Mật Khẩu
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-600" /> Hiện Tất Cả Mật Khẩu
                </>
              )}
            </button>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-800 uppercase text-xs font-bold rounded-xl">
                  <tr>
                    <th className="p-3">STT</th>
                    <th className="p-3">Học Sinh</th>
                    <th className="p-3">Tên Đăng Nhập</th>
                    <th className="p-3">Mật Khẩu</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Ngày Đăng Ký</th>
                    <th className="p-3">Đăng Nhập Cuối</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="space-y-2">
                          <Users className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-medium text-slate-500">Chưa có học sinh nào phù hợp!</p>
                          {students.length === 0 && onAddSampleStudents && (
                            <button
                              onClick={() => {
                                playSound('click');
                                onAddSampleStudents();
                              }}
                              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" /> Thêm Danh Sách Mẫu
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const isPasswordVisible =
                        showAllPasswords || visiblePasswordIds[st.id];
                      const pwd = st.password || '123456';

                      return (
                        <tr key={`st-manage-${st.id || ''}-${idx}`} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{st.avatar || '🎓'}</span>
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {st.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs font-bold text-indigo-600">
                            {st.username || '—'}
                          </td>
                          <td className="p-3 font-mono text-xs font-bold text-amber-700">
                            <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 w-fit">
                              <Key className="w-3.5 h-3.5 text-amber-600" />
                              <span>{isPasswordVisible ? pwd : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  playSound('click');
                                  setVisiblePasswordIds((prev) => ({
                                    ...prev,
                                    [st.id]: !prev[st.id],
                                  }));
                                }}
                                className="text-slate-400 hover:text-slate-700 transition ml-1"
                                title={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              >
                                {isPasswordVisible ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              {st.classGroup}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {st.registeredAt || '31/07/2026'}
                          </td>
                          <td className="p-3 font-medium text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {st.lastLoginAt || '31/07/2026'}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> {st.status || 'Hoạt động'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {onDeleteStudent && (
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${st.name}?`)) {
                                    playSound('click');
                                    onDeleteStudent(st.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDENT */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Thêm Học Sinh Mới</h3>
                <p className="text-xs text-slate-500">Tạo thông tin học sinh tham gia lớp học</p>
              </div>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và Tên Học Sinh: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Đăng Nhập (Username):
                </label>
                <input
                  type="text"
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value)}
                  placeholder="nguyenvanan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Khẩu Học Sinh:
                </label>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-800 bg-amber-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp Học:</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
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
                    value={newStudentAvatar}
                    onChange={(e) => setNewStudentAvatar(e.target.value)}
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

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                >
                  Lưu Học Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      )}
    </section>
  );
};
