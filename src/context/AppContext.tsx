import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  TaiLieu, 
  ChuyenDe, 
  CauHoi, 
  DeThi, 
  KetQua, 
  NoiDungHangNgay, 
  MocTruyenThong, 
  NguoiDung, 
  QRCodeItem, 
  NhatKyHeThong, 
  BaiHatTruyenThong,
  VideoTuLieu,
  VaiTro,
  InfographicItem
} from '../types';
import {
  CHUYEN_DE_INITIAL,
  TAI_LIEU_INITIAL,
  CAU_HOI_INITIAL,
  DE_THI_INITIAL,
  NOI_DUNG_HANG_NGAY_INITIAL,
  MOC_TRUYEN_THONG_INITIAL,
  NGUOI_DUNG_INITIAL,
  QR_CODE_INITIAL,
  BAI_HAT_INITIAL,
  VIDEO_INITIAL,
  KET_QUA_INITIAL,
  NHAT_KY_INITIAL,
  INFOGRAPHIC_INITIAL,
  AI_OFFICER_IMAGES
} from '../data/initialData';

export type ActiveTab = 
  | 'trang_chu' 
  | 'tra_cuu' 
  | 'kho_tai_lieu' 
  | 'moi_ngay' 
  | 'hoi_nhanh' 
  | 'trac_nghiem' 
  | 'truyen_thong' 
  | 'da_phuong_tien' 
  | 'ma_qr' 
  | 'infographic'
  | 'quan_tri';

export type SearchCategoryFilter = 'all' | 'van_ban' | 'hinh_anh' | 'am_thanh_video' | 'cau_hoi' | 'truyen_thong';

interface AppContextType {
  // Navigation
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  
  // Data Collections
  chuyenDe: ChuyenDe[];
  taiLieu: TaiLieu[];
  cauHoi: CauHoi[];
  deThi: DeThi[];
  ketQua: KetQua[];
  noiDungHangNgay: NoiDungHangNgay[];
  mocTruyenThong: MocTruyenThong[];
  qrCodes: QRCodeItem[];
  baiHat: BaiHatTruyenThong[];
  video: VideoTuLieu[];
  nhatKy: NhatKyHeThong[];
  infographics: InfographicItem[];
  
  // User & Auth
  currentUser: NguoiDung;
  adminAccount: {
    taiKhoan: string;
    matKhau: string;
    hoTen: string;
    capBac: string;
    chucVu: string;
    donVi: string;
  };
  updateAdminAccount: (newAccount: {
    taiKhoan?: string;
    matKhau?: string;
    hoTen?: string;
    capBac?: string;
    chucVu?: string;
    donVi?: string;
  }) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (taiKhoan: string, matKhau: string) => { success: boolean; message: string };
  switchRoleDemo: (role: VaiTro) => void;
  logout: () => void;
  
  // Modals & Details
  selectedTaiLieu: TaiLieu | null;
  setSelectedTaiLieu: (doc: TaiLieu | null) => void;
  selectedDeThi: DeThi | null;
  setSelectedDeThi: (exam: DeThi | null) => void;
  examMode: 'practice' | 'test';
  setExamMode: (mode: 'practice' | 'test') => void;
  selectedQRCodeForPrint: QRCodeItem | null;
  setSelectedQRCodeForPrint: (qr: QRCodeItem | null) => void;
  
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilter: SearchCategoryFilter;
  setSearchFilter: (filter: SearchCategoryFilter) => void;
  activeChuyenDeId: string | null;
  setActiveChuyenDeId: (id: string | null) => void;
  
  // Media & Speech
  currentAudioTrack: BaiHatTruyenThong | null;
  isPlayingAudio: boolean;
  playTrack: (track: BaiHatTruyenThong) => void;
  pauseTrack: () => void;
  stopAudio: () => void;
  
  isSpeaking: boolean;
  speakingTitle: string;
  speakText: (text: string, title: string) => void;
  stopSpeaking: () => void;
  
  // CRUD Actions
  addTaiLieu: (doc: Omit<TaiLieu, 'id' | 'so_luot_xem'>) => void;
  updateTaiLieu: (doc: TaiLieu) => void;
  deleteTaiLieu: (id: string) => void;
  
  addCauHoi: (question: Omit<CauHoi, 'id'>) => void;
  addBatchCauHoi: (questions: Array<Omit<CauHoi, 'id'>>) => void;
  updateCauHoi: (question: CauHoi) => void;
  deleteCauHoi: (id: string) => void;
  deleteBatchCauHoi: (ids: string[]) => void;
  clearCauHoiByTopic: (topicId: string) => void;
  
  addDeThi: (exam: Omit<DeThi, 'id'>) => void;
  updateDeThi: (exam: DeThi) => void;
  deleteDeThi: (id: string) => void;
  
  addKetQua: (result: Omit<KetQua, 'id' | 'ngay_thi'>) => void;
  deleteKetQua: (id: string) => void;
  
  addQRCode: (qr: Omit<QRCodeItem, 'id' | 'ngay_tao' | 'luot_quet'>) => QRCodeItem;
  deleteQRCode: (id: string) => void;
  recordQRScan: (qrId: string) => void;
  
  addNoiDungHangNgay: (item: Omit<NoiDungHangNgay, 'id'>) => void;
  updateNoiDungHangNgay: (item: NoiDungHangNgay) => void;
  deleteNoiDungHangNgay: (id: string) => void;
  
  addBaiHat: (item: Omit<BaiHatTruyenThong, 'id'>) => void;
  updateBaiHat: (item: BaiHatTruyenThong) => void;
  deleteBaiHat: (id: string) => void;
  
  addVideo: (item: Omit<VideoTuLieu, 'id'>) => void;
  updateVideo: (item: VideoTuLieu) => void;
  deleteVideo: (id: string) => void;
  
  addMocTruyenThong: (item: Omit<MocTruyenThong, 'id'>) => void;
  updateMocTruyenThong: (item: MocTruyenThong) => void;
  deleteMocTruyenThong: (id: string) => void;
  
