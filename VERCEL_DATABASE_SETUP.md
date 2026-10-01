# CẤU HÌNH LƯU TRỮ DÙNG CHUNG TRÊN VERCEL

Phiên bản này chuyển `/api/data`, `/api/version`, `/api/health` và `/api/upload-file` sang Vercel Functions. Dữ liệu và tệp được lưu bền vững trong repository GitHub, thay vì `localStorage` hoặc filesystem tạm của Vercel.

## 1. Tạo GitHub token

Trong GitHub: Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens.

Chỉ cấp quyền cho repository `so-tay-chinh-tri-dien-tu-2`, với quyền `Contents: Read and write`.

Không đưa token vào mã nguồn. Chỉ khai báo trong Vercel Environment Variables.

## 2. Khai báo biến trên Vercel

Project -> Settings -> Environment Variables:

GITHUB_OWNER=trung47f1-lab
GITHUB_REPO=so-tay-chinh-tri-dien-tu-2
GITHUB_BRANCH=main
GITHUB_TOKEN=<token vừa tạo>

Chọn Production, Preview và Development nếu cần.

## 3. Deploy lại

Sau khi lưu biến môi trường, Redeploy production.

## 4. Kiểm tra

Mở:

/api/health

Nếu đúng sẽ trả về JSON có `status: ok` và `storage: github`.

## 5. Lưu ý tệp lớn

API hiện nhận tệp tối đa khoảng 4 MB do giới hạn request của Vercel Functions. Với PDF/Word lớn hơn, nên chuyển riêng phần file sang Vercel Blob hoặc Supabase Storage; database vẫn có thể giữ cấu trúc hiện tại.
