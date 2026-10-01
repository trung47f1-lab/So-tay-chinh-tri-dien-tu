import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  BarChart3, 
  Calendar, 
  Trash2, 
  Plus, 
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  Image as ImageIcon,
  CheckSquare,
  Shuffle,
  Eye,
  Play,
  Search,
  Filter,
  AlertCircle,
  XCircle,
  FileCheck,
  Layers,
  Sparkles,
  Archive,
  Music,
  Radio,
  Video,
  Film,
  Volume2,
  Printer,
  FileSpreadsheet,
  FileDown,
  Database,
  FileUp,
  Paperclip,
  QrCode,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { 
  TaiLieu,
  CauHoi, 
  LoaiTaiLieu, 
  MocTruyenThong, 
  DeThi, 
  KetQua, 
  ChiTietCauTraLoi,
  BaiHatTruyenThong,
  VideoTuLieu,
  NoiDungHangNgay
} from '../types';
import { 
  extractTextFromFile, 
  parseQuestionsFromText, 
  readFileAsDataURL, 
  ParsedQuestionItem 
} from '../utils/fileParser';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    taiLieu, 
    cauHoi, 
    deThi, 
    ketQua, 
    noiDungHangNgay, 
    mocTruyenThong,
    baiHat,
    video,
    nhatKy, 
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
    deleteKetQua,
    setSelectedDeThi,
    setExamMode,
    setCurrentTab,
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
    exportDatabaseJSON, 
    importDatabaseJSON, 
    resetDatabase,
    uploadFileToServer,
    setSelectedQRCodeForPrint,
    addQRCode,
    qrCodes,
    chuyenDe,
    adminAccount,
    updateAdminAccount,
    setIsLoginModalOpen,
    isSyncing,
    lastSyncTime,
    syncNow
  } = useApp();

  const [adminTab, setAdminTab] = useState<'thong_ke' | 'de_thi' | 'tai_lieu' | 'cau_hoi' | 'truyen_thong' | 'moi_ngay' | 'am_thanh' | 'video' | 'nhat_ky' | 'sao_luu' | 'tai_khoan_admin'>('thong_ke');
  
  // Admin credentials state
  const [editAdminUser, setEditAdminUser] = useState(adminAccount.taiKhoan);
  const [editAdminPass, setEditAdminPass] = useState(adminAccount.matKhau);
  const [editAdminPassConfirm, setEditAdminPassConfirm] = useState(adminAccount.matKhau);
  const [editAdminName, setEditAdminName] = useState(adminAccount.hoTen);
  const [editAdminRank, setEditAdminRank] = useState(adminAccount.capBac);
  const [editAdminDuty, setEditAdminDuty] = useState(adminAccount.chucVu);
  const [editAdminUnit, setEditAdminUnit] = useState(adminAccount.donVi);
  const [adminUpdateMsg, setAdminUpdateMsg] = useState('');
  const [adminUpdateError, setAdminUpdateError] = useState('');

  // Exam Management State (Tạo đợt kiểm tra, quy định số lượng đề, thời gian, ngân hàng câu hỏi, tự động rút, đảo câu, đảo đáp án)
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<DeThi | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examTopicId, setExamTopicId] = useState('all');
  const [examQuestionCount, setExamQuestionCount] = useState(10);
  const [examDurationMinutes, setExamDurationMinutes] = useState(15);
  const [examTargetAudience, setExamTargetAudience] = useState('Toàn thể cán bộ, chiến sĩ');
  const [examAutoDraw, setExamAutoDraw] = useState(true);
  const [examShuffleQuestions, setExamShuffleQuestions] = useState(true);
  const [examShuffleAnswers, setExamShuffleAnswers] = useState(true);
  const [examDescription, setExamDescription] = useState('');
  const [examError, setExamError] = useState('');

  // Batch Exam Generation State (Quy định số lượng đề: sinh ra N đề thi khác nhau)
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState('Kiểm tra nhận thức chính trị năm 2026');
  const [batchCount, setBatchCount] = useState(3);
  const [batchTopicId, setBatchTopicId] = useState('all');
  const [batchQuestionCount, setBatchQuestionCount] = useState(10);
  const [batchDurationMinutes, setBatchDurationMinutes] = useState(15);
  const [batchTargetAudience, setBatchTargetAudience] = useState('Toàn thể cán bộ, chiến sĩ');
  const [batchAutoDraw, setBatchAutoDraw] = useState(true);
  const [batchShuffleQuestions, setBatchShuffleQuestions] = useState(true);
  const [batchShuffleAnswers, setBatchShuffleAnswers] = useState(true);
  const [batchNotice, setBatchNotice] = useState('');

  // Examinee Test Paper Inspection Modal (Xem bài thi đã lưu của thí sinh với đáp án đúng/sai từng câu)
  const [viewingResult, setViewingResult] = useState<KetQua | null>(null);

  // Results Tab Filters & Export State
  const [filterExamId, setFilterExamId] = useState('all');
  const [filterExamCode, setFilterExamCode] = useState('all');
  const [searchExaminee, setSearchExaminee] = useState('');
  const [filterRank, setFilterRank] = useState<'all' | 'gioi' | 'kha' | 'dat' | 'chua_dat'>('all');
  const [showExportReportModal, setShowExportReportModal] = useState(false);

  const handleSaveAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUpdateMsg('');
    setAdminUpdateError('');

    if (!editAdminUser.trim() || !editAdminPass.trim()) {
      setAdminUpdateError('Vui lòng không để trống tên đăng nhập hoặc mật khẩu.');
      return;
    }

    if (editAdminPass !== editAdminPassConfirm) {
      setAdminUpdateError('Mật khẩu mới và xác nhận mật khẩu không khớp nhau.');
      return;
    }

    updateAdminAccount({
      taiKhoan: editAdminUser.trim(),
      matKhau: editAdminPass.trim(),
      hoTen: editAdminName.trim() || 'Quản trị viên Hệ thống',
      capBac: editAdminRank.trim() || 'Thiếu tá',
      chucVu: editAdminDuty.trim() || 'Trợ lý Quản trị',
      donVi: editAdminUnit.trim() || 'Ban Chính trị'
    });

    setAdminUpdateMsg('Đã cập nhật thông tin và mật khẩu tài khoản Quản trị viên thành công.');
  };
  
  // Tradition milestone form state
  const [showTraditionModal, setShowTraditionModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MocTruyenThong | null>(null);
  const [tNam, setTNam] = useState('');
  const [tNgayThang, setTNgayThang] = useState('');
  const [tTieuDe, setTTieuDe] = useState('');
  const [tLoai, setTLoai] = useState<'thanh_lap' | 'chien_cong' | 'danh_hieu' | 'phat_trien'>('chien_cong');
  const [tNoiDung, setTNoiDung] = useState('');
  const [tYNghia, setTYNghia] = useState('');
  const [tHinhAnh, setTHinhAnh] = useState('');
  const [tError, setTError] = useState('');

  const handleOpenAddTradition = () => {
    setEditingMilestone(null);
    setTNam('');
    setTNgayThang('');
    setTTieuDe('');
    setTLoai('chien_cong');
    setTNoiDung('');
    setTYNghia('');
    setTHinhAnh('');
    setTError('');
    setShowTraditionModal(true);
  };

  const handleOpenEditTradition = (item: MocTruyenThong) => {
    setEditingMilestone(item);
    setTNam(item.nam);
    setTNgayThang(item.ngay_thang);
    setTTieuDe(item.tieu_de);
    setTLoai(item.loai_su_kien);
    setTNoiDung(item.noi_dung);
    setTYNghia(item.y_nghia);
    setTHinhAnh(item.hinh_anh || '');
    setTError('');
    setShowTraditionModal(true);
  };

  const handleSaveTradition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tNam.trim() || !tNgayThang.trim() || !tTieuDe.trim() || !tNoiDung.trim()) {
      setTError('Vui lòng điền đầy đủ Năm, Ngày tháng, Tiêu đề và Nội dung tóm tắt.');
      return;
    }

    if (editingMilestone) {
      updateMocTruyenThong({
        ...editingMilestone,
        nam: tNam.trim(),
        ngay_thang: tNgayThang.trim(),
        tieu_de: tTieuDe.trim(),
        loai_su_kien: tLoai,
        noi_dung: tNoiDung.trim(),
        y_nghia: tYNghia.trim(),
        hinh_anh: tHinhAnh.trim() || undefined
      });
    } else {
      addMocTruyenThong({
        nam: tNam.trim(),
        ngay_thang: tNgayThang.trim(),
        tieu_de: tTieuDe.trim(),
        loai_su_kien: tLoai,
        noi_dung: tNoiDung.trim(),
        y_nghia: tYNghia.trim(),
        hinh_anh: tHinhAnh.trim() || undefined
      });
    }
    setShowTraditionModal(false);
  };

  const handleDeleteTradition = (id: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa mốc truyền thống "${title}"?`)) {
      deleteMocTruyenThong(id);
    }
  };

  // 1. Quản lý Lời Bác Hồ dạy mỗi ngày (noiDungHangNgay)
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<NoiDungHangNgay | null>(null);
  const [qNgay, setQNgay] = useState('');
  const [qTieuDe, setQTieuDe] = useState('');
  const [qTrichDan, setQTrichDan] = useState('');
  const [qHoanCanh, setQHoanCanh] = useState('');
  const [qYNghia, setQYNghia] = useState('');
  const [qNguon, setQNguon] = useState('');
  const [qAudioUrl, setQAudioUrl] = useState('');
  const [qError, setQError] = useState('');

  const handleOpenAddQuote = () => {
    setEditingQuote(null);
    setQNgay(new Date().toISOString().split('T')[0]);
    setQTieuDe('');
    setQTrichDan('');
    setQHoanCanh('');
    setQYNghia('');
    setQNguon('Hồ Chí Minh Toàn tập, NXB Chính trị quốc gia Sự thật');
    setQAudioUrl('');
    setQError('');
    setShowQuoteModal(true);
  };

  const handleOpenEditQuote = (item: NoiDungHangNgay) => {
    setEditingQuote(item);
    setQNgay(item.ngay);
    setQTieuDe(item.tieu_de);
    setQTrichDan(item.trich_dan);
    setQHoanCanh(item.hoan_canh);
    setQYNghia(item.y_nghia);
    setQNguon(item.nguon);
    setQAudioUrl(item.audio_url || '');
    setQError('');
    setShowQuoteModal(true);
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTieuDe.trim() || !qTrichDan.trim()) {
      setQError('Vui lòng nhập đầy đủ Tiêu đề và Câu trích dẫn của Bác.');
      return;
    }
    if (editingQuote) {
      updateNoiDungHangNgay({
        ...editingQuote,
        ngay: qNgay.trim() || new Date().toISOString().split('T')[0],
        tieu_de: qTieuDe.trim(),
        trich_dan: qTrichDan.trim(),
        hoan_canh: qHoanCanh.trim(),
        y_nghia: qYNghia.trim(),
        nguon: qNguon.trim() || 'Hồ Chí Minh Toàn tập',
        audio_url: qAudioUrl.trim() || undefined
      });
    } else {
      addNoiDungHangNgay({
        ngay: qNgay.trim() || new Date().toISOString().split('T')[0],
        tieu_de: qTieuDe.trim(),
        trich_dan: qTrichDan.trim(),
        hoan_canh: qHoanCanh.trim(),
        y_nghia: qYNghia.trim(),
        nguon: qNguon.trim() || 'Hồ Chí Minh Toàn tập',
        audio_url: qAudioUrl.trim() || undefined
      });
    }
    setShowQuoteModal(false);
  };

  const handleDeleteQuote = (id: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa nội dung "${title}"?`)) {
      deleteNoiDungHangNgay(id);
    }
  };

  const handleQuoteFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.text) {
        if (!qTrichDan) setQTrichDan(parsed.text);
        if (!qTieuDe) setQTieuDe(parsed.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuoteAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setQAudioUrl(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Quản lý Âm thanh & Bài hát truyền thống (baiHat)
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [editingAudio, setEditingAudio] = useState<BaiHatTruyenThong | null>(null);
  const [aTieuDe, setATieuDe] = useState('');
  const [aTacGia, setATacGia] = useState('');
  const [aTheLoai, setATheLoai] = useState<'bai_hat' | 'phat_thanh' | 'podcast'>('bai_hat');
  const [aThoiLuong, setAThoiLuong] = useState('03:30');
  const [aMoTa, setAMoTa] = useState('');
  const [aLoi, setALoi] = useState('');
  const [aUrl, setAUrl] = useState('');
  const [aError, setAError] = useState('');

  const handleOpenAddAudio = () => {
    setEditingAudio(null);
    setATieuDe('');
    setATacGia('');
    setATheLoai('bai_hat');
    setAThoiLuong('03:30');
    setAMoTa('');
    setALoi('');
    setAUrl('');
    setAError('');
    setShowAudioModal(true);
  };

  const handleOpenEditAudio = (item: BaiHatTruyenThong) => {
    setEditingAudio(item);
    setATieuDe(item.tieu_de);
    setATacGia(item.tac_gia);
    setATheLoai(item.the_loai);
    setAThoiLuong(item.thoi_luong);
    setAMoTa(item.mo_ta);
    setALoi(item.loi_bai_hat || '');
    setAUrl(item.audio_url || '');
    setAError('');
    setShowAudioModal(true);
  };

  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTieuDe.trim() || !aTacGia.trim()) {
      setAError('Vui lòng nhập Tên bài hát/bản tin và Tác giả.');
      return;
    }
    if (editingAudio) {
      updateBaiHat({
        ...editingAudio,
        tieu_de: aTieuDe.trim(),
        tac_gia: aTacGia.trim(),
        the_loai: aTheLoai,
        thoi_luong: aThoiLuong.trim() || '03:00',
        mo_ta: aMoTa.trim(),
        loi_bai_hat: aLoi.trim() || undefined,
        audio_url: aUrl.trim() || undefined
      });
    } else {
      addBaiHat({
        tieu_de: aTieuDe.trim(),
        tac_gia: aTacGia.trim(),
        the_loai: aTheLoai,
        thoi_luong: aThoiLuong.trim() || '03:00',
        mo_ta: aMoTa.trim(),
        loi_bai_hat: aLoi.trim() || undefined,
        audio_url: aUrl.trim() || undefined
      });
    }
    setShowAudioModal(false);
  };

  const handleDeleteAudio = (id: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa tác phẩm âm thanh "${title}"?`)) {
      deleteBaiHat(id);
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const serverUrl = await uploadFileToServer(file.name, dataUrl, 'audio', 'media');
      setAUrl(serverUrl || dataUrl);
      if (!aTieuDe) {
        setATieuDe(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLyricsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.text) {
        setALoi(parsed.text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Quản lý Video tư liệu (video)
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoTuLieu | null>(null);
  const [vTieuDe, setVTieuDe] = useState('');
  const [vTheLoai, setVTheLoai] = useState('Phim tài liệu lịch sử');
  const [vThoiLuong, setVThoiLuong] = useState('15:00');
  const [vMoTa, setVMoTa] = useState('');
  const [vUrl, setVUrl] = useState('');
  const [vThumbnail, setVThumbnail] = useState('');
  const [vError, setVError] = useState('');

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVTieuDe('');
    setVTheLoai('Phim tài liệu lịch sử');
    setVThoiLuong('15:00');
    setVMoTa('');
    setVUrl('');
    setVThumbnail('');
    setVError('');
    setShowVideoModal(true);
  };

  const handleOpenEditVideo = (item: VideoTuLieu) => {
    setEditingVideo(item);
    setVTieuDe(item.tieu_de);
    setVTheLoai(item.the_loai);
    setVThoiLuong(item.thoi_luong);
    setVMoTa(item.mo_ta);
    setVUrl(item.video_url);
    setVThumbnail(item.thumbnail_url || '');
    setVError('');
    setShowVideoModal(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTieuDe.trim() || !vUrl.trim()) {
      setVError('Vui lòng nhập Tiêu đề video và Đường dẫn video (URL).');
      return;
    }
    if (editingVideo) {
      updateVideo({
        ...editingVideo,
        tieu_de: vTieuDe.trim(),
        the_loai: vTheLoai.trim(),
        thoi_luong: vThoiLuong.trim() || '10:00',
        mo_ta: vMoTa.trim(),
        video_url: vUrl.trim(),
        thumbnail_url: vThumbnail.trim() || undefined
      });
    } else {
      addVideo({
        tieu_de: vTieuDe.trim(),
        the_loai: vTheLoai.trim(),
        thoi_luong: vThoiLuong.trim() || '10:00',
        mo_ta: vMoTa.trim(),
        video_url: vUrl.trim(),
        thumbnail_url: vThumbnail.trim() || undefined
      });
    }
    setShowVideoModal(false);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa video "${title}"?`)) {
      deleteVideo(id);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      const serverUrl = await uploadFileToServer(file.name, dataUrl, 'video', 'media');
      setVUrl(serverUrl || dataUrl);
      if (!vTieuDe) {
        setVTieuDe(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DOCUMENT MANAGEMENT (TÀI LIỆU & VĂN KIỆN) =================
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TaiLieu | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docLoai, setDocLoai] = useState<LoaiTaiLieu>('van_kien');
  const [docChuyenDeId, setDocChuyenDeId] = useState(chuyenDe[0]?.id || 'cd-1');
  const [docTacGia, setDocTacGia] = useState('Tổng cục Chính trị / Trung đoàn 1');
  const [docSoHieu, setDocSoHieu] = useState('');
  const [docTomTat, setDocTomTat] = useState('');
  const [docNoiDung, setDocNoiDung] = useState('');
  const [docThoiLuong, setDocThoiLuong] = useState(5);
  const [docAttachedFileName, setDocAttachedFileName] = useState('');
  const [docAttachedFileSize, setDocAttachedFileSize] = useState(0);
  const [docAttachedFileType, setDocAttachedFileType] = useState<'none' | 'word' | 'pdf' | 'text' | 'image' | 'audio' | 'video'>('none');
  const [docAttachedDataUrl, setDocAttachedDataUrl] = useState<string | undefined>(undefined);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [docUploadNotice, setDocUploadNotice] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docFilterChuyenDe, setDocFilterChuyenDe] = useState('all');

  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocTitle('');
    setDocLoai('van_kien');
    setDocChuyenDeId(chuyenDe[0]?.id || 'cd-1');
    setDocTacGia('Tổng cục Chính trị / Trung đoàn 1');
    setDocSoHieu('');
    setDocTomTat('');
    setDocNoiDung('');
    setDocThoiLuong(5);
    setDocAttachedFileName('');
    setDocAttachedFileSize(0);
    setDocAttachedFileType('none');
    setDocAttachedDataUrl(undefined);
    setDocUploadNotice('');
    setShowDocModal(true);
  };

  const handleOpenEditDoc = (doc: TaiLieu) => {
    setEditingDoc(doc);
    setDocTitle(doc.tieu_de);
    setDocLoai(doc.loai);
    setDocChuyenDeId(doc.chuyen_de_id);
    setDocTacGia(doc.tac_gia);
    setDocSoHieu(doc.so_hieu || '');
    setDocTomTat(doc.tom_tat);
    setDocNoiDung(doc.noi_dung);
    setDocThoiLuong(doc.thoi_luong_phut || 5);
    setDocAttachedFileName(doc.ten_tep_goc || '');
    setDocAttachedFileSize(doc.kich_thuoc_tep || 0);
    setDocAttachedFileType(doc.loai_dinh_kem || 'none');
    setDocAttachedDataUrl(doc.du_lieu_tep);
    setDocUploadNotice('');
    setShowDocModal(true);
  };

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingDoc(true);
    setDocUploadNotice('');
    try {
      const parsed = await extractTextFromFile(file);
      let fileUrl = parsed.dataUrl;
      if (parsed.dataUrl) {
        const serverUrl = await uploadFileToServer(parsed.fileName, parsed.dataUrl, parsed.fileType, 'documents');
        if (serverUrl) {
          fileUrl = serverUrl;
        }
      }
      setDocAttachedFileName(parsed.fileName);
      setDocAttachedFileSize(parsed.fileSize);
      setDocAttachedFileType(parsed.fileType === 'word' ? 'word' : parsed.fileType === 'pdf' ? 'pdf' : 'none');
      setDocAttachedDataUrl(fileUrl);

      // Tự động điền tiêu đề từ tên file nếu chưa có
      if (!docTitle.trim()) {
        const cleanName = parsed.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocTitle(cleanName);
      }

      // Tự động trích xuất nội dung từ tệp Word hoặc Text
      if (parsed.text && parsed.text.length > 5) {
        setDocNoiDung(parsed.text);
        if (!docTomTat.trim()) {
          setDocTomTat(parsed.text.slice(0, 180) + '...');
        }
      }

      setDocUploadNotice(`✓ Đã lưu tệp nguồn vào máy chủ (/uploads/documents/) và nạp nội dung thành công: ${parsed.fileName} (${(parsed.fileSize / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(err);
      setDocUploadNotice('Lỗi khi đọc tệp Word/PDF. Vui lòng kiểm tra định dạng.');
    } finally {
      setIsParsingDoc(false);
    }
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docNoiDung.trim()) return;

    if (editingDoc) {
      updateTaiLieu({
        ...editingDoc,
        tieu_de: docTitle.trim(),
        loai: docLoai,
        chuyen_de_id: docChuyenDeId,
        tac_gia: docTacGia.trim(),
        so_hieu: docSoHieu.trim() || undefined,
        tom_tat: docTomTat.trim() || docNoiDung.slice(0, 150) + '...',
        noi_dung: docNoiDung.trim(),
        thoi_luong_phut: Number(docThoiLuong) || 5,
        loai_dinh_kem: docAttachedFileType === 'word' ? 'word' : docAttachedFileType === 'pdf' ? 'pdf' : 'none',
        ten_tep_goc: docAttachedFileName || undefined,
        du_lieu_tep: docAttachedDataUrl || undefined,
        kich_thuoc_tep: docAttachedFileSize || undefined
      });
    } else {
      addTaiLieu({
        tieu_de: docTitle.trim(),
        loai: docLoai,
        chuyen_de_id: docChuyenDeId,
        tac_gia: docTacGia.trim(),
        ngay_dang: new Date().toISOString().split('T')[0],
        so_hieu: docSoHieu.trim() || undefined,
        tom_tat: docTomTat.trim() || docNoiDung.slice(0, 150) + '...',
        noi_dung: docNoiDung.trim(),
        thoi_luong_phut: Number(docThoiLuong) || 5,
        loai_dinh_kem: docAttachedFileType === 'word' ? 'word' : docAttachedFileType === 'pdf' ? 'pdf' : 'none',
        ten_tep_goc: docAttachedFileName || undefined,
        du_lieu_tep: docAttachedDataUrl || undefined,
        kich_thuoc_tep: docAttachedFileSize || undefined
      });
    }
    setShowDocModal(false);
    setEditingDoc(null);
  };

  // ================= QUESTION BATCH IMPORT (NGÂN HÀNG CÂU HỎI WORD / PDF) =================
  const [showImportQuestionModal, setShowImportQuestionModal] = useState(false);
  const [importTargetChuyenDeId, setImportTargetChuyenDeId] = useState(chuyenDe[0]?.id || 'cd-1');
  const [importDefaultMucDo, setImportDefaultMucDo] = useState<'co_ban' | 'nang_cao'>('co_ban');
  const [isParsingQuestions, setIsParsingQuestions] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importQuestionNotice, setImportQuestionNotice] = useState('');
  const [rawQuestionText, setRawQuestionText] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionFilterChuyenDe, setQuestionFilterChuyenDe] = useState('all');

  const handleOpenImportQuestions = () => {
    setShowImportQuestionModal(true);
    setParsedQuestions([]);
    setRawQuestionText('');
    setImportFileName('');
    setImportQuestionNotice('');
  };

  const handleQuestionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingQuestions(true);
    setImportFileName(file.name);
    setImportQuestionNotice('');
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.dataUrl) {
        await uploadFileToServer(file.name, parsed.dataUrl, 'questions', 'questions');
      }
      setRawQuestionText(parsed.text);
      const qs = parseQuestionsFromText(parsed.text, importTargetChuyenDeId, importDefaultMucDo);
      setParsedQuestions(qs);
      if (qs.length === 0) {
        setImportQuestionNotice(`Đã lưu tệp nguồn "${file.name}" vào máy chủ (/uploads/questions/) nhưng chưa nhận diện được cấu trúc câu hỏi. Bạn có thể kiểm tra định dạng hoặc chỉnh sửa nội dung văn bản bên dưới.`);
      } else {
        setImportQuestionNotice(`✓ Đã lưu tệp nguồn "${file.name}" vào máy chủ (/uploads/questions/) và tách thành công ${qs.length} câu hỏi trắc nghiệm!`);
      }
    } catch (err) {
      console.error(err);
      setImportQuestionNotice('Lỗi khi đọc tệp Word/PDF. Vui lòng kiểm tra định dạng tệp.');
    } finally {
      setIsParsingQuestions(false);
    }
  };

  const handleReParseQuestionText = () => {
    if (!rawQuestionText.trim()) return;
    const qs = parseQuestionsFromText(rawQuestionText, importTargetChuyenDeId, importDefaultMucDo);
    setParsedQuestions(qs);
    setImportQuestionNotice(`✓ Nhận diện được ${qs.length} câu hỏi từ văn bản!`);
  };

  const handleConfirmBatchImport = () => {
    if (parsedQuestions.length === 0) return;
    const toAdd = parsedQuestions.map(q => ({
      chuyen_de_id: importTargetChuyenDeId,
      noi_dung: q.noi_dung,
      cac_dap_an: q.cac_dap_an,
      dap_an_dung: q.dap_an_dung,
      giai_thich: q.giai_thich || 'Căn cứ chương trình giáo dục chính trị tại đơn vị.',
      muc_do: importDefaultMucDo
    }));
    addBatchCauHoi(toAdd);
    setShowImportQuestionModal(false);
    setParsedQuestions([]);
    setRawQuestionText('');
    setImportFileName('');
    setImportQuestionNotice('');
  };

  // Upload Word / PDF for single question form autofill
  const handleSingleQuestionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.dataUrl) {
        await uploadFileToServer(file.name, parsed.dataUrl, 'questions', 'questions');
      }
      const qs = parseQuestionsFromText(parsed.text, newQTopicId, 'co_ban');
      if (qs.length > 0) {
        const first = qs[0];
        setNewQContent(first.noi_dung);
        setNewQOptA(first.cac_dap_an[0] || '');
        setNewQOptB(first.cac_dap_an[1] || '');
        setNewQOptC(first.cac_dap_an[2] || '');
        setNewQOptD(first.cac_dap_an[3] || '');
        setNewQCorrect(first.dap_an_dung);
        setNewQExpl(first.giai_thich);
      } else if (parsed.text) {
        setNewQContent(parsed.text.slice(0, 300));
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  // Edit existing question in question bank
  const [editingQuestion, setEditingQuestion] = useState<CauHoi | null>(null);
  const [editQTopicId, setEditQTopicId] = useState(chuyenDe[0]?.id || 'cd-1');
  const [editQLevel, setEditQLevel] = useState<'co_ban' | 'nang_cao'>('co_ban');
  const [editQContent, setEditQContent] = useState('');
  const [editQOptA, setEditQOptA] = useState('');
  const [editQOptB, setEditQOptB] = useState('');
  const [editQOptC, setEditQOptC] = useState('');
  const [editQOptD, setEditQOptD] = useState('');
  const [editQCorrect, setEditQCorrect] = useState(0);
  const [editQExpl, setEditQExpl] = useState('');

  const handleOpenEditQuestion = (q: CauHoi) => {
    setEditingQuestion(q);
    setEditQTopicId(q.chuyen_de_id);
    setEditQLevel(q.muc_do || 'co_ban');
    setEditQContent(q.noi_dung);
    setEditQOptA(q.cac_dap_an[0] || '');
    setEditQOptB(q.cac_dap_an[1] || '');
    setEditQOptC(q.cac_dap_an[2] || '');
    setEditQOptD(q.cac_dap_an[3] || '');
    setEditQCorrect(q.dap_an_dung);
    setEditQExpl(q.giai_thich || '');
  };

  const handleSaveEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editQContent.trim() || !editQOptA.trim() || !editQOptB.trim()) {
      alert('Vui lòng điền nội dung câu hỏi và ít nhất 2 đáp án.');
      return;
    }
    updateCauHoi({
      ...editingQuestion,
      chuyen_de_id: editQTopicId,
      muc_do: editQLevel,
      noi_dung: editQContent.trim(),
      cac_dap_an: [editQOptA.trim(), editQOptB.trim(), editQOptC.trim(), editQOptD.trim()],
      dap_an_dung: editQCorrect,
      giai_thich: editQExpl.trim() || 'Căn cứ theo tài liệu giáo dục chính trị tại đơn vị.'
    });
    setEditingQuestion(null);
  };

  // Direct editing of parsed questions within batch import preview modal
  const [editingParsedIdx, setEditingParsedIdx] = useState<number | null>(null);
  const [parsedEditContent, setParsedEditContent] = useState('');
  const [parsedEditOptA, setParsedEditOptA] = useState('');
  const [parsedEditOptB, setParsedEditOptB] = useState('');
  const [parsedEditOptC, setParsedEditOptC] = useState('');
  const [parsedEditOptD, setParsedEditOptD] = useState('');
  const [parsedEditCorrect, setParsedEditCorrect] = useState(0);
  const [parsedEditExpl, setParsedEditExpl] = useState('');

  const handleStartEditParsedQuestion = (idx: number) => {
    const item = parsedQuestions[idx];
    if (!item) return;
    setEditingParsedIdx(idx);
    setParsedEditContent(item.noi_dung);
    setParsedEditOptA(item.cac_dap_an[0] || '');
    setParsedEditOptB(item.cac_dap_an[1] || '');
    setParsedEditOptC(item.cac_dap_an[2] || '');
    setParsedEditOptD(item.cac_dap_an[3] || '');
    setParsedEditCorrect(item.dap_an_dung);
    setParsedEditExpl(item.giai_thich || '');
  };

  const handleSaveParsedQuestion = () => {
    if (editingParsedIdx === null) return;
    if (!parsedEditContent.trim() || !parsedEditOptA.trim() || !parsedEditOptB.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi và ít nhất 2 đáp án.');
      return;
    }
    const updated = [...parsedQuestions];
    updated[editingParsedIdx] = {
      ...updated[editingParsedIdx],
      noi_dung: parsedEditContent.trim(),
      cac_dap_an: [parsedEditOptA.trim(), parsedEditOptB.trim(), parsedEditOptC.trim(), parsedEditOptD.trim()],
      dap_an_dung: parsedEditCorrect,
      giai_thich: parsedEditExpl.trim()
    };
    setParsedQuestions(updated);
    setEditingParsedIdx(null);
  };

  const handleDeleteParsedQuestion = (idx: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
    if (editingParsedIdx === idx) setEditingParsedIdx(null);
  };

  // Export exam QR Code directly for scanning and taking test
  const handleExportExamQR = (exam: DeThi) => {
    const qrItem = addQRCode({
      tieu_de: `Đề thi: ${exam.tieu_de}`,
      loai: 'de_thi',
      muc_tieu_id: exam.id,
      ma_dinh_danh: exam.ma_de || `DE-${exam.id.slice(-6).toUpperCase()}`,
      duong_dan_noi_bo: `/?exam=${exam.id}`,
      vi_tri_dan: 'Bảng tin phòng thi / Bảng niêm yết đơn vị'
    });
    setSelectedQRCodeForPrint(qrItem);
  };

  // New question form state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQTopicId, setNewQTopicId] = useState(chuyenDe[0]?.id || 'cd-1');
  const [newQContent, setNewQContent] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExpl, setNewQExpl] = useState('');

  // Question & Entity Delete Confirmation States (replaces blocked window.confirm)
  const [questionToDelete, setQuestionToDelete] = useState<CauHoi | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [showClearTopicModal, setShowClearTopicModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<TaiLieu | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string; title: string } | null>(null);
  const [resultToDelete, setResultToDelete] = useState<{ id: string; name: string } | null>(null);
  const [traditionToDelete, setTraditionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [audioToDelete, setAudioToDelete] = useState<{ id: string; title: string } | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showResetDbModal, setShowResetDbModal] = useState(false);
  const [questionSuccessMsg, setQuestionSuccessMsg] = useState('');

  const triggerQuestionSuccess = (msg: string) => {
    setQuestionSuccessMsg(msg);
    setTimeout(() => {
      setQuestionSuccessMsg('');
    }, 3500);
  };

  // Backup / restore
  const [backupJson, setBackupJson] = useState('');
  const [importNotice, setImportNotice] = useState('');

  // Quick statistics calculation
  const totalExamsTaken = ketQua.length;
  const avgScore = totalExamsTaken > 0 
    ? Math.round((ketQua.reduce((sum, item) => sum + item.diem, 0) / totalExamsTaken) * 10) / 10 
    : 0;
  const goodScoresCount = ketQua.filter(k => k.diem >= 8.0).length;
  const goodScorePercent = totalExamsTaken > 0 ? Math.round((goodScoresCount / totalExamsTaken) * 100) : 0;

  const handleExport = () => {
    const data = exportDatabaseJSON();
    setBackupJson(data);

    // Trigger browser file download
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sotay-chinhtri-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupJson.trim()) return;
    const ok = importDatabaseJSON(backupJson);
    if (ok) {
      setImportNotice('Khôi phục dữ liệu thành công từ tệp sao lưu.');
    } else {
      setImportNotice('Lỗi: Định dạng tệp sao lưu JSON không hợp lệ.');
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQContent.trim() || !newQOptA.trim() || !newQOptB.trim()) {
      alert('Vui lòng điền nội dung câu hỏi và ít nhất 2 đáp án.');
      return;
    }

    addCauHoi({
      chuyen_de_id: newQTopicId,
      noi_dung: newQContent.trim(),
      cac_dap_an: [newQOptA.trim(), newQOptB.trim(), newQOptC.trim(), newQOptD.trim()],
      dap_an_dung: newQCorrect,
      giai_thich: newQExpl.trim() || 'Căn cứ theo tài liệu giáo dục chính trị tại đơn vị.',
      muc_do: 'co_ban'
    });

    setShowAddQuestionModal(false);
    setNewQContent('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExpl('');
  };

  // Open Single Exam Modal
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamTitle('');
    setExamTopicId('all');
    setExamQuestionCount(10);
    setExamDurationMinutes(15);
    setExamTargetAudience('Toàn thể cán bộ, chiến sĩ');
    setExamAutoDraw(true);
    setExamShuffleQuestions(true);
    setExamShuffleAnswers(true);
    setExamDescription('Kiểm tra nhận thức chính trị định kỳ. Thí sinh hoàn thành bài thi trong thời gian quy định.');
    setExamError('');
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam: DeThi) => {
    setEditingExam(exam);
    setExamTitle(exam.tieu_de);
    setExamTopicId(exam.chuyen_de_id || 'all');
    setExamQuestionCount(exam.so_cau || 10);
    setExamDurationMinutes(exam.thoi_gian_phut || 15);
    setExamTargetAudience(exam.doi_tuong || 'Toàn thể cán bộ, chiến sĩ');
    setExamAutoDraw(exam.tu_dong_rut_cau_hoi !== false);
    setExamShuffleQuestions(exam.dao_cau_hoi !== false);
    setExamShuffleAnswers(exam.dao_dap_an !== false);
    setExamDescription(exam.mo_ta || '');
    setExamError('');
    setShowExamModal(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setExamError('Vui lòng nhập tiêu đề đợt kiểm tra / đề thi.');
      return;
    }
    if (Number(examQuestionCount) <= 0) {
      setExamError('Số lượng câu hỏi phải lớn hơn 0.');
      return;
    }
    if (Number(examDurationMinutes) <= 0) {
      setExamError('Thời gian làm bài phải lớn hơn 0 phút.');
      return;
    }

    if (editingExam) {
      updateDeThi({
        ...editingExam,
        tieu_de: examTitle.trim(),
        chuyen_de_id: examTopicId,
        so_cau: Number(examQuestionCount),
        thoi_gian_phut: Number(examDurationMinutes),
        doi_tuong: examTargetAudience.trim() || 'Toàn thể cán bộ, chiến sĩ',
        tu_dong_rut_cau_hoi: examAutoDraw,
        dao_cau_hoi: examShuffleQuestions,
        dao_dap_an: examShuffleAnswers,
        mo_ta: examDescription.trim()
      });
    } else {
      addDeThi({
        tieu_de: examTitle.trim(),
        chuyen_de_id: examTopicId,
        so_cau: Number(examQuestionCount),
        thoi_gian_phut: Number(examDurationMinutes),
        doi_tuong: examTargetAudience.trim() || 'Toàn thể cán bộ, chiến sĩ',
        tu_dong_rut_cau_hoi: examAutoDraw,
        dao_cau_hoi: examShuffleQuestions,
        dao_dap_an: examShuffleAnswers,
        mo_ta: examDescription.trim() || 'Kiểm tra nhận thức chính trị định kỳ.'
      });
    }

    setShowExamModal(false);
  };

  const handleDeleteExam = (id: string, title: string) => {
    setExamToDelete({ id, title });
  };

  // Open Batch Modal (Quy định số lượng đề)
  const handleOpenBatchModal = () => {
    setBatchPrefix('Kiểm tra nhận thức chính trị năm 2026');
    setBatchCount(3);
    setBatchTopicId('all');
    setBatchQuestionCount(10);
    setBatchDurationMinutes(15);
    setBatchTargetAudience('Toàn thể cán bộ, chiến sĩ');
    setBatchAutoDraw(true);
    setBatchShuffleQuestions(true);
    setBatchShuffleAnswers(true);
    setBatchNotice('');
    setShowBatchModal(true);
  };

  const handleGenerateBatchExams = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchPrefix.trim()) {
      setBatchNotice('Vui lòng nhập tên đợt kiểm tra.');
      return;
    }
    const count = Math.min(Math.max(Number(batchCount) || 1, 1), 20);
    
    for (let i = 1; i <= count; i++) {
      const code = i < 10 ? `0${i}` : `${i}`;
      addDeThi({
        tieu_de: `${batchPrefix.trim()} — Mã đề ${code}`,
        chuyen_de_id: batchTopicId,
        so_cau: Number(batchQuestionCount),
        thoi_gian_phut: Number(batchDurationMinutes),
        doi_tuong: batchTargetAudience.trim() || 'Toàn thể cán bộ, chiến sĩ',
        tu_dong_rut_cau_hoi: batchAutoDraw,
        dao_cau_hoi: batchShuffleQuestions,
        dao_dap_an: batchShuffleAnswers,
        mo_ta: `Đề thi số ${code} trong đợt kiểm tra "${batchPrefix.trim()}". Tự động rút câu hỏi ngẫu nhiên và đảo đáp án.`
      });
    }

    setShowBatchModal(false);
  };

  const handleTakeExamNow = (exam: DeThi) => {
    setSelectedDeThi(exam);
    setExamMode('test');
    setCurrentTab('trac_nghiem');
  };

  const handleDeleteResult = (id: string, name: string) => {
    setResultToDelete({ id, name });
  };

  const getRankBadge = (score: number) => {
    if (score >= 8.5) return { label: 'Giỏi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 7.0) return { label: 'Khá', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 5.0) return { label: 'Đạt yêu cầu', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Chưa đạt', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  // Unique exam codes for filter
  const availableExamCodes = Array.from(
    new Set([
      ...deThi.map((d, idx) => d.ma_de || ('MĐ-' + (idx + 1).toString().padStart(2, '0'))),
      ...ketQua.map(k => k.ma_de).filter(Boolean) as string[]
    ])
  ).sort();

  // Filtered results list
  const filteredKetQua = ketQua.filter((item) => {
    if (filterExamId !== 'all' && item.de_thi_id !== filterExamId) {
      return false;
    }
    if (filterExamCode !== 'all' && (item.ma_de || 'MĐ-01') !== filterExamCode) {
      return false;
    }
    if (searchExaminee.trim()) {
      const q = searchExaminee.toLowerCase().trim();
      const match = 
        item.ho_ten.toLowerCase().includes(q) || 
        item.cap_bac.toLowerCase().includes(q) || 
        (item.chuc_vu && item.chuc_vu.toLowerCase().includes(q)) ||
        (item.ma_de && item.ma_de.toLowerCase().includes(q)) ||
        item.don_vi.toLowerCase().includes(q) ||
        item.de_thi_tieu_de.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterRank === 'gioi' && item.diem < 8.5) return false;
    if (filterRank === 'kha' && (item.diem < 7.0 || item.diem >= 8.5)) return false;
    if (filterRank === 'dat' && (item.diem < 5.0 || item.diem >= 7.0)) return false;
    if (filterRank === 'chua_dat' && item.diem >= 5.0) return false;
    return true;
  });

  // Trích xuất kết quả kiểm tra ra tệp Excel / CSV (UTF-8 BOM hỗ trợ hoàn hảo tiếng Việt có dấu)
  const handleExportResultsCSV = () => {
    const headers = [
      'STT',
      'Mã kết quả',
      'Họ và tên quân nhân',
      'Cấp bậc',
      'Chức vụ',
      'Đơn vị',
      'Mã đề thi',
      'Đợt kiểm tra / Đề thi',
      'Điểm số (thang 10)',
      'Số câu đúng',
      'Tổng số câu',
      'Tỷ lệ đúng (%)',
      'Thời gian làm bài',
      'Ngày giờ nộp bài',
      'Xếp loại nhận thức'
    ];

    const rows = filteredKetQua.map((item, index) => {
      const mins = Math.floor(item.thoi_gian_lam_giay / 60);
      const secs = item.thoi_gian_lam_giay % 60;
      const timeStr = `${mins} phút ${secs.toString().padStart(2, '0')} giây`;
      const pct = Math.round((item.so_cau_dung / (item.tong_so_cau || 1)) * 100) + '%';
      const rank = getRankBadge(item.diem).label;

      return [
        (index + 1).toString(),
        `"${item.id}"`,
        `"${item.ho_ten.replace(/"/g, '""')}"`,
        `"${item.cap_bac.replace(/"/g, '""')}"`,
        `"${(item.chuc_vu || 'Chiến sĩ').replace(/"/g, '""')}"`,
        `"${item.don_vi.replace(/"/g, '""')}"`,
        `"${(item.ma_de || 'MĐ-01').replace(/"/g, '""')}"`,
        `"${item.de_thi_tieu_de.replace(/"/g, '""')}"`,
        item.diem.toString(),
        item.so_cau_dung.toString(),
        item.tong_so_cau.toString(),
        `"${pct}"`,
        `"${timeStr}"`,
        `"${item.ngay_thi}"`,
        `"${rank}"`
      ];
    });

    // \uFEFF ensures Excel detects UTF-8 correctly
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Bang-tong-hop-ket-qua-kiem-tra-chinh-tri-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trích xuất dữ liệu kiểm tra ra định dạng JSON
  const handleExportResultsJSON = () => {
    const jsonStr = JSON.stringify(filteredKetQua, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `Du-lieu-kiem-tra-chinh-tri-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Guard: Only Admin can access the Admin Dashboard
  if (currentUser.vai_tro !== 'quan_tri') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <span className="text-[10px] text-red-800 font-bold uppercase tracking-widest block mb-1">
          Khu vực bảo mật nội bộ
        </span>
        <h2 className="text-xl font-bold font-serif-doc text-stone-900 mb-2">
          Khu Vực Dành Riêng Cho Quản Trị Viên (Admin)
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
          Thành viên đơn vị chỉ có quyền xem, học tập và kiểm tra nhận thức chính trị. Mọi quyền bổ sung, chỉnh sửa hoặc xóa dữ liệu thuộc thẩm quyền riêng của tài khoản Quản trị viên (Admin).
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          Đăng nhập tài khoản Quản trị (Admin)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Phân hệ 8</span>
              <span aria-hidden="true">·</span>
              <span>Quản trị & Giám sát nhận thức</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Bảng Điều Khiển Quản Trị Hệ Thống
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Quản trị viên có toàn quyền cập nhật tài liệu, câu hỏi, dòng thời gian truyền thống, theo dõi thống kê kết quả kiểm tra toàn đơn vị và sao lưu dữ liệu máy chủ mạng LAN nội bộ.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-right w-full sm:w-auto">
              <span className="text-[11px] text-stone-500 uppercase font-semibold block">Đang đăng nhập:</span>
              <span className="text-xs font-bold text-red-800">
                {currentUser.cap_bac} {currentUser.ho_ten}
              </span>
              <span className="text-[10px] text-stone-500 block">
                Vai trò: Quản trị hệ thống (Admin)
              </span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'thong_ke', label: 'Thống kê kết quả', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'de_thi', label: `Đợt kiểm tra (${deThi.length})`, icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'cau_hoi', label: `Ngân hàng câu hỏi (${cauHoi.length})`, icon: <HelpCircle className="w-4 h-4" /> },
            { id: 'tai_lieu', label: `Kho tài liệu (${taiLieu.length})`, icon: <BookOpen className="w-4 h-4" /> },
            { id: 'truyen_thong', label: `Mốc truyền thống (${mocTruyenThong.length})`, icon: <Award className="w-4 h-4" /> },
            { id: 'moi_ngay', label: `Lời Bác dạy (${noiDungHangNgay.length})`, icon: <Calendar className="w-4 h-4" /> },
            { id: 'am_thanh', label: `Âm thanh (${baiHat.length})`, icon: <Radio className="w-4 h-4" /> },
            { id: 'video', label: `Video (${video.length})`, icon: <Video className="w-4 h-4" /> },
            { id: 'nhat_ky', label: `Nhật ký thao tác (${nhatKy.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: 'sao_luu', label: 'Sao lưu & Phục hồi', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'tai_khoan_admin', label: 'Tài khoản Admin', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                adminTab === tab.id
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: THỐNG KÊ KẾT QUẢ TOÀN ĐƠN VỊ */}
      {adminTab === 'thong_ke' && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <span className="text-xs text-stone-500 font-medium">Tổng số lượt kiểm tra</span>
              <div className="text-3xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
                {totalExamsTaken}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Chiến sĩ đã hoàn thành</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <span className="text-xs text-stone-500 font-medium">Điểm trung bình toàn đơn vị</span>
              <div className="text-3xl font-bold font-mono text-red-800 mt-1 tabular-nums">
                {avgScore} <span className="text-sm font-sans font-normal text-stone-500">/ 10</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Đạt yêu cầu huấn luyện</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <span className="text-xs text-stone-500 font-medium">Tỉ lệ Giỏi & Khá</span>
              <div className="text-3xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {goodScorePercent}%
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">{goodScoresCount} lượt đạt loại Giỏi</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <span className="text-xs text-stone-500 font-medium">Số lượng đề thi hiện có</span>
              <div className="text-3xl font-bold font-mono text-blue-900 mt-1 tabular-nums">
                {deThi.length}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Phủ khắp 6 chuyên đề</span>
            </div>
          </div>

          {/* Detailed results table with advanced filter & examinee search */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-doc">
                    Bảng Thống Kê Chi Tiết Kết Quả Kiểm Tra Của Thí Sinh
                  </h3>
                  <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                    {filteredKetQua.length} / {ketQua.length} lượt thi
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Lưu trữ kết quả dự thi, thông tin quân nhân (Họ tên, Cấp bậc, Chức vụ, Đơn vị, Mã đề) và trích xuất dữ liệu báo cáo đơn vị.
                </p>
              </div>

              {/* ACTION EXPORT BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportResultsCSV}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Trích xuất bảng kết quả ra file Excel / CSV có dấu tiếng Việt chuẩn UTF-8"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Trích xuất Excel / CSV</span>
                </button>

                <button
                  onClick={handleExportResultsJSON}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Trích xuất toàn bộ dữ liệu kiểm tra ra định dạng JSON"
                >
                  <FileDown className="w-4 h-4 text-amber-300" />
                  <span>Trích xuất JSON</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200"
                  title="In hoặc lưu PDF bảng điểm danh sách kết quả"
                >
                  <Printer className="w-4 h-4 text-stone-600" />
                  <span>In báo cáo</span>
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, chức vụ, đơn vị, cấp bậc, mã đề..."
                  value={searchExaminee}
                  onChange={(e) => setSearchExaminee(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              {/* Filter by Exam */}
              <div className="relative">
                <select
                  value={filterExamId}
                  onChange={(e) => setFilterExamId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="all">Tất cả đợt kiểm tra / đề thi</option>
                  {deThi.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.tieu_de} {exam.ma_de ? `(${exam.ma_de})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Rank */}
              <div className="relative">
                <select
                  value={filterRank}
                  onChange={(e) => setFilterRank(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="all">Tất cả xếp loại</option>
                  <option value="gioi">Xếp loại: Giỏi (≥ 8.5 điểm)</option>
                  <option value="kha">Xếp loại: Khá (7.0 - 8.4 điểm)</option>
                  <option value="dat">Xếp loại: Đạt yêu cầu (5.0 - 6.9 điểm)</option>
                  <option value="chua_dat">Xếp loại: Chưa đạt (&lt; 5.0 điểm)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredKetQua.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs border border-dashed border-stone-200 rounded-xl">
                Không tìm thấy bài thi nào phù hợp với điều kiện tìm kiếm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Cấp bậc</th>
                      <th className="py-2.5 px-3">Chức vụ</th>
                      <th className="py-2.5 px-3">Đơn vị</th>
                      <th className="py-2.5 px-3 text-center">Mã đề</th>
                      <th className="py-2.5 px-3">Đợt kiểm tra / Đề thi</th>
                      <th className="py-2.5 px-3 text-center">Số câu đúng</th>
                      <th className="py-2.5 px-3 text-center">Điểm số</th>
                      <th className="py-2.5 px-3 text-center">Xếp loại</th>
                      <th className="py-2.5 px-3 text-right">Ngày thi</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/80">
                    {filteredKetQua.map((item, index) => {
                      const rank = getRankBadge(item.diem);
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-stone-400 font-medium text-[11px]">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 font-semibold text-stone-900 whitespace-nowrap">
                            {item.ho_ten}
                          </td>
                          <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                            {item.cap_bac}
                          </td>
                          <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                            {item.chuc_vu || 'Chiến sĩ'}
                          </td>
                          <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                            {item.don_vi}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="font-mono font-bold text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                              {item.ma_de || 'MĐ-01'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-stone-700 max-w-xs truncate" title={item.de_thi_tieu_de}>
                            {item.de_thi_tieu_de}
                          </td>
                          <td className="py-3 px-3 text-center font-mono whitespace-nowrap">
                            <span className="font-semibold text-emerald-700">{item.so_cau_dung}</span>/{item.tong_so_cau}
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-sm text-red-800 tabular-nums whitespace-nowrap">
                            {item.diem}/10
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rank.color}`}>
                              {rank.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {item.ngay_thi}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingResult(item)}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                                title="Xem chi tiết câu hỏi, đáp án đúng/sai của thí sinh"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-700" />
                                <span>Xem bài</span>
                              </button>
                              <button
                                onClick={() => handleDeleteResult(item.id, item.ho_ten)}
                                className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-lg transition-colors"
                                title="Xóa kết quả thi này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: QUẢN LÝ ĐỢT KIỂM TRA & ĐỀ THI TRẮC NGHIỆM */}
      {adminTab === 'de_thi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          
          {/* Header & Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Quản Lý Đợt Kiểm Tra & Đề Thi Trắc Nghiệm (Phân hệ 5)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
                Quy định số lượng đề, thời gian làm bài, tự động rút câu hỏi từ ngân hàng câu hỏi, tự động đảo thứ tự câu hỏi và đảo thứ tự 4 đáp án chống gian lận.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenBatchModal}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Tạo nhiều mã đề thi cùng lúc từ ngân hàng câu hỏi"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Quy định số lượng đề (Hàng loạt)</span>
              </button>

              <button
                onClick={handleOpenAddExam}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Tạo đợt kiểm tra mới</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Tổng số đợt kiểm tra / đề thi:</span>
              <span className="text-xl font-bold font-mono text-stone-900">{deThi.length} đề</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Ngân hàng câu hỏi nguồn:</span>
              <span className="text-xl font-bold font-mono text-emerald-800">{cauHoi.length} câu hỏi</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Lượt cán bộ, chiến sĩ đã thi:</span>
              <span className="text-xl font-bold font-mono text-blue-900">{ketQua.length} lượt</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Cơ chế rút đề & đảo đáp án:</span>
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động 100% khi phát đề</span>
              </span>
            </div>
          </div>

          {/* Exams list */}
          {deThi.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 font-serif-doc">
                Chưa có đợt kiểm tra trắc nghiệm nào
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Đồng chí có thể tạo đợt kiểm tra đơn lẻ hoặc quy định số lượng đề thi tạo tự động hàng loạt từ ngân hàng câu hỏi.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={handleOpenAddExam}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Tạo đợt kiểm tra đầu tiên</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {deThi.map((exam, idx) => {
                const topic = chuyenDe.find(c => c.id === exam.chuyen_de_id);
                const topicName = exam.chuyen_de_id === 'all' || !exam.chuyen_de_id
                  ? 'Tổng hợp tất cả chuyên đề lý luận'
                  : topic?.ten || 'Chuyên đề lý luận';
                const examResultsCount = ketQua.filter(k => k.de_thi_id === exam.id).length;

                return (
                  <div 
                    key={exam.id} 
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors shadow-sm"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-red-800 uppercase text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Mã #{idx + 1}
                        </span>
                        <span className="text-stone-500 font-medium">· {topicName}</span>
                        <span className="text-stone-400">· Đối tượng: {exam.doi_tuong}</span>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 font-serif-doc">
                        {exam.tieu_de}
                      </h4>

                      <p className="text-stone-600 line-clamp-1">{exam.mo_ta}</p>

                      {/* Feature tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                          ⏱ {exam.thoi_gian_phut} phút
                        </span>
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                          📝 {exam.so_cau} câu hỏi
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          exam.tu_dong_rut_cau_hoi !== false 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {exam.tu_dong_rut_cau_hoi !== false ? '✓ Tự động rút câu hỏi' : 'Chọn thủ công'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          exam.dao_cau_hoi !== false 
                            ? 'bg-blue-50 text-blue-800 border-blue-200' 
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {exam.dao_cau_hoi !== false ? '✓ Đảo câu hỏi' : 'Thứ tự cố định'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          exam.dao_dap_an !== false 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          {exam.dao_dap_an !== false ? '✓ Đảo 4 đáp án' : 'Đáp án cố định'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                          Đã làm: {examResultsCount} lượt
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleExportExamQR(exam)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        title="Xuất mã QR để dán bảng tin hoặc gửi quân nhân quét vào thi trực tiếp"
                      >
                        <QrCode className="w-3.5 h-3.5 text-red-800" />
                        <span>Mã QR</span>
                      </button>

                      <button
                        onClick={() => handleTakeExamNow(exam)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Vào giao diện thi thử đề này"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Vào thi thử</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditExam(exam)}
                        className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg transition-colors border border-stone-200"
                        title="Sửa cấu hình đợt kiểm tra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteExam(exam.id, exam.tieu_de)}
                        className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-lg transition-colors border border-stone-200"
                        title="Xóa đợt kiểm tra này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* GỢI Ý CÁC TÍNH NĂNG CHỐNG SỬ DỤNG AI KHI LÀM BÀI KIỂM TRA (DÀNH CHO CÁN BỘ QUẢN TRỊ) */}
          <div className="p-5 bg-stone-900 text-white rounded-2xl border border-red-900 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm sm:text-base font-bold font-serif-doc text-amber-300">
                    Cẩm Nang &amp; Bộ Giải Pháp Công Nghệ Chống Sử Dụng AI Khi Kiểm Tra Chính Trị
                  </h4>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Đơn vị đã kích hoạt đồng bộ 7 lớp bảo vệ tự động nhằm ngăn chặn triệt để hành vi sao chép câu hỏi hoặc tra cứu bằng ChatGPT, Gemini, Copilot khi quân nhân làm bài:
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                ✓ Đang kích hoạt 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Chống Copy &amp; Chuột phải</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Vô hiệu hóa bôi đen nội dung (<code>user-select: none</code>), chặn chuột phải và chặn các phím tắt <code>Ctrl+C</code>, <code>Ctrl+V</code>, <code>F12</code>, <code>Ctrl+U</code> để không thể sao chép văn bản câu hỏi đưa sang AI.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Giám sát chuyển Tab &amp; Cửa sổ</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Tự động phát hiện khi thí sinh Alt+Tab, chuyển tab trình duyệt hoặc mở cửa sổ AI song song. Cảnh báo trực tiếp trên màn hình và <strong>tự động thu bài ngay lập tức khi rời màn hình quá 3 lần</strong>.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Thủy ấn an ninh chìm (Watermark)</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Hiển thị họ tên, cấp bậc, đơn vị và mã đề thi in mờ chạy chéo trên toàn bộ màn hình làm bài. Nếu thí sinh dùng điện thoại chụp ảnh màn hình gửi cho AI, hình ảnh sẽ chứa thông tin danh tính của thí sinh đó.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Xáo trộn ngẫu nhiên câu &amp; đáp án</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Cùng một mã đề nhưng mỗi lần phát đề, thứ tự câu hỏi và thứ tự 4 đáp án A, B, C, D đều bị đảo ngẫu nhiên. Ngăn chặn việc học vẹt hoặc chia sẻ đáp án dạng ký tự A-B-C-D.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">5</span>
                  <span>Giới hạn thời gian &amp; Tự động nộp bài</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Đồng hồ đếm ngược từng giây tạo áp lực thời gian thực, thí sinh không đủ thời gian nhập prompt vào AI. Khi đồng hồ về <code>00:00</code>, hệ thống tự động khóa đề và thu bài tức thì.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <span className="w-5 h-5 rounded-full bg-red-900 text-white flex items-center justify-center text-[10px]">6</span>
                  <span>Xác thực bắt buộc 4 thông tin quân nhân</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Quân nhân bắt buộc phải điền đầy đủ: <strong>Họ tên</strong>, <strong>Cấp bậc</strong>, <strong>Chức vụ</strong>, <strong>Đơn vị</strong> mới được cấp quyền vào thi. Dữ liệu được ghi kèm số lần rời màn hình vào báo cáo điểm cán bộ.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUẢN LÝ TÀI LIỆU */}
      {adminTab === 'tai_lieu' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  ★ Kho Văn Kiện &amp; Tài Liệu
                </span>
                <span className="text-xs text-stone-500 font-mono">Tổng số: {taiLieu.length} văn kiện</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-doc text-stone-900">
                Quản Lý Văn Kiện, Chỉ Thị &amp; Tài Liệu Học Tập
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cán bộ có thể tải tệp Word (.docx), PDF (.pdf) để tự động trích xuất nội dung hoặc đính kèm văn bản gốc cho bộ đội học tập
              </p>
            </div>

            <button
              onClick={handleOpenAddDoc}
              className="px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-amber-300" />
              <span>Thêm tài liệu mới (Word / PDF)</span>
            </button>
          </div>

          {/* Search & Topic Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu theo tiêu đề, số hiệu hoặc tác giả..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-800 bg-stone-50/50"
              />
              {docSearchQuery && (
                <button
                  onClick={() => setDocSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={docFilterChuyenDe}
                onChange={(e) => setDocFilterChuyenDe(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-red-800 w-full sm:w-56"
              >
                <option value="all">Tất cả chuyên đề ({taiLieu.length})</option>
                {chuyenDe.map(cd => (
                  <option key={cd.id} value={cd.id}>{cd.ten}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Document List */}
          <div className="divide-y divide-stone-200">
            {taiLieu
              .filter(doc => {
                const matchSearch = docSearchQuery === '' || 
                  doc.tieu_de.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                  doc.tac_gia.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                  (doc.so_hieu && doc.so_hieu.toLowerCase().includes(docSearchQuery.toLowerCase()));
                const matchCd = docFilterChuyenDe === 'all' || doc.chuyen_de_id === docFilterChuyenDe;
                return matchSearch && matchCd;
              })
              .map((doc) => {
                const topic = chuyenDe.find(c => c.id === doc.chuyen_de_id);
                const hasAttachment = Boolean(doc.du_lieu_tep || doc.ten_tep_goc);
                const isWord = doc.loai_dinh_kem === 'word' || doc.ten_tep_goc?.endsWith('.docx') || doc.ten_tep_goc?.endsWith('.doc');
                const isPdf = doc.loai_dinh_kem === 'pdf' || doc.ten_tep_goc?.endsWith('.pdf');

                return (
                  <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:bg-stone-50/60 p-2 rounded-xl transition-colors">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2 text-stone-500">
                        <span className="font-bold text-red-800 uppercase text-[10px] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {doc.loai === 'van_kien' ? 'Văn kiện' : doc.loai === 'chi_thi' ? 'Chỉ thị' : doc.loai === 'phap_luat' ? 'Pháp luật' : 'Giáo dục'}
                        </span>
                        <span className="text-stone-700 font-semibold">{topic?.ten}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.tac_gia}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.ngay_dang}</span>
                        {doc.so_hieu && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">{doc.so_hieu}</span>
                          </>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 font-serif-doc leading-snug">
                        {doc.tieu_de}
                      </h4>
                      <p className="text-stone-600 line-clamp-2 leading-relaxed">
                        {doc.tom_tat}
                      </p>

                      {/* Attached file indicator */}
                      {hasAttachment && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            isWord 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : isPdf 
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}>
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Tệp đính kèm: <strong>{doc.ten_tep_goc || (isWord ? 'Tai-lieu.docx' : 'Van-ban.pdf')}</strong></span>
                            {doc.kich_thuoc_tep && (
                              <span className="text-stone-500 font-normal">({(doc.kich_thuoc_tep / 1024).toFixed(1)} KB)</span>
                            )}
                          </span>

                          {doc.du_lieu_tep && (
                            <a
                              href={doc.du_lieu_tep}
                              download={doc.ten_tep_goc || 'tai-lieu-goc'}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 hover:text-red-950 underline ml-1"
                              title="Tải tệp đính kèm về máy"
                            >
                              <Download className="w-3 h-3" />
                              <span>Tải tệp gốc</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEditDoc(doc)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs"
                        title="Chỉnh sửa tài liệu này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tài liệu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ CÂU HỎI */}
      {adminTab === 'cau_hoi' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  ★ Ngân Hàng Câu Hỏi Kiểm Tra
                </span>
                <span className="text-xs text-stone-500 font-mono">Tổng cộng: {cauHoi.length} câu</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-doc text-stone-900">
                Ngân Hàng Câu Hỏi Nhận Thức Chính Trị
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cán bộ có thể <strong>tải tệp Word (.docx) hoặc PDF</strong> để nhập hàng loạt hàng chục câu hỏi chỉ với 1 cú nhấp chuột, hoặc bổ sung từng câu hỏi thủ công.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Batch Import Button */}
              <button
                onClick={handleOpenImportQuestions}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Tải lên tệp Word (.docx) hoặc PDF để tự động nhận diện tất cả câu hỏi"
              >
                <FileUp className="w-4 h-4 text-emerald-200" />
                <span>Nhập từ tệp Word (.docx) / PDF</span>
              </button>

              {/* Single Add Button */}
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="px-3.5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Thêm câu hỏi thủ công</span>
              </button>
            </div>
          </div>

          {/* Search & Topic Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={questionSearchQuery}
                onChange={(e) => setQuestionSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nội dung câu hỏi, phương án trả lời..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-800 bg-stone-50/50"
              />
              {questionSearchQuery && (
                <button
                  onClick={() => setQuestionSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={questionFilterChuyenDe}
                onChange={(e) => setQuestionFilterChuyenDe(e.target.value)}
                className="px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-red-800 w-full sm:w-56"
              >
                <option value="all">Tất cả chuyên đề ({cauHoi.length})</option>
                {chuyenDe.map(cd => (
                  <option key={cd.id} value={cd.id}>{cd.ten}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Success Feedback Banner */}
          {questionSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{questionSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuestionSuccessMsg('')}
                className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Question List & Batch Controls */}
          {(() => {
            const filteredQuestions = cauHoi.filter(q => {
              const matchSearch = questionSearchQuery === '' ||
                q.noi_dung.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
                q.cac_dap_an.some(opt => opt.toLowerCase().includes(questionSearchQuery.toLowerCase()));
              const matchCd = questionFilterChuyenDe === 'all' || q.chuyen_de_id === questionFilterChuyenDe;
              return matchSearch && matchCd;
            });

            return (
              <div className="space-y-3">
                {/* Batch Actions & Selection Bar */}
                {filteredQuestions.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-100/90 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700 select-none">
                        <input
                          type="checkbox"
                          checked={filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQuestionIds(filteredQuestions.map(q => q.id));
                            } else {
                              setSelectedQuestionIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded text-red-800 focus:ring-red-800 border-stone-300 cursor-pointer"
                        />
                        <span>
                          {selectedQuestionIds.length > 0
                            ? `Đã chọn ${selectedQuestionIds.length} / ${filteredQuestions.length} câu`
                            : `Chọn tất cả (${filteredQuestions.length} câu)`}
                        </span>
                      </label>

                      {selectedQuestionIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedQuestionIds([])}
                          className="text-[11px] text-stone-500 hover:text-stone-700 underline cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedQuestionIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowBatchDeleteModal(true)}
                          className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa {selectedQuestionIds.length} câu đã chọn</span>
                        </button>
                      )}

                      {questionFilterChuyenDe !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setShowClearTopicModal(true)}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-stone-300"
                          title="Xóa tất cả câu hỏi trong chuyên đề đang lọc"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Xóa toàn bộ câu thuộc chuyên đề này ({filteredQuestions.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Question Cards */}
                {filteredQuestions.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 text-xs border border-dashed border-stone-200 rounded-xl bg-stone-50/50 space-y-2">
                    <p className="font-semibold">Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.</p>
                    <p className="text-[11px] text-stone-400">Đồng chí có thể bấm &quot;Nhập từ tệp Word (.docx) / PDF&quot; hoặc &quot;Thêm câu hỏi thủ công&quot; ở phía trên để bổ sung.</p>
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const topic = chuyenDe.find(c => c.id === q.chuyen_de_id);
                    const isSelected = selectedQuestionIds.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                            : 'bg-stone-50/70 hover:bg-stone-50 border-stone-200'
                        }`}
                      >
                        {/* Select checkbox */}
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedQuestionIds(prev => [...prev, q.id]);
                              } else {
                                setSelectedQuestionIds(prev => prev.filter(id => id !== q.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-red-800 focus:ring-red-800 border-stone-300 cursor-pointer"
                            title="Tích chọn để thao tác hàng loạt"
                          />
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-stone-500">
                            <span className="font-bold text-red-800 bg-red-100/80 px-2 py-0.5 rounded text-[11px]">
                              Câu {idx + 1}
                            </span>
                            <span className="font-semibold text-stone-800">{topic?.ten}</span>
                            <span aria-hidden="true">·</span>
                            <span className="uppercase text-[10px] font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">
                              {q.muc_do === 'nang_cao' ? 'Nâng cao' : 'Cơ bản'}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-stone-900 leading-snug">{q.noi_dung}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.cac_dap_an.map((opt, optIdx) => {
                              const isCorrect = optIdx === q.dap_an_dung;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
                                    isCorrect
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold'
                                      : 'bg-white text-stone-700 border border-stone-200'
                                  }`}
                                >
                                  <span className={`w-4 font-bold shrink-0 ${isCorrect ? 'text-emerald-700' : 'text-stone-500'}`}>
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {isCorrect && (
                                    <span className="text-[10px] text-emerald-700 font-bold ml-1">✓ Đúng</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {q.giai_thich && (
                            <div className="text-[11px] text-stone-600 bg-stone-100 p-2 rounded-lg border border-stone-200">
                              <span className="font-bold text-stone-700">Căn cứ lý luận: </span>
                              <span>{q.giai_thich}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditQuestion(q)}
                            className="px-2.5 py-1.5 bg-stone-200/90 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Chỉnh sửa nội dung câu hỏi, các đáp án hoặc căn cứ giải thích"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-700" />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuestionToDelete(q)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Xóa câu hỏi này khỏi ngân hàng câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-700" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: MỐC TRUYỀN THỐNG ĐƠN VỊ */}
      {adminTab === 'truyen_thong' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Quản Lý Mốc Lịch Sử & Truyền Thống Đơn Vị (Phân hệ 6)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cán bộ chủ động bổ sung, cập nhật các mốc thời gian, ngày thành lập, chiến công vẻ vang để hiển thị trên Dòng thời gian lịch sử
              </p>
            </div>

            <button
              onClick={handleOpenAddTradition}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Thêm mốc lịch sử mới</span>
            </button>
          </div>

          {mocTruyenThong.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 font-serif-doc">
                Chưa có dữ liệu mốc truyền thống nào
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Hiện tại phần truyền thống đã được làm sạch để đơn vị tự nhập dữ liệu chuẩn. Bấm nút bên dưới để bổ sung mốc đầu tiên.
              </p>
              <button
                onClick={handleOpenAddTradition}
                className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Thêm mốc truyền thống đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Tiêu đề mốc lịch sử</th>
                    <th className="py-2.5 px-3">Phân loại sự kiện</th>
                    <th className="py-2.5 px-3">Nội dung tóm tắt</th>
                    <th className="py-2.5 px-3 text-center">Ảnh tư liệu</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  {mocTruyenThong.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-red-800 font-mono text-sm block">{m.nam}</span>
                        <span className="text-[11px] text-stone-500">{m.ngay_thang}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-900 max-w-xs">
                        {m.tieu_de}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          m.loai_su_kien === 'chien_cong' ? 'bg-red-50 text-red-800 border border-red-200' :
                          m.loai_su_kien === 'thanh_lap' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          m.loai_su_kien === 'danh_hieu' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {m.loai_su_kien === 'chien_cong' ? 'Chiến công' :
                           m.loai_su_kien === 'thanh_lap' ? 'Thành lập' :
                           m.loai_su_kien === 'danh_hieu' ? 'Phần thưởng' : 'Phát triển'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-600 max-w-md">
                        <p className="line-clamp-2">{m.noi_dung}</p>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {m.hinh_anh ? (
                          <span className="text-[11px] text-emerald-700 font-medium">Có ảnh</span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Không</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditTradition(m)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 hover:text-red-800 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTradition(m.id, m.tieu_de)}
                            className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded-lg transition-colors"
                            title="Xóa mốc này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MỖI NGÀY MỘT NỘI DUNG (LỜI BÁC DẠY) */}
      {adminTab === 'moi_ngay' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Quản Lý "Mỗi Ngày Một Lời Bác Dạy" ({noiDungHangNgay.length})
              </h3>
              <p className="text-xs text-stone-500">
                Thêm, sửa, xóa nội dung lời dạy của Chủ tịch Hồ Chí Minh và bài học định hướng tư tưởng cho bộ đội.
              </p>
            </div>
            <button
              onClick={handleOpenAddQuote}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm lời Bác dạy</span>
            </button>
          </div>

          <div className="space-y-3">
            {noiDungHangNgay.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Chưa có nội dung lời Bác dạy nào. Hãy thêm nội dung mới.</p>
              </div>
            ) : (
              noiDungHangNgay.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/60 transition-colors space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-red-800 uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-[11px]">
                        {item.ngay}
                      </span>
                      <span className="text-stone-500 text-[11px]">{item.nguon}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditQuote(item)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                        title="Chỉnh sửa nội dung"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(item.id, item.tieu_de)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                        title="Xóa nội dung này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 font-serif-doc">{item.tieu_de}</h4>
                  
                  <div className="p-3 bg-amber-50/70 border-l-2 border-amber-600 rounded-r-lg">
                    <p className="italic font-serif-doc text-stone-800 text-xs sm:text-sm">
                      "{item.trich_dan}"
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Bối cảnh: {item.hoan_canh}
                    </p>
                  </div>

                  <div className="text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="font-semibold text-stone-800 block">Ý nghĩa đối với cán bộ, chiến sĩ: </span>
                    {item.y_nghia}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: QUẢN LÝ ÂM THANH & BÀI HÁT TRUYỀN THỐNG */}
      {adminTab === 'am_thanh' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Quản Lý Âm Thanh & Bài Hát Truyền Thống ({baiHat.length})
              </h3>
              <p className="text-xs text-stone-500">
                Thêm, sửa, xóa các ca khúc cách mạng chính quy, bản tin phát thanh 5 phút và podcast chính trị nội bộ.
              </p>
            </div>
            <button
              onClick={handleOpenAddAudio}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bài hát / âm thanh</span>
            </button>
          </div>

          <div className="space-y-3">
            {baiHat.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <Music className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Chưa có tác phẩm âm thanh nào. Hãy thêm tác phẩm mới.</p>
              </div>
            ) : (
              baiHat.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                        {item.the_loai === 'bai_hat' ? 'Ca khúc' : item.the_loai === 'phat_thanh' ? 'Phát thanh' : 'Podcast'}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">Thời lượng: {item.thoi_luong}</span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 font-serif-doc">
                      {item.tieu_de}
                    </h4>
                    <p className="text-[11px] text-stone-600 font-medium">
                      Tác giả: {item.tac_gia}
                    </p>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {item.mo_ta}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditAudio(item)}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAudio(item.id, item.tieu_de)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: QUẢN LÝ VIDEO TƯ LIỆU */}
      {adminTab === 'video' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-3">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Quản Lý Video Tư Liệu & Phóng Sự ({video.length})
              </h3>
              <p className="text-xs text-stone-500">
                Thêm, sửa, xóa phim tài liệu lịch sử, phóng sự truyền hình và phim truyền thống của đơn vị.
              </p>
            </div>
            <button
              onClick={handleOpenAddVideo}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm video tư liệu</span>
            </button>
          </div>

          <div className="space-y-3">
            {video.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <Film className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Chưa có video nào. Hãy thêm video mới.</p>
              </div>
            ) : (
              video.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                        {item.the_loai}
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">Thời lượng: {item.thoi_luong}</span>
                      {item.ngay_dang && (
                        <span className="text-[11px] text-stone-400 font-mono">· Ngày đăng: {item.ngay_dang}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 font-serif-doc">
                      {item.tieu_de}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {item.mo_ta}
                    </p>
                    <p className="text-[11px] font-mono text-stone-500 truncate max-w-md">
                      URL: {item.video_url}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditVideo(item)}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(item.id, item.tieu_de)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NHẬT KÝ THAO TÁC (AUDIT LOGS) */}
      {adminTab === 'nhat_ky' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-stone-200">
            <h3 className="text-base font-bold font-serif-doc text-stone-900">Nhật Ký Thao Tác Hệ Thống (Audit Logs)</h3>
            <p className="text-xs text-stone-500">Ghi nhận minh bạch mọi thao tác thêm/sửa/xóa và làm bài kiểm tra để tra soát</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Vai trò</th>
                  <th className="py-2.5 px-3">Hành động</th>
                  <th className="py-2.5 px-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80">
                {nhatKy.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px] whitespace-nowrap">{log.thoi_gian}</td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{log.nguoi_thuc_hien}</td>
                    <td className="py-3 px-3 text-stone-600">{log.vai_tro}</td>
                    <td className="py-3 px-3 font-medium text-red-800">{log.hanh_dong}</td>
                    <td className="py-3 px-3 text-stone-700 max-w-md truncate">{log.chi_tiet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SAO LƯU, ĐỒNG BỘ NGUỒN & PHỤC HỒI DỮ LIỆU */}
      {adminTab === 'sao_luu' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-stone-200">
            <h3 className="text-base font-bold font-serif-doc text-stone-900">Vận Hành, Tự Động Đồng Bộ &amp; Lưu Trữ Tệp Nguồn</h3>
            <p className="text-xs text-stone-600 mt-1">
              Khi cán bộ bổ sung tài liệu (Word/PDF), câu hỏi hoặc bất kỳ nội dung nào, hệ thống sẽ tự động lưu trữ vào tệp nguồn máy chủ và đồng bộ tức thời để tất cả người dùng xem được ngay trên Máy tính và Điện thoại di động.
            </p>
          </div>

          {/* REAL-TIME SOURCE SYNC STATUS CARD */}
          <div className="p-5 bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl border border-stone-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Trạng Thái Đồng Bộ Tệp Nguồn Máy Chủ</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isSyncing ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-emerald-500 text-stone-950'
                    }`}>
                      {isSyncing ? 'Đang đồng bộ...' : 'Hoạt động tốt'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tự động đồng bộ đa thiết bị: Bất kỳ ai vào đường dẫn web trên Điện thoại hay Máy tính đều thấy nội dung mới.
                  </p>
                </div>
              </div>

              <button
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-stone-700 self-start sm:self-auto cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>{isSyncing ? 'Đang nạp...' : 'Đồng bộ nguồn ngay'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50 space-y-1">
                <span className="text-[11px] text-stone-400 block">Tệp nguồn CSDL:</span>
                <span className="font-mono text-emerald-300 font-semibold text-xs block">/data/database.json</span>
                <span className="text-[10px] text-stone-500 block">Lưu toàn văn tài liệu, ngân hàng đề thi</span>
              </div>

              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50 space-y-1">
                <span className="text-[11px] text-stone-400 block">Kho tệp đính kèm gốc:</span>
                <span className="font-mono text-amber-300 font-semibold text-xs block">/uploads/documents/</span>
                <span className="text-[10px] text-stone-500 block">Lưu tệp Word (.docx) &amp; PDF (.pdf) gốc</span>
              </div>

              <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50 space-y-1">
                <span className="text-[11px] text-stone-400 block">Lần đồng bộ gần nhất:</span>
                <span className="font-semibold text-stone-200 text-xs block">
                  {lastSyncTime ? lastSyncTime.toLocaleTimeString('vi-VN') : 'Vừa xong'}
                </span>
                <span className="text-[10px] text-emerald-400 block">Tự động kiểm tra mỗi 7 giây</span>
              </div>
            </div>
          </div>

          {/* Card: Tự động lưu tệp nguồn & Đồng bộ đa nền tảng PC - Điện thoại */}
          <div className="p-5 bg-gradient-to-r from-red-950 via-stone-900 to-stone-900 text-white rounded-2xl border border-red-900/60 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-800 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-serif-doc">
                    Tự Động Lưu Tệp Nguồn Vào Máy Chủ & Đồng Bộ Đa Thiết Bị
                  </h4>
                  <p className="text-[11px] text-stone-300">
                    Lưu trữ ổ cứng máy chủ (/uploads/) — Đồng bộ hóa theo thời gian thực giữa Máy tính (PC / Laptop) và Điện thoại di động
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-700 px-2.5 py-0.5 rounded-full shrink-0">
                ✓ Đang hoạt động
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1">
                <span className="font-bold text-amber-300 block">1. Lưu tệp nguồn máy chủ</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Bất kỳ tệp Word (.docx, .doc), PDF (.pdf), âm thanh (.mp3), video (.mp4) hay hình ảnh nào được cán bộ tải lên sẽ được tự động ghi vĩnh viễn vào thư mục nguồn <code>/uploads/</code> trên máy chủ.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1">
                <span className="font-bold text-amber-300 block">2. Đồng bộ điện thoại & máy tính</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Quân nhân truy cập qua máy tính hoặc quét mã QR bằng điện thoại thông minh đều có thể mở tài liệu, xem toàn văn, nghe âm thanh và tải tệp gốc về máy từ cùng một nguồn dữ liệu máy chủ.
                </p>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1">
                <span className="font-bold text-amber-300 block">3. An toàn & Lưu trữ vĩnh viễn</span>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Toàn bộ cơ sở dữ liệu được đồng bộ liên tục vào <code>data/database.json</code>, không phụ thuộc vào bộ nhớ tạm trình duyệt, đảm bảo dữ liệu không bị mất khi đổi máy.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs uppercase font-bold text-red-800 tracking-wider">
                1. Sao lưu dữ liệu ra tệp JSON
              </span>
              <p className="text-xs text-stone-600">
                Gói toàn bộ tài liệu, chuyên đề, câu hỏi, đề thi, lịch sử điểm thi và mã QR vào một tệp sao lưu an toàn.
              </p>
              <button
                onClick={handleExport}
                className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp sao lưu (.json)</span>
              </button>
            </div>

            {/* Restore */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs uppercase font-bold text-stone-800 tracking-wider">
                2. Phục hồi dữ liệu từ bản sao lưu
              </span>
              <p className="text-xs text-stone-600">
                Dán nội dung JSON đã sao lưu vào ô dưới đây để khôi phục trạng thái hệ thống.
              </p>
              <form onSubmit={handleImportSubmit} className="space-y-2">
                <textarea
                  rows={3}
                  value={backupJson}
                  onChange={(e) => {
                    setBackupJson(e.target.value);
                    setImportNotice('');
                  }}
                  placeholder="Dán mã JSON sao lưu tại đây..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-red-800"
                />
                {importNotice && (
                  <p className={`text-[11px] font-semibold ${importNotice.includes('thành công') ? 'text-emerald-700' : 'text-red-700'}`}>
                    {importNotice}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Khôi phục dữ liệu</span>
                </button>
              </form>
            </div>

          </div>

          {/* Reset database emergency */}
          {currentUser.vai_tro === 'quan_tri' && (
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-900 block">Khởi tạo lại cơ sở dữ liệu mẫu ban đầu</span>
                <span className="text-[11px] text-stone-500">Khôi phục toàn bộ các văn kiện và câu hỏi mẫu ban đầu của Quân đội.</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Đồng chí có chắc chắn muốn đặt lại dữ liệu mẫu ban đầu?')) {
                    resetDatabase();
                  }
                }}
                className="px-3.5 py-1.5 border border-red-300 text-red-800 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt lại dữ liệu mẫu</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB: TÀI KHOẢN ADMIN */}
      {adminTab === 'tai_khoan_admin' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-stone-200">
            <h3 className="text-base font-bold font-serif-doc text-stone-900">
              Quản Lý Tài Khoản Quản Trị Viên (Admin)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Hệ thống áp dụng phân quyền nghiêm ngặt: Các thành viên chỉ xem nội dung. Quyền bổ sung, chỉnh sửa hoặc xóa nội dung dữ liệu thuộc thẩm quyền duy nhất của tài khoản Quản trị viên (Admin).
            </p>
          </div>

          {/* Current Admin Information summary card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                Thông tin tài khoản hiện tại:
              </span>
              <div className="grid grid-cols-2 gap-2 text-stone-700">
                <div>
                  <span className="text-stone-400 block text-[10px]">Tài khoản:</span>
                  <span className="font-mono font-bold text-stone-900">{adminAccount.taiKhoan}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Mật khẩu:</span>
                  <span className="font-mono text-stone-600">••••••••</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Họ tên cán bộ:</span>
                  <span className="font-semibold text-stone-900">{adminAccount.hoTen}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Cấp bậc - Chức vụ:</span>
                  <span className="text-stone-900">{adminAccount.capBac} - {adminAccount.chucVu}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Nguyên tắc bảo mật:</span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Đồng chí Quản trị viên nên đổi mật khẩu riêng sau khi nhận bàn giao hệ thống. Mật khẩu mới sẽ được lưu trữ an toàn trong cơ sở dữ liệu nội bộ.
                </p>
              </div>
            </div>
          </div>

          {/* Update Account Form */}
          <div className="pt-2">
            <h4 className="text-sm font-bold font-serif-doc text-stone-900 mb-3">
              Cập Nhật Tên Đăng Nhập & Đổi Mật Khẩu Admin
            </h4>

            {adminUpdateMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">{adminUpdateMsg}</span>
              </div>
            )}

            {adminUpdateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{adminUpdateError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminAccount} className="space-y-4 max-w-2xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tên đăng nhập Admin <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdminUser}
                    onChange={(e) => setEditAdminUser(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Họ và tên Quản trị viên:
                  </label>
                  <input
                    type="text"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mật khẩu mới <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="password"
                    required
                    value={editAdminPass}
                    onChange={(e) => setEditAdminPass(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị mới"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Xác nhận mật khẩu mới <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="password"
                    required
                    value={editAdminPassConfirm}
                    onChange={(e) => setEditAdminPassConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Cấp bậc:
                  </label>
                  <input
                    type="text"
                    value={editAdminRank}
                    onChange={(e) => setEditAdminRank(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Chức vụ:
                  </label>
                  <input
                    type="text"
                    value={editAdminDuty}
                    onChange={(e) => setEditAdminDuty(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Đơn vị:
                  </label>
                  <input
                    type="text"
                    value={editAdminUnit}
                    onChange={(e) => setEditAdminUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Lưu thay đổi tài khoản Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA TÀI LIỆU VĂN KIỆN (WORD / PDF UPLOAD) */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs">
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center text-amber-300 font-bold">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-serif-doc text-white">
                    {editingDoc ? 'Chỉnh Sửa Văn Kiện & Tài Liệu' : 'Thêm Văn Kiện & Tài Liệu Học Tập Mới'}
                  </h3>
                  <span className="text-[10px] text-amber-400 block">
                    Hỗ trợ trích xuất tự động từ tệp Word (.docx, .doc) và tệp PDF (.pdf)
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setEditingDoc(null);
                }}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveDoc} className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* FILE UPLOAD DROPZONE */}
              <div className="p-4 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/80 hover:bg-stone-50 hover:border-red-800 transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-800 shrink-0">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="font-bold text-stone-900 text-xs block">
                      Tải lên tệp Word (.docx, .doc), PDF (.pdf) hoặc Text (.txt)
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Hệ thống tự động đọc và trích xuất nội dung vào ô bên dưới, đồng thời lưu giữ tệp gốc để quân nhân tải về hoặc đọc trực tiếp.
                    </p>
                  </div>
                  <label className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isParsingDoc ? 'Đang đọc tệp...' : 'Chọn tệp từ máy'}</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf,.txt,.md"
                      disabled={isParsingDoc}
                      className="hidden"
                      onChange={handleDocFileUpload}
                    />
                  </label>
                </div>

                {/* Upload Status / Attachment Preview */}
                {docUploadNotice && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{docUploadNotice}</span>
                    </div>
                  </div>
                )}

                {docAttachedFileName && (
                  <div className="mt-2 flex items-center justify-between bg-white border border-stone-200 px-3 py-2 rounded-lg text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-stone-700">
                      <Paperclip className="w-3.5 h-3.5 text-stone-400" />
                      <span>Tệp đã gắn: <strong>{docAttachedFileName}</strong></span>
                      {docAttachedFileSize > 0 && (
                        <span className="text-stone-400">({(docAttachedFileSize / 1024).toFixed(1)} KB)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocAttachedFileName('');
                        setDocAttachedFileSize(0);
                        setDocAttachedFileType('none');
                        setDocAttachedDataUrl(undefined);
                        setDocUploadNotice('');
                      }}
                      className="text-red-700 hover:text-red-900 text-[10px] font-bold"
                    >
                      Gỡ bỏ tệp
                    </button>
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tiêu đề văn kiện / tài liệu <span className="text-red-700">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="VD: Nghị quyết số 847-NQ/QUTW về Phát huy phẩm chất Bộ đội Cụ Hồ..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Chuyên đề trực thuộc *:</label>
                  <select
                    value={docChuyenDeId}
                    onChange={(e) => setDocChuyenDeId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-800"
                  >
                    {chuyenDe.map(cd => (
                      <option key={cd.id} value={cd.id}>{cd.ten}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Loại tài liệu:</label>
                  <select
                    value={docLoai}
                    onChange={(e) => setDocLoai(e.target.value as LoaiTaiLieu)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-800"
                  >
                    <option value="van_kien">Văn kiện chính trị</option>
                    <option value="chi_thi">Chỉ thị / Nghị quyết</option>
                    <option value="phap_luat">Pháp luật &amp; Kỷ luật Quân đội</option>
                    <option value="giao_duc">Giáo dục chính trị cơ bản</option>
                    <option value="truyen_thong">Lịch sử &amp; Truyền thống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cơ quan ban hành / Tác giả:</label>
                  <input
                    type="text"
                    value={docTacGia}
                    onChange={(e) => setDocTacGia(e.target.value)}
                    placeholder="VD: Quân ủy Trung ương"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Số hiệu văn bản (nếu có):</label>
                  <input
                    type="text"
                    value={docSoHieu}
                    onChange={(e) => setDocSoHieu(e.target.value)}
                    placeholder="VD: 847-NQ/QUTW"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thời lượng đọc (phút):</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={docThoiLuong}
                    onChange={(e) => setDocThoiLuong(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tóm tắt nội dung chính:</label>
                <textarea
                  rows={2}
                  value={docTomTat}
                  onChange={(e) => setDocTomTat(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn mục đích, yêu cầu và nội dung cốt lõi của văn bản..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">
                    Toàn văn nội dung tài liệu <span className="text-red-700">*</span>:
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {docNoiDung.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={docNoiDung}
                  onChange={(e) => setDocNoiDung(e.target.value)}
                  placeholder="Dán hoặc chỉnh sửa toàn văn nội dung tài liệu tại đây (đã tự động nạp khi tải file Word)..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocModal(false);
                    setEditingDoc(null);
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingDoc ? 'Cập nhật tài liệu' : 'Lưu tài liệu vào kho'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: NHẬP HÀNG LOẠT CÂU HỎI TỪ TỆP WORD / PDF */}
      {showImportQuestionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs">
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-serif-doc text-white">
                    Nhập Ngân Hàng Câu Hỏi Từ Tệp Word (.docx) / PDF
                  </h3>
                  <span className="text-[10px] text-emerald-300 block">
                    Tự động tách câu hỏi, 4 phương án (A, B, C, D), đáp án đúng và căn cứ lý luận
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportQuestionModal(false);
                  setParsedQuestions([]);
                }}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* Instructions & sample format */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-stone-800 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-950 block mb-1">
                  Định dạng câu hỏi được hệ thống hỗ trợ tự động nhận diện:
                </span>
                <pre className="font-mono bg-white p-2 rounded border border-amber-200/70 text-[10px] text-stone-700 overflow-x-auto whitespace-pre">
{`Câu 1: Bản chất của Quân đội nhân dân Việt Nam là gì?
A. Mang bản chất giai cấp nông dân
B. Mang bản chất giai cấp công nhân
C. Mang bản chất nhân dân lao động
D. Mang bản chất toàn thể dân tộc
Đáp án: B
Giải thích: Căn cứ lời dạy của Chủ tịch Hồ Chí Minh và Nghị quyết Đại hội Đảng...`}
                </pre>
              </div>

              {/* Upload Dropzone */}
              <div className="p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="font-bold text-stone-900 text-xs block">
                      Chọn tệp Word (.docx, .doc) hoặc PDF chứa danh sách câu hỏi
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Hệ thống sẽ phân tích cú pháp và trích xuất danh sách câu hỏi trắc nghiệm ngay lập tức.
                    </p>
                  </div>
                  <label className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isParsingQuestions ? 'Đang xử lý...' : 'Chọn tệp Word/PDF'}</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf,.txt,.csv"
                      disabled={isParsingQuestions}
                      className="hidden"
                      onChange={handleQuestionFileUpload}
                    />
                  </label>
                </div>

                {importQuestionNotice && (
                  <div className="mt-3 p-2.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-[11px] flex items-center justify-between">
                    <span className="font-semibold">{importQuestionNotice}</span>
                  </div>
                )}
              </div>

              {/* Target Chuyen De & Difficulty settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Lưu vào chuyên đề học tập:
                  </label>
                  <select
                    value={importTargetChuyenDeId}
                    onChange={(e) => {
                      setImportTargetChuyenDeId(e.target.value);
                      if (rawQuestionText) {
                        const qs = parseQuestionsFromText(rawQuestionText, e.target.value, importDefaultMucDo);
                        setParsedQuestions(qs);
                      }
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    {chuyenDe.map(cd => (
                      <option key={cd.id} value={cd.id}>{cd.ten}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mức độ nhận thức:
                  </label>
                  <select
                    value={importDefaultMucDo}
                    onChange={(e) => {
                      const val = e.target.value as 'co_ban' | 'nang_cao';
                      setImportDefaultMucDo(val);
                      if (rawQuestionText) {
                        const qs = parseQuestionsFromText(rawQuestionText, importTargetChuyenDeId, val);
                        setParsedQuestions(qs);
                      }
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    <option value="co_ban">Cơ bản (Chiến sĩ mới, Hạ sĩ quan)</option>
                    <option value="nang_cao">Nâng cao (Sĩ quan, Quân nhân chuyên nghiệp)</option>
                  </select>
                </div>
              </div>

              {/* Parsed questions preview */}
              {parsedQuestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 text-xs">
                      Danh sách {parsedQuestions.length} câu hỏi nhận diện được từ tệp:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Đã sẵn sàng nạp ({parsedQuestions.length} câu)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setParsedQuestions([]);
                          setRawQuestionText('');
                          setEditingParsedIdx(null);
                        }}
                        className="text-[11px] text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                        title="Xóa danh sách câu hỏi này để chọn tệp khác"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa danh sách này</span>
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {parsedQuestions.map((q, idx) => {
                      const isEditingThis = editingParsedIdx === idx;

                      if (isEditingThis) {
                        return (
                          <div key={idx} className="p-3.5 bg-amber-50/90 rounded-xl border-2 border-amber-500 space-y-2.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-950 text-xs">
                                ✏️ Đang điều chỉnh câu hỏi số {idx + 1}:
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingParsedIdx(null)}
                                className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Nội dung câu hỏi:</label>
                              <textarea
                                rows={2}
                                value={parsedEditContent}
                                onChange={(e) => setParsedEditContent(e.target.value)}
                                className="w-full p-2 text-xs border border-stone-300 rounded-lg bg-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-stone-700">4 Phương án & Chọn đáp án đúng (radio):</label>
                              {[
                                { label: 'A', val: parsedEditOptA, setVal: setParsedEditOptA, idxVal: 0 },
                                { label: 'B', val: parsedEditOptB, setVal: setParsedEditOptB, idxVal: 1 },
                                { label: 'C', val: parsedEditOptC, setVal: setParsedEditOptC, idxVal: 2 },
                                { label: 'D', val: parsedEditOptD, setVal: setParsedEditOptD, idxVal: 3 },
                              ].map((optItem) => (
                                <div key={optItem.label} className="flex items-center gap-1.5">
                                  <span className="font-bold w-4 text-[11px] text-stone-600">{optItem.label}.</span>
                                  <input
                                    type="text"
                                    value={optItem.val}
                                    onChange={(e) => optItem.setVal(e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                                    placeholder={`Phương án ${optItem.label}...`}
                                  />
                                  <label className="flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-stone-200">
                                    <input
                                      type="radio"
                                      name={`parsedCorrect_${idx}`}
                                      checked={parsedEditCorrect === optItem.idxVal}
                                      onChange={() => setParsedEditCorrect(optItem.idxVal)}
                                      className="text-emerald-700 focus:ring-emerald-700"
                                    />
                                    <span className="text-[10px] font-bold text-emerald-800">Đúng</span>
                                  </label>
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Căn cứ giải thích:</label>
                              <input
                                type="text"
                                value={parsedEditExpl}
                                onChange={(e) => setParsedEditExpl(e.target.value)}
                                placeholder="Căn cứ lý luận, tài liệu chính quy..."
                                className="w-full px-2 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
                              <button
                                type="button"
                                onClick={() => setEditingParsedIdx(null)}
                                className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs"
                              >
                                Hủy sửa
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveParsedQuestion}
                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Lưu điều chỉnh câu {idx + 1}</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-1.5 hover:border-stone-300 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-red-800 text-[11px] leading-snug">Câu {idx + 1}: {q.noi_dung}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                                Đáp án: {String.fromCharCode(65 + q.dap_an_dung)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartEditParsedQuestion(idx)}
                                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded text-[10px] flex items-center gap-0.5 border border-stone-200"
                                title="Sửa nội dung câu hỏi này trước khi nạp"
                              >
                                <Edit3 className="w-3 h-3 text-stone-600" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParsedQuestion(idx)}
                                className="p-1 hover:bg-red-50 text-stone-400 hover:text-red-700 rounded transition-colors"
                                title="Loại bỏ câu hỏi này khỏi danh sách nạp"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            {q.cac_dap_an.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className={`p-1 rounded ${oIdx === q.dap_an_dung ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-stone-600'}`}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </span>
                            ))}
                          </div>
                          {q.giai_thich && (
                            <p className="text-[9px] text-stone-500 italic bg-stone-50 p-1 rounded">
                              Giải thích: {q.giai_thich}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Raw text area if user wants to review or edit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700 text-[11px]">
                    Nội dung văn bản thô (có thể chỉnh sửa trực tiếp hoặc dán thêm):
                  </label>
                  {rawQuestionText && (
                    <button
                      type="button"
                      onClick={handleReParseQuestionText}
                      className="text-[11px] text-red-800 font-semibold hover:underline"
                    >
                      Phân tích lại văn bản
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={rawQuestionText}
                  onChange={(e) => setRawQuestionText(e.target.value)}
                  placeholder="Nội dung văn bản trích xuất từ tệp..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-[11px] font-mono leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportQuestionModal(false);
                    setParsedQuestions([]);
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={parsedQuestions.length === 0}
                  onClick={handleConfirmBatchImport}
                  className={`px-5 py-2 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs ${
                    parsedQuestions.length > 0
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Xác nhận thêm {parsedQuestions.length} câu hỏi vào ngân hàng</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Ngân hàng đề thi</span>
                <h3 className="text-base font-bold font-serif-doc text-stone-900">Thêm Câu Hỏi Nhận Thức Mới</h3>
              </div>
              <button onClick={() => setShowAddQuestionModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            {/* Quick Word/PDF single question upload */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileUp className="w-4 h-4 text-red-800" />
                <span className="text-[11px] text-stone-600">
                  Tự động điền nhanh câu hỏi từ tệp Word (.docx) hoặc PDF:
                </span>
              </div>
              <label className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-stone-500" />
                <span>Chọn tệp</span>
                <input
                  type="file"
                  accept=".docx,.doc,.pdf,.txt"
                  className="hidden"
                  onChange={handleSingleQuestionUpload}
                />
              </label>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Chuyên đề học tập *</label>
                <select
                  value={newQTopicId}
                  onChange={(e) => setNewQTopicId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                >
                  {chuyenDe.map(cd => (
                    <option key={cd.id} value={cd.id}>{cd.ten}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nội dung câu hỏi *</label>
                <textarea
                  required
                  rows={2}
                  value={newQContent}
                  onChange={(e) => setNewQContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-stone-700 block">4 Phương án trả lời:</span>
                {[
                  { label: 'A', val: newQOptA, setVal: setNewQOptA },
                  { label: 'B', val: newQOptB, setVal: setNewQOptB },
                  { label: 'C', val: newQOptC, setVal: setNewQOptC },
                  { label: 'D', val: newQOptD, setVal: setNewQOptD },
                ].map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="font-bold text-stone-600 w-4">{item.label}.</span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      placeholder={`Nội dung phương án ${item.label}...`}
                      className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg"
                    />
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQCorrect === idx}
                        onChange={() => setNewQCorrect(idx)}
                      />
                      <span className="text-[11px] text-stone-600">Đúng</span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Căn cứ lý luận & Lời giải thích</label>
                <textarea
                  rows={2}
                  value={newQExpl}
                  onChange={(e) => setNewQExpl(e.target.value)}
                  placeholder="Giải thích tại sao đáp án này là chuẩn xác..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-semibold"
                >
                  Lưu vào ngân hàng câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SỬA CÂU HỎI TRONG NGÂN HÀNG CÂU HỎI */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Hiệu chỉnh câu hỏi</span>
                <h3 className="text-base font-bold font-serif-doc text-stone-900">Sửa Nội Dung Câu Hỏi &amp; Đáp Án</h3>
              </div>
              <button onClick={() => setEditingQuestion(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleSaveEditQuestion} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Chuyên đề học tập *</label>
                  <select
                    value={editQTopicId}
                    onChange={(e) => setEditQTopicId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    {chuyenDe.map(cd => (
                      <option key={cd.id} value={cd.id}>{cd.ten}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mức độ nhận thức *</label>
                  <select
                    value={editQLevel}
                    onChange={(e) => setEditQLevel(e.target.value as 'co_ban' | 'nang_cao')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="co_ban">Cơ bản (Chiến sĩ mới, Hạ sĩ quan)</option>
                    <option value="nang_cao">Nâng cao (Sĩ quan, QNCN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nội dung câu hỏi *</label>
                <textarea
                  required
                  rows={3}
                  value={editQContent}
                  onChange={(e) => setEditQContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-stone-700 block">4 Phương án trả lời &amp; Tích chọn đáp án đúng:</span>
                {[
                  { label: 'A', val: editQOptA, setVal: setEditQOptA },
                  { label: 'B', val: editQOptB, setVal: setEditQOptB },
                  { label: 'C', val: editQOptC, setVal: setEditQOptC },
                  { label: 'D', val: editQOptD, setVal: setEditQOptD },
                ].map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="font-bold text-stone-600 w-4">{item.label}.</span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      placeholder={`Nội dung phương án ${item.label}...`}
                      className="flex-1 px-2.5 py-1.5 border border-stone-300 rounded-lg"
                    />
                    <label className="flex items-center gap-1 cursor-pointer bg-stone-50 px-2 py-1 rounded border border-stone-200">
                      <input
                        type="radio"
                        name="editCorrectAnswer"
                        checked={editQCorrect === idx}
                        onChange={() => setEditQCorrect(idx)}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                      <span className="text-[11px] font-bold text-emerald-800">Đúng</span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Căn cứ lý luận &amp; Lời giải thích</label>
                <textarea
                  rows={2}
                  value={editQExpl}
                  onChange={(e) => setEditQExpl(e.target.value)}
                  placeholder="Giải thích tại sao đáp án này là chuẩn xác..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    if (editingQuestion) {
                      const idToDelete = editingQuestion.id;
                      setEditingQuestion(null);
                      deleteCauHoi(idToDelete);
                      setSelectedQuestionIds(prev => prev.filter(id => id !== idToDelete));
                      triggerQuestionSuccess('Đã xóa câu hỏi khỏi ngân hàng câu hỏi thành công!');
                    }
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xóa hẳn câu hỏi này"
                >
                  <Trash2 className="w-4 h-4 text-red-700" />
                  <span>Xóa câu hỏi này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Cập nhật câu hỏi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA MỐC TRUYỀN THỐNG */}
      {showTraditionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-800 flex items-center justify-center text-amber-300 font-bold text-xs">
                  ★
                </div>
                <h3 className="text-base font-bold font-serif-doc">
                  {editingMilestone ? 'Cập Nhật Mốc Lịch Sử Truyền Thống' : 'Thêm Mốc Lịch Sử Truyền Thống Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowTraditionModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTradition} className="p-6 space-y-4 overflow-y-auto text-xs">
              {tError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-medium">
                  {tError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Năm sự kiện <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 1945, 1975, 2026..."
                    value={tNam}
                    onChange={(e) => setTNam(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ngày tháng <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 22/12/1944"
                    value={tNgayThang}
                    onChange={(e) => setTNgayThang(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Loại sự kiện:
                </label>
                <select
                  value={tLoai}
                  onChange={(e) => setTLoai(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="thanh_lap">Ngày thành lập đơn vị</option>
                  <option value="chien_cong">Chiến công hiển hách</option>
                  <option value="danh_hieu">Phần thưởng, danh hiệu cao quý</option>
                  <option value="phat_trien">Xây dựng & phát triển chính quy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tiêu đề mốc lịch sử <span className="text-red-700">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thành lập Đội VNTTGPQ; Chiến thắng Ba Gia..."
                  value={tTieuDe}
                  onChange={(e) => setTTieuDe(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nội dung tóm tắt sự kiện <span className="text-red-700">*</span>:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Diễn biến, bối cảnh lịch sử, thành tích đạt được..."
                  value={tNoiDung}
                  onChange={(e) => setTNoiDung(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ý nghĩa lịch sử & Bài học kinh nghiệm:
                </label>
                <textarea
                  rows={2}
                  placeholder="Bài học giáo dục truyền thống và ý thức trách nhiệm cho quân nhân..."
                  value={tYNghia}
                  onChange={(e) => setTYNghia(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Đường dẫn hình ảnh tư liệu (tùy chọn):
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="https://... hoặc /src/assets/images/..."
                    value={tHinhAnh}
                    onChange={(e) => setTHinhAnh(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTraditionModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingMilestone ? 'Cập nhật mốc' : 'Lưu mốc truyền thống'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO / SỬA ĐỢT KIỂM TRA ĐƠN LẺ */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col text-xs">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-800 flex items-center justify-center text-amber-300 font-bold text-xs">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif-doc">
                    {editingExam ? 'Chỉnh Sửa Cấu Hình Đợt Kiểm Tra' : 'Tạo Đợt Kiểm Tra Nhận Thức Mới'}
                  </h3>
                  <span className="text-[10px] text-stone-400 block">
                    Thiết lập thời gian, số lượng câu, rút ngẫu nhiên và đảo đáp án
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowExamModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-4 overflow-y-auto">
              {examError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{examError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tiêu đề đợt kiểm tra / Tên đề thi <span className="text-red-700">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm tra nhận thức chính trị Quý I năm 2026..."
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Chuyên đề / Phạm vi ngân hàng câu hỏi:
                </label>
                <select
                  value={examTopicId}
                  onChange={(e) => setExamTopicId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="all">
                    Tổng hợp tất cả chuyên đề ({cauHoi.length} câu trong ngân hàng)
                  </option>
                  {chuyenDe.map((cd) => {
                    const countInCd = cauHoi.filter(q => q.chuyen_de_id === cd.id).length;
                    return (
                      <option key={cd.id} value={cd.id}>
                        {cd.ten} ({countInCd} câu hỏi)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Số lượng câu hỏi trong đề <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={examQuestionCount}
                    onChange={(e) => setExamQuestionCount(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    (Mặc định 10 hoặc 20 câu)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Thời gian làm bài (Phút) <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={examDurationMinutes}
                    onChange={(e) => setExamDurationMinutes(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    (Hệ thống tự động tính giờ và nộp bài)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Đối tượng quân nhân tham gia:
                </label>
                <input
                  type="text"
                  placeholder="VD: Toàn thể cán bộ, chiến sĩ / Sĩ quan, QNCN / Hạ sĩ quan - Binh sĩ..."
                  value={examTargetAudience}
                  onChange={(e) => setExamTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              {/* Security & Automation toggles */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider block">
                  Cơ Chế Tự Động Hóa & Chống Trùng Lặp
                </span>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examAutoDraw}
                    onChange={(e) => setExamAutoDraw(e.target.checked)}
                    className="mt-0.5 rounded text-red-800 focus:ring-red-800"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 block">
                      Tự động rút câu hỏi ngẫu nhiên từ ngân hàng câu hỏi
                    </span>
                    <span className="text-[10px] text-stone-500 block leading-relaxed">
                      Mỗi khi thí sinh bấm bắt đầu, hệ thống sẽ tự động bốc ngẫu nhiên {examQuestionCount} câu hỏi từ ngân hàng câu hỏi đã chọn.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examShuffleQuestions}
                    onChange={(e) => setExamShuffleQuestions(e.target.checked)}
                    className="mt-0.5 rounded text-red-800 focus:ring-red-800"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 block">
                      Đảo thứ tự câu hỏi khi phát đề
                    </span>
                    <span className="text-[10px] text-stone-500 block leading-relaxed">
                      Thứ tự các câu hỏi sẽ được xáo trộn ngẫu nhiên để các thí sinh ngồi gần nhau không thể nhìn bài nhau.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={examShuffleAnswers}
                    onChange={(e) => setExamShuffleAnswers(e.target.checked)}
                    className="mt-0.5 rounded text-red-800 focus:ring-red-800"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 block">
                      Đảo thứ tự 4 đáp án (A, B, C, D)
                    </span>
                    <span className="text-[10px] text-stone-500 block leading-relaxed">
                      Các phương án A, B, C, D sẽ được đảo vị trí ngẫu nhiên, đáp án đúng tự động được cập nhật tương ứng.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mô tả / Hướng dẫn đợt kiểm tra:
                </label>
                <textarea
                  rows={2}
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Yêu cầu quân nhân làm bài nghiêm túc, không sử dụng tài liệu..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingExam ? 'Cập nhật đợt kiểm tra' : 'Lưu đợt kiểm tra mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TẠO HÀNG LOẠT ĐỀ THI (QUY ĐỊNH SỐ LƯỢNG ĐỀ) */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden text-xs">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif-doc">
                    Quy Định Số Lượng Đề & Tạo Hàng Loạt
                  </h3>
                  <span className="text-[10px] text-amber-300 block">
                    Tự động tạo nhiều mã đề thi khác nhau từ ngân hàng câu hỏi
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatchExams} className="p-6 space-y-4">
              {batchNotice && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-medium">
                  {batchNotice}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên đợt kiểm tra chung <span className="text-red-700">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm tra nhận thức chính trị năm 2026..."
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-semibold"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Hệ thống sẽ tự động gắn hậu tố: — Mã đề 01, Mã đề 02, Mã đề 03...
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Số lượng đề cần tạo:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={batchCount}
                    onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono font-bold text-red-800 text-sm"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">VD: 3 đề, 5 đề...</span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Số câu / đề:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={batchQuestionCount}
                    onChange={(e) => setBatchQuestionCount(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">VD: 10 câu</span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Thời gian (phút):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={batchDurationMinutes}
                    onChange={(e) => setBatchDurationMinutes(parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">VD: 15 phút</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Phạm vi chuyên đề câu hỏi:
                </label>
                <select
                  value={batchTopicId}
                  onChange={(e) => setBatchTopicId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="all">Tổng hợp tất cả chuyên đề ({cauHoi.length} câu)</option>
                  {chuyenDe.map((cd) => (
                    <option key={cd.id} value={cd.id}>{cd.ten}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Đối tượng kiểm tra:
                </label>
                <input
                  type="text"
                  value={batchTargetAudience}
                  onChange={(e) => setBatchTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <span className="font-bold text-stone-800 block">✓ Cấu hình mặc định áp dụng:</span>
                <p>• Tự động rút câu hỏi ngẫu nhiên độc lập cho từng mã đề thi.</p>
                <p>• Bật sẵn cơ chế đảo câu hỏi và đảo thứ tự 4 đáp án A, B, C, D.</p>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-amber-300 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sinh ngay {batchCount} đề thi tự động</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XEM CHI TIẾT BÀI THI ĐÃ LƯU CỦA THÍ SINH (ĐÁP ÁN ĐÚNG/SAI TỪNG CÂU & LÝ LUẬN) */}
      {viewingResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col text-xs">
            
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center text-amber-300 font-bold text-sm">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif-doc">
                    Chi Tiết Bài Thi Đã Lưu Của Quân Nhân
                  </h3>
                  <span className="text-[10px] text-stone-400 block">
                    Hồ sơ lưu trữ bài làm và đối chiếu đáp án phục vụ công tác đánh giá
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingResult(null)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard banner */}
            <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 text-white border-b border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-amber-300 font-serif-doc">
                    {viewingResult.ho_ten}
                  </span>
                  <span className="text-xs text-stone-300">
                    ({viewingResult.cap_bac} · {viewingResult.chuc_vu || 'Chiến sĩ'} · {viewingResult.don_vi})
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                    Mã đề: {viewingResult.ma_de || 'MĐ-01'}
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-1">
                  Đề thi: <span className="font-semibold text-white">{viewingResult.de_thi_tieu_de}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Ngày nộp bài: <span className="font-mono text-stone-300">{viewingResult.ngay_thi}</span> · Thời gian làm: <span className="font-mono text-stone-300">{Math.floor(viewingResult.thoi_gian_lam_giay / 60)} phút {viewingResult.thoi_gian_lam_giay % 60} giây</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Điểm số</span>
                  <div className="text-3xl font-bold font-mono text-white leading-none">
                    {viewingResult.diem}<span className="text-sm font-normal text-stone-400">/10</span>
                  </div>
                  <span className="text-[10px] text-stone-300 block mt-0.5">
                    Đúng {viewingResult.so_cau_dung}/{viewingResult.tong_so_cau} câu
                  </span>
                </div>

                <div className="pl-3 border-l border-stone-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${getRankBadge(viewingResult.diem).color}`}>
                    {getRankBadge(viewingResult.diem).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions detail review */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-bold text-stone-800 text-xs">
                  Danh sách {viewingResult.chi_tiet?.length || viewingResult.tong_so_cau} câu hỏi trong bài làm:
                </span>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                  ✓ Dữ liệu lưu trữ chính thức
                </span>
              </div>

              {(!viewingResult.chi_tiet || viewingResult.chi_tiet.length === 0) ? (
                <div className="p-6 text-center text-stone-500 border border-dashed rounded-xl">
                  Bài thi lưu dạng tóm tắt (không có chi tiết từng câu).
                </div>
              ) : (
                <div className="space-y-4">
                  {viewingResult.chi_tiet.map((item, idx) => {
                    const isUnanswered = item.da_chon === -1 || item.da_chon === undefined;
                    const isCorrect = item.dung;

                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-xl border ${
                          isCorrect 
                            ? 'border-emerald-200 bg-emerald-50/20' 
                            : isUnanswered
                            ? 'border-amber-200 bg-amber-50/20'
                            : 'border-red-200 bg-red-50/20'
                        } space-y-3`}
                      >
                        {/* Question line */}
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm">
                            Câu {idx + 1}: {item.noi_dung_cau_hoi || 'Câu hỏi nhận thức'}
                          </span>
                          
                          {isCorrect ? (
                            <span className="shrink-0 flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Đúng</span>
                            </span>
                          ) : isUnanswered ? (
                            <span className="shrink-0 flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px] border border-amber-300">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Chưa chọn</span>
                            </span>
                          ) : (
                            <span className="shrink-0 flex items-center gap-1 font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded text-[10px] border border-red-300">
                              <XCircle className="w-3.5 h-3.5 text-red-700" />
                              <span>Sai</span>
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        {item.cac_dap_an && item.cac_dap_an.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {item.cac_dap_an.map((opt, optIdx) => {
                              const isChosen = item.da_chon === optIdx;
                              const isCorrectOpt = item.dap_an_dung === optIdx;

                              let optStyle = 'bg-white border-stone-200 text-stone-700';

                              if (isChosen && isCorrectOpt) {
                                optStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                              } else if (isChosen && !isCorrectOpt) {
                                optStyle = 'bg-red-100 border-red-500 text-red-950 font-semibold';
                              } else if (!isChosen && isCorrectOpt) {
                                optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                              }

                              return (
                                <div 
                                  key={optIdx}
                                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${optStyle}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                      isChosen 
                                        ? isCorrectOpt ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
                                        : isCorrectOpt ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 border'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>

                                  <div className="shrink-0 text-[10px] font-semibold">
                                    {isChosen && !isCorrectOpt && (
                                      <span className="text-red-700 font-bold">Thí sinh đã chọn (Sai)</span>
                                    )}
                                    {isChosen && isCorrectOpt && (
                                      <span className="text-emerald-800 font-bold">Thí sinh đã chọn (Đúng)</span>
                                    )}
                                    {!isChosen && isCorrectOpt && (
                                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Đáp án đúng</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {item.giai_thich && (
                          <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200 text-[11px] text-stone-700 leading-relaxed">
                            <span className="font-bold text-red-800 block mb-0.5">
                              Căn cứ lý luận & Lời giải thích khoa học:
                            </span>
                            <p>{item.giai_thich}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-stone-500">
                Mã kết quả: <code className="font-mono text-stone-700">{viewingResult.id}</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-stone-500" />
                  <span>In bài làm</span>
                </button>
                <button
                  onClick={() => setViewingResult(null)}
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-semibold transition-colors"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: THÊM / SỬA LỜI BÁC DẠY MỖI NGÀY */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-800" />
                <h3 className="text-base font-bold font-serif-doc text-stone-900">
                  {editingQuote ? 'Chỉnh Sửa Lời Bác Dạy' : 'Thêm Lời Bác Hồ Dạy Mới'}
                </h3>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-4 pt-4">
              {qError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {qError}
                </div>
              )}

              {/* Quick Word/PDF Upload for Quote */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-red-800" />
                  <span className="text-[11px] text-stone-700">
                    Tải tệp Word (.docx) hoặc PDF để tự trích xuất lời Bác và ý nghĩa:
                  </span>
                </div>
                <label className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-800 border border-amber-300 rounded-lg text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1 shrink-0">
                  <Paperclip className="w-3 h-3 text-stone-500" />
                  <span>Chọn tệp Word/PDF</span>
                  <input
                    type="file"
                    accept=".docx,.doc,.pdf,.txt"
                    className="hidden"
                    onChange={handleQuoteFileUpload}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ngày áp dụng / Mã ngày</label>
                  <input
                    type="text"
                    value={qNgay}
                    onChange={(e) => setQNgay(e.target.value)}
                    placeholder="2026-09-27 hoặc Thứ Hai"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nguồn trích dẫn</label>
                  <input
                    type="text"
                    value={qNguon}
                    onChange={(e) => setQNguon(e.target.value)}
                    placeholder="Hồ Chí Minh Toàn tập..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tiêu đề chủ đề bài học *</label>
                <input
                  type="text"
                  value={qTieuDe}
                  onChange={(e) => setQTieuDe(e.target.value)}
                  placeholder="Lời Bác dạy về đoàn kết / tự phê bình..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Câu nói / Lời trích dẫn của Bác *</label>
                <textarea
                  value={qTrichDan}
                  onChange={(e) => setQTrichDan(e.target.value)}
                  rows={3}
                  placeholder="Nhập nguyên văn lời Bác dạy..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 font-serif-doc"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bối cảnh lịch sử / Hoàn cảnh ra đời</label>
                <input
                  type="text"
                  value={qHoanCanh}
                  onChange={(e) => setQHoanCanh(e.target.value)}
                  placeholder="Bài nói chuyện tại Đại hội... ngày..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ý nghĩa định hướng đối với cán bộ, chiến sĩ</label>
                <textarea
                  value={qYNghia}
                  onChange={(e) => setQYNghia(e.target.value)}
                  rows={2}
                  placeholder="Rèn luyện đức tính trung thực, tinh thần vượt khó trong huấn luyện..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">Đường dẫn tệp âm thanh đọc (tùy chọn)</label>
                  <label className="text-[11px] text-red-800 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>Tải tệp MP3 từ máy</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleQuoteAudioUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={qAudioUrl}
                  onChange={(e) => setQAudioUrl(e.target.value)}
                  placeholder="https://... hoặc tải trực tiếp tệp âm thanh ở trên"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingQuote ? 'Lưu thay đổi' : 'Thêm mới lời Bác dạy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM / SỬA TÁC PHẨM ÂM THANH */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-red-800" />
                <h3 className="text-base font-bold font-serif-doc text-stone-900">
                  {editingAudio ? 'Chỉnh Sửa Tác Phẩm Âm Thanh' : 'Thêm Tác Phẩm Âm Thanh Mới'}
                </h3>
              </div>
              <button onClick={() => setShowAudioModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAudio} className="space-y-4 pt-4">
              {aError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {aError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tên bài hát / bản tin *</label>
                  <input
                    type="text"
                    value={aTieuDe}
                    onChange={(e) => setATieuDe(e.target.value)}
                    placeholder="Vì nhân dân quên mình / Bản tin số..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tác giả / Cơ quan *</label>
                  <input
                    type="text"
                    value={aTacGia}
                    onChange={(e) => setATacGia(e.target.value)}
                    placeholder="Nhạc sĩ... / Ban Chính trị..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thể loại</label>
                  <select
                    value={aTheLoai}
                    onChange={(e) => setATheLoai(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 bg-white"
                  >
                    <option value="bai_hat">Ca khúc cách mạng Quân đội</option>
                    <option value="phat_thanh">Phát thanh chính trị 5 phút</option>
                    <option value="podcast">Podcast chính trị nội bộ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thời lượng (phút:giây)</label>
                  <input
                    type="text"
                    value={aThoiLuong}
                    onChange={(e) => setAThoiLuong(e.target.value)}
                    placeholder="03:30"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mô tả / Ý nghĩa tác phẩm</label>
                <textarea
                  value={aMoTa}
                  onChange={(e) => setAMoTa(e.target.value)}
                  rows={2}
                  placeholder="Khắc họa phẩm chất bộ đội Cụ Hồ, giai điệu hào sảng..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">Lời bài hát / Nội dung bản tin</label>
                  <label className="text-[11px] text-red-800 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <FileUp className="w-3 h-3" />
                    <span>Tải từ tệp Word (.docx)</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.txt"
                      className="hidden"
                      onChange={handleLyricsFileUpload}
                    />
                  </label>
                </div>
                <textarea
                  value={aLoi}
                  onChange={(e) => setALoi(e.target.value)}
                  rows={4}
                  placeholder="Dán toàn bộ lời bài hát hoặc tải từ file Word (.docx)..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">Đường dẫn tệp âm thanh (URL / MP3)</label>
                  <label className="text-[11px] text-red-800 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>Tải tệp âm thanh từ máy</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioFileUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={aUrl}
                  onChange={(e) => setAUrl(e.target.value)}
                  placeholder="https://... hoặc tải trực tiếp tệp âm thanh ở trên"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAudioModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingAudio ? 'Lưu thay đổi' : 'Thêm tác phẩm âm thanh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THÊM / SỬA VIDEO TƯ LIỆU */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-red-800" />
                <h3 className="text-base font-bold font-serif-doc text-stone-900">
                  {editingVideo ? 'Chỉnh Sửa Video Tư Liệu' : 'Thêm Video Tư Liệu Mới'}
                </h3>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 pt-4">
              {vError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {vError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tiêu đề video *</label>
                <input
                  type="text"
                  value={vTieuDe}
                  onChange={(e) => setVTieuDe(e.target.value)}
                  placeholder="Ký ức Ba Gia — Khúc tráng ca / Phóng sự..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thể loại video</label>
                  <input
                    type="text"
                    value={vTheLoai}
                    onChange={(e) => setVTheLoai(e.target.value)}
                    placeholder="Phim tài liệu / Phóng sự truyền hình..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Thời lượng (phút:giây)</label>
                  <input
                    type="text"
                    value={vThoiLuong}
                    onChange={(e) => setVThoiLuong(e.target.value)}
                    placeholder="18:30"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">Đường dẫn video (URL YouTube hoặc MP4) *</label>
                  <label className="text-[11px] text-red-800 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Tải video từ máy</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoFileUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={vUrl}
                  onChange={(e) => setVUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... hoặc tải trực tiếp video từ máy ở trên"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ảnh đại diện Thumbnail (tùy chọn)</label>
                <input
                  type="text"
                  value={vThumbnail}
                  onChange={(e) => setVThumbnail(e.target.value)}
                  placeholder="https://... hoặc để trống để dùng ảnh mặc định"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mô tả tóm tắt nội dung video</label>
                <textarea
                  value={vMoTa}
                  onChange={(e) => setVMoTa(e.target.value)}
                  rows={3}
                  placeholder="Phim tư liệu ghi lại lời kể của các nhân chứng lịch sử..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-100 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  {editingVideo ? 'Lưu thay đổi' : 'Thêm video tư liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA 1 CÂU HỎI */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">Xác nhận xóa câu hỏi</h4>
                <p className="text-xs text-stone-500">Đồng chí có chắc chắn muốn xóa vĩnh viễn câu hỏi này khỏi ngân hàng?</p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-1">
              <p className="font-bold text-stone-900 line-clamp-3 leading-snug">{questionToDelete.noi_dung}</p>
              <span className="text-[10px] text-stone-500 block">
                Chuyên đề: <strong>{chuyenDe.find(c => c.id === questionToDelete.chuyen_de_id)?.ten}</strong>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCauHoi(questionToDelete.id);
                  setSelectedQuestionIds(prev => prev.filter(id => id !== questionToDelete.id));
                  setQuestionToDelete(null);
                  triggerQuestionSuccess('Đã xóa câu hỏi khỏi ngân hàng câu hỏi thành công!');
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA HÀNG LOẠT CÂU HỎI ĐÃ CHỌN */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">
                  Xóa đồng loạt {selectedQuestionIds.length} câu hỏi
                </h4>
                <p className="text-xs text-stone-500">Các câu hỏi được chọn sẽ được loại bỏ hoàn toàn khỏi hệ thống.</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Hành động này sẽ xóa đồng loạt <strong>{selectedQuestionIds.length} câu hỏi</strong> và tự động cập nhật lại tổng số câu hỏi của các chuyên đề liên quan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const count = selectedQuestionIds.length;
                  deleteBatchCauHoi(selectedQuestionIds);
                  setSelectedQuestionIds([]);
                  setShowBatchDeleteModal(false);
                  triggerQuestionSuccess(`Đã xóa thành công ${count} câu hỏi khỏi ngân hàng câu hỏi!`);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa {selectedQuestionIds.length} câu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÓA TOÀN BỘ CÂU HỎI TRONG CHUYÊN ĐỀ */}
      {showClearTopicModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">Xóa toàn bộ câu hỏi chuyên đề</h4>
                <p className="text-xs text-stone-500">
                  {chuyenDe.find(c => c.id === questionFilterChuyenDe)?.ten}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Đồng chí có chắc chắn muốn xóa toàn bộ câu hỏi thuộc chuyên đề này không? Thao tác này sẽ làm rỗng ngân hàng câu hỏi của chuyên đề.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowClearTopicModal(false)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCauHoiByTopic(questionFilterChuyenDe);
                  setSelectedQuestionIds([]);
                  setShowClearTopicModal(false);
                  triggerQuestionSuccess('Đã xóa toàn bộ câu hỏi trong chuyên đề thành công!');
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa hết</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA TÀI LIỆU */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">Xác nhận xóa tài liệu</h4>
                <p className="text-xs text-stone-500">Tài liệu và tệp đính kèm sẽ được loại bỏ khỏi kho lưu trữ.</p>
              </div>
            </div>

            <p className="text-xs text-stone-800 font-semibold p-3 bg-stone-50 rounded-xl border border-stone-200">
              {docToDelete.tieu_de}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTaiLieu(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA ĐỀ THI */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">Xác nhận xóa đợt kiểm tra</h4>
                <p className="text-xs text-stone-500">Đề thi này sẽ không còn xuất hiện trong danh sách thi.</p>
              </div>
            </div>

            <p className="text-xs text-stone-800 font-semibold p-3 bg-stone-50 rounded-xl border border-stone-200">
              {examToDelete.title}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDeThi(examToDelete.id);
                  setExamToDelete(null);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA KẾT QUẢ THI */}
      {resultToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif-doc">Xác nhận xóa kết quả thi</h4>
                <p className="text-xs text-stone-500">Bài thi của thí sinh sẽ được xóa khỏi bảng điểm.</p>
              </div>
            </div>

            <p className="text-xs text-stone-800 font-semibold p-3 bg-stone-50 rounded-xl border border-stone-200">
              Thí sinh: {resultToDelete.name}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setResultToDelete(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteKetQua(resultToDelete.id);
                  if (viewingResult?.id === resultToDelete.id) {
                    setViewingResult(null);
                  }
                  setResultToDelete(null);
                }}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
