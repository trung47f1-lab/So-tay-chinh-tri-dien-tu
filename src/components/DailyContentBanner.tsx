import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, ArrowRight, Calendar, Bookmark, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react';

export const DailyContentBanner: React.FC = () => {
  const { 
    noiDungHangNgay, 
    speakText, 
    stopSpeaking, 
    isSpeaking, 
    setSelectedTaiLieu, 
    taiLieu,
    setCurrentTab,
    selectedDeThi,
    setSelectedDeThi,
    deThi,
    setExamMode,
    openInfographicStudioWithDraft
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const currentItem = noiDungHangNgay[currentIndex] || noiDungHangNgay[0];

  const handleCopy = () => {
    const textToCopy = `"${currentItem.trich_dan}" - ${currentItem.hoan_canh}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const fullSpeech = `${currentItem.tieu_de}. Lời trích: ${currentItem.trich_dan}. Bối cảnh: ${currentItem.hoan_canh}. Ý nghĩa hành động đối với chiến sĩ: ${currentItem.y_nghia}`;
      speakText(fullSpeech, currentItem.tieu_de);
    }
  };

  const handleOpenDocument = () => {
    if (currentItem.tai_lieu_id) {
      const doc = taiLieu.find(d => d.id === currentItem.tai_lieu_id);
      if (doc) {
        setSelectedTaiLieu(doc);
        setCurrentTab('kho_tai_lieu');
      }
    }
  };

  const handleQuickQuiz = () => {
    if (deThi.length > 0) {
      setSelectedDeThi(deThi[0]);
      setExamMode('practice');
      setCurrentTab('trac_nghiem');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950 via-stone-900 to-stone-950 border border-red-900/60 text-white shadow-xl">
      {/* Subtle decorative background motif */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative p-6 sm:p-8">
        
        {/* Top bar of banner: Category, Date, Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Mỗi Ngày Một Lời Bác Dạy
            </span>
            <span className="text-stone-500" aria-hidden="true">·</span>
            <span className="text-stone-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              {currentItem.ngay}
            </span>
          </div>

          {/* Date switcher / Day selector */}
          <div className="flex items-center gap-1 bg-stone-900/90 rounded-lg p-1 border border-stone-800">
            {noiDungHangNgay.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setCurrentIndex(idx);
                }}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  idx === currentIndex 
                    ? 'bg-red-800 text-amber-300 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Bài {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-serif-doc text-stone-100 leading-snug">
              {currentItem.tieu_de}
            </h2>

            {/* Golden Quote */}
            <div className="relative pl-5 border-l-2 border-amber-500/80 my-3 group">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base sm:text-lg italic font-serif-doc text-amber-200/90 leading-relaxed">
                  "{currentItem.trich_dan}"
                </p>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/80 text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors"
                  title="Sao chép câu nói để lưu vào sổ tay"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chép lời Bác</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {currentItem.hoan_canh}
              </p>
            </div>

            {/* Practical meaning for soldiers */}
            <div className="text-sm text-stone-300 leading-relaxed bg-stone-900/60 p-3.5 rounded-xl border border-stone-800/80">
              <span className="font-semibold text-amber-400 block mb-1">
                Bài học hành động cho cán bộ, chiến sĩ hôm nay:
              </span>
              <p>{currentItem.y_nghia}</p>
            </div>

            <div className="text-xs text-stone-400 flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-stone-500" />
              <span>Nguồn trích: {currentItem.nguon}</span>
            </div>
          </div>

          {/* Action sidebar within banner */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-center bg-stone-900/70 p-5 rounded-xl border border-stone-800">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
              Phương thức tiếp cận
            </span>

            {/* Audio Voice Reader */}
            <button
              onClick={handleSpeak}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                isSpeaking
                  ? 'bg-amber-500 text-stone-950 font-bold animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-stone-950" />
                  <span>Đang phát lời đọc... (Bấm để dừng)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Nghe giọng đọc chính trị (TTS)</span>
                </>
              )}
            </button>

            {/* Create Infographic AI */}
            <button
              onClick={() => {
                openInfographicStudioWithDraft(
                  currentItem.tieu_de,
                  `"${currentItem.trich_dan}"\nBối cảnh: ${currentItem.hoan_canh}\nÝ nghĩa hành động: ${currentItem.y_nghia}\nNguồn: ${currentItem.nguon}`,
                  'loi_bac_day',
                  'img-officer-troops'
                );
              }}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 border border-amber-400 flex items-center justify-between transition-all shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-red-900 fill-red-900" />
                Biên tập Infographic Lời Bác (AI)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-900" />
            </button>

            {/* Open full document */}
            {currentItem.tai_lieu_id && (
              <button
                onClick={handleOpenDocument}
                className="w-full py-2 px-4 rounded-lg text-xs font-medium text-stone-200 bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 flex items-center justify-between transition-colors"
              >
                <span>Xem tài liệu chuyên đề gốc</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            )}

            {/* Test knowledge immediately */}
            <button
              onClick={handleQuickQuiz}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-red-800 hover:bg-red-700 border border-red-700 flex items-center justify-between transition-colors shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                Kiểm tra nhận thức nhanh
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
