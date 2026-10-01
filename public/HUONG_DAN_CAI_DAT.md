# HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI SỔ TAY CHÍNH TRỊ ĐIỆN TỬ
Đơn vị: Sổ tay chính trị điện tử Quân đội nhân dân Việt Nam

---

## I. YÊU CẦU HỆ THỐNG
1. **Máy tính / Máy chủ mạng LAN nội bộ**:
   - Hệ điều hành: Windows 10/11, Windows Server, Linux (Ubuntu, Debian, CentOS), macOS.
   - Node.js phiên bản 18+ (nếu chạy từ mã nguồn). Hoặc chỉ cần bất kỳ Web Server nào (Nginx, IIS, Apache, Caddy, npx serve) nếu dùng gói Production Build (`so-tay-chinh-tri-dist.zip`).
   - Trình duyệt khuyến nghị: Google Chrome, Microsoft Edge, Firefox, Cốc Cốc.

---

## II. CÁCH 1: TRIỂN KHAI NHANH BẢN PRODUCTION (KHÔNG CẦN CÀI NODE.JS)
Nếu bạn đã tải tệp `so-tay-chinh-tri-dist.zip`:
1. Giải nén tệp `so-tay-chinh-tri-dist.zip` vào thư mục web server (ví dụ `C:\inetpub\wwwroot` hoặc `/var/www/html`).
2. Hoặc trên máy tính có Node.js, chỉ cần mở terminal trong thư mục đã giải nén và chạy:
   ```bash
   npx serve -s . -p 3000
   ```
3. Truy cập địa chỉ: `http://localhost:3000` hoặc IP máy chủ LAN trong đơn vị (ví dụ: `http://192.168.1.100:3000`).
4. Toàn bộ cán bộ, chiến sĩ trong đơn vị kết nối chung mạng LAN hoặc WiFi nội bộ có thể truy cập ngay vào phần mềm.

---

## III. CÁCH 2: CHẠY & PHÁT TRIỂN TỪ MÃ NGUỒN (SOURCE CODE)
Nếu bạn đã tải tệp `so-tay-chinh-tri-dien-tu-source.zip`:
1. Giải nén tệp `so-tay-chinh-tri-dien-tu-source.zip`.
2. Mở cửa sổ dòng lệnh (Terminal / Command Prompt / PowerShell) tại thư mục dự án vừa giải nén.
3. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
4. Khởi chạy máy chủ phát triển nội bộ:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại: `http://localhost:3000`.

5. Đóng gói bản phát hành chính thức khi cần:
   ```bash
   npm run build
   ```
   Thư mục `dist/` tạo ra là bản web tĩnh hoàn chỉnh sẵn sàng đưa lên máy chủ đơn vị.

---

## IV. TÀI KHOẢN HỆ THỐNG MẶC ĐỊNH
- **Tài khoản Quản trị viên (Admin)**:
  - Tên đăng nhập: `admin` (hoặc chọn tài khoản Thượng úy Nguyễn Hữu Đạt)
  - Mật khẩu: `admin123`
  - Quyền hạn: Quản lý đợt thi, ngân hàng câu hỏi trắc nghiệm, kho tài liệu, Lời Bác dạy, âm thanh & video, theo dõi bảng điểm, trích xuất dữ liệu Excel/CSV/JSON.

- **Quân nhân dự thi**:
  - Khi vào mục "Kiểm tra nhận thức trắc nghiệm", quân nhân bắt buộc đăng ký đầy đủ: Họ tên, Cấp bậc, Chức vụ, Đơn vị và chọn Mã đề thi để vào làm bài.
  - Điểm số và thời gian làm bài sẽ được tự động ghi nhận và lưu trữ vào hệ thống.

---

Chúc đồng chí hoàn thành xuất sắc nhiệm vụ học tập chính trị và huấn luyện tại đơn vị!
