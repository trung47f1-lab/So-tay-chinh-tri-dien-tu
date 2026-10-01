import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeItem, LoaiQRCode } from '../types';
import { 
  QrCode, 
  Printer, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  CheckCircle2, 
  Share2, 
  Smartphone,
  ScanLine
} from 'lucide-react';
import QRCode from 'qrcode';

export const PoliticalQRManager: React.FC = () => {
  const { 
    qrCodes, 
    addQRCode, 
    deleteQRCode, 
    setSelectedQRCodeForPrint, 
    chuyenDe, 
    taiLieu, 
    deThi,
    currentUser,
    handleQRNavigation
  } = useApp();

  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Generate QR image data URLs for all items
  useEffect(() => {
    qrCodes.forEach(item => {
      const fullUrl = `https://sotay-chinhtri.internal${item.duong_dan_noi_bo}`;
      QRCode.toDataURL(
        fullUrl, 
        { width: 300, margin: 2, color: { dark: '#1c1917', light: '#ffffff' } },
        (err, url) => {
          if (!err && url) {
            setQrImages(prev => ({ ...prev, [item.id]: url }));
          }
        }
      );
    });
  }, [qrCodes]);

  const handleTestScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCodeInput.trim()) return;
    const ok = handleQRNavigation(testCodeInput.trim());
    if (ok) {
      setTestResult('Đã quét thành công! Ứng dụng đã chuyển hướng đến đúng nội dung đích.');
    } else {
      setTestResult('Không tìm thấy nội dung với mã này. Vui lòng kiểm tra lại.');
    }
  };

  const handleSimulateScan = (qr: QRCodeItem) => {
    handleQRNavigation(qr.ma_dinh_danh);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Hạ tầng kết nối nhanh</span>
              <span aria-hidden="true">·</span>
              <span>Cơ chế Mã QR Chính trị nội bộ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Quản Lý & In Ấn Mã QR Chính Trị
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Sinh mã QR độc lập trong mạng LAN phục vụ in ấn dán tại Phòng Hồ Chí Minh, bảng tin đơn vị, tủ sách chính trị. Chiến sĩ quét mã để mở thẳng tài liệu hoặc bài kiểm tra không cần gõ từ khóa.
            </p>
          </div>

          {currentUser.vai_tro !== 'chien_si' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Tạo mã QR mới
            </button>
          )}
        </div>

        {/* Simulator Box for mobile/testing */}
        <div className="mt-6 pt-5 border-t border-stone-200 bg-stone-50 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-red-800" />
              Mô phỏng máy quét mã QR / Nhập mã số dán tại bảng tin
            </span>
            <span className="text-[11px] text-stone-500">
              Hoạt động offline hoàn toàn trong mạng nội bộ đơn vị
            </span>
          </div>

          <form onSubmit={handleTestScan} className="flex gap-2">
            <input
              type="text"
              value={testCodeInput}
              onChange={(e) => {
                setTestCodeInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="Nhập mã định danh in trên QR (VD: QR-CD-10LT12DKL hoặc QR-DT-THI-QUY-1)"
              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Quét & Mở ngay
            </button>
          </form>

          {testResult && (
            <div className={`mt-2 p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              testResult.includes('thành công') 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

      </div>

      {/* Grid of Generated QR Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {qrCodes.map((qr) => {
          const qrUrl = qrImages[qr.id];

          return (
            <div
              key={qr.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-red-800 uppercase text-[10px] tracking-wider">
                    {qr.loai === 'chuyen_de' ? 'Chuyên đề' : qr.loai === 'tai_lieu' ? 'Tài liệu' : 'Đề kiểm tra'}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {qr.luot_quet} lượt quét
                  </span>
                </div>

                <h3 className="text-sm font-bold font-serif-doc text-stone-900 line-clamp-2 mb-3 leading-snug">
                  {qr.tieu_de}
                </h3>

                {/* QR Image Box */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 mb-3 text-center">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt={qr.tieu_de}
                      className="w-40 h-40 mx-auto rounded shadow-xs"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center mx-auto bg-stone-200 rounded">
                      <QrCode className="w-8 h-8 text-stone-400" />
                    </div>
                  )}
                  <span className="block mt-2 text-[10px] font-mono text-stone-600 truncate font-semibold">
                    {qr.ma_dinh_danh}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 mb-4">
                  <span className="font-semibold text-stone-700 block">Vị trí dán khuyến nghị:</span>
                  <p className="line-clamp-2">{qr.vi_tri_dan}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedQRCodeForPrint(qr)}
                  className="flex-1 py-1.5 px-3 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In bản dán</span>
                </button>

                <button
                  onClick={() => handleSimulateScan(qr)}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs transition-colors"
                  title="Mô phỏng quét mã này"
                >
                  <Smartphone className="w-4 h-4" />
                </button>

                {currentUser.vai_tro === 'quan_tri' && (
                  <button
                    onClick={() => deleteQRCode(qr.id)}
                    className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-lg text-xs transition-colors"
                    title="Xóa mã này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE QR MODAL */}
      {showCreateModal && (
        <CreateQRModal onClose={() => setShowCreateModal(false)} />
      )}

    </div>
  );
};

// Modal for creating new QR code
const CreateQRModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { chuyenDe, taiLieu, deThi, addQRCode } = useApp();

  const [tieuDe, setTieuDe] = useState('');
  const [loai, setLoai] = useState<LoaiQRCode>('chuyen_de');
  const [targetId, setTargetId] = useState(chuyenDe[0]?.id || '');
  const [viTriDan, setViTriDan] = useState('Phòng Hồ Chí Minh, Bảng tin đơn vị');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim()) return;

    let targetPath = `/chuyen-de/${targetId}`;
    if (loai === 'tai_lieu') targetPath = `/tai-lieu/${targetId}`;
    if (loai === 'de_thi') targetPath = `/kiem-tra/${targetId}`;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const maDinhDanh = `QR-${loai.toUpperCase()}-${randomSuffix}`;

    addQRCode({
      tieu_de: tieuDe.trim(),
      loai,
      muc_tieu_id: targetId,
      ma_dinh_danh: maDinhDanh,
      duong_dan_noi_bo: targetPath,
      vi_tri_dan: viTriDan.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 p-6 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Cán bộ chính trị</span>
            <h2 className="text-lg font-bold font-serif-doc text-stone-900">Sinh Mã QR Chính Trị Mới</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Tiêu đề biểu mẫu QR *</label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: QR Quét nhanh Chuyên đề Học tập Bác Hồ"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Loại nội dung liên kết *</label>
            <select
              value={loai}
              onChange={(e) => {
                const newLoai = e.target.value as LoaiQRCode;
                setLoai(newLoai);
                if (newLoai === 'chuyen_de') setTargetId(chuyenDe[0]?.id || '');
                if (newLoai === 'tai_lieu') setTargetId(taiLieu[0]?.id || '');
                if (newLoai === 'de_thi') setTargetId(deThi[0]?.id || '');
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            >
              <option value="chuyen_de">Chuyên đề học tập</option>
              <option value="tai_lieu">Văn bản / Tài liệu cụ thể</option>
              <option value="de_thi">Đề thi / Bài kiểm tra tuần</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Chọn nội dung đích *</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            >
              {loai === 'chuyen_de' && chuyenDe.map(cd => (
                <option key={cd.id} value={cd.id}>{cd.ten}</option>
              ))}
              {loai === 'tai_lieu' && taiLieu.map(tl => (
                <option key={tl.id} value={tl.id}>{tl.tieu_de}</option>
              ))}
              {loai === 'de_thi' && deThi.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.tieu_de} ({dt.doi_tuong})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Vị trí dán niêm yết</label>
            <input
              type="text"
              value={viTriDan}
              onChange={(e) => setViTriDan(e.target.value)}
              placeholder="VD: Phòng Hồ Chí Minh, Bảng tin Đại đội 1"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-semibold"
            >
              Tạo mã QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
