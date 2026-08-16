import { Chapter, Lesson } from '../types';

export const CURRICULUM_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "CHỦ ĐỀ 1: MÁY TÍNH VÀ CỘNG ĐỒNG",
    icon: "fa-desktop",
    summary: "Nghiên cứu về vai trò của thông tin, dữ liệu trong cuộc sống; quá trình xử lí thông tin của máy tính và cách biểu diễn thông tin dưới dạng dãy bit.",
    mindmapNodes: [
      { title: "Thông tin & Dữ liệu", desc: "Thông tin là hiểu biết, Dữ liệu là vật mang thông tin (văn bản, số, hình ảnh, âm thanh)." },
      { title: "Xử lí thông tin", desc: "Sơ đồ: Thu nhận -> Xử lí -> Lưu trữ -> Xuất thông tin." },
      { title: "Dãy Bit", desc: "Máy tính chỉ hiểu kí hiệu 0 và 1. Mỗi kí hiệu 0 hoặc 1 là 1 bit." }
    ]
  },
  {
    id: 2,
    title: "CHỦ ĐỀ 2: MẠNG MÁY TÍNH VÀ INTERNET",
    icon: "fa-network-wired",
    summary: "Khái niệm mạng máy tính, thành phần mạng, lợi ích của Internet và ứng dụng trong học tập, giao tiếp.",
    mindmapNodes: [
      { title: "Mạng máy tính", desc: "Tập hợp các máy tính kết nối truyền thông để chia sẻ dữ liệu và thiết bị." },
      { title: "Thành phần mạng", desc: "Thiết bị đầu cuối, Thiết bị kết nối, Phần mềm mạng." },
      { title: "Internet", desc: "Mạng toàn cầu, không thuộc sở hữu của riêng ai, kho tri thức khổng lồ." }
    ]
  },
  {
    id: 3,
    title: "CHỦ ĐỀ 3: TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN",
    icon: "fa-folder-tree",
    summary: "Sử dụng mạng thông tin toàn cầu (WWW), công cụ tìm kiếm Google, quản lý thư mục và trao đổi qua Thư điện tử (Email).",
    mindmapNodes: [
      { title: "Mạng WWW", desc: "Hệ thống các trang web kết nối qua siêu liên kết (hyperlink)." },
      { title: "Tìm kiếm thông tin", desc: "Sử dụng từ khóa chính xác trên các máy tìm kiếm (Google, Bing...)." },
      { title: "Thư điện tử", desc: "Gửi nhận thư nhanh chóng, đính kèm tệp, yêu cầu tài khoản và mật khẩu." }
    ]
  },
  {
    id: 4,
    title: "CHỦ ĐỀ 4: ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ",
    icon: "fa-shield-halved",
    summary: "An toàn thông tin cá nhân, bảo vệ mật khẩu, ứng xử văn minh trên không gian mạng và phòng tránh tác hại của Internet.",
    mindmapNodes: [
      { title: "Bảo vệ tài khoản", desc: "Mật khẩu mạnh (gồm chữ, số, kí tự đặc biệt), không chia sẻ mật khẩu." },
      { title: "Văn hóa mạng", desc: "Tôn trọng người khác, không lan truyền tin giả, ứng xử lịch sự." },
      { title: "An toàn cá nhân", desc: "Không tự ý đưa thông tin riêng tư, địa chỉ, số điện thoại lên mạng." }
    ]
  },
  {
    id: 5,
    title: "CHỦ ĐỀ 5: ỨNG DỤNG TIN HỌC",
    icon: "fa-file-word",
    summary: "Sử dụng phần mềm Sơ đồ tư duy để tổ chức ý tưởng và Phần mềm Soạn thảo văn bản (Word) để định dạng, trình bày bảng.",
    mindmapNodes: [
      { title: "Sơ đồ tư duy", desc: "Chủ đề chính ở trung tâm, phát triển nhánh phụ bằng từ khóa và hình ảnh." },
      { title: "Soạn thảo văn bản", desc: "Định dạng font, cỡ chữ, màu sắc, căn lề và tạo bảng dữ liệu." },
      { title: "Tìm kiếm & Thay thế", desc: "Công cụ Find (Ctrl+F) và Replace (Ctrl+H) hỗ trợ thao tác nhanh." }
    ]
  },
  {
    id: 6,
    title: "CHỦ ĐỀ 6: GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH",
    icon: "fa-gears",
    summary: "Khái niệm thuật toán, các phương pháp mô tả thuật toán (Liệt kê các bước, Sơ đồ khối) và cấu trúc rẽ nhánh, lặp.",
    mindmapNodes: [
      { title: "Thuật toán", desc: "Dãy các chỉ dẫn rõ ràng, sắp xếp theo thứ tự để giải quyết công việc." },
      { title: "Biểu diễn thuật toán", desc: "Bằng ngôn ngữ tự nhiên (Liệt kê) hoặc Sơ đồ khối (Hình elip, chữ nhật, thoi)." },
      { title: "Cấu trúc điều khiển", desc: "Cấu trúc tuần tự, Rẽ nhánh (Nếu... Thì) và Lặp." }
    ]
  }
];

