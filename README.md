# SỔ TAY CHÍNH TRỊ ĐIỆN TỬ
### Ứng dụng số hóa công tác giáo dục chính trị, quản lý tư tưởng và thi trắc nghiệm tại đơn vị cơ sở

---

## 1. Giới thiệu tổng quan
**Sổ tay Chính trị Điện tử** là hệ thống phần mềm chuyên trách phục vụ công tác Đảng, công tác chính trị trong Quân đội nhân dân Việt Nam. Ứng dụng hoạt động độc lập, bảo mật cao, tương thích hoàn toàn trên môi trường máy chủ mạng nội bộ (LAN / Intranet), máy tính và thiết bị di động (Smart device / Máy tính bảng).

### 8 Phân hệ nghiệp vụ chính:
1. **Trang chủ & Tổng quan chính trị**: Bản tin ngày, thông điệp truyền thống, chuyên đề giáo dục trọng tâm.
2. **Kho Văn kiện & Tài liệu**: Hệ thống văn kiện Đảng, Nhà nước, Quân đội; 10 lời thề danh dự, 12 điều kỷ luật khi tiếp xúc nhân dân.
3. **Mỗi ngày một lời Bác dạy & Một câu hỏi nhận thức**: Học tập tấm gương đạo đức Hồ Chí Minh, tự giác rèn luyện.
4. **Hỏi nhanh nhận thức (Flashcard)**: Ôn luyện kiến thức cốt lõi bằng thẻ ghi nhớ thông minh.
5. **Kiểm tra trắc nghiệm & Đề thi tự động**:
   - Quản trị viên (Admin) tạo đợt kiểm tra, quy định số lượng đề, thời gian làm bài.
   - Tự động rút ngẫu nhiên câu hỏi từ ngân hàng câu hỏi.
   - Đảo ngẫu nhiên thứ tự câu hỏi và thứ tự 4 đáp án A, B, C, D.
   - Chấm điểm tự động, hiện báo cáo đáp án đúng/sai từng câu và căn cứ lý luận.
   - Lưu trữ bài thi đã làm của từng quân nhân, thống kê kết quả toàn đơn vị.
6. **Dòng thời gian Lịch sử & Truyền thống**: Quản trị viên cập nhật các mốc son lịch sử vẻ vang của đơn vị.
7. **Số hóa Mã QR Chính trị**: Tạo, quét và in ấn bảng mã QR dán tại bảng tin đại đội, phòng sinh hoạt chung.
8. **Bảng điều khiển Quản trị (Admin Dashboard)**: Giám sát toàn diện, phân quyền bảo mật, sao lưu và phục hồi dữ liệu dạng JSON.

---

## 2. Tài khoản truy cập mặc định
- **Thành viên đơn vị / Cán bộ, Chiến sĩ**: Tự do học tập, tra cứu tài liệu, làm bài kiểm tra nhận thức mà không cần đăng nhập. Thành viên không có quyền chỉnh sửa, thêm mới hay xóa dữ liệu.
- **Tài khoản Quản trị viên (Admin)**:
  - Tài khoản: `admin`
  - Mật khẩu: `admin123`
  - Quyền hạn: Thêm, sửa, xóa tài liệu, câu hỏi, đề thi trắc nghiệm, mốc truyền thống, xem chi tiết bài làm của thí sinh và sao lưu hệ thống.

---

## 3. Hướng dẫn cài đặt và vận hành

### Yêu cầu môi trường:
- Node.js phiên bản 18 trở lên (khuyên dùng Node.js 20 LTS).
- Trình quản lý gói: `npm`, `yarn` hoặc `pnpm`.

### Các bước cài đặt:
1. Giải nén tệp mã nguồn dự án vào thư mục làm việc:
   ```bash
   unzip so-tay-chinh-tri-dien-tu-source.zip
   cd so-tay-chinh-tri-dien-tu
   ```

2. Cài đặt các gói phụ thuộc (Dependencies):
   ```bash
   npm install
   ```

3. Khởi chạy máy chủ phát triển (Development):
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc cổng được hiển thị trong terminal).

4. Đóng gói triển khai sản xuất (Production Build):
   ```bash
   npm run build
   ```
   Thư mục `dist/` sau khi build có thể triển khai lên bất kỳ Web Server nào (Nginx, Apache, IIS trên mạng LAN nội bộ) hoặc chạy với lệnh:
   ```bash
   npm run preview
   ```

---

## 4. Cấu trúc thư mục mã nguồn
```
so-tay-chinh-tri-dien-tu/
├── index.html              # Điểm khởi đầu HTML của ứng dụng
├── package.json            # Cấu hình dự án và danh sách thư viện
├── tsconfig.json           # Cấu hình trình biên dịch TypeScript
├── vite.config.ts          # Cấu hình Vite build tool
├── README.md               # Tài liệu hướng dẫn sử dụng và triển khai
├── public/                 # Thư mục tài nguyên tĩnh
└── src/
    ├── App.tsx             # Component gốc quản lý layout và điều hướng
    ├── main.tsx            # Điểm nạp React DOM
    ├── index.css           # Cấu hình Tailwind CSS và font chữ
    ├── types/              # Định nghĩa cấu trúc dữ liệu TypeScript (DeThi, KetQua, TaiLieu...)
    ├── data/               # Dữ liệu ban đầu chuẩn hóa (initialData.ts)
    ├── context/            # Quản lý trạng thái và lưu trữ LocalStorage (AppContext.tsx)
    └── components/         # Các phân hệ giao diện người dùng
        ├── Header.tsx            # Thanh điều hướng và đăng nhập Admin
        ├── HomeOverview.tsx      # Phân hệ 1: Tổng quan trang chủ
        ├── DocumentLibrary.tsx   # Phân hệ 2: Kho tài liệu & văn kiện
        ├── DailyContentBanner.tsx# Phân hệ 3: Lời Bác dạy & nội dung mỗi ngày
        ├── FlashcardsView.tsx    # Phân hệ 4: Hỏi nhanh Flashcard
        ├── QuizSection.tsx       # Phân hệ 5: Trắc nghiệm, thi tính giờ & xem lại bài thi
        ├── TraditionTimeline.tsx # Phân hệ 6: Dòng thời gian lịch sử & truyền thống
        ├── PoliticalQRManager.tsx# Phân hệ 7: Số hóa & quản lý mã QR
        ├── AdminDashboard.tsx    # Phân hệ 8: Bảng điều khiển Quản trị viên
        ├── LoginModal.tsx        # Cửa sổ đăng nhập Quản trị viên
        ├── ExportModal.tsx       # Cửa sổ xuất file, tải mã nguồn & sao lưu
        └── AudioPlayerBar.tsx    # Trình phát thanh tuyên truyền
```

---
*Bản quyền phát triển phục vụ công tác Đảng, công tác chính trị trong Quân đội nhân dân Việt Nam.*
