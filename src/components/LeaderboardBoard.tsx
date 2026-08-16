import React, { useState } from 'react';
import { AttemptRecord } from '../types';
import { playSound } from '../utils/audio';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  Sparkles,
  Filter,
} from 'lucide-react';

interface LeaderboardBoardProps {
  history: AttemptRecord[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const LeaderboardBoard: React.FC<LeaderboardBoardProps> = ({
  history,
  title = 'BẢNG XẾP HẠNG TOP 10 HỌC SINH XUẤT SẮC 🏆',
  subtitle = 'Tự động tổng hợp từ lịch sử làm bài thi thử & luyện tập',
  compact = false,
}) => {
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Filter history by mode if selected
  const filteredHistory = history.filter((item) => {
    if (modeFilter === 'all') return true;
    if (modeFilter === 'exam') return item.mode.includes('Thi Thử');
    if (modeFilter === 'quiz') return !item.mode.includes('Thi Thử');
    return true;
  });

  // Calculate Leaderboard Map
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

  filteredHistory.forEach((record) => {
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

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-emerald-500/30 space-y-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wide flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Thi Đua Học Tập
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">{subtitle}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
              {title}
            </h3>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 text-xs self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setModeFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex-1 text-center ${
              modeFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Tất Cả
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setModeFilter('exam');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex-1 text-center ${
              modeFilter === 'exam'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Thi Thử
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setModeFilter('quiz');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex-1 text-center ${
              modeFilter === 'quiz'
                ? 'bg-sky-400 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Luyện Bài
          </button>
        </div>
      </div>

      {top10Leaderboard.length === 0 ? (
        <div className="text-center py-8 text-slate-400 space-y-2 relative z-10">
          <Trophy className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
          <p className="text-sm font-medium">Chưa có dữ liệu lượt thi nào phù hợp để xếp hạng.</p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          {/* Top 3 Podiums */}
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
                      <tr key={`lead-board-row-${st.name}-${st.classGroup}-${idx}`} className="hover:bg-slate-800/40 transition">
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
  );
};