  // Infographics Actions
  selectedInfographic: InfographicItem | null;
  setSelectedInfographic: (item: InfographicItem | null) => void;
  editorialDraft: {
    title: string;
    content: string;
    sourceType: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh';
    selectedVisualId?: string;
  } | null;
  setEditorialDraft: (draft: {
    title: string;
    content: string;
    sourceType: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh';
    selectedVisualId?: string;
  } | null) => void;
  openInfographicStudioWithDraft: (
    title: string,
    content: string,
    sourceType: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh',
    selectedVisualId?: string
  ) => void;
  addInfographic: (item: InfographicItem) => void;
  updateInfographic: (id: string, updates: Partial<InfographicItem>) => void;
  deleteInfographic: (id: string) => void;
  
  uploadFileToServer: (fileName: string, fileData: string, fileType?: string, folder?: string) => Promise<string | null>;
  logAction: (action: string, detail: string) => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (json: string) => boolean;
  resetDatabase: () => void;
  handleQRNavigation: (identifierOrUrl: string) => boolean;

  // Synchronization with source files and server
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [currentTab, setCurrentTab] = useState<ActiveTab>('trang_chu');
  
  const [chuyenDe, setChuyenDe] = useState<ChuyenDe[]>(() => {
    const saved = localStorage.getItem('stct_chuyen_de');
    return saved ? JSON.parse(saved) : CHUYEN_DE_INITIAL;
  });

  const [taiLieu, setTaiLieu] = useState<TaiLieu[]>(() => {
    const saved = localStorage.getItem('stct_tai_lieu');
    return saved ? JSON.parse(saved) : TAI_LIEU_INITIAL;
  });

  const [cauHoi, setCauHoi] = useState<CauHoi[]>(() => {
    const saved = localStorage.getItem('stct_cau_hoi');
    return saved ? JSON.parse(saved) : CAU_HOI_INITIAL;
  });

  const [deThi, setDeThi] = useState<DeThi[]>(() => {
    const saved = localStorage.getItem('stct_de_thi');
    return saved ? JSON.parse(saved) : DE_THI_INITIAL;
  });

  const [ketQua, setKetQua] = useState<KetQua[]>(() => {
    const saved = localStorage.getItem('stct_ket_qua');
    return saved ? JSON.parse(saved) : KET_QUA_INITIAL;
  });

  const [noiDungHangNgay, setNoiDungHangNgay] = useState<NoiDungHangNgay[]>(() => {
    const saved = localStorage.getItem('stct_noi_dung_hang_ngay');
    return saved ? JSON.parse(saved) : NOI_DUNG_HANG_NGAY_INITIAL;
  });

  const [mocTruyenThong, setMocTruyenThong] = useState<MocTruyenThong[]>(() => {
    // Clear old sample/demo traditions if this is first run of the official clean version
    const cleanFlag = 'stct_tradition_clean_official_v4';
    if (!localStorage.getItem(cleanFlag)) {
      localStorage.removeItem('stct_moc_truyen_thong');
      localStorage.setItem(cleanFlag, 'true');
      return [];
    }
    const saved = localStorage.getItem('stct_moc_truyen_thong');
    return saved ? JSON.parse(saved) : [];
  });

  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>(() => {
    const saved = localStorage.getItem('stct_qr_codes');
    return saved ? JSON.parse(saved) : QR_CODE_INITIAL;
  });

  const [baiHat, setBaiHat] = useState<BaiHatTruyenThong[]>(() => {
    const saved = localStorage.getItem('stct_bai_hat');
    return saved ? JSON.parse(saved) : BAI_HAT_INITIAL;
  });

  const [video, setVideo] = useState<VideoTuLieu[]>(() => {
    const saved = localStorage.getItem('stct_video');
    return saved ? JSON.parse(saved) : VIDEO_INITIAL;
  });

  const [nhatKy, setNhatKy] = useState<NhatKyHeThong[]>(() => {
    const saved = localStorage.getItem('stct_nhat_ky');
    return saved ? JSON.parse(saved) : NHAT_KY_INITIAL;
  });

  const [infographics, setInfographics] = useState<InfographicItem[]>(() => {
    const saved = localStorage.getItem('stct_infographics');
    return saved ? JSON.parse(saved) : INFOGRAPHIC_INITIAL;
  });

