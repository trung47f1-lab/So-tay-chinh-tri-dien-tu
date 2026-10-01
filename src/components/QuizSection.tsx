import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DeThi, CauHoi, ChiTietCauTraLoi } from '../types';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileCheck,
  BarChart3,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  AlertCircle,
  User,
  Shield,
  Briefcase,
  Building,
  X,
  Tag,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Lock,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CAP_BAC_OPTIONS = [
  'Binh nhì',
  'Binh nhất',
  'Hạ sĩ',
  'Trung sĩ',
  'Thượng sĩ',
  'Thiếu úy',
  'Trung úy',
  'Thượng úy',
  'Đại úy',
  'Thiếu tá',
  'Trung tá',
  'Thượng tá',
  'Đại tá',
  'Thiếu úy QNCN',
  'Trung úy QNCN',
  'Thượng úy QNCN',
  'Đại úy QNCN',
  'Công nhân viên quốc phòng'
];

const CHUC_VU_OPTIONS = [
  'Chiến sĩ',
  'Tiểu đội phó',
  'Tiểu đội trưởng',
  'Khẩu đội phó',
  'Khẩu đội trưởng',
  'Trung đội phó',
  'Trung đội trưởng',
  'Phó Đại đội trưởng',
  'Đại đội trưởng',
  'Chính trị viên phó',
  'Chính trị viên',
  'Trợ lý chính trị',
  'Nhân viên quân y',
  'Nhân viên thông tin',
  'Học viên'
];

interface SessionQuestion {
  id: string;
  noi_dung: string;
  cac_dap_an: string[];
  dap_an_dung: number;
  giai_thich: string;
  chuyen_de_id: string;
  muc_do?: string;
}

function buildSessionQuestions(exam: DeThi, allQuestions: CauHoi[]): SessionQuestion[] {
  // 1. Filter pool by topic
  let pool: CauHoi[] = [];
  if (exam.chuyen_de_id === 'all' || !exam.chuyen_de_id) {
    pool = [...allQuestions];
  } else {
    pool = allQuestions.filter(q => q.chuyen_de_id === exam.chuyen_de_id);
    if (pool.length === 0) pool = [...allQuestions];
  }

  // 2. Select questions (auto-draw or manual IDs)
  let selected: CauHoi[] = [];
  if (exam.tu_dong_rut_cau_hoi === false && exam.cau_hoi_ids && exam.cau_hoi_ids.length > 0) {
    selected = exam.cau_hoi_ids
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is CauHoi => Boolean(q));
  } else {
    // Tự động rút câu hỏi ngẫu nhiên từ ngân hàng
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(exam.so_cau || 10, shuffledPool.length);
    selected = shuffledPool.slice(0, count);
  }

  // 3. Đảo thứ tự câu hỏi khi phát đề (nếu bật, mặc định bật)
  if (exam.dao_cau_hoi !== false) {
    selected = [...selected].sort(() => Math.random() - 0.5);
  }

  // 4. Đảo thứ tự đáp án A, B, C, D (nếu bật, mặc định bật)
  const prepared: SessionQuestion[] = selected.map(q => {
    if (exam.dao_dap_an !== false) {
      const correctText = q.cac_dap_an[q.dap_an_dung];
      const indexed = q.cac_dap_an.map((text, idx) => ({ text, originalIdx: idx }));
      const shuffledOptions = [...indexed].sort(() => Math.random() - 0.5);
      const newCorrectIdx = shuffledOptions.findIndex(item => item.text === correctText);

      return {
        id: q.id,
        noi_dung: q.noi_dung,
        cac_dap_an: shuffledOptions.map(item => item.text),
        dap_an_dung: newCorrectIdx >= 0 ? newCorrectIdx : 0,
        giai_thich: q.giai_thich,
        chuyen_de_id: q.chuyen_de_id,
        muc_do: q.muc_do
      };
    } else {
      return {
        id: q.id,
        noi_dung: q.noi_dung,
        cac_dap_an: [...q.cac_dap_an],
        dap_an_dung: q.dap_an_dung,
        giai_thich: q.giai_thich,
        chuyen_de_id: q.chuyen_de_id,
        muc_do: q.muc_do
      };
    }
  });

  return prepared;
}

