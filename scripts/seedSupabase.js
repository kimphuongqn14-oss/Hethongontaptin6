import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pgdrzhfeqfrtdbgyrhtb.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZHJ6aGZlcWZydGRiZ3lyaHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0OTg0OSwiZXhwIjoyMTAyMDI1ODQ5fQ.g-YZyNbjdLU4tIKGI0CxGj1i0V5EYH24xeRcEVcnqOw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DEFAULT_MCQ = [
  {
    id: 101, lesson_id: 1, chapter_id: 1, level: "Nhận biết",
    question: "Thông tin là gì?",
    options: JSON.stringify(["A. Các con số và ký tự.", "B. Những gì đem lại hiểu biết cho con người về thế giới xung quanh và về chính bản thân mình.", "C. Văn bản và hình ảnh trên sách báo.", "D. Tiếng nói và âm thanh."]),
    correct_answer: 1,
    explanation: "Theo SGK Tin học 6 Kết nối tri thức, thông tin là những gì đem lại hiểu biết cho con người về thế giới xung quanh và chính bản thân mình."
  },
  {
    id: 102, lesson_id: 2, chapter_id: 1, level: "Thông hiểu",
    question: "Vật mang tin là gì?",
    options: JSON.stringify(["A. Mạng Internet.", "B. Phương tiện, vật dụng chứa đựng và lưu trữ thông tin.", "C. Màn hình máy tính.", "D. Bộ nhớ RAM."]),
    correct_answer: 1,
    explanation: "Vật mang tin là vật mang/chứa thông tin như giấy, thẻ nhớ, đĩa CD, sách vở..."
  },
  {
    id: 103, lesson_id: 3, chapter_id: 1, level: "Thông hiểu",
    question: "Máy tính gồm có mấy thành phần chính để xử lý thông tin?",
    options: JSON.stringify(["A. 2 thành phần (Màn hình và Bàn phím).", "B. 3 thành phần.", "C. 4 thành phần (Thiết bị vào, Bộ xử lý, Bộ nhớ, Thiết bị ra).", "D. 5 thành phần."]),
    correct_answer: 2,
    explanation: "Cấu trúc chung gồm: Thiết bị vào, Bộ xử lý (CPU), Bộ nhớ (trong/ngoài) và Thiết bị ra."
  },
  {
    id: 104, lesson_id: 4, chapter_id: 2, level: "Nhận biết",
    question: "Quan sát sơ đồ bên dưới, mô hình mạng máy tính kết nối các máy tính qua thiết bị trung tâm là gì?",
    image_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180"><rect width="100%" height="100%" fill="%23f8fafc" rx="16"/><rect x="40" y="35" width="80" height="55" rx="8" fill="%232563eb"/><text x="80" y="68" fill="white" font-size="12" font-weight="bold" text-anchor="middle">Máy tính A</text><rect x="280" y="35" width="80" height="55" rx="8" fill="%232563eb"/><text x="320" y="68" fill="white" font-size="12" font-weight="bold" text-anchor="middle">Máy tính B</text><circle cx="200" cy="125" r="28" fill="%23059669"/><text x="200" y="129" fill="white" font-size="10" font-weight="bold" text-anchor="middle">Switch/Hub</text><line x1="80" y1="90" x2="180" y2="115" stroke="%2364748b" stroke-width="3"/><line x1="320" y1="90" x2="220" y2="115" stroke="%2364748b" stroke-width="3"/><text x="200" y="24" fill="%231e293b" font-size="12" font-weight="bold" text-anchor="middle">Sơ Đồ Kết Nối Mạng Máy Tính Tối Giản</text></svg>',
    options: JSON.stringify(["A. Mạng máy tính đơn lẻ không kết nối.", "B. Mạng máy tính kết nối trao đổi dữ liệu qua thiết bị mạng trung tâm.", "C. Mạng điện ba pha gia đình.", "D. Hệ thống truyền hình cáp đơn hướng."]),
    correct_answer: 1,
    explanation: "Sơ đồ thể hiện hai hoặc nhiều máy tính kết nối thông qua thiết bị trung tâm (Switch/Hub) để chia sẻ tài nguyên."
  },
  {
    id: 105, lesson_id: 7, chapter_id: 3, level: "Vận dụng",
    question: "Địa chỉ Email nào sau đây có cấu trúc hợp lệ?",
    options: JSON.stringify(["A. hocsinh6a@gmail.com", "B. hocsinh6a#gmail.com", "C. hocsinh6a.gmail.com", "D. hocsinh6a@gmail@com"]),
    correct_answer: 0,
    explanation: "Cấu trúc email chuẩn: <tên_người_dùng>@<tên_miền> (ví dụ: hocsinh6a@gmail.com)."
  }
];