  const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(null);
  const [editorialDraft, setEditorialDraft] = useState<{
    title: string;
    content: string;
    sourceType: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh';
    selectedVisualId?: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('stct_infographics', JSON.stringify(infographics));
  }, [infographics]);

  // User state
  const [currentUser, setCurrentUser] = useState<NguoiDung>(() => {
    const saved = localStorage.getItem('stct_current_user');
    return saved ? JSON.parse(saved) : NGUOI_DUNG_INITIAL[0]; // Default member/soldier
  });

  // Dedicated Admin Account credentials
  const [adminAccount, setAdminAccount] = useState<{
    taiKhoan: string;
    matKhau: string;
    hoTen: string;
    capBac: string;
    chucVu: string;
    donVi: string;
  }>(() => {
    const saved = localStorage.getItem('stct_admin_account_v3');
    return saved ? JSON.parse(saved) : {
      taiKhoan: 'admin',
      matKhau: 'admin123',
      hoTen: 'Quản trị viên Hệ thống',
      capBac: 'Thiếu tá',
      chucVu: 'Trợ lý Tuyên huấn - Quản trị',
      donVi: 'Ban Chính trị Trung đoàn'
    };
  });

  useEffect(() => {
    localStorage.setItem('stct_admin_account_v3', JSON.stringify(adminAccount));
  }, [adminAccount]);

  const updateAdminAccount = (newAccount: {
    taiKhoan?: string;
    matKhau?: string;
    hoTen?: string;
    capBac?: string;
    chucVu?: string;
    donVi?: string;
  }) => {
    setAdminAccount(prev => {
      const updated = { ...prev, ...newAccount };
      if (currentUser.vai_tro === 'quan_tri') {
        setCurrentUser(curr => ({
          ...curr,
          ho_ten: updated.hoTen,
          cap_bac: updated.capBac,
          chuc_vu: updated.chucVu,
          don_vi: updated.donVi,
          tai_khoan: updated.taiKhoan
        }));
      }
      pushToServer({ adminAccount: updated });
      return updated;
    });
    logAction('Cập nhật tài khoản Admin', 'Cập nhật thông tin/mật khẩu tài khoản Quản trị viên');
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active items
  const [selectedTaiLieu, setSelectedTaiLieu] = useState<TaiLieu | null>(null);
  const [selectedDeThi, setSelectedDeThi] = useState<DeThi | null>(null);
  const [examMode, setExamMode] = useState<'practice' | 'test'>('practice');
  const [selectedQRCodeForPrint, setSelectedQRCodeForPrint] = useState<QRCodeItem | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchCategoryFilter>('all');
  const [activeChuyenDeId, setActiveChuyenDeId] = useState<string | null>(null);

  // Media Player
  const [currentAudioTrack, setCurrentAudioTrack] = useState<BaiHatTruyenThong | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Web Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingTitle, setSpeakingTitle] = useState('');

  // Synchronization with server and source files (database.json & uploads/)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const lastServerTimestamp = useRef<number>(0);
  const isPushing = useRef<boolean>(false);

  // Sync from server (loads database.json)
  const fetchFromServer = useCallback(async (isInitial = false) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (Array.isArray(d.chuyenDe) && d.chuyenDe.length > 0) setChuyenDe(d.chuyenDe);
        if (Array.isArray(d.taiLieu)) setTaiLieu(d.taiLieu);
        if (Array.isArray(d.cauHoi)) setCauHoi(d.cauHoi);
        if (Array.isArray(d.deThi)) setDeThi(d.deThi);
        if (Array.isArray(d.ketQua)) setKetQua(d.ketQua);
        if (Array.isArray(d.noiDungHangNgay)) setNoiDungHangNgay(d.noiDungHangNgay);
        if (Array.isArray(d.mocTruyenThong)) setMocTruyenThong(d.mocTruyenThong);
        if (Array.isArray(d.qrCodes)) setQrCodes(d.qrCodes);
        if (Array.isArray(d.baiHat)) setBaiHat(d.baiHat);
        if (Array.isArray(d.video)) setVideo(d.video);
        if (Array.isArray(d.nhatKy)) setNhatKy(d.nhatKy);
        if (Array.isArray(d.infographics)) setInfographics(d.infographics);
        if (d.adminAccount && d.adminAccount.taiKhoan) setAdminAccount(d.adminAccount);

        lastServerTimestamp.current = json.lastUpdated || Date.now();
        setLastSyncTime(new Date());
      }
    } catch (err) {
      if (isInitial) {
        console.warn('[Sync] Using local storage mode:', err);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Upload file helper: uploads file to server disk /uploads/{folder}/
  const uploadFileToServer = async (fileName: string, fileData: string, fileType?: string, folder?: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/upload-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileData, fileType, folder })
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.fileUrl) {
        return json.fileUrl;
      }
    } catch (err) {
      console.warn('[Upload] Server upload failed, preserving local data URL:', err);
    }
    return null;
  };

  // Push updates to server /api/data (which updates data/database.json)
  const pushToServer = async (override?: Record<string, any>) => {
    if (isPushing.current) return;
    try {
      isPushing.current = true;
      setIsSyncing(true);
      const payload = {
        chuyenDe,
        taiLieu,
        cauHoi,
        deThi,
        ketQua,
        noiDungHangNgay,
        mocTruyenThong,
        qrCodes,
        baiHat,
        video,
        nhatKy,
        infographics,
        adminAccount,
        ...override
      };
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        lastServerTimestamp.current = json.lastUpdated || Date.now();
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('[Sync] Push to server failed:', err);
    } finally {
      isPushing.current = false;
      setIsSyncing(false);
    }
  };

  const syncNow = async () => {
    await fetchFromServer();
  };

  // Setup initial fetch and periodic auto-sync polling
  useEffect(() => {
    fetchFromServer(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/version');
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.lastUpdated && json.lastUpdated > lastServerTimestamp.current) {
          fetchFromServer();
        }
      } catch (e) {
        // silent offline fallback
      }
    }, 7000);

    const onFocus = () => {
      fetchFromServer();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchFromServer]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('stct_chuyen_de', JSON.stringify(chuyenDe));
  }, [chuyenDe]);

  useEffect(() => {
    localStorage.setItem('stct_tai_lieu', JSON.stringify(taiLieu));
  }, [taiLieu]);

  useEffect(() => {
    localStorage.setItem('stct_cau_hoi', JSON.stringify(cauHoi));
  }, [cauHoi]);

  useEffect(() => {
    localStorage.setItem('stct_de_thi', JSON.stringify(deThi));
  }, [deThi]);

  useEffect(() => {
    localStorage.setItem('stct_ket_qua', JSON.stringify(ketQua));
  }, [ketQua]);

  useEffect(() => {
    localStorage.setItem('stct_qr_codes', JSON.stringify(qrCodes));
  }, [qrCodes]);

  useEffect(() => {
    localStorage.setItem('stct_nhat_ky', JSON.stringify(nhatKy));
  }, [nhatKy]);

  useEffect(() => {
    localStorage.setItem('stct_moc_truyen_thong', JSON.stringify(mocTruyenThong));
  }, [mocTruyenThong]);

  useEffect(() => {
    localStorage.setItem('stct_noi_dung_hang_ngay', JSON.stringify(noiDungHangNgay));
  }, [noiDungHangNgay]);

  useEffect(() => {
    localStorage.setItem('stct_bai_hat', JSON.stringify(baiHat));
  }, [baiHat]);

  useEffect(() => {
    localStorage.setItem('stct_video', JSON.stringify(video));
  }, [video]);

  useEffect(() => {
    localStorage.setItem('stct_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Logging
  const logAction = (hanhDong: string, chiTiet: string) => {
    const newLog: NhatKyHeThong = {
      id: 'log-' + Date.now(),
      thoi_gian: new Date().toLocaleString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      nguoi_thuc_hien: `${currentUser.cap_bac} ${currentUser.ho_ten}`,
      vai_tro: currentUser.vai_tro === 'quan_tri' ? 'Quản trị hệ thống' : currentUser.vai_tro === 'can_bo' ? 'Cán bộ phụ trách' : 'Chiến sĩ',
      hanh_dong: hanhDong,
      chi_tiet: chiTiet
    };
    setNhatKy(prev => [newLog, ...prev]);
  };

  // Auth: Dedicated Admin Authentication
  const login = (taiKhoan: string, matKhau: string) => {
    const cleanUser = taiKhoan.trim();
    const cleanPass = matKhau.trim();

    if (cleanUser === adminAccount.taiKhoan && cleanPass === adminAccount.matKhau) {
      const u: NguoiDung = {
        id: 'user-admin',
        ho_ten: adminAccount.hoTen,
        cap_bac: adminAccount.capBac,
        chuc_vu: adminAccount.chucVu,
        don_vi: adminAccount.donVi,
        vai_tro: 'quan_tri',
        tai_khoan: adminAccount.taiKhoan,
        dang_nhap_cuoi: new Date().toLocaleString('vi-VN')
      };
      setCurrentUser(u);
      logAction('Đăng nhập', `Quản trị viên (${adminAccount.taiKhoan}) đăng nhập thành công`);
      return { success: true, message: 'Đăng nhập thành công với quyền Quản trị viên (Admin)' };
    }

    return { 
      success: false, 
      message: 'Tài khoản hoặc mật khẩu không chính xác. Chỉ Quản trị viên (Admin) mới có quyền đăng nhập quản trị hệ thống.' 
    };
  };

  const switchRoleDemo = (role: VaiTro) => {
    const targetUser = NGUOI_DUNG_INITIAL.find(u => u.vai_tro === role) || NGUOI_DUNG_INITIAL[0];
    setCurrentUser(targetUser);
    logAction('Chuyển vai trò', `Đổi vai trò sang: ${role}`);
  };

  const logout = () => {
    logAction('Đăng xuất', 'Quản trị viên đăng xuất về chế độ xem thành viên');
    setCurrentUser(NGUOI_DUNG_INITIAL[0]);
    if (currentTab === 'quan_tri') {
      setCurrentTab('trang_chu');
    }
  };

  // Speech Synthesis
  const speakText = (text: string, title: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của đồng chí chưa hỗ trợ phát âm thanh Web Speech.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingTitle(title);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingTitle('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingTitle('');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingTitle('');
  };

  // Audio Music Player
  const playTrack = (track: BaiHatTruyenThong) => {
    stopSpeaking();
    setCurrentAudioTrack(track);
    setIsPlayingAudio(true);
  };

  const pauseTrack = () => {
    setIsPlayingAudio(false);
  };

  const stopAudio = () => {
    setIsPlayingAudio(false);
    setCurrentAudioTrack(null);
  };

  // CRUD for Documents
  const addTaiLieu = async (doc: Omit<TaiLieu, 'id' | 'so_luot_xem'>) => {
    let finalDoc = { ...doc };
    // If the file was attached as a base64 data URL, upload to server disk /uploads/documents/
    if (doc.du_lieu_tep && doc.du_lieu_tep.startsWith('data:')) {
      const serverFileUrl = await uploadFileToServer(doc.ten_tep_goc || 'van-ban.docx', doc.du_lieu_tep, doc.loai_dinh_kem);
      if (serverFileUrl) {
        finalDoc.du_lieu_tep = serverFileUrl;
      }
    }

    const newDoc: TaiLieu = {
      ...finalDoc,
      id: 'tl-' + Date.now(),
      so_luot_xem: 1,
    };
    const updatedDocs = [newDoc, ...taiLieu];
    const updatedCds = chuyenDe.map(cd => cd.id === doc.chuyen_de_id ? { ...cd, so_tai_lieu: cd.so_tai_lieu + 1 } : cd);
    setTaiLieu(updatedDocs);
    setChuyenDe(updatedCds);
    logAction('Thêm tài liệu', `Thêm mới tài liệu "${newDoc.tieu_de}"`);
    pushToServer({ taiLieu: updatedDocs, chuyenDe: updatedCds });
  };

  const updateTaiLieu = async (doc: TaiLieu) => {
    let finalDoc = { ...doc };
    if (doc.du_lieu_tep && doc.du_lieu_tep.startsWith('data:')) {
      const serverFileUrl = await uploadFileToServer(doc.ten_tep_goc || 'van-ban.docx', doc.du_lieu_tep, doc.loai_dinh_kem);
      if (serverFileUrl) {
        finalDoc.du_lieu_tep = serverFileUrl;
      }
    }
    const updatedDocs = taiLieu.map(d => d.id === doc.id ? finalDoc : d);
    setTaiLieu(updatedDocs);
    logAction('Sửa tài liệu', `Cập nhật tài liệu "${doc.tieu_de}"`);
    pushToServer({ taiLieu: updatedDocs });
  };

  const deleteTaiLieu = (id: string) => {
    const docToDelete = taiLieu.find(d => d.id === id);
    if (!docToDelete) return;
    const updatedDocs = taiLieu.filter(d => d.id !== id);
    const updatedCds = chuyenDe.map(cd => cd.id === docToDelete.chuyen_de_id ? { ...cd, so_tai_lieu: Math.max(0, cd.so_tai_lieu - 1) } : cd);
    setTaiLieu(updatedDocs);
    setChuyenDe(updatedCds);
    logAction('Xóa tài liệu', `Đã xóa tài liệu "${docToDelete.tieu_de}"`);
    pushToServer({ taiLieu: updatedDocs, chuyenDe: updatedCds });
  };

  // CRUD for Questions
  const addCauHoi = (question: Omit<CauHoi, 'id'>) => {
    const newQ: CauHoi = {
      ...question,
      id: 'ch-' + Date.now()
    };
    const updatedQs = [...cauHoi, newQ];
    const updatedCds = chuyenDe.map(cd => cd.id === question.chuyen_de_id ? { ...cd, so_cau_hoi: cd.so_cau_hoi + 1 } : cd);
    setCauHoi(updatedQs);
    setChuyenDe(updatedCds);
    logAction('Thêm câu hỏi', `Thêm câu hỏi nhận thức vào chuyên đề`);
    pushToServer({ cauHoi: updatedQs, chuyenDe: updatedCds });
  };

  const addBatchCauHoi = (newQuestions: Array<Omit<CauHoi, 'id'>>) => {
    if (!newQuestions || newQuestions.length === 0) return;
    const created: CauHoi[] = newQuestions.map((q, idx) => ({
      ...q,
      id: `ch-${Date.now()}-${idx + 1}`
    }));
    const updatedQs = [...cauHoi, ...created];
    const updatedCds = chuyenDe.map(cd => {
      const addedForCd = created.filter(q => q.chuyen_de_id === cd.id).length;
      return addedForCd > 0 ? { ...cd, so_cau_hoi: cd.so_cau_hoi + addedForCd } : cd;
    });
    setCauHoi(updatedQs);
    setChuyenDe(updatedCds);
    logAction('Nhập câu hỏi từ tệp', `Đã nhập tự động ${created.length} câu hỏi từ tệp vào ngân hàng câu hỏi`);
    pushToServer({ cauHoi: updatedQs, chuyenDe: updatedCds });
  };

  const updateCauHoi = (question: CauHoi) => {
    const updatedQs = cauHoi.map(q => q.id === question.id ? question : q);
    setCauHoi(updatedQs);
    logAction('Sửa câu hỏi', `Cập nhật nội dung câu hỏi mã ${question.id}`);
    pushToServer({ cauHoi: updatedQs });
  };

  const deleteCauHoi = (id: string) => {
    const qToDelete = cauHoi.find(q => q.id === id);
    if (!qToDelete) return;
    const updatedQs = cauHoi.filter(q => q.id !== id);
    const updatedCds = chuyenDe.map(cd => cd.id === qToDelete.chuyen_de_id ? { ...cd, so_cau_hoi: Math.max(0, cd.so_cau_hoi - 1) } : cd);
    setCauHoi(updatedQs);
    setChuyenDe(updatedCds);
    logAction('Xóa câu hỏi', `Xóa câu hỏi nhận thức mã ${id}`);
    pushToServer({ cauHoi: updatedQs, chuyenDe: updatedCds });
  };

  const deleteBatchCauHoi = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const updatedQs = cauHoi.filter(q => !idSet.has(q.id));
    const updatedCds = chuyenDe.map(cd => {
      const remainingCount = updatedQs.filter(q => q.chuyen_de_id === cd.id).length;
      return { ...cd, so_cau_hoi: remainingCount };
    });
    setCauHoi(updatedQs);
    setChuyenDe(updatedCds);
    logAction('Xóa nhiều câu hỏi', `Đã xóa ${ids.length} câu hỏi khỏi ngân hàng câu hỏi`);
    pushToServer({ cauHoi: updatedQs, chuyenDe: updatedCds });
  };

  const clearCauHoiByTopic = (topicId: string) => {
    const isAll = topicId === 'all';
    const updatedQs = isAll ? [] : cauHoi.filter(q => q.chuyen_de_id !== topicId);
    const deletedCount = cauHoi.length - updatedQs.length;
    const updatedCds = chuyenDe.map(cd => {
      if (isAll) {
        return { ...cd, so_cau_hoi: 0 };
      }
      if (cd.id === topicId) {
        return { ...cd, so_cau_hoi: 0 };
      }
      return cd;
    });
    setCauHoi(updatedQs);
    setChuyenDe(updatedCds);
    logAction('Xóa câu hỏi theo chuyên đề', `Đã xóa ${deletedCount} câu hỏi khỏi hệ thống`);
    pushToServer({ cauHoi: updatedQs, chuyenDe: updatedCds });
  };

  // CRUD for Exams
  const addDeThi = (exam: Omit<DeThi, 'id'>) => {
    const newExam: DeThi = {
      ...exam,
      id: 'dt-' + Date.now()
    };
    const updatedExams = [newExam, ...deThi];
    setDeThi(updatedExams);
    logAction('Tạo đề thi', `Tạo đề thi kiểm tra: "${newExam.tieu_de}"`);
    pushToServer({ deThi: updatedExams });
  };

  const updateDeThi = (exam: DeThi) => {
    const updatedExams = deThi.map(e => e.id === exam.id ? exam : e);
    setDeThi(updatedExams);
    logAction('Sửa đề thi', `Cập nhật cấu hình đề thi: "${exam.tieu_de}"`);
    pushToServer({ deThi: updatedExams });
  };

  const deleteDeThi = (id: string) => {
    const examToDelete = deThi.find(e => e.id === id);
    if (!examToDelete) return;
    const updatedExams = deThi.filter(e => e.id !== id);
    setDeThi(updatedExams);
    logAction('Xóa đề thi', `Đã xóa đề thi "${examToDelete.tieu_de}"`);
    pushToServer({ deThi: updatedExams });
  };

  // Results
  const addKetQua = (result: Omit<KetQua, 'id' | 'ngay_thi'>) => {
    const newResult: KetQua = {
      ...result,
      id: 'kq-' + Date.now(),
      ngay_thi: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updatedKq = [newResult, ...ketQua];
    setKetQua(updatedKq);
    logAction('Kiểm tra nhận thức', `${result.cap_bac} ${result.ho_ten} (${result.don_vi}) hoàn thành bài thi với điểm: ${result.diem}/10`);
    pushToServer({ ketQua: updatedKq });
  };

  const deleteKetQua = (id: string) => {
    const item = ketQua.find(k => k.id === id);
    const updatedKq = ketQua.filter(k => k.id !== id);
    setKetQua(updatedKq);
    if (item) {
      logAction('Xóa kết quả thi', `Đã xóa bài thi của thí sinh ${item.ho_ten} (${item.de_thi_tieu_de})`);
    }
    pushToServer({ ketQua: updatedKq });
  };

  // QR Codes
  const addQRCode = (qr: Omit<QRCodeItem, 'id' | 'ngay_tao' | 'luot_quet'>): QRCodeItem => {
    const newQR: QRCodeItem = {
      ...qr,
      id: 'qr-' + Date.now(),
      ngay_tao: new Date().toISOString().split('T')[0],
      luot_quet: 0
    };
    const updatedQrs = [newQR, ...qrCodes];
    setQrCodes(updatedQrs);
    logAction('Tạo mã QR', `Tạo mã QR "${newQR.tieu_de}" (${newQR.ma_dinh_danh})`);
    pushToServer({ qrCodes: updatedQrs });
    return newQR;
  };

  const deleteQRCode = (id: string) => {
    const qr = qrCodes.find(q => q.id === id);
    const updatedQrs = qrCodes.filter(q => q.id !== id);
    setQrCodes(updatedQrs);
    if (qr) {
      logAction('Xóa mã QR', `Đã xóa mã QR "${qr.tieu_de}"`);
    }
    pushToServer({ qrCodes: updatedQrs });
  };

  const recordQRScan = (qrId: string) => {
    const updatedQrs = qrCodes.map(q => q.id === qrId ? { ...q, luot_quet: q.luot_quet + 1 } : q);
    setQrCodes(updatedQrs);
    pushToServer({ qrCodes: updatedQrs });
  };

  const addNoiDungHangNgay = (item: Omit<NoiDungHangNgay, 'id'>) => {
    const newItem: NoiDungHangNgay = {
      ...item,
      id: 'nd-' + Date.now()
    };
    const updatedNds = [newItem, ...noiDungHangNgay];
    setNoiDungHangNgay(updatedNds);
    logAction('Đặt lịch nội dung', `Thêm mới Lời Bác dạy / Học tập hằng ngày: "${newItem.tieu_de}"`);
    pushToServer({ noiDungHangNgay: updatedNds });
  };

  const updateNoiDungHangNgay = (item: NoiDungHangNgay) => {
    const updatedNds = noiDungHangNgay.map(n => n.id === item.id ? item : n);
    setNoiDungHangNgay(updatedNds);
    logAction('Cập nhật lời Bác dạy', `Chỉnh sửa nội dung: "${item.tieu_de}"`);
    pushToServer({ noiDungHangNgay: updatedNds });
  };

  const deleteNoiDungHangNgay = (id: string) => {
    const target = noiDungHangNgay.find(n => n.id === id);
    const updatedNds = noiDungHangNgay.filter(n => n.id !== id);
    setNoiDungHangNgay(updatedNds);
    if (target) {
      logAction('Xóa lời Bác dạy', `Đã xóa nội dung: "${target.tieu_de}"`);
    }
    pushToServer({ noiDungHangNgay: updatedNds });
  };

  // CRUD for Audio (BaiHat / PhatThanh / Podcast)
  const addBaiHat = async (item: Omit<BaiHatTruyenThong, 'id'>) => {
    let finalItem = { ...item };
    if (item.audio_url && item.audio_url.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.tieu_de}.mp3`, item.audio_url, 'audio', 'media');
      if (serverUrl) finalItem.audio_url = serverUrl;
    }
    const newItem: BaiHatTruyenThong = {
      ...finalItem,
      id: 'bh-' + Date.now()
    };
    const updatedBhs = [newItem, ...baiHat];
    setBaiHat(updatedBhs);
    logAction('Thêm bài hát/âm thanh', `Thêm tác phẩm âm thanh: "${newItem.tieu_de}" (${newItem.tac_gia})`);
    pushToServer({ baiHat: updatedBhs });
  };

  const updateBaiHat = async (item: BaiHatTruyenThong) => {
    let finalItem = { ...item };
    if (item.audio_url && item.audio_url.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.tieu_de}.mp3`, item.audio_url, 'audio', 'media');
      if (serverUrl) finalItem.audio_url = serverUrl;
    }
    const updatedBhs = baiHat.map(b => b.id === item.id ? finalItem : b);
    setBaiHat(updatedBhs);
    logAction('Cập nhật bài hát/âm thanh', `Cập nhật tác phẩm: "${item.tieu_de}"`);
    pushToServer({ baiHat: updatedBhs });
  };

  const deleteBaiHat = (id: string) => {
    const target = baiHat.find(b => b.id === id);
    const updatedBhs = baiHat.filter(b => b.id !== id);
    setBaiHat(updatedBhs);
    if (target) {
      logAction('Xóa bài hát/âm thanh', `Đã xóa tác phẩm âm thanh: "${target.tieu_de}"`);
    }
    pushToServer({ baiHat: updatedBhs });
  };

  // CRUD for Video (Phim tài liệu / Phóng sự / Phim truyền thống)
  const addVideo = async (item: Omit<VideoTuLieu, 'id'>) => {
    let finalItem = { ...item };
    if (item.video_url && item.video_url.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.tieu_de}.mp4`, item.video_url, 'video', 'media');
      if (serverUrl) finalItem.video_url = serverUrl;
    }
    if (item.thumbnail_url && item.thumbnail_url.startsWith('data:')) {
      const thumbUrl = await uploadFileToServer(`${item.tieu_de}-thumb.jpg`, item.thumbnail_url, 'image', 'images');
      if (thumbUrl) finalItem.thumbnail_url = thumbUrl;
    }
    const newItem: VideoTuLieu = {
      ...finalItem,
      id: 'vid-' + Date.now(),
      ngay_dang: item.ngay_dang || new Date().toISOString().split('T')[0]
    };
    const updatedVids = [newItem, ...video];
    setVideo(updatedVids);
    logAction('Thêm video tư liệu', `Đăng tải video: "${newItem.tieu_de}" (${newItem.the_loai})`);
    pushToServer({ video: updatedVids });
  };

  const updateVideo = async (item: VideoTuLieu) => {
    let finalItem = { ...item };
    if (item.video_url && item.video_url.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.tieu_de}.mp4`, item.video_url, 'video', 'media');
      if (serverUrl) finalItem.video_url = serverUrl;
    }
    if (item.thumbnail_url && item.thumbnail_url.startsWith('data:')) {
      const thumbUrl = await uploadFileToServer(`${item.tieu_de}-thumb.jpg`, item.thumbnail_url, 'image', 'images');
      if (thumbUrl) finalItem.thumbnail_url = thumbUrl;
    }
    const updatedVids = video.map(v => v.id === item.id ? finalItem : v);
    setVideo(updatedVids);
    logAction('Cập nhật video tư liệu', `Cập nhật thông tin video: "${item.tieu_de}"`);
    pushToServer({ video: updatedVids });
  };

  const deleteVideo = (id: string) => {
    const target = video.find(v => v.id === id);
    const updatedVids = video.filter(v => v.id !== id);
    setVideo(updatedVids);
    if (target) {
      logAction('Xóa video tư liệu', `Đã xóa video: "${target.tieu_de}"`);
    }
    pushToServer({ video: updatedVids });
  };

  // CRUD for Tradition Milestones (Mốc truyền thống)
  const addMocTruyenThong = async (item: Omit<MocTruyenThong, 'id'>) => {
    let finalItem = { ...item };
    if (item.hinh_anh && item.hinh_anh.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.nam}-${item.tieu_de}.jpg`, item.hinh_anh, 'image', 'images');
      if (serverUrl) finalItem.hinh_anh = serverUrl;
    }
    const newItem: MocTruyenThong = {
      ...finalItem,
      id: 'mtt-' + Date.now()
    };
    const updatedMtt = [newItem, ...mocTruyenThong];
    setMocTruyenThong(updatedMtt);
    logAction('Thêm mốc truyền thống', `Bổ sung mốc lịch sử năm ${newItem.nam}: "${newItem.tieu_de}"`);
    pushToServer({ mocTruyenThong: updatedMtt });
  };

  const updateMocTruyenThong = async (item: MocTruyenThong) => {
    let finalItem = { ...item };
    if (item.hinh_anh && item.hinh_anh.startsWith('data:')) {
      const serverUrl = await uploadFileToServer(`${item.nam}-${item.tieu_de}.jpg`, item.hinh_anh, 'image', 'images');
      if (serverUrl) finalItem.hinh_anh = serverUrl;
    }
    const updatedMtt = mocTruyenThong.map(m => m.id === item.id ? finalItem : m);
    setMocTruyenThong(updatedMtt);
    logAction('Cập nhật mốc truyền thống', `Cập nhật mốc lịch sử năm ${item.nam}: "${item.tieu_de}"`);
    pushToServer({ mocTruyenThong: updatedMtt });
  };

  const deleteMocTruyenThong = (id: string) => {
    const target = mocTruyenThong.find(m => m.id === id);
    const updatedMtt = mocTruyenThong.filter(m => m.id !== id);
    setMocTruyenThong(updatedMtt);
    if (target) {
      logAction('Xóa mốc truyền thống', `Đã xóa mốc lịch sử năm ${target.nam}: "${target.tieu_de}"`);
    }
    pushToServer({ mocTruyenThong: updatedMtt });
  };

  // Handle QR scanning or manual quick code entry
  const handleQRNavigation = (identifierOrUrl: string): boolean => {
    let clean = identifierOrUrl.trim().toLowerCase();
    
    // Check if it's a full URL with search params or hash
    try {
      if (clean.startsWith('http://') || clean.startsWith('https://') || clean.includes('?')) {
        const urlObj = new URL(clean.startsWith('http') ? clean : `https://dummy.local/${clean}`);
        const examParam = urlObj.searchParams.get('exam') || urlObj.searchParams.get('de_thi') || urlObj.searchParams.get('dethi');
        const docParam = urlObj.searchParams.get('doc') || urlObj.searchParams.get('tai_lieu') || urlObj.searchParams.get('tailieu');
        
        if (examParam) {
          const examMatch = deThi.find(e => e.id.toLowerCase() === examParam.toLowerCase() || (e.ma_de && e.ma_de.toLowerCase() === examParam.toLowerCase()));
          if (examMatch) {
            setSelectedDeThi(examMatch);
            setExamMode('test');
            setCurrentTab('trac_nghiem');
            return true;
          }
        }
        if (docParam) {
          const docMatch = taiLieu.find(d => d.id.toLowerCase() === docParam.toLowerCase());
          if (docMatch) {
            setSelectedTaiLieu(docMatch);
            setCurrentTab('kho_tai_lieu');
            return true;
          }
        }
      }
    } catch {}

    // Check if it matches a QRCode item
    const matchedQR = qrCodes.find(q => 
      q.id.toLowerCase() === clean || 
      q.ma_dinh_danh.toLowerCase() === clean || 
      q.duong_dan_noi_bo.toLowerCase() === clean
    );

    if (matchedQR) {
      recordQRScan(matchedQR.id);
      if (matchedQR.loai === 'tai_lieu') {
        const doc = taiLieu.find(d => d.id === matchedQR.muc_tieu_id);
        if (doc) {
          setSelectedTaiLieu(doc);
          setCurrentTab('kho_tai_lieu');
          return true;
        }
      } else if (matchedQR.loai === 'de_thi') {
        const exam = deThi.find(e => e.id === matchedQR.muc_tieu_id);
        if (exam) {
          setSelectedDeThi(exam);
          setExamMode('test');
          setCurrentTab('trac_nghiem');
          return true;
        }
      } else if (matchedQR.loai === 'chuyen_de') {
        setActiveChuyenDeId(matchedQR.muc_tieu_id);
        setCurrentTab('kho_tai_lieu');
        return true;
      }
    }

    // Direct document ID match
    const docMatch = taiLieu.find(d => d.id.toLowerCase() === clean);
    if (docMatch) {
      setSelectedTaiLieu(docMatch);
      setCurrentTab('kho_tai_lieu');
      return true;
    }

    // Direct exam ID or exam code (ma_de) match
    const examMatch = deThi.find(e => 
      e.id.toLowerCase() === clean || 
      (e.ma_de && e.ma_de.toLowerCase() === clean)
    );
    if (examMatch) {
      setSelectedDeThi(examMatch);
      setExamMode('test');
      setCurrentTab('trac_nghiem');
      return true;
    }

    // Direct topic match
    const cdMatch = chuyenDe.find(c => c.id.toLowerCase() === clean);
    if (cdMatch) {
      setActiveChuyenDeId(cdMatch.id);
      setCurrentTab('kho_tai_lieu');
      return true;
    }

    return false;
  };

  // Infographics Operations
  const openInfographicStudioWithDraft = (
    title: string,
    content: string,
    sourceType: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh',
    selectedVisualId?: string
  ) => {
    setEditorialDraft({ title, content, sourceType, selectedVisualId });
    setCurrentTab('infographic');
  };

  const addInfographic = (item: InfographicItem) => {
    setInfographics(prev => {
      const next = [item, ...prev];
      pushToServer({ infographics: next });
      return next;
    });
    logAction('Tạo Infographic', `Tạo infographic "${item.tieu_de}"`);
  };

  const updateInfographic = (id: string, updates: Partial<InfographicItem>) => {
    setInfographics(prev => {
      const next = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      pushToServer({ infographics: next });
      return next;
    });
    logAction('Cập nhật Infographic', `Cập nhật infographic ID ${id}`);
  };

  const deleteInfographic = (id: string) => {
    setInfographics(prev => {
      const next = prev.filter(item => item.id !== id);
      pushToServer({ infographics: next });
      return next;
    });
    logAction('Xóa Infographic', `Xóa infographic ID ${id}`);
  };

  // Database Backup / Restore for LAN
  const exportDatabaseJSON = () => {
    const db = {
      chuyenDe,
      taiLieu,
      cauHoi,
      deThi,
      ketQua,
      noiDungHangNgay,
      mocTruyenThong,
      qrCodes,
      baiHat,
      video,
      nhatKy,
      infographics,
      currentUser,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    logAction('Sao lưu dữ liệu', 'Xuất cơ sở dữ liệu hệ thống ra tệp sao lưu JSON');
    return JSON.stringify(db, null, 2);
  };

  const importDatabaseJSON = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.chuyenDe && data.taiLieu && data.cauHoi) {
        setChuyenDe(data.chuyenDe);
        setTaiLieu(data.taiLieu);
        setCauHoi(data.cauHoi);
        if (data.deThi) setDeThi(data.deThi);
        if (data.ketQua) setKetQua(data.ketQua);
        if (data.noiDungHangNgay) setNoiDungHangNgay(data.noiDungHangNgay);
        if (data.mocTruyenThong) setMocTruyenThong(data.mocTruyenThong);
        if (data.qrCodes) setQrCodes(data.qrCodes);
        if (data.baiHat) setBaiHat(data.baiHat);
        if (data.video) setVideo(data.video);
        if (data.nhatKy) setNhatKy(data.nhatKy);
        if (data.infographics) setInfographics(data.infographics);
        logAction('Phục hồi dữ liệu', 'Khôi phục thành công cơ sở dữ liệu từ tệp sao lưu');
        pushToServer(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetDatabase = () => {
    setChuyenDe(CHUYEN_DE_INITIAL);
    setTaiLieu(TAI_LIEU_INITIAL);
    setCauHoi(CAU_HOI_INITIAL);
    setDeThi(DE_THI_INITIAL);
    setKetQua(KET_QUA_INITIAL);
    setNoiDungHangNgay(NOI_DUNG_HANG_NGAY_INITIAL);
    setMocTruyenThong([]);
    setQrCodes(QR_CODE_INITIAL);
    setBaiHat(BAI_HAT_INITIAL);
    setVideo(VIDEO_INITIAL);
    setNhatKy(NHAT_KY_INITIAL);
    setInfographics(INFOGRAPHIC_INITIAL);
    logAction('Khởi tạo lại', 'Đã đặt lại toàn bộ dữ liệu ban đầu');
    pushToServer({
      chuyenDe: CHUYEN_DE_INITIAL,
      taiLieu: TAI_LIEU_INITIAL,
      cauHoi: CAU_HOI_INITIAL,
      deThi: DE_THI_INITIAL,
      ketQua: KET_QUA_INITIAL,
      noiDungHangNgay: NOI_DUNG_HANG_NGAY_INITIAL,
      mocTruyenThong: [],
      qrCodes: QR_CODE_INITIAL,
      baiHat: BAI_HAT_INITIAL,
      video: VIDEO_INITIAL,
      nhatKy: NHAT_KY_INITIAL,
      infographics: INFOGRAPHIC_INITIAL
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        chuyenDe,
        taiLieu,
        cauHoi,
        deThi,
        ketQua,
        noiDungHangNgay,
        mocTruyenThong,
        qrCodes,
        baiHat,
        video,
        nhatKy,
        infographics,
        selectedInfographic,
        setSelectedInfographic,
        editorialDraft,
        setEditorialDraft,
        openInfographicStudioWithDraft,
        addInfographic,
        updateInfographic,
        deleteInfographic,
        currentUser,
        adminAccount,
        updateAdminAccount,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        switchRoleDemo,
        logout,
        selectedTaiLieu,
        setSelectedTaiLieu,
        selectedDeThi,
        setSelectedDeThi,
        examMode,
        setExamMode,
        selectedQRCodeForPrint,
        setSelectedQRCodeForPrint,
        searchQuery,
        setSearchQuery,
        searchFilter,
        setSearchFilter,
        activeChuyenDeId,
        setActiveChuyenDeId,
        currentAudioTrack,
        isPlayingAudio,
        playTrack,
        pauseTrack,
        stopAudio,
        isSpeaking,
        speakingTitle,
        speakText,
        stopSpeaking,
        addTaiLieu,
        updateTaiLieu,
        deleteTaiLieu,
        addCauHoi,
        addBatchCauHoi,
        updateCauHoi,
        deleteCauHoi,
        deleteBatchCauHoi,
        clearCauHoiByTopic,
        addDeThi,
        updateDeThi,
        deleteDeThi,
        addKetQua,
        deleteKetQua,
        addQRCode,
        deleteQRCode,
        recordQRScan,
        addNoiDungHangNgay,
        updateNoiDungHangNgay,
        deleteNoiDungHangNgay,
        addBaiHat,
        updateBaiHat,
        deleteBaiHat,
        addVideo,
        updateVideo,
        deleteVideo,
        addMocTruyenThong,
        updateMocTruyenThong,
        deleteMocTruyenThong,
        uploadFileToServer,
        logAction,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetDatabase,
        handleQRNavigation,
        isSyncing,
        lastSyncTime,
        syncNow
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
