import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoaiTaiLieu, TaiLieu } from '../types';
import { 
  BookOpen, 
  Plus, 
  Volume2, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  ArrowRight, 
  QrCode,
  Eye,
  CheckCircle2,
  Paperclip,
  Sparkles
} from 'lucide-react';

export const DocumentLibrary: React.FC = () => {
  const { 
    taiLieu, 
    chuyenDe, 
    currentUser, 
    activeChuyenDeId, 
    setActiveChuyenDeId,
    setSelectedTaiLieu,
    setSelectedQRCodeForPrint,
    qrCodes,
    addQRCode,
    setSelectedDeThi,
    deThi,
    setExamMode,
    setCurrentTab,
    openInfographicStudioWithDraft
  } = useApp();

  const [selectedLoai, setSelectedLoai] = useState<LoaiTaiLieu | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter documents
  const filteredDocs = taiLieu.filter(doc => {
    const matchTopic = activeChuyenDeId ? doc.chuyen_de_id === activeChuyenDeId : true;
    const matchLoai = selectedLoai === 'all' ? true : doc.loai === selectedLoai;
    return matchTopic && matchLoai;
  });

  const getLoaiLabel = (loai: LoaiTaiLieu) => {
    switch (loai) {
      case 'van_kien': return 'Văn kiện - Nghị quyết';
      case 'chi_thi': return 'Chỉ thị - Quy định';
      case 'phap_luat': return 'Pháp luật - Kỷ luật';
      case 'giao_duc': return 'Giáo dục Chính trị';
      case 'truyen_thong': return 'Lịch sử - Truyền thống';
    }
  };

  const handlePrintQR = (e: React.MouseEvent, doc: TaiLieu) => {
    e.stopPropagation();
    // Check if QR already exists or create one
    let qr = qrCodes.find(q => q.muc_tieu_id === doc.id);
    if (!qr) {
      qr = addQRCode({
        tieu_de: `QR Tài liệu: ${doc.tieu_de}`,
        loai: 'tai_lieu',
        muc_tieu_id: doc.id,
        ma_dinh_danh: `QR-TL-${doc.id.toUpperCase()}`,
        duong_dan_noi_bo: `/tai-lieu/${doc.id}`,
        vi_tri_dan: 'Bảng tin đơn vị, Tủ sách chính trị'
      });
    }
    setSelectedQRCodeForPrint(qr);
  };

  const handleQuickQuiz = (e: React.MouseEvent, doc: TaiLieu) => {
    e.stopPropagation();
    const relatedExam = deThi.find(e => e.chuyen_de_id === doc.chuyen_de_id) || deThi[0];
    if (relatedExam) {
      setSelectedDeThi(relatedExam);
      setExamMode('practice');
      setCurrentTab('trac_nghiem');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Phân hệ 2</span>
              <span aria-hidden="true">·</span>
              <span>Một nội dung — Nhiều hình thức tiếp cận</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Kho Tài Liệu Chính Trị Cơ Sở
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Hệ thống hóa toàn bộ văn kiện, quy định điều lệnh, chuyên đề học tập và tư liệu truyền thống. Đọc trực tiếp, nghe giọng đọc chuẩn hoặc quét mã QR.
            </p>
          </div>

          {/* Action button for admin only */}
          {currentUser.vai_tro === 'quan_tri' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Thêm tài liệu mới
            </button>
          )}
        </div>

        {/* Chuyên đề Filter Buttons */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            Lọc theo Chuyên đề học tập:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveChuyenDeId(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeChuyenDeId === null
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Tất cả chuyên đề ({taiLieu.length})
            </button>
            {chuyenDe.map((cd) => (
              <button
                key={cd.id}
                onClick={() => setActiveChuyenDeId(cd.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeChuyenDeId === cd.id
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cd.ten}
              </button>
            ))}
          </div>
        </div>

        {/* Loại tài liệu Filter */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-stone-500 font-medium whitespace-nowrap">Loại tài liệu:</span>
          {(['all', 'van_kien', 'chi_thi', 'phap_luat', 'giao_duc', 'truyen_thong'] as const).map((loai) => (
            <button
              key={loai}
              onClick={() => setSelectedLoai(loai)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedLoai === loai
                  ? 'bg-stone-900 text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {loai === 'all' ? 'Tất cả loại' : getLoaiLabel(loai)}
            </button>
          ))}
        </div>

      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const topic = chuyenDe.find(c => c.id === doc.chuyen_de_id);
          return (
            <div
              key={doc.id}
              onClick={() => setSelectedTaiLieu(doc)}
              className="bg-white rounded-2xl border border-stone-200 hover:border-red-700/60 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Unboxed Metadata Header */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-red-800 uppercase text-[10px] tracking-wider">
                      {getLoaiLabel(doc.loai).split(' - ')[0]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{topic?.ten || 'Chính trị'}</span>
                  </div>

                  <span className="shrink-0 text-[11px] text-stone-400">
                    {doc.thoi_luong_phut || 5} phút
                  </span>
                </div>

                <h3 className="text-base font-bold font-serif-doc text-stone-900 group-hover:text-red-800 transition-colors line-clamp-2 mb-2 leading-snug">
                  {doc.tieu_de}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                  {doc.tom_tat}
                </p>
              </div>

              {/* Card Footer with Multi-format badging & Actions */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Media access indicators */}
                  <div className="flex items-center gap-2 text-stone-500">
                    <span className="flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      <FileText className="w-3 h-3 text-stone-500" />
                      Đọc
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      <Volume2 className="w-3 h-3 text-amber-600" />
                      Nghe
                    </span>
                    {doc.loai_dinh_kem === 'image' && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        <ImageIcon className="w-3 h-3" />
                        Ảnh
                      </span>
                    )}
                    {doc.loai_dinh_kem === 'video' && (
                      <span className="flex items-center gap-1 text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {(doc.loai_dinh_kem === 'word' || doc.ten_tep_goc?.endsWith('.docx') || doc.ten_tep_goc?.endsWith('.doc')) && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        <Paperclip className="w-3 h-3" />
                        Word
                      </span>
                    )}
                    {(doc.loai_dinh_kem === 'pdf' || doc.ten_tep_goc?.endsWith('.pdf')) && (
                      <span className="flex items-center gap-1 text-[11px] text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold">
                        <Paperclip className="w-3 h-3" />
                        PDF
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {doc.so_luot_xem}
                  </span>
                </div>

                {/* Direct Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleQuickQuiz(e, doc)}
                    className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 border border-amber-200"
                    title="Kiểm tra nhận thức về bài này"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    Thi nhanh
                  </button>

                  <button
                    onClick={(e) => handlePrintQR(e, doc)}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs transition-colors border border-stone-200"
                    title="Xem & In mã QR tài liệu này"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInfographicStudioWithDraft(doc.tieu_de, doc.noi_dung, 'tai_lieu');
                    }}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs transition-colors border border-amber-300"
                    title="Tự động biên tập thành Infographic áp phích (AI)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <button
                    onClick={() => setSelectedTaiLieu(doc)}
                    className="py-1.5 px-3 bg-red-800 hover:bg-red-900 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Mở đọc <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">Không có tài liệu nào trong phân loại này</h3>
          <p className="text-xs text-stone-500 mt-1">Vui lòng chọn chuyên đề khác hoặc xóa bộ lọc.</p>
        </div>
      )}

      {/* ADD DOCUMENT MODAL FOR OFFICERS */}
      {showAddModal && (
        <AddDocumentModal 
          onClose={() => setShowAddModal(false)} 
        />
      )}

    </div>
  );
};

// Sub-component for adding new document without modifying code
const AddDocumentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { chuyenDe, addTaiLieu } = useApp();
  const [tieuDe, setTieuDe] = useState('');
  const [chuyenDeId, setChuyenDeId] = useState(chuyenDe[0]?.id || 'cd-1');
  const [loai, setLoai] = useState<LoaiTaiLieu>('giao_duc');
  const [tomTat, setTomTat] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [tacGia, setTacGia] = useState('Ban Chính trị đơn vị');
  const [soHieu, setSoHieu] = useState('');
  const [thoiLuong, setThoiLuong] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !noiDung.trim()) {
      alert('Đồng chí vui lòng nhập đầy đủ tiêu đề và nội dung tài liệu.');
      return;
    }

    addTaiLieu({
      tieu_de: tieuDe.trim(),
      chuyen_de_id: chuyenDeId,
      loai,
      tom_tat: tomTat.trim() || tieuDe.trim(),
      noi_dung: noiDung.trim(),
      tac_gia: tacGia.trim(),
      so_hieu: soHieu.trim() || undefined,
      ngay_dang: new Date().toISOString().split('T')[0],
      loai_dinh_kem: 'none',
      thoi_luong_phut: Number(thoiLuong) || 5
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Cán bộ nhập liệu</span>
            <h2 className="text-lg font-bold font-serif-doc text-stone-900">Thêm mới Tài liệu Chính trị</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Tiêu đề tài liệu *</label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Chỉ thị số 05 về Đẩy mạnh học tập và làm theo tư tưởng Bác"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Chuyên đề học tập *</label>
              <select
                value={chuyenDeId}
                onChange={(e) => setChuyenDeId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                {chuyenDe.map((cd) => (
                  <option key={cd.id} value={cd.id}>{cd.ten}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Loại văn bản *</label>
              <select
                value={loai}
                onChange={(e) => setLoai(e.target.value as LoaiTaiLieu)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="giao_duc">Giáo dục Chính trị</option>
                <option value="van_kien">Văn kiện - Nghị quyết</option>
                <option value="chi_thi">Chỉ thị - Quy định</option>
                <option value="phap_luat">Pháp luật - Kỷ luật</option>
                <option value="truyen_thong">Lịch sử - Truyền thống</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Cơ quan ban hành / Tác giả</label>
              <input
                type="text"
                value={tacGia}
                onChange={(e) => setTacGia(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Số hiệu văn bản (nếu có)</label>
              <input
                type="text"
                value={soHieu}
                onChange={(e) => setSoHieu(e.target.value)}
                placeholder="VD: CT-05/TW hoặc TT-143/BQP"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Tóm tắt ngắn (1-2 câu)</label>
            <textarea
              rows={2}
              value={tomTat}
              onChange={(e) => setTomTat(e.target.value)}
              placeholder="Tóm tắt mục đích và nội dung cốt lõi của tài liệu..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nội dung chi tiết *</label>
            <textarea
              required
              rows={8}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Dán toàn văn hoặc trích yếu nội dung văn bản tại đây..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-serif-doc"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg font-medium hover:bg-stone-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-semibold"
            >
              Lưu vào kho tài liệu
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