export const CURRICULUM_LESSONS: Lesson[] = [
  {
    id: 1, chapterId: 1, title: "Bài 1: Thông tin và dữ liệu",
    desc: "Phân biệt khái niệm thông tin, dữ liệu, vật mang thông tin và tầm quan trọng của thông tin trong cuộc sống.",
    keyPoints: [
      "Thông tin là những gì đem lại hiểu biết cho con người.",
      "Dữ liệu là thông tin được ghi lên vật mang thông tin dưới dạng văn bản, số, hình ảnh...",
      "Vật mang thông tin là phương tiện lưu giữ dữ liệu (sách, thẻ nhớ, đĩa CD)."
    ],
    keywords: ["Thông tin", "Dữ liệu", "Vật mang thông tin"]
  },
  {
    id: 2, chapterId: 1, title: "Bài 2: Xử lí thông tin",
    desc: "Tìm hiểu sơ đồ quá trình xử lí thông tin của con người và máy tính.",
    keyPoints: [
      "Sơ đồ 4 bước: Thu nhận -> Xử lí -> Lưu trữ -> Xuất/Truyền thông tin.",
      "CPU trong máy tính thực hiện xử lý dữ liệu tự động theo chương trình."
    ],
    keywords: ["Thu nhận", "Xử lý", "Lưu trữ", "CPU"]
  },
  {
    id: 3, chapterId: 1, title: "Bài 3: Thông tin trong máy tính",
    desc: "Biểu diễn thông tin trong máy tính bằng dãy bit gồm hai kí hiệu 0 và 1.",
    keyPoints: [
      "Máy tính xử lý và lưu trữ thông tin ở dạng dãy bit.",
      "Bit là đơn vị nhỏ nhất (0 hoặc 1). 1 Byte = 8 bit."
    ],
    keywords: ["Dãy Bit", "Byte", "Dung lượng"]
  },
  {
    id: 4, chapterId: 2, title: "Bài 4: Mạng máy tính",
    desc: "Khái niệm mạng máy tính, các thành phần cơ bản và lợi ích của việc nối mạng.",
    keyPoints: [
      "Mạng kết nối từ 2 máy tính trở lên để chia sẻ dữ liệu và thiết bị.",
      "Thành phần: Thiết bị đầu cuối, Thiết bị kết nối, Phần mềm mạng."
    ],
    keywords: ["Mạng máy tính", "Router", "Chia sẻ tài nguyên"]
  },
  {
    id: 5, chapterId: 2, title: "Bài 5: Internet",
    desc: "Tìm hiểu mạng Internet toàn cầu, các đặc điểm và dịch vụ cơ bản.",
    keyPoints: [
      "Internet kết nối hàng triệu máy tính trên toàn thế giới.",
      "Dịch vụ: Tra cứu thông tin, thư điện tử, học trực tuyến."
    ],
    keywords: ["Internet", "Toàn cầu", "Tra cứu"]
  },
  {
    id: 6, chapterId: 3, title: "Bài 6: Mạng thông tin toàn cầu (WWW)",
    desc: "Giới thiệu về World Wide Web, địa chỉ trang web, trình duyệt web và siêu liên kết.",
    keyPoints: [
      "WWW chứa thông tin đa dạng liên kết với nhau qua siêu liên kết.",
      "Trình duyệt web giúp truy cập trang web."
    ],
    keywords: ["WWW", "Trang web", "Trình duyệt", "Siêu liên kết"]
  },
  {
    id: 7, chapterId: 3, title: "Bài 7: Tìm kiếm thông tin trên Internet",
    desc: "Kĩ năng sử dụng máy tìm kiếm và lựa chọn từ khóa chính xác.",
    keyPoints: [
      "Máy tìm kiếm tra cứu thông tin tự động.",
      "Đặt từ khóa trong ngoặc kép \"...\" để tìm kiếm chính xác."
    ],
    keywords: ["Máy tìm kiếm", "Từ khóa", "Google"]
  },
  {
    id: 8, chapterId: 3, title: "Bài 8: Thư điện tử (Email)",
    desc: "Khái niệm thư điện tử, ưu điểm và cách gửi đính kèm tệp.",
    keyPoints: [
      "Gửi nhận thư qua mạng Internet tức thì.",
      "Cấu trúc: tên_người_dùng@tên_miền."
    ],
    keywords: ["Email", "Địa chỉ email", "Tệp đính kèm"]
  },
  {
    id: 9, chapterId: 4, title: "Bài 9: An toàn thông tin trên Internet",
    desc: "Nhận biết các nguy cơ trên mạng, bảo vệ thông tin cá nhân và ứng xử có văn hóa.",
    keyPoints: [
      "Đặt mật khẩu mạnh, không chia sẻ mật khẩu.",
      "Ứng xử tôn trọng và văn minh trên không gian mạng."
    ],
    keywords: ["An toàn thông tin", "Mật khẩu", "Văn hóa số"]
  },
  {
    id: 10, chapterId: 5, title: "Bài 10: Sơ đồ tư duy",
    desc: "Sử dụng sơ đồ tư duy để tổ chức, sắp xếp ý tưởng và ghi nhớ kiến thức.",
    keyPoints: [
      "Kết hợp từ khóa, hình ảnh, màu sắc và đường nối.",
      "Chủ đề chính ở trung tâm, các nhánh phụ tỏa ra."
    ],
    keywords: ["Sơ đồ tư duy", "Chủ đề chính", "Nhánh phụ"]
  },
  {
    id: 11, chapterId: 5, title: "Bài 11: Định dạng văn bản",
    desc: "Thay đổi phông chữ, cỡ chữ, màu sắc và căn lề trong văn bản.",
    keyPoints: [
      "Định dạng ký tự: Font, Size, B, I, U, Color.",
      "Định dạng đoạn văn: Căn lề trái, phải, giữa, đều 2 bên."
    ],
    keywords: ["Soạn thảo văn bản", "Font", "Căn lề"]
  },
  {
    id: 12, chapterId: 5, title: "Bài 12: Trình bày thông tin ở dạng bảng",
    desc: "Tạo bảng, chèn thêm, xóa hàng/cột trong văn bản.",
    keyPoints: [
      "Bảng gồm các Hàng và Cột giao nhau tạo thành Ô.",
      "Trình bày dạng bảng giúp so sánh ngắn gọn, khoa học."
    ],
    keywords: ["Tạo bảng", "Hàng", "Cột", "Ô"]
  },
  {
    id: 13, chapterId: 5, title: "Bài 13: Tìm kiếm và thay thế",
    desc: "Sử dụng công cụ Find & Replace để chỉnh sửa nhanh.",
    keyPoints: [
      "Ctrl + F: Tìm kiếm từ khóa.",
      "Ctrl + H: Thay thế tự động."
    ],
    keywords: ["Find", "Replace", "Ctrl+F"]
  },
  {
    id: 14, chapterId: 6, title: "Bài 14: Thuật toán",
    desc: "Khái niệm thuật toán và các tính chất cơ bản.",
    keyPoints: [
      "Dãy các chỉ dẫn rõ ràng, sắp xếp theo thứ tự để giải quyết công việc.",
      "Các tính chất: Tính xác định, tính dừng, tính đúng đắn."
    ],
    keywords: ["Thuật toán", "Dãy chỉ dẫn", "Tính xác định"]
  },
  {
    id: 15, chapterId: 6, title: "Bài 15: Biểu diễn thuật toán",
    desc: "Mô tả thuật toán bằng phương pháp liệt kê và Sơ đồ khối.",
    keyPoints: [
      "Liệt kê: Dùng ngôn ngữ tự nhiên.",
      "Sơ đồ khối: Hình Elip (Bắt đầu/Kết thúc), Chữ nhật (Thao tác), Thoi (Rẽ nhánh)."
    ],
    keywords: ["Sơ đồ khối", "Hình thoi", "Hình elip"]
  }
];
