import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  ArrowLeft, 
  Image as ImageIcon,
  Share2,
  Download,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';

export const DocumentDetailModal: React.FC = () => {
  const { 
    selectedTaiLieu, 
    setSelectedTaiLieu, 
    chuyenDe, 
    speakText, 
    stopSpeaking, 
    isSpeaking,
    setSelectedDeThi,
    deThi,
    setExamMode,
    setCurrentTab,
    setSelectedQRCodeForPrint,
    qrCodes,
    addQRCode,
    openInfographicStudioWithDraft
  } = useApp();

  const [activeView, setActiveView] = useState<'doc' | 'nghe' | 'xem' | 'qr'>('doc');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR code data URL dynamically (hook must run unconditionally before any early return)
  React.useEffect(() => {
    if (!selectedTaiLieu) return;
    QRCode.toDataURL(
      `https://sotay-chinhtri.internal/tai-lieu/${selectedTaiLieu.id}`,
      { width: 280, margin: 2, color: { dark: '#1c1917', light: '#ffffff' } },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [selectedTaiLieu?.id]);

  if (!selectedTaiLieu) return null;

  const topic = chuyenDe.find(c => c.id === selectedTaiLieu.chuyen_de_id);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const speech = `${selectedTaiLieu.tieu_de}. Cơ quan ban hành: ${selectedTaiLieu.tac_gia}. Tóm tắt: ${selectedTaiLieu.tom_tat}. Toàn văn nội dung: ${selectedTaiLieu.noi_dung}`;
      speakText(speech, selectedTaiLieu.tieu_de);
    }
  };

  const handleStartExam = () => {
    // Find exam for this topic or default
    const exam = deThi.find(e => e.chuyen_de_id === selectedTaiLieu.chuyen_de_id) || deThi[0];
    if (exam) {
      setSelectedDeThi(exam);
      setExamMode('practice');
      setSelectedTaiLieu(null);
      setCurrentTab('trac_nghiem');
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const handleExportSingleDoc = () => {
    let text = `TỔNG CỤC CHÍNH TRỊ - BỘ QUỐC PHÒNG\nTRUNG ĐOÀN 1 - ĐOÀN BA GIA ANH HÙNG\n`;
    text += `================================================================================\n`;
    text += `TIÊU ĐỀ: ${selectedTaiLieu.tieu_de.toUpperCase()}\n`;
    text += `Số hiệu: ${selectedTaiLieu.so_hieu || 'Nội bộ'} | Cơ quan ban hành: ${selectedTaiLieu.tac_gia}\n`;
    text += `Ngày đăng: ${selectedTaiLieu.ngay_dang} | Thời lượng đọc: ~${selectedTaiLieu.thoi_luong_phut || 5} phút\n`;
    text += `Tóm tắt: ${selectedTaiLieu.tom_tat}\n`;
    text += `================================================================================\n\n`;
    text += `[NỘI DUNG VĂN BẢN]:\n\n${selectedTaiLieu.noi_dung}\n\n`;
    text += `================================================================================\n`;
    text += `Trích xuất từ Sổ tay Chính trị Điện tử - Ngày ${new Date().toLocaleDateString('vi-VN')}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tai-Lieu-${selectedTaiLieu.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintQR = () => {
    let qr = qrCodes.find(q => q.muc_tieu_id === selectedTaiLieu.id);
    if (!qr) {
      qr = addQRCode({
        tieu_de: `QR Tài liệu: ${selectedTaiLieu.tieu_de}`,
        loai: 'tai_lieu',
        muc_tieu_id: selectedTaiLieu.id,
        ma_dinh_danh: `QR-TL-${selectedTaiLieu.id.toUpperCase()}`,
        duong_dan_noi_bo: `/tai-lieu/${selectedTaiLieu.id}`,
        vi_tri_dan: 'Phòng Hồ Chí Minh, Bảng tin đơn vị'
      });
    }
    setSelectedQRCodeForPrint(qr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-50 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setSelectedTaiLieu(null);
              }}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <div className="truncate">
              <span className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider block">
                {topic?.ten || 'Kho tài liệu chính trị'}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-stone-100 truncate font-serif-doc max-w-md">
                {selectedTaiLieu.tieu_de}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Infographic AI button */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                openInfographicStudioWithDraft(selectedTaiLieu.tieu_de, selectedTaiLieu.noi_dung, 'tai_lieu');
                setSelectedTaiLieu(null);
              }}
              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
              title="Tự động biên tập tài liệu này thành Infographic trực quan"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-900 fill-red-900" />
              <span className="hidden sm:inline">Biên tập Infographic (AI)</span>
              <span className="sm:hidden">Infographic</span>
            </button>

            {/* Quick check button */}
            <button
              onClick={handleStartExam}
              className="py-1.5 px-3 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Kiểm tra nhận thức bài này</span>
              <span className="sm:hidden">Kiểm tra</span>
            </button>

            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setSelectedTaiLieu(null);
              }}
              className="p-1.5 text-stone-400 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Multi-access Mode Selector (Clean Tabs) */}
        <div className="bg-white border-b border-stone-200 px-6 py-2.5 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveView('doc')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeView === 'doc'
                  ? 'bg-white text-red-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Đọc văn bản</span>
            </button>

            <button
              onClick={() => setActiveView('nghe')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeView === 'nghe'
                  ? 'bg-white text-amber-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Nghe bài giảng (TTS)</span>
            </button>

            <button
              onClick={() => setActiveView('xem')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeView === 'xem'
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Xem tư liệu</span>
            </button>

            <button
              onClick={() => setActiveView('qr')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeView === 'qr'
                  ? 'bg-white text-stone-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mã QR dán bảng</span>
            </button>
          </div>

          {/* Reading Font Tools */}
          {activeView === 'doc' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 text-[11px] hidden sm:inline">Cỡ chữ:</span>
              <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-0.5 rounded text-xs ${fontSize === 'normal' ? 'bg-white font-bold shadow-xs' : 'text-stone-500'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-0.5 rounded text-sm ${fontSize === 'large' ? 'bg-white font-bold shadow-xs' : 'text-stone-500'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-0.5 rounded text-base ${fontSize === 'xlarge' ? 'bg-white font-bold shadow-xs' : 'text-stone-500'}`}
                >
                  A++
                </button>
              </div>

              <button
                onClick={handleExportSingleDoc}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors flex items-center gap-1 text-[11px] font-medium"
                title="Tải văn bản này về máy (.txt)"
              >
                <Download className="w-3.5 h-3.5 text-red-800" />
                <span className="hidden sm:inline">Tải về</span>
              </button>

              <button
                onClick={handlePrintDocument}
                className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                title="In tài liệu này"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
          
          {/* TAB 1: READ DOCUMENT */}
          {activeView === 'doc' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Institutional Header */}
              <div className="border-b border-stone-200 pb-5 text-center space-y-2">
                <div className="text-[11px] tracking-widest uppercase font-semibold text-red-800">
                  {selectedTaiLieu.so_hieu ? `Số hiệu: ${selectedTaiLieu.so_hieu}` : 'Tài liệu sinh hoạt chính trị nội bộ'}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif-doc text-stone-900 leading-snug">
                  {selectedTaiLieu.tieu_de}
                </h1>
                <div className="text-xs text-stone-500 flex items-center justify-center gap-3 pt-1">
                  <span>Ban hành: {selectedTaiLieu.tac_gia}</span>
                  <span aria-hidden="true">·</span>
                  <span>Ngày đăng: {selectedTaiLieu.ngay_dang}</span>
                  <span aria-hidden="true">·</span>
                  <span>Thời lượng: ~{selectedTaiLieu.thoi_luong_phut || 5} phút</span>
                </div>
              </div>

              {/* Document Summary Box */}
              {selectedTaiLieu.tom_tat && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-stone-800 leading-relaxed">
                  <span className="font-bold text-amber-900 block mb-1">Mục đích & Tóm lược:</span>
                  <p>{selectedTaiLieu.tom_tat}</p>
                </div>
              )}

              {/* Attached Original File (Word / PDF) */}
              {(selectedTaiLieu.du_lieu_tep || selectedTaiLieu.ten_tep_goc) && (
                <div className="p-4 rounded-xl bg-stone-100/90 border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
                      selectedTaiLieu.loai_dinh_kem === 'word' || selectedTaiLieu.ten_tep_goc?.endsWith('.docx') || selectedTaiLieu.ten_tep_goc?.endsWith('.doc')
                        ? 'bg-blue-800'
                        : 'bg-red-800'
                    }`}>
                      {selectedTaiLieu.loai_dinh_kem === 'word' || selectedTaiLieu.ten_tep_goc?.endsWith('.docx') || selectedTaiLieu.ten_tep_goc?.endsWith('.doc') ? 'DOC' : 'PDF'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {selectedTaiLieu.ten_tep_goc || 'Van-ban-goc.docx'}
                        </span>
                        {selectedTaiLieu.kich_thuoc_tep && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            ({(selectedTaiLieu.kich_thuoc_tep / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        Tệp văn bản đính kèm gốc do cán bộ đơn vị tải lên hệ thống
                      </span>
                    </div>
                  </div>

                  {selectedTaiLieu.du_lieu_tep && (
                    <a
                      href={selectedTaiLieu.du_lieu_tep}
                      download={selectedTaiLieu.ten_tep_goc || 'van-ban-goc'}
                      className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tải tệp gốc về máy</span>
                    </a>
                  )}
                </div>
              )}

              {/* Full Text Prose with font size control */}
              <div className={`font-serif-doc text-stone-800 leading-relaxed whitespace-pre-line ${
                fontSize === 'normal' ? 'text-sm sm:text-base leading-7' :
                fontSize === 'large' ? 'text-base sm:text-lg leading-8' :
                'text-lg sm:text-xl leading-9'
              }`}>
                {selectedTaiLieu.noi_dung}
              </div>

              {/* Quick Assessment CTA at bottom of text */}
              <div className="mt-8 p-5 bg-gradient-to-r from-red-900 to-stone-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-amber-400 text-xs uppercase font-bold tracking-wider block">
                    Đã hoàn thành nội dung bài học
                  </span>
                  <h4 className="text-base font-bold font-serif-doc text-white">
                    Kiểm tra nhận thức ngay để củng cố kiến thức
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Hệ thống tự động chấm điểm và giải thích chi tiết từng câu hỏi.
                  </p>
                </div>
                <button
                  onClick={handleStartExam}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-md transition-all whitespace-nowrap"
                >
                  Bắt đầu làm bài thi
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: AUDIO / SPEECH SYNTHESIS */}
          {activeView === 'nghe' && (
            <div className="max-w-xl mx-auto py-6 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-inner">
                <Volume2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-semibold text-red-800 tracking-wider">
                  Trình đọc âm thanh chính trị
                </span>
                <h3 className="text-xl font-bold font-serif-doc text-stone-900">
                  {selectedTaiLieu.tieu_de}
                </h3>
                <p className="text-xs text-stone-500">
                  Sử dụng công nghệ tổng hợp giọng nói tiếng Việt chuẩn, phục vụ bộ đội nghe bài giảng khi lao động tăng gia hoặc trước giờ nghỉ.
                </p>
              </div>

              <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 text-left text-xs text-stone-600 max-h-48 overflow-y-auto">
                <span className="font-bold text-stone-800 block mb-1">Đoạn phát thanh:</span>
                <p className="line-clamp-6">{selectedTaiLieu.noi_dung}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleToggleSpeak}
                  className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                    isSpeaking
                      ? 'bg-red-700 text-white animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Dừng phát âm thanh</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Bắt đầu phát giọng đọc</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VISUAL / VIDEO ATTACHMENTS */}
          {activeView === 'xem' && (
            <div className="max-w-2xl mx-auto py-4 space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-semibold text-red-800 tracking-wider">
                  Hình ảnh & Tư liệu truyền thông
                </span>
                <h3 className="text-lg font-bold font-serif-doc text-stone-900">
                  Tư liệu minh họa chuyên đề
                </h3>
              </div>

              {selectedTaiLieu.media_url ? (
                <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-md">
                  <img
                    src={selectedTaiLieu.media_url}
                    alt={selectedTaiLieu.tieu_de}
                    referrerPolicy="no-referrer"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 italic">
                    Hình ảnh: Tư liệu học tập và huấn luyện tại đơn vị cơ sở gắn với chuyên đề "{selectedTaiLieu.tieu_de}".
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-stone-100 rounded-2xl border border-stone-200">
                  <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-700">Tài liệu này hiện sử dụng định dạng văn bản chuẩn</p>
                  <p className="text-xs text-stone-500 mt-1">Cán bộ phụ trách có thể tải bổ sung ảnh/video qua bảng quản trị.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QR CODE PREVIEW & PRINT */}
          {activeView === 'qr' && (
            <div className="max-w-md mx-auto py-4 space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-red-800 tracking-wider">
                  Mã QR Chính Trị Nội Bộ
                </span>
                <h3 className="text-lg font-bold font-serif-doc text-stone-900">
                  {selectedTaiLieu.tieu_de}
                </h3>
                <p className="text-xs text-stone-500">
                  Quét bằng điện thoại trong mạng LAN để mở thẳng văn bản này.
                </p>
              </div>

              {/* QR Image Card */}
              <div className="p-6 bg-white rounded-2xl border-2 border-stone-300 shadow-lg inline-block">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Mã QR tài liệu" 
                    className="w-56 h-56 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 bg-stone-100 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-stone-400 animate-spin" />
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-stone-200 text-[11px] font-mono text-stone-600">
                  MÃ ĐỊNH DANH: QR-TL-{selectedTaiLieu.id.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleOpenPrintQR}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In biểu mẫu dán bảng tin (Khổ A4/A5)</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
