import * as XLSX from 'xlsx';
import { AttemptRecord, StudentUser } from '../types';

export const exportStudentsToExcel = (
  students: StudentUser[],
  filename = 'Danh_Sach_Hoc_Sinh_Tham_Gia_TinHoc6.xlsx'
) => {
  if (!students || students.length === 0) {
    alert('Không có danh sách học sinh để xuất file Excel!');
    return;
  }

  const sheetData = students.map((item, index) => ({
    'STT': index + 1,
    'Tên Đăng Nhập': item.username || item.name,
    'Mật Khẩu': item.password || '123456',
    'Họ và Tên Học Sinh': item.name,
    'Lớp Học': item.classGroup,
    'Trạng Thái': item.status || 'Hoạt động',
    'Ngày Đăng Ký': item.registeredAt || '31/07/2026',
    'Lần Đăng Nhập Cuối': item.lastLoginAt || '31/07/2026',
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Tên đăng nhập
    { wch: 15 }, // Mật khẩu
    { wch: 25 }, // Họ và tên
    { wch: 12 }, // Lớp học
    { wch: 14 }, // Trạng thái
    { wch: 22 }, // Ngày đăng ký
    { wch: 22 }, // Lần đăng nhập cuối
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Học Sinh');
  XLSX.writeFile(workbook, filename);
};

export const exportStatsToExcel = (
  historyRecords: AttemptRecord[],
  filename = 'Bao_Cao_Thong_Ke_Diem_Hoc_Sinh_TinHoc6.xlsx',
  studentsList?: StudentUser[]
) => {
  if (!historyRecords || historyRecords.length === 0) {
    alert('Không có dữ liệu lịch sử làm bài để xuất file Excel!');
    return;
  }

  // 1. Prepare detailed student score list
  const detailSheetData = historyRecords.map((item, index) => ({
    'STT': index + 1,
    'Họ và Tên Học Sinh': item.studentName || 'Học Sinh Lớp 6',
    'Lớp': item.classGroup || 'Lớp 6A',
    'Chế Độ Làm Bài / Thi': item.mode || 'Trắc nghiệm',
    'Số Câu Đúng': `${item.correctCount}/${item.totalQuestions}`,
    'Điểm Số (/10)': parseFloat(item.score) || 0,
    'Xếp Loại': item.rank || 'Đạt',
    'Thời Gian Hoàn Thành': item.date,
  }));

  const worksheet1 = XLSX.utils.json_to_sheet(detailSheetData);

  // Set column widths for sheet 1
  worksheet1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 25 }, // Họ tên
    { wch: 12 }, // Lớp
    { wch: 24 }, // Chế độ
    { wch: 15 }, // Số câu đúng
    { wch: 14 }, // Điểm số
    { wch: 16 }, // Xếp loại
    { wch: 24 }, // Thời gian
  ];

  // 2. Prepare Summary Statistics by Class
  const classStatsMap: Record<
    string,
    {
      count: number;
      totalScore: number;
      maxScore: number;
      minScore: number;
      excellentCount: number;
      goodCount: number;
      passCount: number;
    }
  > = {};

  historyRecords.forEach((item) => {
    const cls = item.classGroup || 'Lớp 6A';
    const score = parseFloat(item.score) || 0;

    if (!classStatsMap[cls]) {
      classStatsMap[cls] = {
        count: 0,
        totalScore: 0,
        maxScore: 0,
        minScore: 10,
        excellentCount: 0,
        goodCount: 0,
        passCount: 0,
      };
    }

    classStatsMap[cls].count += 1;
    classStatsMap[cls].totalScore += score;
    if (score > classStatsMap[cls].maxScore) classStatsMap[cls].maxScore = score;
    if (score < classStatsMap[cls].minScore) classStatsMap[cls].minScore = score;

    if (score >= 8.5) {
      classStatsMap[cls].excellentCount += 1;
    } else if (score >= 6.5) {
      classStatsMap[cls].goodCount += 1;
    } else {
      classStatsMap[cls].passCount += 1;
    }
  });

  const summarySheetData = Object.keys(classStatsMap).map((cls, idx) => {
    const stat = classStatsMap[cls];
    const avgScore = stat.count > 0 ? (stat.totalScore / stat.count).toFixed(2) : '0';
    return {
      'STT': idx + 1,
      'Lớp': cls,
      'Số Lượt Tham Gia': stat.count,
      'Điểm Trung Bình': parseFloat(avgScore),
      'Điểm Cao Nhất': stat.maxScore,
      'Điểm Thấp Nhất': stat.minScore === 10 && stat.count === 0 ? 0 : stat.minScore,
      'Số Bài Giỏi (>= 8.5)': stat.excellentCount,
      'Số Bài Khá (6.5 - 8.4)': stat.goodCount,
      'Số Bài Trung Bình / Đạt (< 6.5)': stat.passCount,
    };
  });

  const worksheet2 = XLSX.utils.json_to_sheet(summarySheetData);
  worksheet2['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Lớp
    { wch: 18 }, // Số lượt tham gia
    { wch: 16 }, // Điểm TB
    { wch: 16 }, // Điểm cao nhất
    { wch: 16 }, // Điểm thấp nhất
    { wch: 22 }, // Số bài Giỏi
    { wch: 22 }, // Số bài Khá
    { wch: 26 }, // Số bài TB
  ];

  // Combine into Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, 'Danh Sách Điểm Chi Tiết');
  XLSX.utils.book_append_sheet(workbook, worksheet2, 'Thống Kê Theo Lớp');

  if (studentsList && studentsList.length > 0) {
    const studentSheetData = studentsList.map((st, idx) => ({
      'STT': idx + 1,
      'Tên Đăng Nhập': st.username || st.name,
      'Mật Khẩu': st.password || '123456',
      'Họ và Tên Học Sinh': st.name,
      'Lớp Học': st.classGroup,
      'Trạng Thái': st.status || 'Hoạt động',
      'Ngày Đăng Ký': st.registeredAt || '31/07/2026',
      'Lần Đăng Nhập Cuối': st.lastLoginAt || '31/07/2026',
    }));
    const worksheet3 = XLSX.utils.json_to_sheet(studentSheetData);
    worksheet3['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Học Sinh Tham Gia');
  }

  // Trigger Excel File Download
  XLSX.writeFile(workbook, filename);
};
