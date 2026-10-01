import React from 'react';
import { useApp } from '../context/AppContext';
import { DailyContentBanner } from './DailyContentBanner';
import heroImage from '../assets/images/hero_chinh_tri_1790380032680.jpg';
import { 
  BookOpen, 
  HelpCircle, 
  CheckSquare, 
  Shield, 
  QrCode, 
  Radio, 
  ArrowRight, 
  Search,
  Sparkles,
  FileText,
  Award,
  Clock,
  Star,
  Compass
} from 'lucide-react';

export const HomeOverview: React.FC = () => {
  const { 
    setCurrentTab, 
    chuyenDe, 
    setActiveChuyenDeId, 
    taiLieu, 
    setSelectedTaiLieu,
    setSearchQuery,
    deThi,
    setSelectedDeThi,
    setExamMode
  } = useApp();

  const [homeSearch, setHomeSearch] = React.useState('');

  const currentHour = new Date().getHours();
  const militaryGreeting = currentHour >= 5 && currentHour < 12 
    ? 'Chào buổi sáng đồng chí! Chúc một ngày học tập giỏi, kỷ luật nghiêm!' 
    : currentHour >= 12 && currentHour < 18 
    ? 'Buổi chiều hăng say học tập, rèn luyện trên thao trường, bãi tập!' 
    : 'Giờ đọc báo, sinh hoạt chính trị, ôn tập nhận thức tại đơn vị!';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeSearch.trim()) return;
    setSearchQuery(homeSearch.trim());
    setCurrentTab('tra_cuu');
  };

  const handleSelectTopic = (topicId: string) => {
    setActiveChuyenDeId(topicId);
    setCurrentTab('kho_tai_lieu');
  };

  const handleStartExamQuick = () => {
    if (deThi.length > 0) {
      setSelectedDeThi(deThi[0]);
      setExamMode('test');
      setCurrentTab('trac_nghiem');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. HERO INSTITUTIONAL MARQUEE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950 via-stone-950 to-stone-900 border border-red-900/60 text-white shadow-xl">
        <div className="relative min-h-[250px] sm:min-h-[290px] w-full overflow-hidden">
          {/* Background image bundled by Vite, with onError fallback so no broken image ever shows */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-45 opacity-60"
          />

          {/* Decorative Gold Star Watermark */}
          <div className="absolute right-4 -bottom-8 pointer-events-none opacity-10 sm:opacity-15 text-amber-400">
            <Star className="w-56 h-56 fill-amber-400" />
          </div>

          {/* Measured contrast scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-red-950/30" />
          
          <div className="relative z-10 flex flex-col justify-end p-5 sm:p-8 max-w-4xl">
            {/* Dynamic Military Time Greeting */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-semibold text-amber-300 mb-2.5 backdrop-blur-sm self-start">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{militaryGreeting}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-400 uppercase font-bold tracking-widest mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block border border-amber-400" />
              <span>Quân đội Nhân dân Việt Nam · Đơn vị cơ sở</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-serif-doc text-white leading-tight">
              Sổ Tay Chính Trị Điện Tử
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-200 mt-2 max-w-2xl leading-relaxed">
              Giải pháp số hóa toàn diện công tác Đảng, công tác chính trị tại đơn vị. Thống nhất tài liệu, nâng cao chất lượng tự học tập, tra cứu nhanh chóng và kiểm tra nhận thức chính trị theo thời gian thực.
            </p>

            {/* Quick action buttons in Hero */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4 sm:mt-5">
              <button
                onClick={() => setCurrentTab('kho_tai_lieu')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Tra cứu kho tài liệu</span>
              </button>

              <button
                onClick={handleStartExamQuick}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-stone-800/90 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-colors backdrop-blur-sm"
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Làm bài kiểm tra nhận thức</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Strip integrated at bottom of Hero */}
        <div className="bg-stone-950 border-t border-stone-800/80 px-6 py-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder="Tra cứu nhanh chỉ thị, lời thề, điều lệnh, chiến công lịch sử..."
                className="w-full pl-10 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* 2. MỖI NGÀY MỘT NỘI DUNG (Daily political highlight) */}
      <DailyContentBanner />

      {/* 3. 6 CHUYÊN ĐỀ HỌC TẬP CHÍNH TRỊ TRỌNG TÂM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-red-800 tracking-wider">Học tập chính quy</span>
            <h2 className="text-xl font-bold font-serif-doc text-stone-900">
              6 Chuyên Đề Giáo Dục Chính Trị Cơ Bản
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('kho_tai_lieu')}
            className="text-xs text-red-800 hover:text-red-900 font-semibold flex items-center gap-1"
          >
            Tất cả tài liệu <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chuyenDe.map((cd, index) => (
            <div
              key={cd.id}
              onClick={() => handleSelectTopic(cd.id)}
              className="bg-white rounded-2xl border border-stone-200 hover:border-red-700/60 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-mono font-bold text-red-800 text-[11px]">
                    CHUYÊN ĐỀ 0{index + 1}
                  </span>
                  <span>{cd.so_tai_lieu} tài liệu · {cd.so_cau_hoi} câu hỏi</span>
                </div>

                <h3 className="text-base font-bold font-serif-doc text-stone-900 group-hover:text-red-800 transition-colors mb-2 leading-snug">
                  {cd.ten}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {cd.mo_ta}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400 group-hover:text-red-800 transition-colors font-medium">
                  Mở chuyên đề
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-800 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TÍNH NĂNG NỔI BẬT: INFOGRAPHIC AI, HỎI NHANH VÀ MÃ QR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Infographic Studio Card */}
        <div 
          onClick={() => setCurrentTab('infographic')}
          className="bg-gradient-to-br from-red-900/10 via-amber-50 to-stone-50 rounded-2xl border-2 border-amber-500/50 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-red-800"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-800 to-amber-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-200 fill-amber-200" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-800 text-amber-300 font-bold uppercase tracking-wider">
                MỚI · AI TẠO
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-red-900 tracking-wider">
              Tự Động Hóa Tuyên Huấn
            </span>
            <h3 className="text-lg font-bold font-serif-doc text-stone-900 mt-1 group-hover:text-red-900 transition-colors">
              Infographic Lời Bác & Chuyên Đề
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Biên tập tự động bằng AI, trích xuất điểm cốt lõi, tích hợp hình ảnh sĩ quan QĐND Việt Nam chính quy, chuẩn in áp phích A4.
            </p>
          </div>

          <div className="pt-4 mt-4 flex items-center text-xs font-bold text-red-900">
            <span>Mở Xưởng Biên tập AI</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Flashcards Card */}
        <div 
          onClick={() => setCurrentTab('hoi_nhanh')}
          className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
              Phân hệ 4 · Không áp lực điểm số
            </span>
            <h3 className="text-lg font-bold font-serif-doc text-stone-900 mt-1">
              Hỏi Nhanh — Đáp Đúng (Thẻ lật)
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Chiến sĩ tự bấm lật thẻ để kiểm tra trí nhớ, củng cố 10 lời thề danh dự, 12 điều kỷ luật và các mốc lịch sử mà không lo bị ghi nhận điểm.
            </p>
          </div>

          <div className="pt-4 mt-4 flex items-center text-xs font-semibold text-amber-900">
            <span>Bắt đầu ôn luyện ngay</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>

        {/* QR Politics Card */}
        <div 
          onClick={() => setCurrentTab('ma_qr')}
          className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-2xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-800 text-white flex items-center justify-center mb-3 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-red-900 tracking-wider">
              Cơ chế kết nối thông minh
            </span>
            <h3 className="text-lg font-bold font-serif-doc text-stone-900 mt-1">
              Mã QR Chính Trị Niêm Yết Đơn Vị
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              In dán mã QR tại Phòng Hồ Chí Minh, bảng tin thi đua để bộ đội dùng điện thoại quét và mở thẳng tài liệu học tập trong mạng LAN nội bộ.
            </p>
          </div>

          <div className="pt-4 mt-4 flex items-center text-xs font-semibold text-red-900">
            <span>Khám phá điểm quét QR</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </div>
        </div>

      </div>

      {/* 5. TÀI LIỆU TIÊU BIỂU GẦN ĐÂY */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase font-bold text-red-800 tracking-wider">Văn bản tiêu biểu</span>
            <h3 className="text-base font-bold font-serif-doc text-stone-900">
              Văn Kiện & Quy Định Mới Ban Hành
            </h3>
          </div>
          <button
            onClick={() => setCurrentTab('kho_tai_lieu')}
            className="text-xs text-red-800 hover:text-red-900 font-semibold"
          >
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taiLieu.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedTaiLieu(doc)}
              className="p-4 rounded-xl border border-stone-200 hover:border-red-700/50 bg-stone-50/50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider block mb-1">
                  {doc.tac_gia}
                </span>
                <h4 className="text-sm font-bold font-serif-doc text-stone-900 line-clamp-2 mb-2 leading-snug">
                  {doc.tieu_de}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-2">
                  {doc.tom_tat}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{doc.ngay_dang}</span>
                <span className="text-red-800 font-semibold flex items-center gap-1">
                  Đọc <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