export const QuizSection: React.FC = () => {
  const { 
    deThi, 
    cauHoi, 
    chuyenDe, 
    selectedDeThi, 
    setSelectedDeThi, 
    examMode, 
    setExamMode,
    addKetQua,
    currentUser,
    ketQua,
    setCurrentTab
  } = useApp();

  // Test Runner state
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testResult, setTestResult] = useState<{
    score: number;
    correctCount: number;
    total: number;
    elapsedSeconds: number;
    details: ChiTietCauTraLoi[];
  } | null>(null);

  // Auto-submit and Anti-AI cheating monitors
  const [autoSubmittedDueToTime, setAutoSubmittedDueToTime] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [cheatingWarning, setCheatingWarning] = useState('');

  // Refs to avoid stale closures in interval / event listeners
  const selectedAnswersRef = React.useRef<Record<string, number>>({});
  const sessionQuestionsRef = React.useRef<SessionQuestion[]>([]);
  const selectedDeThiRef = React.useRef<DeThi | null>(null);
  const isSubmittedRef = React.useRef<boolean>(false);
  const timeLeftRef = React.useRef<number>(0);
  const tabSwitchCountRef = React.useRef<number>(0);
  const submitFunctionRef = React.useRef<(isTimeUp?: boolean, isCheatingLimit?: boolean) => void>(() => {});

  // Keep refs in sync
  React.useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  React.useEffect(() => {
    sessionQuestionsRef.current = sessionQuestions;
  }, [sessionQuestions]);

  React.useEffect(() => {
    selectedDeThiRef.current = selectedDeThi;
  }, [selectedDeThi]);

  React.useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  React.useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Soldier input info for official test - Bắt buộc nhập bằng tay 100%, không điền sẵn
  const [examineeName, setExamineeName] = useState('');
  const [examineeRank, setExamineeRank] = useState('');
  const [examineeDuty, setExamineeDuty] = useState('');
  const [examineeUnit, setExamineeUnit] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<'test' | 'practice'>('test');
  const [entryError, setEntryError] = useState('');
  const [isCandidateVerifiedForSession, setIsCandidateVerifiedForSession] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFromQRScan, setIsFromQRScan] = useState(false);

  // Check if opened directly via QR Code or URL param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('exam=') || search.includes('de_thi=') || search.includes('dethi=')) {
        setIsFromQRScan(true);
      }
    }
  }, []);

  // If selectedDeThi is set externally (e.g. from QR scan or URL ?exam=...),
  // ensure the soldier completes registration before starting the test!
  useEffect(() => {
    if (selectedDeThi && sessionQuestions.length === 0) {
      setSelectedExamId(selectedDeThi.id);
      // Bắt buộc quân nhân phải xác nhận thông tin đầy đủ trước khi vào làm bài thi
      if (!isCandidateVerifiedForSession) {
        setShowRegistrationModal(true);
      }
    }
  }, [selectedDeThi, isCandidateVerifiedForSession, sessionQuestions.length]);

  // Open registration modal
  const handleOpenRegistration = (exam?: DeThi, mode: 'test' | 'practice' = 'test') => {
    if (exam) {
      setSelectedExamId(exam.id);
    } else if (deThi.length > 0 && !selectedExamId) {
      setSelectedExamId(deThi[0].id);
    }
    setRegistrationMode(mode);
    setEntryError('');
    setShowRegistrationModal(true);
  };

  // Start an exam after strictly validating soldier credentials & exam code
  const handleConfirmStartExam = (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields: string[] = [];
    if (!examineeName.trim()) missingFields.push('Họ và tên');
    if (!examineeRank.trim()) missingFields.push('Cấp bậc');
    if (!examineeDuty.trim()) missingFields.push('Chức vụ');
    if (!examineeUnit.trim()) missingFields.push('Đơn vị công tác');
    if (!selectedExamId) missingFields.push('Mã đề thi');

    if (missingFields.length > 0) {
      setEntryError(`⚠️ Yêu cầu bắt buộc: Đồng chí chưa nhập đủ thông tin [${missingFields.join(', ')}]. Bắt buộc phải hoàn tất đầy đủ mới được cấp quyền vào thi!`);
      return;
    }

    const exam = deThi.find(d => d.id === selectedExamId);
    if (!exam) {
      setEntryError('Không tìm thấy đề thi đã chọn. Vui lòng chọn lại.');
      return;
    }

    setEntryError('');
    setIsCandidateVerifiedForSession(true);
    setShowRegistrationModal(false);

    const questions = buildSessionQuestions(exam, cauHoi);
    setSessionQuestions(questions);
    setSelectedDeThi(exam);
    setExamMode(registrationMode);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTestResult(null);
    setTimeLeft(exam.thoi_gian_phut * 60);
    setTabSwitchCount(0);
    tabSwitchCountRef.current = 0;
    setCheatingWarning('');
    setAutoSubmittedDueToTime(false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch {}
  };

  // Submit function with reliable access to latest ref data
  const handleSubmitExam = (isTimeUp = false, isCheatingLimit = false) => {
    const exam = selectedDeThiRef.current || selectedDeThi;
    if (!exam || isSubmittedRef.current) return;

    isSubmittedRef.current = true;
    setIsSubmitted(true);

    const questions = sessionQuestionsRef.current.length > 0 ? sessionQuestionsRef.current : sessionQuestions;
    const answers = selectedAnswersRef.current;

    let correctCount = 0;
    const details: ChiTietCauTraLoi[] = [];

    questions.forEach(q => {
      const chosen = answers[q.id];
      const isCorrect = chosen === q.dap_an_dung;
      if (isCorrect) correctCount++;
      details.push({
        cau_hoi_id: q.id,
        noi_dung_cau_hoi: q.noi_dung,
        cac_dap_an: q.cac_dap_an,
        dap_an_dung: q.dap_an_dung,
        giai_thich: q.giai_thich,
        da_chon: chosen !== undefined ? chosen : -1,
        dung: isCorrect
      });
    });

    const total = questions.length;
    const rawScore = total > 0 ? (correctCount / total) * 10 : 0;
    const score = Math.round(rawScore * 10) / 10;
    const remaining = isTimeUp ? 0 : timeLeftRef.current;
    const elapsedSeconds = Math.max(0, (exam.thoi_gian_phut * 60) - remaining);

    setTestResult({
      score,
      correctCount,
      total,
      elapsedSeconds,
      details
    });

    if (isTimeUp) {
      setAutoSubmittedDueToTime(true);
    }

    // Save to results database if official test
    if (examMode === 'test') {
      const examIndex = deThi.findIndex(d => d.id === exam.id);
      const examCode = exam.ma_de || ('MĐ-' + (examIndex >= 0 ? (examIndex + 1).toString().padStart(2, '0') : '01'));
      addKetQua({
        nguoi_dung_id: currentUser.id,
        ho_ten: examineeName.trim(),
        cap_bac: examineeRank.trim(),
        chuc_vu: examineeDuty.trim(),
        don_vi: examineeUnit.trim(),
        de_thi_id: exam.id,
        de_thi_tieu_de: exam.tieu_de,
        ma_de: examCode,
        diem: score,
        so_cau_dung: correctCount,
        tong_so_cau: total,
        thoi_gian_lam_giay: elapsedSeconds,
        so_lan_roi_man_hinh: tabSwitchCountRef.current,
        chi_tiet: details
      });
    }

    // Confetti if good score!
    if (score >= 8.0 && !isCheatingLimit) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  submitFunctionRef.current = handleSubmitExam;

  // Accurate Countdown Timer for official test
  // Automatically submits exam when time runs out (timeLeft <= 0)
  useEffect(() => {
    if (!selectedDeThi || examMode !== 'test' || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitFunctionRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedDeThi, examMode, isSubmitted]);

  // Anti-Cheating & Anti-AI Monitor: Detect tab-switching, window blur, and copy shortcuts
  useEffect(() => {
    if (!selectedDeThi || examMode !== 'test' || isSubmitted) return;

    let lastViolationTime = 0;
    const triggerViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationTime < 1500) return; // Debounce rapid events
      lastViolationTime = now;

      tabSwitchCountRef.current += 1;
      const currentCount = tabSwitchCountRef.current;
      setTabSwitchCount(currentCount);

      if (currentCount >= 3) {
        setCheatingWarning(`⚠️ ĐÌNH CHỈ THI: Đồng chí đã rời khỏi màn hình kiểm tra 3 lần (vượt quá giới hạn cho phép). Hệ thống kích hoạt tự động thu bài và ghi nhận vi phạm kỷ luật!`);
        setTimeout(() => {
          submitFunctionRef.current(false, true);
        }, 800);
      } else {
        setCheatingWarning(`⚠️ CẢNH BÁO VI PHẠM KỶ LUẬT (Lần ${currentCount}/3): Đồng chí vừa rời khỏi màn hình kiểm tra! Nghiêm cấm chuyển tab tra cứu hoặc sử dụng trợ lý AI.`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('visibility');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('blur');
    };

    // Keyboard shortcut prevention (anti-copy / anti-paste / anti-inspect)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+P, Ctrl+S
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setCheatingWarning('⚠️ KỶ LUẬT PHÒNG THI: Đã vô hiệu hóa phím tắt sao chép / dán. Nghiêm cấm đưa câu hỏi sang AI!');
      }
      // Block DevTools
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        setCheatingWarning('⚠️ KỶ LUẬT PHÒNG THI: Nghiêm cấm mở công cụ kiểm tra DevTools!');
      }
    };

    // Track fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [selectedDeThi, examMode, isSubmitted]);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (score: number) => {
    if (score >= 8.5) return { label: 'Giỏi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 7.0) return { label: 'Khá', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 5.0) return { label: 'Đạt yêu cầu', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Chưa đạt (Cần ôn lại)', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  // If no exam selected, show list of available exams
  if (!selectedDeThi) {
    return (
      <div className="space-y-6">
        
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Phân hệ 5</span>
              <span aria-hidden="true">·</span>
              <span>Đánh giá nhận thức chính trị quân sự</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Hệ Thống Đợt Kiểm Tra & Ôn Luyện Trắc Nghiệm
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Tổ chức kiểm tra định kỳ, kiểm tra sau các đợt học tập chính trị. Hệ thống tự động rút câu hỏi từ ngân hàng câu hỏi, đảo thứ tự câu và đáp án ngẫu nhiên để chống gian lận. Sau khi nộp bài, kết quả đúng/sai cùng lời giải thích được hiển thị chi tiết và lưu trữ tự động.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <Shuffle className="w-4 h-4 text-red-700" />
                <span className="font-semibold">Đảo câu & đảo đáp án tự động</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold">Báo đúng/sai & lưu điểm ngay</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Thống kê toàn diện</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-serif-doc text-stone-900">
                Các Đợt Kiểm Tra & Đề Thi Hiện Hành ({deThi.length})
              </h2>
              <span className="text-xs text-stone-500 font-mono">
                Tổng số {cauHoi.length} câu hỏi trong ngân hàng dữ liệu
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenRegistration(undefined, 'test')}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-amber-300" />
                <span>Đăng ký vào thi (Chọn mã đề)</span>
              </button>

              {currentUser.vai_tro === 'quan_tri' && (
                <button
                  onClick={() => setCurrentTab('quan_tri')}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-black text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Mở bảng điều khiển quản trị để tạo và quản lý đợt kiểm tra"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quản lý đợt kiểm tra (Admin)</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deThi.map((exam, index) => {
              const examResults = ketQua.filter(k => k.de_thi_id === exam.id);
              const cd = chuyenDe.find(c => c.id === exam.chuyen_de_id);
              const topicName = exam.chuyen_de_id === 'all' ? 'Tất cả chuyên đề' : (cd?.ten || 'Chuyên đề chung');
              const examCode = exam.ma_de || ('MĐ-' + (index + 1).toString().padStart(2, '0'));

              return (
                <div 
                  key={exam.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-red-700/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold font-mono text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shadow-xs">
                          Mã đề: {examCode}
                        </span>
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 border border-red-200 max-w-[120px] truncate">
                          {topicName}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {exam.thoi_gian_phut} phút
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-serif-doc text-stone-900 line-clamp-2">
                      {exam.tieu_de}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {exam.mo_ta}
                    </p>

                    <div className="space-y-1 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                      <div className="flex items-center justify-between">
                        <span>Số lượng câu hỏi:</span>
                        <span className="font-semibold text-stone-800">{exam.so_cau} câu</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Đối tượng:</span>
                        <span className="font-semibold text-stone-800 truncate max-w-[160px]">{exam.doi_tuong}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Số lượt đã kiểm tra:</span>
                        <span className="font-mono font-semibold text-red-800">{examResults.length} lượt</span>
                      </div>
                    </div>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                        ✓ Rút ngẫu nhiên
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                        ✓ Đảo câu & đáp án
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenRegistration(exam, 'practice')}
                      className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold text-center transition-colors"
                    >
                      Ôn luyện tự do
                    </button>
                    <button
                      onClick={() => handleOpenRegistration(exam, 'test')}
                      className="py-2 px-3 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold text-center shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                      <span>Vào thi tính giờ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Results Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold font-serif-doc text-stone-900">
                Kết Quả Các Lần Kiểm Tra Gần Đây Của Đơn Vị
              </h3>
              <p className="text-xs text-stone-500">
                Toàn bộ điểm số được ghi nhận minh bạch để cán bộ theo dõi chất lượng học tập
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {ketQua.length} lượt thi đã nộp
            </span>
          </div>

          {ketQua.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              Chưa có lượt kiểm tra nào được ghi nhận. Hãy bấm "Đăng ký vào thi" để thực hiện bài thi đầu tiên.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Cấp bậc</th>
                    <th className="py-2.5 px-3">Chức vụ</th>
                    <th className="py-2.5 px-3">Đơn vị</th>
                    <th className="py-2.5 px-3">Mã đề</th>
                    <th className="py-2.5 px-3">Đợt kiểm tra</th>
                    <th className="py-2.5 px-3 text-center">Số câu đúng</th>
                    <th className="py-2.5 px-3 text-center">Điểm số</th>
                    <th className="py-2.5 px-3 text-center">Phân loại</th>
                    <th className="py-2.5 px-3 text-right">Thời gian thi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  {ketQua.slice(0, 8).map((res) => {
                    const badge = getRankBadge(res.diem);
                    return (
                      <tr key={res.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-stone-900 whitespace-nowrap">
                          {res.ho_ten}
                        </td>
                        <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                          {res.cap_bac}
                        </td>
                        <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                          {res.chuc_vu || 'Chiến sĩ'}
                        </td>
                        <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                          {res.don_vi}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                          <span className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                            {res.ma_de || 'MĐ-01'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-700 max-w-xs truncate">
                          {res.de_thi_tieu_de}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {res.so_cau_dung}/{res.tong_so_cau}
                        </td>
                        <td className="py-3 px-3 text-center font-bold font-mono text-sm text-red-800 tabular-nums">
                          {res.diem}/10
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-stone-500 font-mono text-[11px] whitespace-nowrap">
                          {res.ngay_thi}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL BẮT BUỘC: ĐĂNG KÝ VÀO PHÒNG THI TRẮC NGHIỆM & CHỌN MÃ ĐỀ */}
        {showRegistrationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto text-xs animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-1.5 text-red-800 font-bold uppercase tracking-wider text-[11px]">
                    <Shield className="w-4 h-4" />
                    <span>Hệ Thống Kiểm Tra Chính Quy</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif-doc text-stone-900 mt-1">
                    Thẻ Đăng Ký Dự Thi Nhận Thức Chính Trị
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Quân nhân bắt buộc điền đầy đủ <strong>Họ tên</strong>, <strong>Cấp bậc</strong>, <strong>Chức vụ</strong>, <strong>Đơn vị</strong> và <strong>chọn Mã đề thi</strong> mới có thể bắt đầu làm bài.
                  </p>
                </div>
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Direct Entry Banner */}
              {isFromQRScan && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-center gap-2.5">
                  <QrCode className="w-5 h-5 text-red-800 shrink-0" />
                  <div>
                    <span className="font-bold block text-xs">Đồng chí đang truy cập đề thi từ mã QR:</span>
                    <span className="text-[11px] text-stone-700 font-semibold">
                      {deThi.find(d => d.id === selectedExamId)?.tieu_de || 'Đề thi trắc nghiệm chính trị'}
                    </span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Bắt buộc điền đầy đủ và kiểm tra chính xác 4 trường thông tin bên dưới để kích hoạt bài làm.
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleConfirmStartExam} className="space-y-4 pt-3">
                
                {entryError && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
                    <span className="font-bold text-xs">{entryError}</span>
                  </div>
                )}

                {/* Họ tên */}
                <div>
                  <label className="block font-semibold text-stone-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-red-800" />
                      <span>1. Họ và tên quân nhân dự thi <strong className="text-red-700">*</strong></span>
                    </span>
                    {!examineeName.trim() && entryError && (
                      <span className="text-[10px] font-bold text-red-700">Chưa điền</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={examineeName}
                    onChange={(e) => setExamineeName(e.target.value)}
                    placeholder="Nhập họ và tên quân nhân (VD: Nguyễn Văn Hải)..."
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 font-semibold text-stone-900 ${
                      !examineeName.trim() && entryError 
                        ? 'border-red-500 bg-red-50/50 focus:ring-red-600' 
                        : 'border-stone-300 focus:ring-red-800'
                    }`}
                  />
                </div>

                {/* Cấp bậc & Chức vụ - Bắt buộc nhập bằng tay */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-red-800" />
                        <span>2. Cấp bậc <strong className="text-red-700">*</strong></span>
                      </span>
                      {!examineeRank.trim() && entryError ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Bắt buộc nhập</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Nhập bằng tay</span>
                      )}
                    </label>
                    <input
                      type="text"
                      list="capBacSuggestions"
                      required
                      value={examineeRank}
                      onChange={(e) => setExamineeRank(e.target.value)}
                      placeholder="Nhập cấp bậc (VD: Hạ sĩ, Trung sĩ, Binh nhất...)"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 font-medium text-stone-900 ${
                        !examineeRank.trim() && entryError 
                          ? 'border-red-500 bg-red-50/50 focus:ring-red-600' 
                          : 'border-stone-300 focus:ring-red-800'
                      }`}
                    />
                    <datalist id="capBacSuggestions">
                      {CAP_BAC_OPTIONS.map((rank) => (
                        <option key={rank} value={rank} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-red-800" />
                        <span>3. Chức vụ <strong className="text-red-700">*</strong></span>
                      </span>
                      {!examineeDuty.trim() && entryError ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Bắt buộc nhập</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Nhập bằng tay</span>
                      )}
                    </label>
                    <input
                      type="text"
                      list="chucVuSuggestions"
                      required
                      value={examineeDuty}
                      onChange={(e) => setExamineeDuty(e.target.value)}
                      placeholder="Nhập chức vụ (VD: Chiến sĩ, Tiểu đội trưởng...)"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 font-medium text-stone-900 ${
                        !examineeDuty.trim() && entryError 
                          ? 'border-red-500 bg-red-50/50 focus:ring-red-600' 
                          : 'border-stone-300 focus:ring-red-800'
                      }`}
                    />
                    <datalist id="chucVuSuggestions">
                      {CHUC_VU_OPTIONS.map((duty) => (
                        <option key={duty} value={duty} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Đơn vị - Bắt buộc nhập bằng tay */}
                <div>
                  <label className="block font-semibold text-stone-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-red-800" />
                      <span>4. Đơn vị công tác <strong className="text-red-700">*</strong></span>
                    </span>
                    {!examineeUnit.trim() && entryError ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Bắt buộc nhập</span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Nhập bằng tay</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={examineeUnit}
                    onChange={(e) => setExamineeUnit(e.target.value)}
                    placeholder="Nhập đơn vị cụ thể (VD: Trung đội 1, Đại đội 2, Tiểu đoàn 1...)"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 text-stone-900 ${
                      !examineeUnit.trim() && entryError 
                        ? 'border-red-500 bg-red-50/50 focus:ring-red-600' 
                        : 'border-stone-300 focus:ring-red-800'
                    }`}
                  />
                </div>

                {/* Cam kết kỷ luật phòng thi chống AI */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Quy chế kỷ luật phòng thi &amp; Chống sử dụng AI:</span>
                  </div>
                  <p>
                    Quân nhân cam kết tự làm bài trung thực. Hệ thống tự động vô hiệu hóa copy, giám sát chuyển tab (tối đa 3 lần), và tự động khóa đề thu bài đúng thời gian quy định.
                  </p>
                </div>

                {/* CHỌN MÃ ĐỀ THI */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block font-semibold text-stone-800 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-red-800" />
                      <span>5. Chọn Mã đề thi trắc nghiệm *</span>
                    </span>
                    <span className="text-[11px] font-normal text-stone-500">
                      (Bắt buộc phải chọn 1 mã đề)
                    </span>
                  </label>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {deThi.map((exam, idx) => {
                      const examCode = exam.ma_de || ('MĐ-' + (idx + 1).toString().padStart(2, '0'));
                      const isSelected = selectedExamId === exam.id;

                      return (
                        <label
                          key={exam.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-red-50/70 border-red-800 shadow-xs'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="selectedExamRadio"
                              checked={isSelected}
                              onChange={() => setSelectedExamId(exam.id)}
                              className="text-red-800 focus:ring-red-800 h-4 w-4"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                                  {examCode}
                                </span>
                                <h4 className="font-bold text-stone-900 font-serif-doc text-xs sm:text-sm">
                                  {exam.tieu_de}
                                </h4>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {exam.mo_ta}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-stone-700 block">
                              {exam.so_cau} câu
                            </span>
                            <span className="text-[10px] text-stone-500 block">
                              {exam.thoi_gian_phut} phút
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationModal(false)}
                    className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4 text-amber-300" />
                    <span>Xác nhận & Vào phòng thi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ACTIVE EXAM RUNNER
  const activeQ = sessionQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = sessionQuestions.length;

  return (
    <div 
      className="max-w-3xl mx-auto space-y-6 relative select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setCheatingWarning('⚠️ KỶ LUẬT PHÒNG THI: Đã vô hiệu hóa chuột phải để ngăn chặn sao chép câu hỏi sang AI.');
      }}
    >
      {/* Dynamic Security Watermark against Smartphone Photo & AI Leak */}
      {!isSubmitted && (
        <div className="pointer-events-none select-none fixed inset-0 z-10 overflow-hidden opacity-[0.035] flex flex-wrap gap-12 p-8 text-stone-900 font-mono font-bold text-xs uppercase rotate-[-25deg]">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap">
              {examineeName} · {examineeRank} · {examineeUnit} · {selectedDeThi.ma_de || 'MĐ-01'} · CHỐNG GIAN LẬN AI
            </div>
          ))}
        </div>
      )}
      
      {/* Test Control Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 border border-red-900 shadow-xl flex flex-wrap items-center justify-between gap-4 relative z-20">
        <div>
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
            {examMode === 'test' ? 'Đợt Kiểm Tra Tính Giờ' : 'Chế Độ Ôn Luyện Tự Do'}
          </span>
          <h2 className="text-base sm:text-lg font-bold font-serif-doc text-white">
            {selectedDeThi.tieu_de}
          </h2>
          <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
            <span>Đối tượng: {selectedDeThi.doi_tuong}</span>
            <span aria-hidden="true">·</span>
            <span>Tiến độ: {answeredCount}/{totalCount} câu</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Mở toàn màn hình phòng thi'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>

          {/* Countdown timer for test mode */}
          {examMode === 'test' && !isSubmitted && (
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-sm font-bold ${
              timeLeft < 180 
                ? 'bg-red-950 text-red-400 border-red-700 animate-pulse' 
                : 'bg-stone-800 text-amber-300 border-stone-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => setSelectedDeThi(null)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition-colors"
          >
            Thoát bài thi
          </button>
        </div>
      </div>

      {/* Anti-AI & Discipline Monitor Bar */}
      {examMode === 'test' && !isSubmitted && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-4 bg-stone-900 text-stone-300 rounded-xl border border-stone-700 text-xs shadow-xs relative z-20">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium text-stone-300">
              Kỷ luật phòng thi: Chống sao chép · Vô hiệu hóa chuột phải &amp; Chặn tra cứu AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono border ${
              tabSwitchCount === 0 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                : tabSwitchCount === 1 
                ? 'bg-amber-950 text-amber-300 border-amber-700' 
                : 'bg-red-950 text-red-300 border-red-700 animate-pulse'
            }`}>
              Rời màn hình: {tabSwitchCount}/3 lần {tabSwitchCount >= 2 ? '(Nguy cơ đình chỉ!)' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Cheating Warning Banner */}
      {cheatingWarning && !isSubmitted && (
        <div className="p-3.5 bg-red-100 border-2 border-red-600 rounded-xl text-red-950 flex items-start justify-between gap-3 text-xs shadow-md animate-bounce relative z-20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span className="font-bold">{cheatingWarning}</span>
          </div>
          <button
            onClick={() => setCheatingWarning('')}
            className="text-red-700 hover:text-red-950 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Verified Military Candidate Badge */}
      {examMode === 'test' && !isSubmitted && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs relative z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 text-amber-300 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-stone-900 text-sm">
                  {examineeRank} {examineeName}
                </span>
                <span className="text-[11px] text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-medium">
                  {examineeDuty}
                </span>
              </div>
              <span className="text-stone-600 text-[11px]">
                Đơn vị: <strong>{examineeUnit}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center font-mono">
            <span className="text-[11px] text-stone-500">Mã đề thi:</span>
            <span className="text-xs font-bold text-red-800 bg-white border border-red-200 px-2.5 py-0.5 rounded shadow-xs">
              {selectedDeThi.ma_de || ('MĐ-' + (deThi.findIndex(d => d.id === selectedDeThi.id) + 1).toString().padStart(2, '0'))}
            </span>
          </div>
        </div>
      )}

      {/* POST-SUBMIT RESULT SCORECARD & RIGHT/WRONG REVIEW */}
      {isSubmitted && testResult && (
        <div className="space-y-6 relative z-20">
          
          {/* Auto-Submit Notice when Time Expired */}
          {autoSubmittedDueToTime && (
            <div className="p-4 bg-amber-500 text-stone-950 rounded-2xl border-2 border-amber-600 shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-stone-950" />
              </div>
              <div>
                <span className="font-bold block uppercase tracking-wider text-xs sm:text-sm">
                  ⏰ ĐÃ HẾT THỜI GIAN THI — HỆ THỐNG TỰ ĐỘNG THU BÀI!
                </span>
                <p className="text-xs opacity-95 mt-0.5">
                  Thời gian làm bài của đồng chí đã hết (00:00). Hệ thống đã tự động khóa và thu toàn bộ kết quả bài làm để chấm điểm công bằng.
                </p>
              </div>
            </div>
          )}

          {/* Violation Notice when Screen-Left Exceeded */}
          {tabSwitchCount >= 3 && (
            <div className="p-4 bg-red-600 text-white rounded-2xl border-2 border-red-800 shadow-md flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-xs sm:text-sm">
                  ⚠️ BÀI THI BỊ THU DO VI PHẠM KỶ LUẬT (RỜI MÀN HÌNH QUÁ 3 LẦN)
                </span>
                <p className="text-xs text-red-100 mt-0.5">
                  Hệ thống ghi nhận đồng chí đã rời màn hình thi 3 lần để chuyển tab/cửa sổ. Bài thi đã bị khóa thu tự động và lưu số lần vi phạm vào biên bản.
                </p>
              </div>
            </div>
          )}

          {/* Summary Scorecard */}
          <div className="bg-white rounded-2xl border-2 border-red-800 p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-700 text-red-800 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-red-800 tracking-wider">
                Kết quả kiểm tra nhận thức chính trị
              </span>
              <h3 className="text-3xl font-bold font-serif-doc text-stone-900 mt-1">
                Điểm đạt được: <span className="text-red-800 font-mono text-4xl">{testResult.score}</span> / 10
              </h3>
              <p className="text-xs text-stone-600 mt-2">
                Quân nhân: <span className="font-bold text-stone-900">{examineeName}</span> ({examineeRank} · Chức vụ: {examineeDuty} · {examineeUnit})
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Mã đề thi: <strong className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{selectedDeThi.ma_de || ('MĐ-' + (deThi.findIndex(d => d.id === selectedDeThi.id) + 1).toString().padStart(2, '0'))}</strong> · Trả lời đúng <span className="font-bold text-emerald-700">{testResult.correctCount}</span> / {testResult.total} câu · Thời gian làm: <span className="font-mono font-bold text-stone-800">{formatTimer(testResult.elapsedSeconds)}</span>
              </p>
            </div>

            {/* Classification */}
            <div className="inline-block">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getRankBadge(testResult.score).color}`}>
                Xếp loại: {getRankBadge(testResult.score).label}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleOpenRegistration(selectedDeThi, examMode)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại đề này</span>
              </button>
              <button
                onClick={() => setSelectedDeThi(null)}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Trở về danh sách đợt kiểm tra
              </button>
            </div>
          </div>

          {/* DETAILED QUESTION REVIEW: HIỆN ĐÁP ÁN ĐÚNG/SAI CHO TỪNG CÂU */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-serif-doc text-stone-900">
                  Chi Tiết Bài Làm — Báo Cáo Đúng / Sai Từng Câu
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Rà soát đáp án thí sinh đã chọn, đáp án chuẩn xác và căn cứ lý luận giải thích
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Đã lưu bài thi vào hệ thống
              </span>
            </div>

            <div className="space-y-6 pt-2">
              {sessionQuestions.map((q, idx) => {
                const chosenIdx = selectedAnswers[q.id];
                const isCorrect = chosenIdx === q.dap_an_dung;
                const isUnanswered = chosenIdx === undefined || chosenIdx === -1;

                return (
                  <div 
                    key={q.id}
                    className={`p-5 rounded-2xl border ${
                      isCorrect 
                        ? 'border-emerald-200 bg-emerald-50/20' 
                        : isUnanswered 
                        ? 'border-amber-200 bg-amber-50/20' 
                        : 'border-red-200 bg-red-50/20'
                    } space-y-3.5 text-xs`}
                  >
                    {/* Question Header & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-stone-900 text-sm">
                        Câu {idx + 1}: {q.noi_dung}
                      </span>
                      
                      {isCorrect ? (
                        <span className="shrink-0 flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full text-[11px] border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Đúng</span>
                        </span>
                      ) : isUnanswered ? (
                        <span className="shrink-0 flex items-center gap-1 font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full text-[11px] border border-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Chưa chọn</span>
                        </span>
                      ) : (
                        <span className="shrink-0 flex items-center gap-1 font-bold text-red-800 bg-red-100/80 px-2.5 py-1 rounded-full text-[11px] border border-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-700" />
                          <span>Sai</span>
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {q.cac_dap_an.map((opt, optIdx) => {
                        const isChosenOption = chosenIdx === optIdx;
                        const isCorrectOption = optIdx === q.dap_an_dung;

                        let style = 'bg-white border-stone-200 text-stone-700';

                        if (isChosenOption && isCorrectOption) {
                          style = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isChosenOption && !isCorrectOption) {
                          style = 'bg-red-100 border-red-500 text-red-950 font-semibold';
                        } else if (!isChosenOption && isCorrectOption) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                        }

                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${style}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                isChosenOption
                                  ? isCorrectOption ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
                                  : isCorrectOption ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 border border-stone-300'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {/* Option indicators */}
                            <div className="shrink-0 flex items-center gap-1.5 text-[11px]">
                              {isChosenOption && !isCorrectOption && (
                                <span className="text-red-700 font-bold">Thí sinh đã chọn</span>
                              )}
                              {isCorrectOption && (
                                <span className="text-emerald-800 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Đáp án đúng</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.giai_thich && (
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-stone-700 leading-relaxed">
                        <span className="font-bold text-red-800 block mb-0.5">
                          Căn cứ lý luận & Lời giải thích:
                        </span>
                        <p>{q.giai_thich}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* QUESTION RUNNER (When not submitted) */}
      {!isSubmitted && activeQ && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between text-xs text-stone-500 pb-3 border-b border-stone-200">
            <span className="font-bold text-red-800 uppercase tracking-wider">
              Câu hỏi {currentQuestionIndex + 1} / {totalCount}
            </span>
            <span className={activeQ.muc_do === 'co_ban' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
              {activeQ.muc_do === 'co_ban' ? 'Mức độ: Cơ bản' : 'Mức độ: Nâng cao'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-serif-doc text-stone-900 leading-snug">
            {activeQ.noi_dung}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {activeQ.cac_dap_an.map((opt, optIdx) => {
              const isChosen = selectedAnswers[activeQ.id] === optIdx;
              const isCorrect = optIdx === activeQ.dap_an_dung;
              const hasAnswered = selectedAnswers[activeQ.id] !== undefined;
              
              let optionClass = 'border-stone-200 hover:bg-stone-50 text-stone-800';

              if (examMode === 'practice' && hasAnswered) {
                if (isCorrect) {
                  optionClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                } else if (isChosen && !isCorrect) {
                  optionClass = 'bg-red-50 border-red-500 text-red-900';
                }
              } else if (isChosen) {
                optionClass = 'bg-red-50 border-red-700 text-red-950 font-semibold';
              }

              return (
                <button
                  key={optIdx}
                  disabled={examMode === 'practice' && hasAnswered}
                  onClick={() => handleSelectAnswer(activeQ.id, optIdx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition-colors ${optionClass}`}
                >
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isChosen 
                      ? 'bg-red-800 text-white' 
                      : 'bg-stone-100 text-stone-700 border border-stone-300'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Practice Mode immediate explanation */}
          {examMode === 'practice' && selectedAnswers[activeQ.id] !== undefined && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-red-800 block">
                Căn cứ lý luận & Giải thích:
              </span>
              <p className="text-stone-700 leading-relaxed">{activeQ.giai_thich}</p>
            </div>
          )}

          {/* Question Navigation Bar & Submit Button */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                disabled={currentQuestionIndex === totalCount - 1}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
              >
                <span>Câu sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleSubmitExam()}
              className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Nộp bài kiểm tra ({answeredCount}/{totalCount})</span>
            </button>
          </div>

          {/* Pagination number grid */}
          <div className="pt-2">
            <span className="text-[11px] text-stone-400 block mb-2 font-medium">Bảng câu hỏi:</span>
            <div className="flex flex-wrap gap-1.5">
              {sessionQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-red-800 text-white shadow-sm ring-2 ring-red-800/40'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
