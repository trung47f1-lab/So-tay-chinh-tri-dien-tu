import React, { useMemo } from 'react';
import { useApp, SearchCategoryFilter } from '../context/AppContext';
import { 
  Search, 
  FileText, 
  HelpCircle, 
  Clock, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const SearchSection: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchFilter, 
    setSearchFilter, 
    taiLieu, 
    cauHoi, 
    mocTruyenThong, 
    chuyenDe, 
    setSelectedTaiLieu,
    setCurrentTab,
    setSelectedDeThi,
    deThi,
    setExamMode
  } = useApp();

  const hotKeywords = [
    '10 Lời thề danh dự',
    '12 Điều kỷ luật',
    'Lời Bác Hồ dạy',
    'Chiến thắng Ba Gia',
    'Quy định kỷ luật rượu bia',
    'Nghị quyết Trung ương 8',
    'Diễn biến hòa bình'
  ];

  // Combined search results
  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // Documents
    const docs = taiLieu.filter(d => {
      if (!q) return true;
      return (
        d.tieu_de.toLowerCase().includes(q) ||
        d.noi_dung.toLowerCase().includes(q) ||
        d.tom_tat.toLowerCase().includes(q) ||
        d.tac_gia.toLowerCase().includes(q)
      );
    });

    // Questions
    const questions = cauHoi.filter(c => {
      if (!q) return true;
      return (
        c.noi_dung.toLowerCase().includes(q) ||
        c.giai_thich.toLowerCase().includes(q) ||
        c.cac_dap_an.some(a => a.toLowerCase().includes(q))
      );
    });

    // Traditions
    const traditions = mocTruyenThong.filter(m => {
      if (!q) return true;
      return (
        m.tieu_de.toLowerCase().includes(q) ||
        m.noi_dung.toLowerCase().includes(q) ||
        m.nam.includes(q) ||
        m.y_nghia.toLowerCase().includes(q)
      );
    });

    return {
      docs,
      questions,
      traditions,
      totalCount: docs.length + questions.length + traditions.length
    };
  }, [searchQuery, taiLieu, cauHoi, mocTruyenThong]);

  const handleOpenDoc = (docId: string) => {
    const doc = taiLieu.find(d => d.id === docId);
    if (doc) {
      setSelectedTaiLieu(doc);
      setCurrentTab('kho_tai_lieu');
    }
  };

  const handleTakeQuizForTopic = (chuyenDeId: string) => {
    const exam = deThi.find(e => e.chuyen_de_id === chuyenDeId) || deThi[0];
    if (exam) {
      setSelectedDeThi(exam);
      setExamMode('practice');
      setCurrentTab('trac_nghiem');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-6">
          <span className="text-xs uppercase tracking-wider text-red-800 font-bold">
            Phân hệ 1 · Hệ thống tra cứu đa kênh
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
            Tra cứu Tài liệu, Câu hỏi & Truyền thống Đơn vị
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Nhập từ khóa về chỉ thị, điều lệnh, lời dạy của Bác, mốc lịch sử hoặc câu hỏi nhận thức chính trị để tìm kiếm tức thì.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm (VD: 10 lời thề, Ba Gia, kỷ luật, rượu bia...)"
              className="w-full pl-12 pr-10 py-3.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-stone-400 hover:text-stone-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Keywords */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-xs">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Gợi ý từ khóa:
            </span>
            {hotKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className="text-stone-600 hover:text-red-800 bg-stone-100 hover:bg-red-50 border border-stone-200 rounded-md px-2 py-0.5 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters (Clean Segmented Control) */}
        <div className="max-w-2xl mx-auto mt-6 pt-4 border-t border-stone-200/80">
          <div className="flex items-center justify-center flex-wrap gap-1 p-1 bg-stone-100 rounded-xl">
            {[
              { id: 'all', label: `Tất cả (${results.totalCount})` },
              { id: 'van_ban', label: `Văn bản (${results.docs.length})` },
              { id: 'cau_hoi', label: `Câu hỏi (${results.questions.length})` },
              { id: 'truyen_thong', label: `Truyền thống (${results.traditions.length})` },
              { id: 'am_thanh_video', label: 'Âm thanh / Video' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchFilter(tab.id as SearchCategoryFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  searchFilter === tab.id
                    ? 'bg-white text-red-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Search Results Display */}
      <div className="space-y-6">
        
        {/* SECTION 1: Documents */}
        {(searchFilter === 'all' || searchFilter === 'van_ban' || searchFilter === 'am_thanh_video') && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-800" />
                Văn bản & Tài liệu chính trị ({results.docs.length})
              </h2>
              <button 
                onClick={() => setCurrentTab('kho_tai_lieu')}
                className="text-xs text-red-800 hover:text-red-900 font-medium flex items-center gap-1"
              >
                Xem tất cả kho tài liệu <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {results.docs.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">Không tìm thấy tài liệu phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.docs.map((doc) => {
                  const topic = chuyenDe.find(c => c.id === doc.chuyen_de_id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleOpenDoc(doc.id)}
                      className="p-4 rounded-xl border border-stone-200 hover:border-red-700/50 hover:shadow-md transition-all cursor-pointer bg-stone-50/50 hover:bg-white flex flex-col justify-between"
                    >
                      <div>
                        {/* Unboxed metadata */}
                        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                          <span className="font-semibold text-red-800 uppercase text-[10px] tracking-wider">
                            {doc.loai === 'van_kien' ? 'Văn kiện' : doc.loai === 'phap_luat' ? 'Pháp luật' : doc.loai === 'chi_thi' ? 'Chỉ thị' : 'Giáo dục'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{topic ? topic.ten : 'Chính trị'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{doc.thoi_luong_phut || 5} phút đọc</span>
                        </div>

                        <h3 className="text-sm font-bold text-stone-900 hover:text-red-800 transition-colors line-clamp-2 mb-2 font-serif-doc">
                          {doc.tieu_de}
                        </h3>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {doc.tom_tat}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-200/60 text-xs">
                        <div className="flex items-center gap-2 text-stone-500">
                          {doc.loai_dinh_kem === 'audio' && <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
                          {doc.loai_dinh_kem === 'video' && <Video className="w-3.5 h-3.5 text-red-600" />}
                          {doc.loai_dinh_kem === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{doc.tac_gia}</span>
                        </div>
                        <span className="text-red-800 font-medium hover:underline flex items-center gap-1">
                          Đọc chi tiết <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Questions for Quick Testing */}
        {(searchFilter === 'all' || searchFilter === 'cau_hoi') && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Câu hỏi nhận thức & Kiểm tra ({results.questions.length})
              </h2>
              <button 
                onClick={() => setCurrentTab('trac_nghiem')}
                className="text-xs text-red-800 hover:text-red-900 font-medium flex items-center gap-1"
              >
                Làm bài trắc nghiệm nhận thức <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {results.questions.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">Không tìm thấy câu hỏi phù hợp.</p>
            ) : (
              <div className="space-y-3">
                {results.questions.map((q, idx) => {
                  const topic = chuyenDe.find(c => c.id === q.chuyen_de_id);
                  return (
                    <div 
                      key={q.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-xs text-stone-500 flex items-center gap-2">
                          <span className="font-semibold text-stone-700">Câu hỏi {idx + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span>{topic?.ten}</span>
                          <span aria-hidden="true">·</span>
                          <span className={q.muc_do === 'co_ban' ? 'text-emerald-700' : 'text-amber-700'}>
                            {q.muc_do === 'co_ban' ? 'Mức độ cơ bản' : 'Mức độ nâng cao'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleTakeQuizForTopic(q.chuyen_de_id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200 whitespace-nowrap"
                        >
                          Luyện tập đề thi này
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-stone-900 mb-2">
                        {q.noi_dung}
                      </p>

                      <div className="text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                        <span className="font-bold">Đáp án chuẩn: </span>
                        {q.cac_dap_an[q.dap_an_dung]}
                        <p className="text-stone-600 mt-1 italic">{q.giai_thich}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Unit History & Tradition */}
        {(searchFilter === 'all' || searchFilter === 'truyen_thong') && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-800" />
                Mốc lịch sử truyền thống đơn vị ({results.traditions.length})
              </h2>
              <button 
                onClick={() => setCurrentTab('truyen_thong')}
                className="text-xs text-red-800 hover:text-red-900 font-medium flex items-center gap-1"
              >
                Xem dòng thời gian hoàn chỉnh <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {results.traditions.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">Không tìm thấy mốc truyền thống phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.traditions.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="font-bold text-amber-700 text-sm font-serif-doc">{item.nam}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.ngay_thang}</span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 font-serif-doc mb-2">
                      {item.tieu_de}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
                      {item.noi_dung}
                    </p>

                    <div className="text-[11px] text-red-800 bg-red-50 p-2 rounded-lg border border-red-100">
                      <span className="font-semibold">Ý nghĩa lịch sử: </span>
                      {item.y_nghia}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