const DEFAULT_ESSAY = [
  {
    id: 201, lesson_id: 1, chapter_id: 1,
    title: "Câu hỏi 1 (Bài 1): Phân biệt Thông tin và Dữ liệu",
    question: "Em hãy nêu sự khác nhau cơ bản giữa Dữ liệu và Thông tin. Cho ví dụ minh họa cụ thể.",
    hint: "Dữ liệu là các con số, văn bản, hình ảnh thô. Thông tin là dữ liệu đã được xử lý mang lại hiểu biết.",
    sample_answer: "- Dữ liệu: Là các con số, văn bản, hình ảnh, âm thanh thu thập được (chưa qua xử lý).\n- Thông tin: Là ý nghĩa rút ra từ dữ liệu sau khi được con người hoặc máy tính xử lý.\n- Ví dụ: Số '39' là dữ liệu. Nhìn vào nhiệt kế báo '39°C' hiểu là 'Sốt cao' thì đó là thông tin."
  },
  {
    id: 202, lesson_id: 5, chapter_id: 2,
    title: "Câu hỏi 2 (Bài 5): An toàn trên Internet",
    question: "Nêu 3 quy tắc quan trọng giúp em tự bảo vệ thông tin cá nhân khi sử dụng Internet.",
    hint: "Liên hệ các quy tắc đặt mật khẩu, không chia sẻ thông tin cá nhân và không truy cập liên kết lạ.",
    sample_answer: "1. Không chia sẻ mật khẩu, số điện thoại, địa chỉ nhà cho người lạ trên mạng.\n2. Đặt mật khẩu mạnh (gồm chữ hoa, chữ thường, số và ký tự đặc biệt).\n3. Không truy cập vào các đường link lạ hoặc mở tệp đính kèm từ người không quen biết."
  }
];

const DEFAULT_STUDENTS = [
  {
    id: "st_1", username: "nguyenvana", password: "123", name: "Nguyễn Văn An", class_group: "Lớp 6A1", avatar: "👦", registered_at: "10/08/2026", last_login_at: "11/08/2026 08:30", status: "Hoạt động"
  },
  {
    id: "st_2", username: "tranthib", password: "123", name: "Trần Thị Bình", class_group: "Lớp 6A2", avatar: "👧", registered_at: "10/08/2026", last_login_at: "11/08/2026 09:15", status: "Hoạt động"
  }
];

const DEFAULT_HISTORY = [
  {
    id: "rec_1", date: "11/08/2026 08:45", mode: "Ôn Tập Bài 1", correct_count: 5, total_questions: 5, score: "10.0", rank: "Xuất Sắc", student_name: "Nguyễn Văn An", class_group: "Lớp 6A1", avatar: "👦"
  },
  {
    id: "rec_2", date: "11/08/2026 09:20", mode: "Thi Thử Tổng Hợp", correct_count: 8, total_questions: 10, score: "8.0", rank: "Giỏi", student_name: "Trần Thị Bình", class_group: "Lớp 6A2", avatar: "👧"
  }
];

async function seed() {
  console.log('Seeding Supabase database with standard initial data...');

  const { error: e1 } = await supabase.from('mcq_questions').upsert(DEFAULT_MCQ);
  console.log('MCQ seed status:', e1 ? e1.message : 'SUCCESS');

  const { error: e2 } = await supabase.from('essay_questions').upsert(DEFAULT_ESSAY);
  console.log('Essay seed status:', e2 ? e2.message : 'SUCCESS');

  const { error: e3 } = await supabase.from('students').upsert(DEFAULT_STUDENTS);
  console.log('Students seed status:', e3 ? e3.message : 'SUCCESS');

  const { error: e4 } = await supabase.from('attempt_records').upsert(DEFAULT_HISTORY);
  console.log('History seed status:', e4 ? e4.message : 'SUCCESS');
}

seed().catch(console.error);
