import React from 'react';
import { Laptop, GraduationCap, Mail, Phone, User, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Laptop className="w-5 h-5 text-blue-500" />
              <span>HỆ THỐNG ÔN TẬP TIN HỌC 6</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Phần mềm ứng dụng học tập, ôn tập tương tác theo bộ sách &quot;Kết nối tri thức với cuộc sống&quot;. Chạy trực tiếp trên trình duyệt web, máy chiếu và màn hình cảm ứng.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tính Năng Cốt Lõi</h4>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Ôn tập lý thuyết 15 Bài học & 6 Chủ đề lớn</li>
              <li>• Ngân hàng trắc nghiệm & tự luận tự động chấm</li>
              <li>• Đề thi thử 45 phút & Trợ lý AI Gemini thông minh</li>
              <li>• Quản lý ngân hàng câu hỏi & Đăng nhập</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Thông Tin Liên Hệ & Hỗ Trợ</h4>
            <div className="text-slate-300 text-xs space-y-2">
              <div className="space-y-1">
                <p className="flex items-start gap-1.5 font-medium text-slate-200">
                  <User className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Giáo viên:</strong> Phạm Thị Kim Phượng
                  </span>
                </p>
                <p className="flex items-start gap-1.5 text-slate-400 pl-5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Trường THCS Nguyễn Bá Loan - Xã Long Phụng - Tỉnh Quảng Ngãi</span>
                </p>
              </div>

              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">Email:</strong>{' '}
                  <a
                    href="mailto:kimphuongqn.14@gmail.com"
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    kimphuongqn.14@gmail.com
                  </a>
                </span>
              </p>

              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">Hotline/ Zalo hỗ trợ:</strong>{' '}
                  <a
                    href="tel:0968430379"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    0968430379
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 text-center sm:text-left">
          <p>Bản quyền © 2026 HỆ THỐNG ÔN TẬP TIN HỌC 6 – KẾT NỐI TRI THỨC VỚI CUỘC SỐNG. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <span>Phiên bản 3.5 (Tích hợp AI & Admin)</span>
            <span>Offline Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
