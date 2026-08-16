import { ExamAttachment } from '../types';

export const DEFAULT_EXAM_ATTACHMENTS: ExamAttachment[] = [
  {
    id: 'exam-att-1',
    name: 'De_Kiem_Tra_Dinh_Ky_Tin_Hoc_6_HK1.pdf',
    title: 'Đề Kiểm Tra Định Kỳ 45 Phút - Học Kỳ 1 (Chuẩn Ma Trận Bộ GD&ĐT)',
    fileType: 'pdf',
    fileSize: '345 KB',
    uploadedAt: '15/08/2026, 08:30:00',
    uploadedBy: 'Cô Phạm Thị Kim Phượng - GV Tin Học',
    targetChapters: [1, 2, 3],
    description:
      'Đề thi chính thức định kỳ 45 phút gồm 15 câu trắc nghiệm (7.5 điểm) và 2 câu tự luận (2.5 điểm), bao phủ Chủ đề 1, 2 và 3.',
    durationMinutes: 45,
    totalPoints: 10,
    textContent: `TRƯỜNG THCS NGUYỄN BÁ LOAN
TỔ KHOA HỌC TỰ NHIÊN - TIN HỌC 6
NĂM HỌC: 2026 - 2027

ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TIN HỌC 6 - HỌC KỲ 1
Thời gian làm bài: 45 phút (Không kể thời gian phát đề)
Giáo viên ra đề: Phạm Thị Kim Phượng
-------------------------------------------------------------

PHẦN I. TRẮC NGHIỆM KHÁCH QUAN (7.5 ĐIỂM - 15 CÂU)
(Mỗi câu trả lời đúng được 0.5 điểm)

Câu 1: Thông tin là gì?
A. Là những gì đem lại hiểu biết cho con người về thế giới xung quanh và về chính bản thân mình.
B. Là các văn bản, hình ảnh, âm thanh được lưu trữ trong máy tính.
C. Là các con số và phép tính toán học.
D. Là chương trình được cài đặt trên máy tính.

Câu 2: Vật mang tin là gì?
A. Phương tiện được dùng để lưu trữ và truyền đạt thông tin.
B. Các dây cáp mạng và sóng Wi-Fi.
C. Bộ nhớ trong của máy tính (RAM, ROM).
D. Màn hình và máy in của máy tính.

Câu 3: Đơn vị cơ bản nhỏ nhất dùng để đo lượng thông tin trong máy tính là gì?
A. Byte
B. Bit
C. Kilobyte (KB)
D. Megabyte (MB)

Câu 4: 1 Byte (B) bằng bao nhiêu bit?
A. 4 bit
B. 8 bit
C. 10 bit
D. 1024 bit

Câu 5: Mạng máy tính là gì?
A. Là tập hợp các máy tính được nối với nhau để có thể truyền thông tin cho nhau.
B. Là một chiếc máy tính cá nhân có kết nối Internet.
C. Là phần mềm dùng để lướt web trên máy tính.
D. Là tập hợp các thiết bị lưu trữ dữ liệu ngoài.

Câu 6: Thiết bị nào sau đây KHÔNG PHẢI là thiết bị kết nối mạng?
A. Cáp mạng (Cáp xoắn, cáp quang)
B. Bộ chia tín hiệu mạng (Switch/Hub)
C. Bộ định tuyến không dây (Access Point / Router Wi-Fi)
D. Máy scan hình ảnh cầm tay

Câu 7: Mạng toàn cầu kết nối hàng triệu máy tính trên khắp thế giới được gọi là:
A. Mạng LAN (Local Area Network)
B. Internet
C. Mạng nội bộ trường học
D. Mạng Bluetooth

Câu 8: World Wide Web (WWW) là gì?
A. Là mạng lưới các trang thông tin đa phương tiện được liên kết với nhau trên Internet.
B. Là tên một loại máy tính đời mới.
C. Là trình duyệt web của Google.
D. Là nhà cung cấp dịch vụ Internet.

Câu 9: Để truy cập một trang web, người dùng cần nhập địa chỉ trang web vào phần mềm nào?
A. Phần mềm soạn thảo văn bản
B. Trình duyệt web (Web Browser như Chrome, Edge, Firefox)
C. Phần mềm diệt virus
D. Phần mềm bảng tính Excel

Câu 10: Máy tìm kiếm (Search Engine) phổ biến nhất hiện nay là gì?
A. Google Search
B. Microsoft Word
C. Adobe Acrobat Reader
D. Paint 3D

Câu 11: Thư điện tử (Email) mang lại lợi ích gì so với thư truyền thống?
A. Thời gian gửi và nhận gần như tức thời, chi phí rất thấp.
B. Có thể đính kèm nhiều định dạng tệp (văn bản, ảnh, âm thanh).
C. Có thể gửi đồng thời cho nhiều người cùng lúc.
D. Cả A, B và C đều đúng.

Câu 12: Mật khẩu an toàn cho tài khoản cá nhân cần đảm bảo yếu tố nào?
A. Có độ dài tối thiểu từ 8 ký tự trở lên, gồm cả chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
B. Đặt theo ngày tháng năm sinh hoặc số điện thoại của mình.
C. Sử dụng các từ đơn giản như 123456 hoặc password.
D. Chia sẻ mật khẩu cho tất cả bạn bè trong lớp biết.

Câu 13: Khi sử dụng Internet, hành vi nào sau đây là KHÔNG an toàn?
A. Nhấp vào các liên kết lạ, thư rác gửi từ người không quen biết.
B. Tải phần mềm từ các trang web không rõ nguồn gốc.
C. Cung cấp thông tin cá nhân (địa chỉ nhà, số CCCD bố mẹ) trên mạng xã hội.
D. Cả A, B và C đều là hành vi không an toàn.

Câu 14: Sơ đồ tư duy (Mindmap) là công cụ hữu ích dùng để:
A. Biểu diễn thông tin trực quan, tóm tắt bài học và phát triển ý tưởng.
B. Tính toán các phép cộng trừ nhanh hơn máy tính.
C. Soạn nhạc và chỉnh sửa video chuyên nghiệp.
D. Quét mã QR code trên điện thoại.

Câu 15: Phần mềm nào sau đây thường được dùng để vẽ sơ đồ tư duy trên máy tính?
A. MindMaple Lite, XMind, Mindmeister
B. Paint, Photoshop
C. Microsoft Word
D. Calculator

PHẦN II. TỰ LUẬN (2.5 ĐIỂM - 2 CÂU)

Câu 1 (1.25 điểm):
Em hãy nêu khái niệm về Mạng máy tính và kể tên 4 thành phần cơ bản của một mạng máy tính?

Câu 2 (1.25 điểm):
Để bảo vệ an toàn thông tin cá nhân khi tham gia học tập và giao lưu trên môi trường Internet, em cần tuân thủ những quy tắc bảo mật nào? Hãy nêu ít nhất 3 lời khuyên cụ thể.

------------------- HẾT -------------------
(Cán bộ coi thi không giải thích gì thêm)`,
  },
  {
    id: 'exam-att-2',
    name: 'De_Cuong_On_Tap_Va_De_Minh_Hoa_Giua_Ky_1.docx',
    title: 'Đề Cương Ôn Tập & Đề Minh Họa Giữa Kỳ 1 (Chủ Đề 1 & 2)',
    fileType: 'docx',
    fileSize: '210 KB',
    uploadedAt: '12/08/2026, 14:20:00',
    uploadedBy: 'Cô Phạm Thị Kim Phượng - GV Tin Học',
    targetChapters: [1, 2],
    description:
      'Tài liệu ôn tập trọng tâm các kiến thức Thông tin và Dữ liệu, Mạng máy tính và Internet kèm đề minh họa có hướng dẫn tự học.',
    durationMinutes: 45,
    totalPoints: 10,
    textContent: `TRƯỜNG THCS NGUYỄN BÁ LOAN
TÀI LIỆU ÔN TẬP VÀ ĐỀ MINH HỌA GIỮA HỌC KỲ 1
MÔN: TIN HỌC 6 (BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG)

A. TÓM TẮT KIẾN THỨC TRỌNG TÂM
1. CHỦ ĐỀ 1: MÁY TÍNH VÀ CỘNG ĐỒNG
- Thông tin là gì? Dữ liệu là gì? Vật mang tin là gì?
- Biểu diễn thông tin trong máy tính: Dãy bit gồm các ký hiệu 0 và 1.
- Các bội số của Byte: Byte (B) -> Kilobyte (KB) -> Megabyte (MB) -> Gigabyte (GB) -> Terabyte (TB). (Mỗi đơn vị cách nhau 1024 lần).

2. CHỦ ĐỀ 2: MẠNG MÁY TÍNH VÀ INTERNET
- Khái niệm Mạng máy tính: Các thiết bị đầu cuối, thiết bị kết nối, phần mềm mạng.
- Phân loại mạng có dây và mạng không dây (Wi-Fi, sóng điện từ).
- Các dịch vụ phổ biến trên Internet: Tìm kiếm thông tin (Google), Thư điện tử (Gmail), Trao đổi dữ liệu, Học trực tuyến.

B. ĐỀ MINH HỌA TỰ LUYỆN TẬP
(Học sinh in tài liệu hoặc chép bài ra vở tự rèn luyện trước khi thi)`,
  },
  {
    id: 'exam-att-3',
    name: 'De_Thi_Thu_Hoc_Ky_2_Chu_De_4_5_6.pdf',
    title: 'Đề Thi Thử Học Kỳ 2 - Soạn Thảo, Trình Chiếu & Thuật Toán',
    fileType: 'pdf',
    fileSize: '418 KB',
    uploadedAt: '10/08/2026, 10:15:00',
    uploadedBy: 'Cô Phạm Thị Kim Phượng - GV Tin Học',
    targetChapters: [4, 5, 6],
    description:
      'Đề thi thử học kỳ 2 tập trung vào kỹ năng Ứng dụng Tin học (Soạn thảo văn bản Word, Bài trình chiếu PowerPoint) và Giải quyết vấn đề với thuật toán.',
    durationMinutes: 45,
    totalPoints: 10,
    textContent: `TRƯỜNG THCS NGUYỄN BÁ LOAN
ĐỀ THI THỬ HỌC KỲ 2 - TIN HỌC LỚP 6
Thời gian làm bài: 45 phút
Chủ đề kiểm tra: Chủ đề 4, 5 và 6
-------------------------------------------------

I. TRẮC NGHIỆM (15 CÂU - 7.5 ĐIỂM)
1. Đâu là định dạng phần mở rộng của tệp văn bản Microsoft Word? (.docx)
2. Thao tác căn lề giữa trong soạn thảo văn bản dùng tổ hợp phím nào? (Ctrl + E)
3. Phần mềm tạo bài trình chiếu thông dụng là gì? (Microsoft PowerPoint)
4. Sơ đồ khối dùng hình khối nào để biểu diễn bước bắt đầu hoặc kết thúc? (Hình Elip / Oval)
5. Thuật toán là gì? (Là một dãy hữu hạn các chỉ dẫn rõ ràng nhằm giải quyết một bài toán).

II. TỰ LUẬN (2 CÂU - 2.5 ĐIỂM)
Câu 1 (1.5đ): Em hãy vẽ hoặc mô tả sơ đồ khối của thuật toán tính tổng 2 số nguyên a và b nhập từ bàn phím?
Câu 2 (1.0đ): Nêu các bước chèn hình ảnh vào một trang chiếu trong PowerPoint và điều chỉnh kích thước cho phù hợp?`,
  },
  {
    id: 'exam-att-4',
    name: 'Huong_Dan_Cham_Va_Dap_An_Chi_Tiet_De_Dinh_Ky.pdf',
    title: 'Hướng Dẫn Chấm & Đáp Án Chi Tiết Đề Thi Thử Định Kỳ (Biểu Điểm 10)',
    fileType: 'pdf',
    fileSize: '290 KB',
    uploadedAt: '14/08/2026, 16:45:00',
    uploadedBy: 'Cô Phạm Thị Kim Phượng - GV Tin Học',
    targetChapters: [1, 2, 3, 4, 5, 6],
    description:
      'Đáp án 15 câu trắc nghiệm và thang điểm chi tiết cho các câu hỏi tự luận để học sinh tự chấm và đối chiếu kết quả.',
    durationMinutes: 45,
    totalPoints: 10,
    textContent: `TRƯỜNG THCS NGUYỄN BÁ LOAN
HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM ĐỀ THI THỬ TIN HỌC 6
Giáo viên: Phạm Thị Kim Phượng
-------------------------------------------------

A. ĐÁP ÁN PHẦN TRẮC NGHIỆM (7.5 ĐIỂM - Mỗi câu 0.5 điểm)
1. A | 2. A | 3. B | 4. B | 5. A
6. D | 7. B | 8. A | 9. B | 10. A
11. D | 12. A | 13. D | 14. A | 15. A

B. ĐÁP ÁN VÀ BIỂU ĐIỂM PHẦN TỰ LUẬN (2.5 ĐIỂM)
Câu 1 (1.25 điểm):
- Nêu đúng khái niệm mạng máy tính (0.5 điểm)
- Kể đúng 4 thành phần cơ bản: Thiết bị đầu cuối, Thiết bị kết nối, Môi trường truyền dẫn, Phần mềm mạng (Mỗi ý 0.1875 điểm - Tổng 0.75 điểm).

Câu 2 (1.25 điểm):
Nêu được ít nhất 3 lời khuyên bảo mật an toàn:
1. Đặt mật khẩu mạnh và không chia sẻ cho người khác (0.4 điểm).
2. Không nhấp vào đường link lạ, thư rác hoặc tải file không rõ nguồn (0.4 điểm).
3. Không cung cấp thông tin cá nhân quan trọng trên mạng xã hội (0.45 điểm).`,
  },
];
