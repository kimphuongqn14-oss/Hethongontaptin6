import { MCQQuestion, EssayQuestion } from '../types';

export const DEFAULT_QUESTION_BANK_MCQ: MCQQuestion[] = [
  {
    id: 101, lessonId: 1, chapterId: 1, level: "Nhận biết",
    question: "Vật mang thông tin là gì?",
    options: [
      "A. Là những gì đem lại hiểu biết cho con người.",
      "B. Là phương tiện dùng để lưu giữ và truyền tải dữ liệu.",
      "C. Là các con số lưu trong máy tính.",
      "D. Là âm thanh phát ra từ loa."
    ],
    correctAnswer: 1,
    explanation: "Vật mang thông tin là phương tiện lưu giữ dữ liệu như cuốn sách, tờ giấy, đĩa CD, thẻ nhớ..."
  },
  {
    id: 102, lessonId: 1, chapterId: 1, level: "Thông hiểu",
    question: "Trường hợp nào sau đây là DỮ LIỆU?",
    options: [
      "A. Sự hiểu biết của em về lịch sử.",
      "B. Con số 38°C ghi trên nhiệt kế.",
      "C. Ý nghĩ trong đầu em.",
      "D. Cảm giác lạnh khi mùa đông về."
    ],
    correctAnswer: 1,
    explanation: "Con số ghi trên nhiệt kế là dữ liệu (dạng số)."
  },
  {
    id: 103, lessonId: 3, chapterId: 1, level: "Thông hiểu",
    question: "1 Byte bằng bao nhiêu bit?",
    options: ["A. 2 bit", "B. 8 bit", "C. 10 bit", "D. 1024 bit"],
    correctAnswer: 1,
    explanation: "Theo quy ước quốc tế trong tin học, 1 Byte = 8 bit."
  },
  {
    id: 104, lessonId: 4, chapterId: 2, level: "Nhận biết",
    question: "Quan sát sơ đồ bên dưới, mô hình mạng máy tính kết nối các máy tính qua thiết bị trung tâm là gì?",
    imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180"><rect width="100%" height="100%" fill="%23f8fafc" rx="16"/><rect x="40" y="35" width="80" height="55" rx="8" fill="%232563eb"/><text x="80" y="68" fill="white" font-size="12" font-weight="bold" text-anchor="middle">Máy tính A</text><rect x="280" y="35" width="80" height="55" rx="8" fill="%232563eb"/><text x="320" y="68" fill="white" font-size="12" font-weight="bold" text-anchor="middle">Máy tính B</text><circle cx="200" cy="125" r="28" fill="%23059669"/><text x="200" y="129" fill="white" font-size="10" font-weight="bold" text-anchor="middle">Switch/Hub</text><line x1="80" y1="90" x2="180" y2="115" stroke="%2364748b" stroke-width="3"/><line x1="320" y1="90" x2="220" y2="115" stroke="%2364748b" stroke-width="3"/><text x="200" y="24" fill="%231e293b" font-size="12" font-weight="bold" text-anchor="middle">Sơ Đồ Kết Nối Mạng Máy Tính Tối Giản</text></svg>`,
    options: [
      "A. Mạng máy tính đơn lẻ không kết nối.",
      "B. Mạng máy tính kết nối trao đổi dữ liệu qua thiết bị mạng trung tâm.",
      "C. Mạng điện ba pha gia đình.",
      "D. Hệ thống truyền hình cáp đơn hướng."
    ],
    correctAnswer: 1,
    explanation: "Sơ đồ thể hiện hai hoặc nhiều máy tính kết nối thông qua thiết bị trung tâm (Switch/Hub) để chia sẻ tài nguyên."
  },
  {
    id: 105, lessonId: 7, chapterId: 3, level: "Vận dụng",
    question: "Để tìm kiếm chính xác cụm từ 'Tin học lớp 6', em nhập như thế nào?",
    options: ["A. Tin học lớp 6", "B. \"Tin học lớp 6\"", "C. Tin_học_lớp_6", "D. [Tin học lớp 6]"],
    correctAnswer: 1,
    explanation: "Đặt từ khóa trong cặp dấu ngoặc kép \"...\" giúp máy tìm kiếm chính xác cụm từ."
  },
  {
    id: 106, lessonId: 9, chapterId: 4, level: "Vận dụng",
    question: "Mật khẩu nào sau đây được coi là MẬT KHẨU MẠNH?",
    options: ["A. 12345678", "B. nguyenvanA", "C. TinHoc6@2026!", "D. 11111111"],
    correctAnswer: 2,
    explanation: "Mật khẩu mạnh kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
  },
  {
    id: 107, lessonId: 11, chapterId: 5, level: "Nhận biết",
    question: "Nút lệnh biểu tượng chữ B (Bold) dùng để làm gì?",
    options: ["A. In nghiêng chữ", "B. Gạch chân chữ", "C. In đậm chữ", "D. Đổi màu chữ"],
    correctAnswer: 2,
    explanation: "B = Bold (In đậm), I = Italic (In nghiêng), U = Underline (Gạch chân)."
  },
  {
    id: 108, lessonId: 15, chapterId: 6, level: "Nhận biết",
    question: "Trong Sơ đồ khối, HÌNH THOI thể hiện điều gì?",
    options: ["A. Bắt đầu/Kết thúc", "B. Thao tác xử lý", "C. Điều kiện rẽ nhánh", "D. Quy trình nhập"],
    correctAnswer: 2,
    explanation: "Hình thoi trong sơ đồ khối thể hiện điều kiện kiểm tra rẽ nhánh."
  },
  {
    id: 109, lessonId: 2, chapterId: 1, level: "Thông hiểu",
    question: "Bộ phận nào trong máy tính đóng vai trò là 'bộ não' xử lý dữ liệu?",
    options: ["A. Bàn phím", "B. Màn hình", "C. Bộ xử lý trung tâm (CPU)", "D. Chuột máy tính"],
    correctAnswer: 2,
    explanation: "CPU (Central Processing Unit) thực hiện các phép tính và xử lý thông tin trong máy tính."
  },
  {
    id: 110, lessonId: 5, chapterId: 2, level: "Nhận biết",
    question: "Internet là gì?",
    options: [
      "A. Mạng máy tính nội bộ của một trường học.",
      "B. Mạng kết nối hàng triệu máy tính trên toàn thế giới.",
      "C. Mạng không dây trong nhà.",
      "D. Phần mềm soạn thảo văn bản."
    ],
    correctAnswer: 1,
    explanation: "Internet là hệ thống thông tin toàn cầu kết nối vô số mạng máy tính lại với nhau."
  },
  {
    id: 111, lessonId: 8, chapterId: 3, level: "Thông hiểu",
    question: "Địa chỉ email nào sau đây có cú pháp đúng quy định?",
    options: [
      "A. nguyenvanan@gmail.com",
      "B. nguyenvanan.gmail.com",
      "C. nguyenvanan#gmail.com",
      "D. nguyenvanan gmail com"
    ],
    correctAnswer: 0,
    explanation: "Địa chỉ email chuẩn gồm <tên_người_dùng>@<tên_miền_dịch_vụ>."
  },
  {
    id: 112, lessonId: 10, chapterId: 5, level: "Vận dụng",
    question: "Ưu điểm lớn nhất của Sơ đồ tư duy trong học tập là gì?",
    options: [
      "A. Giúp viết đoạn văn dài hơn.",
      "B. Tổ chức kiến thức trực quan, dễ nhớ bằng hình ảnh và từ khóa.",
      "C. Tự động sửa lỗi chính tả.",
      "D. Tính toán các con số tự động."
    ],
    correctAnswer: 1,
    explanation: "Sơ đồ tư duy kết hợp từ khóa, màu sắc và đường nối giúp não bộ ghi nhớ kiến thức tốt hơn."
  }
];

