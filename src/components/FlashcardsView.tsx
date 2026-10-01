import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  HelpCircle, 
  CheckCircle2, 
  Bookmark,
  Sparkles
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { cauHoi, chuyenDe } = useApp();
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [savedQuestionIds, setSavedQuestionIds] = useState<string[]>([]);

  // Filter questions
  const filteredQuestions = cauHoi.filter(q => 
    selectedTopicId === 'all' ? true : q.chuyen_de_id === selectedTopicId
  );

  const activeQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];
  const activeTopic = chuyenDe.find(c => c.id === activeQuestion?.chuyen_de_id);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentIndex(randomIndex);
  };

  const toggleBookmark = (id: string) => {
    setSavedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!activeQuestion) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
        <HelpCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-stone-800">Không có câu hỏi trong chuyên đề này</h3>
      </div>
    );
  }

  const isBookmarked = savedQuestionIds.includes(activeQuestion.id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
          <span>Phân hệ 4</span>
          <span aria-hidden="true">·</span>
          <span>Tự ôn luyện không chấm điểm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
          Hỏi Nhanh — Đáp Đúng
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl mx-auto">
          Phương pháp thẻ lật (Flashcard) trực quan giúp cán bộ, chiến sĩ tự ôn luyện kiến thức chính trị trong giờ giải lao, sinh hoạt tổ 3 người hoặc trước giờ ngủ.
        </p>

        {/* Chuyên đề Filter */}
        <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedTopicId('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedTopicId === 'all'
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả ({cauHoi.length})
          </button>
          {chuyenDe.map((cd) => (
            <button
              key={cd.id}
              onClick={() => {
                setSelectedTopicId(cd.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedTopicId === cd.id
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cd.ten.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Bookmark bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-800">
            Câu {currentIndex + 1} / {filteredQuestions.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-stone-500">{activeTopic?.ten}</span>
        </div>

        <button
          onClick={() => toggleBookmark(activeQuestion.id)}
          className={`flex items-center gap-1 font-medium transition-colors ${
            isBookmarked ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600' : ''}`} />
          <span>{isBookmarked ? 'Đã đánh dấu câu khó' : 'Đánh dấu cần ôn lại'}</span>
        </button>
      </div>

      {/* 3D INTERACTIVE FLIP CARD CONTAINER */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[380px] cursor-pointer perspective select-none"
      >
        <div 
          className={`relative w-full min-h-[380px] rounded-2xl shadow-xl transition-all duration-500 transform-gpu preserve-3d border ${
            isFlipped 
              ? 'bg-stone-900 border-amber-500/60 text-white rotate-y-180' 
              : 'bg-white border-stone-300 text-stone-900 hover:border-red-700/60'
          }`}
        >
          
          {/* FRONT OF CARD (Question) */}
          <div className={`p-8 sm:p-10 flex flex-col justify-between h-full absolute inset-0 backface-hidden ${isFlipped ? 'hidden' : 'flex'}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                  Mặt 1: Câu hỏi nhận thức
                </span>
                <span className="text-xs text-stone-400">
                  Nhấp vào thẻ để xem đáp án
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold font-serif-doc text-stone-900 leading-snug mt-4">
                {activeQuestion.noi_dung}
              </h2>

              {/* 4 Choices */}
              <div className="mt-6 space-y-2">
                {activeQuestion.cac_dap_an.map((ans, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs sm:text-sm font-medium text-stone-700 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{ans}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-red-800 font-semibold">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              <span>Chạm hoặc bấm vào thẻ để lật xem đáp án chuẩn</span>
            </div>
          </div>

          {/* BACK OF CARD (Answer & Explanation) */}
          <div className={`p-8 sm:p-10 flex flex-col justify-between h-full bg-stone-900 rounded-2xl text-white ${isFlipped ? 'flex' : 'hidden'}`}>
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mặt 2: Đáp án & Căn cứ chính trị
                </span>
                <span className="text-xs text-stone-400">
                  Bấm để lật lại câu hỏi
                </span>
              </div>

              {/* Correct answer display */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950 to-stone-800 border border-amber-500/50 mb-4">
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 block mb-1">
                  Đáp án chính xác:
                </span>
                <div className="text-base sm:text-lg font-bold text-white font-serif-doc flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + activeQuestion.dap_an_dung)}
                  </span>
                  <span>{activeQuestion.cac_dap_an[activeQuestion.dap_an_dung]}</span>
                </div>
              </div>

              {/* In-depth Political Explanation */}
              <div className="p-4 rounded-xl bg-stone-800/70 border border-stone-700/80 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <span className="font-bold text-amber-400 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Ý nghĩa lý luận và thực tiễn:
                </span>
                <p>{activeQuestion.giai_thich}</p>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-stone-800 flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
              <RotateCw className="w-4 h-4" />
              <span>Bấm vào thẻ để quay lại câu hỏi</span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <button
          onClick={handleShuffle}
          className="py-3 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
          title="Chọn câu ngẫu nhiên"
        >
          <Shuffle className="w-4 h-4" />
          <span className="hidden sm:inline">Ngẫu nhiên</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 bg-red-800 hover:bg-red-900 border border-red-900 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <span>Câu tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
