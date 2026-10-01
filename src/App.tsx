import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeOverview } from './components/HomeOverview';
import { SearchSection } from './components/SearchSection';
import { DocumentLibrary } from './components/DocumentLibrary';
import { DailyContentBanner } from './components/DailyContentBanner';
import { QuizSection } from './components/QuizSection';
import { TraditionTimeline } from './components/TraditionTimeline';
import { MediaSection } from './components/MediaSection';
import { PoliticalQRManager } from './components/PoliticalQRManager';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { PrintQRModal } from './components/PrintQRModal';
import { LoginModal } from './components/LoginModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { InfographicStudio } from './components/InfographicStudio';
import { Shield } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    currentUser, 
    setIsLoginModalOpen,
    deThi,
    setSelectedDeThi,
    setExamMode,
    taiLieu,
    setSelectedTaiLieu,
    handleQRNavigation
  } = useApp();

  // Handle direct link or scanned QR code containing URL parameters
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const examParam = urlParams.get('exam') || urlParams.get('de_thi') || urlParams.get('dethi');
      const docParam = urlParams.get('doc') || urlParams.get('tai_lieu') || urlParams.get('tailieu');
      const qrParam = urlParams.get('qr') || urlParams.get('code');

      if (examParam && deThi.length > 0) {
        const found = deThi.find(d => 
          d.id.toLowerCase() === examParam.toLowerCase() || 
          (d.ma_de && d.ma_de.toLowerCase() === examParam.toLowerCase())
        );
        if (found) {
          setSelectedDeThi(found);
          setExamMode('test');
          setCurrentTab('trac_nghiem');
        }
      } else if (docParam && taiLieu.length > 0) {
        const found = taiLieu.find(d => d.id.toLowerCase() === docParam.toLowerCase());
        if (found) {
          setSelectedTaiLieu(found);
          setCurrentTab('kho_tai_lieu');
        }
      } else if (qrParam) {
        handleQRNavigation(qrParam);
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, [deThi, taiLieu, setSelectedDeThi, setExamMode, setCurrentTab, setSelectedTaiLieu, handleQRNavigation]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-red-800 selection:text-white">
      
      {/* Top Bar Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        {currentTab === 'trang_chu' && <HomeOverview />}
        {currentTab === 'tra_cuu' && <SearchSection />}
        {currentTab === 'kho_tai_lieu' && <DocumentLibrary />}
        {currentTab === 'moi_ngay' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <DailyContentBanner />
          </div>
        )}
        {currentTab === 'trac_nghiem' && <QuizSection />}
        {currentTab === 'truyen_thong' && <TraditionTimeline />}
        {currentTab === 'da_phuong_tien' && <MediaSection />}
        {currentTab === 'ma_qr' && <PoliticalQRManager />}
        {currentTab === 'infographic' && <InfographicStudio />}
        {currentTab === 'quan_tri' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <DocumentDetailModal />
      <PrintQRModal />
      <LoginModal />

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar />

      {/* Official Unit Footer (Anti-Slop, Quiet & Dignified) */}
      <footer className="no-print bg-stone-900 text-stone-400 border-t border-red-950 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-md bg-red-900/60 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              ★
            </div>
            <div>
              <span className="font-bold text-stone-200 block font-serif-doc">
                SỔ TAY CHÍNH TRỊ ĐIỆN TỬ · ĐƠN VỊ CƠ SỞ
              </span>
              <span className="text-[11px] text-stone-500">
                Ứng dụng số hóa tài liệu, học tập và kiểm tra nhận thức trong mạng nội bộ LAN
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400">
            <button 
              onClick={() => setCurrentTab('trang_chu')}
              className="hover:text-stone-200 transition-colors"
            >
              Trang chủ
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => setCurrentTab('tra_cuu')}
              className="hover:text-stone-200 transition-colors"
            >
              Tra cứu
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => setCurrentTab('infographic')}
              className="hover:text-amber-300 transition-colors"
            >
              Infographic AI
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => setCurrentTab('ma_qr')}
              className="hover:text-stone-200 transition-colors"
            >
              Mã QR niêm yết
            </button>
            <span aria-hidden="true">·</span>
            {currentUser.vai_tro === 'chien_si' ? (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Khu vực Cán bộ
              </button>
            ) : (
              <button 
                onClick={() => setCurrentTab('quan_tri')}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                Bảng điều khiển Quản trị
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