export const DEFAULT_QUESTION_BANK_ESSAY: EssayQuestion[] = [
  {
    id: 201, chapterId: 1, lessonId: 1, title: "Phân biệt Thông tin, Dữ liệu và Vật mang thông tin",
    question: "Em hãy nêu ví dụ thực tế về một tình huống có đầy đủ 3 yếu tố: Thông tin, Dữ liệu và Vật mang thông tin.",
    hint: "Gợi ý: Hãy nghĩ về cuốn sách giáo khoa hoặc nhiệt kế đo nhiệt độ.",
    sampleAnswer: "Ví dụ: Cuốn sách giáo khoa Tin học 6.\n- Dữ liệu: Các dòng chữ, con số, hình ảnh in trên trang sách.\n- Vật mang thông tin: Các trang giấy.\n- Thông tin: Sự hiểu biết của học sinh về tin học sau khi đọc sách."
  },
  {
    id: 202, chapterId: 2, lessonId: 4, title: "Lợi ích của Mạng máy tính",
    question: "Mạng máy tính đem lại những lợi ích gì cho học sinh và giáo viên?",
    hint: "Gợi ý: Chia sẻ dữ liệu, dùng chung máy in, trao đổi bài trực tuyến.",
    sampleAnswer: "Các lợi ích chính:\n1. Chia sẻ dữ liệu nhanh chóng.\n2. Dùng chung thiết bị (như máy in phòng máy).\n3. Giao tiếp, trao đổi bài học trực tuyến dễ dàng."
  },
  {
    id: 203, chapterId: 4, lessonId: 9, title: "Quy tắc an toàn trên mạng",
    question: "Em hãy liệt kê 3 việc NÊN LÀM và 3 việc KHÔNG NÊN LÀM khi sử dụng Internet.",
    hint: "Gợi ý: Nghĩ về bảo vệ mật khẩu, ứng xử văn minh, và đăng ảnh thông tin cá nhân.",
    sampleAnswer: "NÊN LÀM:\n1. Đặt mật khẩu mạnh và giữ bí mật.\n2. Ứng xử lịch sự, tôn trọng người khác trên mạng.\n3. Hỏi ý kiến cha mẹ/thầy cô khi gặp thông tin lạ.\n\nKHÔNG NÊN LÀM:\n1. Không tự ý chia sẻ địa chỉ nhà, số điện thoại lên mạng xã hội.\n2. Không bấm vào các liên kết lạ hoặc mở tệp đính kèm không rõ nguồn gốc.\n3. Không lan truyền thông tin sai sự thật hoặc bắt nạt người khác."
  }
];
