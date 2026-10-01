import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, Download, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

export const PrintQRModal: React.FC = () => {
  const { selectedQRCodeForPrint, setSelectedQRCodeForPrint } = useApp();
  const [qrImgUrl, setQrImgUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sotay-chinhtri.internal';
  const targetPath = selectedQRCodeForPrint?.duong_dan_noi_bo 
    ? (selectedQRCodeForPrint.duong_dan_noi_bo.startsWith('/') ? selectedQRCodeForPrint.duong_dan_noi_bo : `/${selectedQRCodeForPrint.duong_dan_noi_bo}`)
    : '/';
  const fullUrl = `${origin}${targetPath}`;

  useEffect(() => {
    if (!selectedQRCodeForPrint) return;
    QRCode.toDataURL(
      fullUrl,
      { width: 450, margin: 2, color: { dark: '#000000', light: '#ffffff' } },
      (err, url) => {
        if (!err && url) setQrImgUrl(url);
      }
    );
  }, [selectedQRCodeForPrint, fullUrl]);

  if (!selectedQRCodeForPrint) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-300 overflow-hidden my-auto flex flex-col">
        
        {/* Top bar (Hidden when printing) */}
        <div className="no-print bg-stone-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>{selectedQRCodeForPrint.loai === 'de_thi' ? 'Mã QR Vào Phòng Thi Trực Tiếp' : 'Xem trước bản in dán bảng tin'}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                copiedLink 
                  ? 'bg-emerald-800 border-emerald-600 text-white' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
              title="Sao chép đường dẫn trực tiếp"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedLink ? 'Đã sao chép link!' : 'Sao chép link thi'}</span>
            </button>
            {qrImgUrl && (
              <a
                href={qrImgUrl}
                download={`${selectedQRCodeForPrint.ma_dinh_danh}.png`}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
                title="Tải ảnh mã QR về máy (.png)"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải ảnh QR</span>
              </a>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In bản niêm yết</span>
            </button>
            <button
              onClick={() => setSelectedQRCodeForPrint(null)}
              className="p-1 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE MILITARY POSTER TEMPLATE */}
        <div className="p-8 text-center space-y-5 bg-white border border-stone-200 m-4 rounded-xl">
          
          {/* Military Unit Header */}
          <div className="border-b-2 border-red-900 pb-4 space-y-1">
            <div className="text-xs font-bold text-red-900 tracking-widest uppercase">
              QUÂN ĐỘI NHÂN DÂN VIỆT NAM
            </div>
            <div className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              TRUNG ĐOÀN 1 — ĐOÀN BA GIA ANH HÙNG
            </div>
            <div className="text-[11px] text-stone-600 font-medium italic">
              Đơn vị Vững mạnh Toàn diện "Mẫu mực, tiêu biểu"
            </div>
          </div>

          {/* Title of the QR item */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              SỔ TAY CHÍNH TRỊ ĐIỆN TỬ · ĐIỂM QUÉT NHANH
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-doc text-stone-900 leading-snug">
              {selectedQRCodeForPrint.tieu_de}
            </h2>
            <div className="text-xs text-stone-500 font-mono">
              Mã số định danh: <span className="font-bold text-stone-900">{selectedQRCodeForPrint.ma_dinh_danh}</span>
            </div>
          </div>

          {/* High resolution QR Code */}
          <div className="py-2">
            <div className="inline-block p-4 border-2 border-stone-900 rounded-2xl bg-white shadow-xs">
              {qrImgUrl ? (
                <img
                  src={qrImgUrl}
                  alt={selectedQRCodeForPrint.tieu_de}
                  className="w-56 h-56 sm:w-64 sm:h-64 mx-auto"
                />
              ) : (
                <div className="w-56 h-56 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                  Đang sinh mã QR...
                </div>
              )}
            </div>
          </div>

          {/* Step Instructions for Soldiers */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs text-stone-700 space-y-1.5">
            <span className="font-bold text-red-900 block text-center uppercase tracking-wider text-[11px] mb-2">
              {selectedQRCodeForPrint.loai === 'de_thi' ? 'HƯỚNG DẪN THÍ SINH DỰ THI TRỰC TIẾP:' : 'HƯỚNG DẪN QUÂN NHÂN THỰC HIỆN:'}
            </span>
            {selectedQRCodeForPrint.loai === 'de_thi' ? (
              <>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">1.</span>
                  <span>Bật camera điện thoại thông minh quét mã QR để truy cập trực tiếp vào phòng thi.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">2.</span>
                  <span>Nhập đầy đủ Họ tên, Cấp bậc, Chức vụ, Đơn vị để kích hoạt quyền làm bài.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">3.</span>
                  <span>Làm bài nghiêm túc, không sao chép hoặc dùng AI. Hệ thống tự động thu bài khi hết thời gian.</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">1.</span>
                  <span>Bật camera điện thoại hoặc mở ứng dụng Sổ tay Chính trị trong mạng LAN đơn vị.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">2.</span>
                  <span>Hướng camera vào mã QR để mở thẳng nội dung tài liệu hoặc bài kiểm tra nhận thức.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-900">3.</span>
                  <span>Đọc kỹ văn bản, nghe bài giảng và thực hiện bài trắc nghiệm củng cố kiến thức.</span>
                </div>
              </>
            )}
          </div>

          {/* Placement Notice */}
          <div className="text-[11px] text-stone-500 italic pt-2">
            Vị trí niêm yết: {selectedQRCodeForPrint.vi_tri_dan} · Ngày ban hành: {selectedQRCodeForPrint.ngay_tao}
          </div>

        </div>

      </div>
    </div>
  );
};
