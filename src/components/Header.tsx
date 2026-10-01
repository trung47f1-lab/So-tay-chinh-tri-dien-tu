import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { 
  BookOpen, 
  Search, 
  CheckSquare, 
  Shield, 
  QrCode, 
  Settings, 
  LogIn, 
  LogOut, 
  Radio, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    currentUser, 
    setIsLoginModalOpen, 
    logout,
    handleQRNavigation,
    isSyncing,
    syncNow
  } = useApp();

  const [quickQRInput, setQuickQRInput] = React.useState('');
  const [showQRQuickBox, setShowQRQuickBox] = React.useState(false);
  const [qrError, setQrError] = React.useState('');

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'trang_chu', label: 'Trang chủ', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'infographic', label: 'Infographic AI', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { tab: 'tra_cuu', label: 'Tra cứu', icon: <Search className="w-4 h-4" /> },
    { tab: 'kho_tai_lieu', label: 'Kho tài liệu', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'trac_nghiem', label: 'Trắc nghiệm', icon: <CheckSquare className="w-4 h-4" /> },
    { tab: 'truyen_thong', label: 'Truyền thống', icon: <Shield className="w-4 h-4" /> },
    { tab: 'da_phuong_tien', label: 'Âm thanh - Video', icon: <Radio className="w-4 h-4" /> },
    { tab: 'ma_qr', label: 'Mã QR', icon: <QrCode className="w-4 h-4" /> },
    ...(currentUser.vai_tro === 'quan_tri' 
      ? [{ tab: 'quan_tri' as ActiveTab, label: 'Quản trị', icon: <Settings className="w-4 h-4" /> }] 
      : [])
  ];

  const handleQuickQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQRInput.trim()) return;
    const ok = handleQRNavigation(quickQRInput.trim());
    if (ok) {
      setQuickQRInput('');
      setShowQRQuickBox(false);
      setQrError('');
    } else {
      setQrError('Không tìm thấy tài liệu với mã này. Hãy thử: QR-CD-10LT12DKL hoặc tl-1');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-red-950 text-white shadow-md">
      {/* Red accent top band reminiscent of military flags */}
      <div className="h-1 bg-gradient-to-r from-red-700 via-amber-500 to-red-700 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* ZONE 1: Brand title wordmark */}
          <button 
            onClick={() => setCurrentTab('trang_chu')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-red-700 to-red-900 border border-amber-500/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-amber-400 font-bold text-lg select-none">★</span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-stone-100 uppercase block font-serif-doc">
                Sổ Tay Chính Trị Điện Tử
              </span>
              <span className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Ứng dụng công nghệ số phục vụ cơ sở
              </span>
            </div>
          </button>

          {/* ZONE 2: Clean navigation links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setCurrentTab(item.tab)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-red-800 text-amber-300 shadow-sm' 
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: Primary actions */}
          <div className="flex items-center gap-2">
            
            {/* Live Sync Status indicator */}
            <button
              onClick={() => syncNow()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/90 hover:bg-stone-800 border border-stone-700/80 rounded-lg text-stone-300 transition-colors cursor-pointer"
              title="Dữ liệu được tự động lưu vào tệp nguồn và đồng bộ giữa máy tính và điện thoại. Bấm để đồng bộ ngay."
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ nguồn'}
              </span>
            </button>

            {/* Quick QR input toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQRQuickBox(!showQRQuickBox);
                  setQrError('');
                }}
                className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
                  showQRQuickBox
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-700'
                }`}
                title="Nhập mã QR nhanh"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Quick QR Popup */}
              {showQRQuickBox && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-200 p-4 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Mở nhanh qua Mã QR
                    </span>
                    <button 
                      onClick={() => setShowQRQuickBox(false)} 
                      className="text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    Nhập mã định danh in trên bảng tin đơn vị hoặc phòng Hồ Chí Minh để mở tức thì.
                  </p>
                  <form onSubmit={handleQuickQRSubmit} className="space-y-2">
                    <input
                      type="text"
                      value={quickQRInput}
                      onChange={(e) => setQuickQRInput(e.target.value)}
                      placeholder="VD: QR-CD-10LT12DKL hoặc tl-1"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 font-mono"
                      autoFocus
                    />
                    {qrError && (
                      <p className="text-[11px] text-red-600 leading-tight">{qrError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 px-3 bg-red-800 hover:bg-red-900 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Mở nội dung
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickQRInput('QR-CD-10LT12DKL');
                        }}
                        className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-lg transition-colors whitespace-nowrap"
                      >
                        Thử mã mẫu
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* User status & role toggle */}
            <div className="flex items-center">
              {currentUser.vai_tro !== 'quan_tri' ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700/80 hover:bg-red-700 text-white rounded-lg text-xs font-medium border border-red-600 transition-colors whitespace-nowrap shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Đăng nhập Admin</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 shadow-sm">
                  <div className="text-left hidden sm:block">
                    <span className="text-[11px] font-semibold text-amber-300 block leading-tight">
                      {currentUser.ho_ten}
                    </span>
                    <span className="text-[10px] text-stone-400 block leading-tight">
                      Quản trị viên (Admin)
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-amber-300 border border-amber-600/40">
                    Admin
                  </span>

                  <button
                    onClick={logout}
                    className="p-1 text-stone-400 hover:text-red-400 transition-colors"
                    title="Đăng xuất khỏi quyền Admin"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="lg:hidden flex items-center space-x-1 py-2 overflow-x-auto scrollbar-none border-t border-stone-800">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setCurrentTab(item.tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
                  isActive 
                    ? 'bg-red-800 text-amber-300' 
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
