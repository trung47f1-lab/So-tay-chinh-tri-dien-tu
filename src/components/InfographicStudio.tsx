import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { InfographicItem, InfographicKeyPoint } from '../types';
import { AI_OFFICER_IMAGES } from '../data/initialData';
import { 
  Sparkles, 
  Printer, 
  Download, 
  QrCode, 
  Share2, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Star, 
  Shield, 
  Calendar, 
  Compass, 
  Flag, 
  FileText, 
  Layers, 
  Palette, 
  Check, 
  ArrowRight,
  Maximize2,
  X,
  RefreshCw,
  Flame,
  Award
} from 'lucide-react';
import QRCode from 'qrcode';

export const InfographicStudio: React.FC = () => {
  const { 
    infographics, 
    addInfographic, 
    updateInfographic, 
    deleteInfographic,
    selectedInfographic, 
    setSelectedInfographic,
    editorialDraft, 
    setEditorialDraft,
    chuyenDe, 
    noiDungHangNgay, 
    taiLieu,
    addQRCode,
    setSelectedQRCodeForPrint,
    qrCodes,
    speakText,
    stopSpeaking,
    isSpeaking,
    currentUser
  } = useApp();

  // Active view: 'thu_vien' | 'bien_tap'
  const [activeTab, setActiveTab] = useState<'thu_vien' | 'bien_tap'>('thu_vien');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'loi_bac_day' | 'chuyen_de' | 'tai_lieu'>('all');

  // Studio Creation / Editing State
  const [sourceType, setSourceType] = useState<'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh'>('loi_bac_day');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customContent, setCustomContent] = useState<string>('');
  const [selectedVisualId, setSelectedVisualId] = useState<string>(AI_OFFICER_IMAGES[0].id);
  const [selectedStyle, setSelectedStyle] = useState<'ap_phich_co_dong' | 'infographic_hien_dai' | 'so_tay_bo_tui'>('ap_phich_co_dong');
  const [selectedColor, setSelectedColor] = useState<'do_vang' | 'xanh_quan_doi' | 'do_sam'>('do_vang');
  const [unitName, setUnitName] = useState<string>('Trung đoàn 1 · Sư đoàn 324');
  const [editorName, setEditorName] = useState<string>(currentUser.ho_ten || 'Trợ lý Tuyên huấn');

  // Loading state when calling AI editorial
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Active editable preview item in Studio
  const [currentDraft, setCurrentDraft] = useState<InfographicItem | null>(null);

  // Modal full preview
  const [modalItem, setModalItem] = useState<InfographicItem | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const modalPosterRef = useRef<HTMLDivElement>(null);

  // Pre-fill from editorialDraft if passed from other views
  useEffect(() => {
    if (editorialDraft) {
      setActiveTab('bien_tap');
      setSourceType(editorialDraft.sourceType);
      setCustomTitle(editorialDraft.title);
      setCustomContent(editorialDraft.content);
      if (editorialDraft.selectedVisualId) {
        setSelectedVisualId(editorialDraft.selectedVisualId);
      }
      // Auto trigger AI editorial immediately
      handleTriggerAIEditorial(editorialDraft.title, editorialDraft.content, editorialDraft.sourceType, editorialDraft.selectedVisualId);
      // Clear draft once consumed
      setEditorialDraft(null);
    } else if (!currentDraft && infographics.length > 0) {
      setCurrentDraft(infographics[0]);
    }
  }, [editorialDraft]);

  // Generate QR for modal item
  useEffect(() => {
    if (modalItem) {
      QRCode.toDataURL(
        `https://sotay-chinhtri.internal/infographic/${modalItem.id}`,
        { width: 220, margin: 2, color: { dark: '#1c1917', light: '#ffffff' } },
        (err, url) => {
          if (!err && url) setQrCodeDataUrl(url);
        }
      );
    }
  }, [modalItem]);

  // When source type changes, auto pick default item
  const handleSourceTypeChange = (type: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh') => {
    setSourceType(type);
    if (type === 'loi_bac_day' && noiDungHangNgay.length > 0) {
      const item = noiDungHangNgay[0];
      setSelectedSourceId(item.id);
      setCustomTitle(item.tieu_de);
      setCustomContent(`"${item.trich_dan}"\nBối cảnh: ${item.hoan_canh}\nÝ nghĩa hành động: ${item.y_nghia}\nNguồn: ${item.nguon}`);
      setSelectedVisualId('img-officer-troops');
    } else if (type === 'chuyen_de' && chuyenDe.length > 0) {
      const cd = chuyenDe[0];
      setSelectedSourceId(cd.id);
      setCustomTitle(cd.ten);
      setCustomContent(`Chuyên đề: ${cd.ten}\nMục tiêu: ${cd.mo_ta}\nYêu cầu đối với bộ đội: Quán triệt sâu sắc mục tiêu, rèn luyện phẩm chất Bộ đội Cụ Hồ, nâng cao kỷ luật và khả năng sẵn sàng chiến đấu.`);
      setSelectedVisualId('img-officer-lecture');
    } else if (type === 'tai_lieu' && taiLieu.length > 0) {
      const tl = taiLieu[0];
      setSelectedSourceId(tl.id);
      setCustomTitle(tl.tieu_de);
      setCustomContent(`${tl.tieu_de}\nTác giả: ${tl.tac_gia}\nTóm tắt: ${tl.tom_tat}\nNội dung chính:\n${tl.noi_dung.slice(0, 1500)}`);
      setSelectedVisualId('img-officer-salute');
    } else {
      setSelectedSourceId('');
      setCustomTitle('HỌC TẬP VÀ RÈN LUYỆN THEO PHONG CÁCH QUÂN NHÂN CÁCH MẠNG');
      setCustomContent('Cán bộ, chiến sĩ nêu cao tinh thần tự giác, chấp hành nghiêm kỷ luật quân đội, sẵn sàng nhận và hoàn thành xuất sắc mọi nhiệm vụ được giao.');
      setSelectedVisualId('img-officer-research');
    }
  };

  const handleSelectPredefinedSource = (id: string) => {
    setSelectedSourceId(id);
    if (sourceType === 'loi_bac_day') {
      const item = noiDungHangNgay.find(n => n.id === id);
      if (item) {
        setCustomTitle(item.tieu_de);
        setCustomContent(`"${item.trich_dan}"\nBối cảnh: ${item.hoan_canh}\nÝ nghĩa: ${item.y_nghia}\nNguồn: ${item.nguon}`);
      }
    } else if (sourceType === 'chuyen_de') {
      const cd = chuyenDe.find(c => c.id === id);
      if (cd) {
        setCustomTitle(cd.ten);
        const relatedDocs = taiLieu.filter(t => t.chuyen_de_id === cd.id);
        const docSummaries = relatedDocs.map(d => `- ${d.tieu_de}: ${d.tom_tat}`).join('\n');
        setCustomContent(`Chuyên đề: ${cd.ten}\nNội dung: ${cd.mo_ta}\nTài liệu trọng tâm:\n${docSummaries || 'Học tập chính trị, rèn luyện phương pháp tác phong chính quy.'}`);
      }
    } else if (sourceType === 'tai_lieu') {
      const tl = taiLieu.find(t => t.id === id);
      if (tl) {
        setCustomTitle(tl.tieu_de);
        setCustomContent(`${tl.tieu_de}\nTóm tắt: ${tl.tom_tat}\nNội dung:\n${tl.noi_dung.slice(0, 1500)}`);
      }
    }
  };

  // Main Call: AI Editorial Synthesis
  const handleTriggerAIEditorial = async (
    overrideTitle?: string,
    overrideContent?: string,
    overrideType?: string,
    overrideVisual?: string
  ) => {
    setIsGenerating(true);
    setGenerateError(null);

    const titleToUse = overrideTitle || customTitle;
    const contentToUse = overrideContent || customContent;
    const typeToUse = overrideType || sourceType;
    const visualToUse = overrideVisual || selectedVisualId;

    try {
      const res = await fetch('/api/ai/editorial-infographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: contentToUse,
          title: titleToUse,
          sourceType: typeToUse,
          style: selectedStyle,
          selectedVisualId: visualToUse,
          unitName: unitName,
          editorName: editorName
        })
      });

      if (!res.ok) {
        throw new Error('Máy chủ phản hồi lỗi khi biên tập.');
      }

      const json = await res.json();
      if (json.success && json.infographic) {
        const item: InfographicItem = {
          ...json.infographic,
          mau_sac: selectedColor,
          bo_cuc: selectedStyle
        };
        setCurrentDraft(item);
        // Also add to global list if new
        addInfographic(item);
      } else {
        throw new Error(json.error || 'Không nhận được dữ liệu infographic biên tập.');
      }
    } catch (err: any) {
      console.warn('AI API call error, applying local military editorial fallback:', err.message);
      // Deterministic instant local fallback
      const chosenVisual = AI_OFFICER_IMAGES.find(img => img.id === visualToUse) || AI_OFFICER_IMAGES[0];
      const localItem: InfographicItem = {
        id: `info-${Date.now()}`,
        tieu_de: titleToUse.toUpperCase() || 'INFOGRAPHIC GIÁO DỤC CHÍNH TRỊ CƠ SỞ',
        tieu_de_phu: 'Biên tập trực quan hóa phục vụ cán bộ, chiến sĩ đơn vị cơ sở',
        loai_nguon: typeToUse as any,
        trich_dan_bac_ho: {
          cau_noi: contentToUse.match(/["“]([^"”]+)["”]/)?.[1] || contentToUse.slice(0, 180) || 'Quân đội ta trung với Đảng, hiếu với dân, nhiệm vụ nào cũng hoàn thành, khó khăn nào cũng vượt qua, kẻ thù nào cũng đánh thắng.',
          hoan_canh: 'Tài liệu giáo dục chính trị tại đơn vị',
          y_nghia: 'Kim chỉ nam soi đường cho tư tưởng, ý chí và hành động của mọi quân nhân.'
        },
        khau_hieu_hanh_dong: 'QUYẾT TÂM THI ĐUA HỌC TỐT, RÈN NGHIÊM, HOÀN THÀNH XUẤT SẮC MỌI NHIỆM VỤ!',
        cac_diem_chinh: [
          {
            id: `p-${Date.now()}-1`,
            order: 1,
            title: 'Kiên định Mục tiêu Lý tưởng',
            desc: 'Tuyệt đối trung thành với Đảng, Tổ quốc và Nhân dân; giữ vững lập trường cách mạng kiên trung.',
            badge: 'BẢN LĨNH CHÍNH TRỊ'
          },
          {
            id: `p-${Date.now()}-2`,
            order: 2,
            title: 'Kỷ luật Sắt - Tác phong Chuẩn',
            desc: 'Chấp hành nghiêm 10 Lời thề danh dự, 12 Điều kỷ luật khi tiếp xúc nhân dân và nền nếp ngày tuần.',
            badge: 'KỶ LUẬT THÉP'
          },
          {
            id: `p-${Date.now()}-3`,
            order: 3,
            title: 'Huấn luyện Giỏi - Sẵn sàng Chiến đấu',
            desc: 'Làm chủ vũ khí trang bị kỹ thuật hiện đại, rèn luyện thể lực bền bỉ và thuần thục chiến thuật.',
            badge: 'SẴN SÀNG CHIẾN ĐẤU'
          }
        ],
        phuong_cham_hanh_dong: [
          'Học đi đôi với hành, lý luận gắn liền thực tiễn thao trường bãi tập',
          'Cán bộ làm gương trước chiến sĩ; cấp trên làm gương trước cấp dưới',
          'Đoàn kết thương yêu đồng đội như ruột thịt, chia ngọt sẻ bùi'
        ],
        chi_tieu_thi_dua: '100% quân số hoàn thành tốt nhiệm vụ, phân đội an toàn tuyệt đối',
        loi_the_danh_du: 'Nhiệm vụ nào cũng hoàn thành, khó khăn nào cũng vượt qua, kẻ thù nào cũng đánh thắng. Xin thề!',
        hinh_anh_ai: {
          id: chosenVisual.id,
          duong_dan: chosenVisual.duong_dan,
          ten_hinh_anh: chosenVisual.ten_hinh_anh,
          mo_ta: chosenVisual.mo_ta,
          tac_gia_ai: chosenVisual.tac_gia_ai,
          dac_trung: chosenVisual.dac_trung
        },
        don_vi_ap_dung: unitName,
        ngay_bien_tap: new Date().toISOString().split('T')[0],
        nguoi_bien_tap: editorName,
        cap_bac_nguoi_bien_tap: 'Trợ lý Tuyên huấn',
        mau_sac: selectedColor,
        bo_cuc: selectedStyle,
        so_luot_xem: 1
      };
      setCurrentDraft(localItem);
      addInfographic(localItem);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct editing within the current draft
  const handleUpdateDraftField = (field: keyof InfographicItem, value: any) => {
    if (!currentDraft) return;
    const updated = { ...currentDraft, [field]: value };
    setCurrentDraft(updated);
    updateInfographic(updated.id, updated);
  };

  const handleUpdateKeyPoint = (index: number, field: keyof InfographicKeyPoint, value: any) => {
    if (!currentDraft) return;
    const nextPoints = [...currentDraft.cac_diem_chinh];
    nextPoints[index] = { ...nextPoints[index], [field]: value };
    handleUpdateDraftField('cac_diem_chinh', nextPoints);
  };

  const handleAddKeyPoint = () => {
    if (!currentDraft) return;
    const newPoint: InfographicKeyPoint = {
      id: `p-${Date.now()}`,
      order: currentDraft.cac_diem_chinh.length + 1,
      title: 'Nội dung trọng tâm mới',
      desc: 'Mô tả tóm tắt nội dung hành động cho người chiến sĩ.',
      badge: `TIÊU CHUẨN ${currentDraft.cac_diem_chinh.length + 1}`
    };
    handleUpdateDraftField('cac_diem_chinh', [...currentDraft.cac_diem_chinh, newPoint]);
  };

  const handleDeleteKeyPoint = (index: number) => {
    if (!currentDraft) return;
    const nextPoints = currentDraft.cac_diem_chinh.filter((_, i) => i !== index);
    handleUpdateDraftField('cac_diem_chinh', nextPoints);
  };

  // Change AI Officer Visual on Draft
  const handleChangeDraftVisual = (visualId: string) => {
    const v = AI_OFFICER_IMAGES.find(img => img.id === visualId);
    if (!v || !currentDraft) return;
    setSelectedVisualId(visualId);
    handleUpdateDraftField('hinh_anh_ai', {
      id: v.id,
      duong_dan: v.duong_dan,
      ten_hinh_anh: v.ten_hinh_anh,
      mo_ta: v.mo_ta,
      tac_gia_ai: v.tac_gia_ai,
      dac_trung: v.dac_trung
    });
  };

  // Print poster
  const handlePrintPoster = () => {
    window.print();
  };

  // Download Infographic as PNG Image via Canvas rasterization
  const handleDownloadInfographicPNG = async (item: InfographicItem) => {
    setIsDownloadingImage(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D');

      // Standard A4 aspect ratio (1200 x 1700 px)
      canvas.width = 1200;
      canvas.height = 1750;

      // Background theme colors
      const isArmyGreen = item.mau_sac === 'xanh_quan_doi';
      const isDeepRed = item.mau_sac === 'do_sam';
      
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isArmyGreen) {
        grad.addColorStop(0, '#1c281a');
        grad.addColorStop(0.5, '#141d13');
        grad.addColorStop(1, '#0b110a');
      } else if (isDeepRed) {
        grad.addColorStop(0, '#3f0c10');
        grad.addColorStop(0.5, '#22080a');
        grad.addColorStop(1, '#110405');
      } else {
        grad.addColorStop(0, '#5a0c13');
        grad.addColorStop(0.4, '#38070b');
        grad.addColorStop(1, '#1a0507');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gold border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Inner subtle border
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // Header Banner
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(30, 30, canvas.width - 60, 110);
      
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QUÂN ĐỘI NHÂN DÂN VIỆT NAM · BAN CHÍNH TRỊ', canvas.width / 2, 68);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(item.don_vi_ap_dung?.toUpperCase() || 'ĐƠN VỊ CƠ SỞ', canvas.width / 2, 98);

      ctx.fillStyle = '#fde047';
      ctx.font = '16px sans-serif';
      ctx.fillText('★ BẢN TIN TRỰC QUAN HÓA GIÁO DỤC CHÍNH TRỊ ★', canvas.width / 2, 124);

      // Main Title
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 34px serif';
      ctx.fillText(item.tieu_de, canvas.width / 2, 195);

      if (item.tieu_de_phu) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'italic 19px sans-serif';
        ctx.fillText(item.tieu_de_phu, canvas.width / 2, 230);
      }

      // Action Slogan Banner
      ctx.fillStyle = '#851a1d';
      ctx.fillRect(60, 255, canvas.width - 120, 50);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 255, canvas.width - 120, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(item.khau_hieu_hanh_dong, canvas.width / 2, 288);

      // Draw Officer Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.hinh_anh_ai.duong_dan;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // continue even if image loading fails
      });

      // Officer image box
      const imgX = 60;
      const imgY = 330;
      const imgW = 420;
      const imgH = 480;

      if (img.width) {
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.strokeRect(imgX, imgY, imgW, imgH);

      // Officer caption badge
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(imgX + 10, imgY + imgH - 55, imgW - 20, 45);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('★ ' + item.hinh_anh_ai.ten_hinh_anh, imgX + 20, imgY + imgH - 26);

      // Right column: Golden Quote Box
      const rightX = 510;
      const rightW = canvas.width - rightX - 60;
      const quoteY = 330;
      const quoteH = 480;

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(rightX, quoteY, rightW, quoteH);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(rightX, quoteY, rightW, quoteH);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 22px serif';
      ctx.fillText('LỜI BÁC HỒ DẠY CÁN BỘ, CHIẾN SĨ:', rightX + 25, quoteY + 45);

      // Wrap quote text
      ctx.fillStyle = '#fef9c3';
      ctx.font = 'italic 20px serif';
      const quoteText = `"${item.trich_dan_bac_ho?.cau_noi || ''}"`;
      
      const words = quoteText.split(' ');
      let line = '';
      let y = quoteY + 90;
      const maxWidth = rightW - 50;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, rightX + 25, y);
          line = words[n] + ' ';
          y += 32;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, rightX + 25, y);

      // Context
      if (item.trich_dan_bac_ho?.hoan_canh) {
        y += 40;
        ctx.fillStyle = '#fef08a';
        ctx.font = '15px sans-serif';
        ctx.fillText('— ' + item.trich_dan_bac_ho.hoan_canh, rightX + 25, y);
      }

      // Meaning
      if (item.trich_dan_bac_ho?.y_nghia) {
        y += 35;
        ctx.fillStyle = '#d1d5db';
        ctx.font = '15px sans-serif';
        ctx.fillText('Bài học: ' + item.trich_dan_bac_ho.y_nghia.slice(0, 110) + '...', rightX + 25, y);
      }

      // Middle Section: 3-4 Key Takeaway Pillars
      ctx.textAlign = 'left';
      let pillarY = 840;
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('NỘI DUNG CỐT LÕI & TIÊU CHUẨN RÈN LUYỆN:', 60, pillarY);

      pillarY += 25;
      const numPoints = Math.min(item.cac_diem_chinh.length, 4);
      const colWidth = (canvas.width - 120 - (numPoints - 1) * 20) / numPoints;

      item.cac_diem_chinh.slice(0, 4).forEach((pt, idx) => {
        const px = 60 + idx * (colWidth + 20);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(px, pillarY, colWidth, 290);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, pillarY, colWidth, 290);

        // Header badge
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(px, pillarY, colWidth, 42);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pt.badge || `TIÊU CHÍ ${idx + 1}`, px + colWidth / 2, pillarY + 27);

        // Point Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pt.title, px + colWidth / 2, pillarY + 80);

        // Point desc wrap
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';

        const pwords = pt.desc.split(' ');
        let pline = '';
        let py = pillarY + 115;
        for (let i = 0; i < pwords.length; i++) {
          const test = pline + pwords[i] + ' ';
          if (ctx.measureText(test).width > colWidth - 24 && i > 0) {
            ctx.fillText(pline, px + 12, py);
            pline = pwords[i] + ' ';
            py += 22;
          } else {
            pline = test;
          }
        }
        ctx.fillText(pline, px + 12, py);
      });

      // Bottom Section: Guidelines & Emulation
      const botY = 1170;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(60, botY, canvas.width - 120, 240);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, botY, canvas.width - 120, 240);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('HÀNH ĐỘNG CỦA CÁN BỘ, CHIẾN SĨ TẠI ĐƠN VỊ:', 85, botY + 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      item.phuong_cham_hanh_dong.forEach((g, idx) => {
        ctx.fillText(`★  ${g}`, 85, botY + 80 + idx * 36);
      });

      if (item.loi_the_danh_du) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'italic 16px serif';
        ctx.fillText(`Lời thề danh dự: "${item.loi_the_danh_du}"`, 85, botY + 205);
      }

      // Footer
      const footY = 1460;
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(60, footY, canvas.width - 120, 230);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, footY, canvas.width - 120, 230);

      // Foot details
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('BAN TUYÊN HUẤN ĐƠN VỊ CƠ SỞ', 90, footY + 45);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px sans-serif';
      ctx.fillText(`Người biên tập: ${item.cap_bac_nguoi_bien_tap || 'Trợ lý Tuyên huấn'} ${item.nguoi_bien_tap || ''}`, 90, footY + 85);
      ctx.fillText(`Đơn vị áp dụng: ${item.don_vi_ap_dung || 'Đơn vị cơ sở'}`, 90, footY + 115);
      ctx.fillText(`Thời gian biên tập: ${item.ngay_bien_tap}`, 90, footY + 145);
      ctx.fillText(`Mô tả hình ảnh: Sĩ quan QĐND Việt Nam chính quy ve áo đỏ sao vàng`, 90, footY + 175);
      ctx.fillText(`Công nghệ: Trí tuệ nhân tạo Tuyên huấn Quân đội`, 90, footY + 205);

      // Footer QR Code
      const qrData = await QRCode.toDataURL(`https://sotay-chinhtri.internal/infographic/${item.id}`, { width: 170, margin: 1 });
      const qrImg = new Image();
      qrImg.src = qrData;
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
      });
      ctx.drawImage(qrImg, canvas.width - 250, footY + 30, 160, 160);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QUÉT MÃ TRÊN ĐIỆN THOẠI', canvas.width - 170, footY + 208);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `infographic-tuyen-huan-${item.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e: any) {
      console.error('Download error:', e);
      alert('Không thể tạo file ảnh tự động. Đồng chí có thể dùng tính năng "In áp phích" và lưu dưới dạng PDF.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Register QR to unit bulletin boards
  const handleRegisterQRCode = (item: InfographicItem) => {
    let qr = qrCodes.find(q => q.muc_tieu_id === item.id);
    if (!qr) {
      qr = addQRCode({
        tieu_de: `Infographic: ${item.tieu_de}`,
        loai: 'tai_lieu',
        muc_tieu_id: item.id,
        ma_dinh_danh: `QR-INFO-${item.id.toUpperCase()}`,
        duong_dan_noi_bo: `/infographic/${item.id}`,
        vi_tri_dan: 'Bảng tin tuyên truyền đại đội, Tủ sách chính trị, Phòng Hồ Chí Minh'
      });
    }
    setSelectedQRCodeForPrint(qr);
  };

  // Copy Quote
  const handleCopyQuote = (quote: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Voice speech synthesis
  const handleSpeakInfographic = (item: InfographicItem) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const pointsText = item.cac_diem_chinh.map(p => `${p.title}. ${p.desc}`).join('. ');
      const speech = `${item.tieu_de}. Khẩu hiệu: ${item.khau_hieu_hanh_dong}. Lời Bác dạy: ${item.trich_dan_bac_ho?.cau_noi || ''}. Các nội dung chính: ${pointsText}. Phương châm hành động: ${item.phuong_cham_hanh_dong.join('. ')}`;
      speakText(speech, item.tieu_de);
    }
  };

  // Filtered infographics list
  const filteredInfographics = infographics.filter(item => {
    if (categoryFilter === 'all') return true;
    return item.loai_nguon === categoryFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HERO INSTITUTIONAL MARQUEE */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950 via-stone-950 to-stone-900 border border-red-900/60 text-white shadow-xl p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Biên Tập Tự Động Hóa Bằng Trí Tuệ Nhân Tạo (AI)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-doc text-stone-100 tracking-tight">
              Infographic Tuyên Huấn & Lời Bác Hồ Dạy
            </h1>
            
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
              Tự động cô đọng nội dung chuyên đề chính trị, chỉ thị, nghị quyết và lời Bác dạy thành áp phích trực quan, dễ nhớ, dễ hiểu; tích hợp hình ảnh chính quy chuẩn nét đặc trưng của sĩ quan Quân đội Nhân dân Việt Nam và hồn nước Việt Nam.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Sĩ quan QĐND Việt Nam chính quy
              </span>
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-stone-300">
                <Printer className="w-3.5 h-3.5 text-stone-400" />
                Chuẩn kích thước in A4 / Poster
              </span>
              <span className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800 text-stone-300">
                <QrCode className="w-3.5 h-3.5 text-stone-400" />
                Mã QR niêm yết bảng tin
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800">
            <button
              onClick={() => setActiveTab('thu_vien')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'thu_vien'
                  ? 'bg-red-800 text-amber-300 shadow-md border border-red-700'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Thư viện Áp phích ({infographics.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('bien_tap');
                if (!currentDraft && infographics.length > 0) {
                  setCurrentDraft(infographics[0]);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'bien_tap'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'text-amber-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Xưởng Biên Tập AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE 1: THƯ VIỆN INFOGRAPHIC (GALLERY) */}
      {activeTab === 'thu_vien' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-stone-700 mr-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-700" />
                Phân loại:
              </span>
              {[
                { key: 'all', label: 'Tất cả áp phích' },
                { key: 'loi_bac_day', label: 'Lời Bác Hồ dạy' },
                { key: 'chuyen_de', label: 'Chuyên đề chính trị' },
                { key: 'tai_lieu', label: 'Văn kiện - Chỉ thị' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setCategoryFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    categoryFilter === f.key
                      ? 'bg-red-800 text-amber-300 font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveTab('bien_tap');
                handleSourceTypeChange('loi_bac_day');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-800 hover:bg-red-700 text-white flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tạo Infographic Mới Bằng AI</span>
            </button>
          </div>

          {/* Grid of Infographic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredInfographics.map((item) => (
              <div 
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-red-900/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Header */}
                <div className="relative aspect-video sm:aspect-[16/9] w-full overflow-hidden bg-stone-900">
                  <img
                    src={item.hinh_anh_ai.duong_dan}
                    alt={item.hinh_anh_ai.ten_hinh_anh}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  
                  {/* Category & Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-red-800/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40 shadow-sm backdrop-blur-sm">
                      {item.loai_nguon === 'loi_bac_day' ? 'Lời Bác Hồ dạy' : item.loai_nguon === 'chuyen_de' ? 'Chuyên đề chính trị' : 'Văn kiện chỉ thị'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-stone-900/80 text-stone-200 text-[10px] font-medium border border-stone-700 backdrop-blur-sm">
                      {item.don_vi_ap_dung || 'Đơn vị cơ sở'}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <h3 className="text-base sm:text-lg font-bold font-serif-doc text-white leading-snug drop-shadow-md">
                      {item.tieu_de}
                    </h3>
                    <p className="text-xs text-amber-300 line-clamp-1 italic">
                      "{item.trich_dan_bac_ho?.cau_noi}"
                    </p>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Slogan */}
                  <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs font-semibold text-red-900 flex items-start gap-2">
                    <Flag className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <span>{item.khau_hieu_hanh_dong}</span>
                  </div>

                  {/* 3 Key Takeaways preview */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                      Điểm cốt lõi ({item.cac_diem_chinh.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.cac_diem_chinh.slice(0, 4).map((pt) => (
                        <div key={pt.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">
                            {pt.badge || 'Trọng tâm'}
                          </span>
                          <span className="font-semibold text-stone-800 line-clamp-1">{pt.title}</span>
                          <span className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">{pt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Officer AI details */}
                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
                      <span className="truncate"><strong>Hình ảnh:</strong> {item.hinh_anh_ai.ten_hinh_anh}</span>
                    </div>
                    <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-700 shrink-0">
                      AI Generated
                    </span>
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeakInfographic(item)}
                        className="p-2 rounded-lg text-stone-600 hover:text-red-800 hover:bg-stone-100 transition-colors"
                        title="Nghe đọc bài giảng"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegisterQRCode(item)}
                        className="p-2 rounded-lg text-stone-600 hover:text-red-800 hover:bg-stone-100 transition-colors"
                        title="Tạo mã QR niêm yết bảng tin"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInfographicPNG(item)}
                        disabled={isDownloadingImage}
                        className="p-2 rounded-lg text-stone-600 hover:text-red-800 hover:bg-stone-100 transition-colors"
                        title="Tải ảnh PNG về máy"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentDraft(item);
                          setActiveTab('bien_tap');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 border border-stone-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => setModalItem(item)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-800 hover:bg-red-700 flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Xem Áp Phích A4</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODE 2: XƯỞNG BIÊN TẬP TỰ ĐỘNG BẰNG AI (AI EDITORIAL STUDIO) */}
      {activeTab === 'bien_tap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input & AI Generation Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg font-bold font-serif-doc text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Thiết Lập Biên Tập Tuyên Huấn AI</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Chọn nguồn tài liệu chính trị hoặc nhập bài giảng để AI tự động phân tích và tạo áp phích.
              </p>
            </div>

            {/* Step 1: Source Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                1. Nguồn nội dung biên tập:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'loi_bac_day', label: 'Lời Bác Hồ dạy' },
                  { key: 'chuyen_de', label: 'Chuyên đề chính trị' },
                  { key: 'tai_lieu', label: 'Kho tài liệu văn kiện' },
                  { key: 'tuy_chinh', label: 'Nhập nội dung bất kỳ' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSourceTypeChange(opt.key as any)}
                    className={`py-2 px-3 rounded-xl font-medium text-left border transition-all ${
                      sourceType === opt.key
                        ? 'bg-red-800 text-white border-red-800 font-bold shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Predefined Dropdowns */}
            {sourceType === 'loi_bac_day' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Chọn Lời Bác dạy có sẵn:
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => handleSelectPredefinedSource(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-red-800 outline-none"
                >
                  {noiDungHangNgay.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.tieu_de} ({item.ngay})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === 'chuyen_de' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Chọn Chuyên đề chính trị:
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => handleSelectPredefinedSource(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-red-800 outline-none"
                >
                  {chuyenDe.map(cd => (
                    <option key={cd.id} value={cd.id}>
                      {cd.ten}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === 'tai_lieu' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Chọn Tài liệu / Văn kiện:
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => handleSelectPredefinedSource(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-red-800 outline-none"
                >
                  {taiLieu.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.tieu_de}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Editable Input Texts */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tiêu đề định hướng:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ví dụ: LỜI BÁC DẠY: TRUNG VỚI ĐẢNG - HIẾU VỚI DÂN"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-red-800 outline-none font-semibold text-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nội dung chính / Văn bản cần cô đọng:
                </label>
                <textarea
                  rows={4}
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Dán nội dung chỉ thị, bài giảng hoặc câu trích lời Bác dạy vào đây..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-red-800 outline-none font-sans text-stone-700"
                />
              </div>
            </div>

            {/* Step 2: Choose Authentic Vietnam People's Army Officer Art */}
            <div className="space-y-2 border-t border-stone-200 pt-4">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wide block flex items-center justify-between">
                <span>2. Chọn Hình ảnh Sĩ quan QĐND Việt Nam (AI Tạo):</span>
                <span className="text-[10px] text-amber-700 font-semibold lowercase">4 mẫu đặc trưng</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {AI_OFFICER_IMAGES.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedVisualId(img.id);
                      if (currentDraft) handleChangeDraftVisual(img.id);
                    }}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-1.5 ${
                      selectedVisualId === img.id
                        ? 'border-red-800 bg-red-50/50 shadow-md ring-2 ring-red-700/20'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                      <img
                        src={img.duong_dan}
                        alt={img.ten_hinh_anh}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {selectedVisualId === img.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 px-1">
                      <span className="text-[11px] font-bold text-stone-800 block line-clamp-1">
                        {img.ten_hinh_anh}
                      </span>
                      <span className="text-[10px] text-stone-500 line-clamp-1">
                        {img.dac_trung}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Layout Style & Color Theme */}
            <div className="grid grid-cols-2 gap-3 border-t border-stone-200 pt-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Bố cục trình bày:
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => {
                    const st = e.target.value as any;
                    setSelectedStyle(st);
                    if (currentDraft) handleUpdateDraftField('bo_cuc', st);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="ap_phich_co_dong">Áp phích Cổ động (Poster A4)</option>
                  <option value="infographic_hien_dai">Infographic Hiện đại</option>
                  <option value="so_tay_bo_tui">Sổ tay Bỏ túi Chiến sĩ</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tông màu chủ đạo:
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => {
                    const c = e.target.value as any;
                    setSelectedColor(c);
                    if (currentDraft) handleUpdateDraftField('mau_sac', c);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="do_vang">Đỏ Cờ - Vàng Sao</option>
                  <option value="xanh_quan_doi">Xanh Áo Lính Ô-liu</option>
                  <option value="do_sam">Đỏ Sẫm Truyền Thống</option>
                </select>
              </div>
            </div>

            {/* Unit name & Editor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Tên đơn vị áp dụng:
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => {
                    setUnitName(e.target.value);
                    if (currentDraft) handleUpdateDraftField('don_vi_ap_dung', e.target.value);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Cán bộ biên tập:
                </label>
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => {
                    setEditorName(e.target.value);
                    if (currentDraft) handleUpdateDraftField('nguoi_bien_tap', e.target.value);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* AI Action Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleTriggerAIEditorial()}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-800 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-amber-300 animate-spin" />
                    <span>AI Đang Tự Động Biên Tập...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>TỰ ĐỘNG BIÊN TẬP INFOGRAPHIC BẰNG AI</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Interactive Poster Canvas (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Action Bar Above Canvas */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-stone-800">Bản xem trực quan áp phích</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-500">Chuẩn in A4 Quân đội</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentDraft && (
                  <>
                    <button
                      onClick={() => handleSpeakInfographic(currentDraft)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isSpeaking 
                          ? 'bg-amber-500 text-stone-950 font-bold animate-pulse' 
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isSpeaking ? 'Dừng đọc' : 'Nghe đọc'}</span>
                    </button>

                    <button
                      onClick={() => handleRegisterQRCode(currentDraft)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 transition-colors"
                      title="Tạo mã QR dán bảng tin đơn vị"
                    >
                      <QrCode className="w-3.5 h-3.5 text-stone-600" />
                      <span>Xuất mã QR</span>
                    </button>

                    <button
                      onClick={() => handleDownloadInfographicPNG(currentDraft)}
                      disabled={isDownloadingImage}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-stone-600" />
                      <span>Tải PNG</span>
                    </button>

                    <button
                      onClick={handlePrintPoster}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-800 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>In Áp phích A4</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Poster Canvas Preview Container */}
            {currentDraft ? (
              <div 
                ref={posterRef}
                className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all border-4 ${
                  currentDraft.mau_sac === 'xanh_quan_doi'
                    ? 'bg-gradient-to-b from-[#1c281a] via-[#141d13] to-[#0b110a] border-amber-600/70'
                    : currentDraft.mau_sac === 'do_sam'
                    ? 'bg-gradient-to-b from-[#3f0c10] via-[#22080a] to-[#110405] border-amber-500/70'
                    : 'bg-gradient-to-b from-[#5a0c13] via-[#38070b] to-[#1a0507] border-amber-500/80'
                }`}
              >
                {/* Gold star corner decorations */}
                <div className="absolute top-2 left-2 text-amber-400 font-bold text-xs select-none">★</div>
                <div className="absolute top-2 right-2 text-amber-400 font-bold text-xs select-none">★</div>
                <div className="absolute bottom-2 left-2 text-amber-400 font-bold text-xs select-none">★</div>
                <div className="absolute bottom-2 right-2 text-amber-400 font-bold text-xs select-none">★</div>

                {/* Inner border line */}
                <div className="border border-amber-400/40 rounded-2xl p-5 sm:p-6 space-y-6">
                  
                  {/* Formal Military Header */}
                  <div className="text-center space-y-1.5 border-b border-amber-500/40 pb-4">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest">
                      <span>★</span>
                      <span>QUÂN ĐỘI NHÂN DÂN VIỆT NAM · BAN CHÍNH TRỊ</span>
                      <span>★</span>
                    </div>
                    <div className="text-xs font-semibold text-stone-300 uppercase">
                      {currentDraft.don_vi_ap_dung || 'TRUNG ĐOÀN 1 · SƯ ĐOÀN 324'}
                    </div>
                    <div className="pt-2">
                      <span className="px-3 py-1 rounded-full bg-red-900/90 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/50">
                        BẢN TIN TRỰC QUAN HÓA GIÁO DỤC CHÍNH TRỊ
                      </span>
                    </div>
                  </div>

                  {/* Main Title & Subtitle */}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-doc text-amber-200 tracking-tight leading-snug drop-shadow-md">
                      {currentDraft.tieu_de}
                    </h2>
                    {currentDraft.tieu_de_phu && (
                      <p className="text-xs sm:text-sm text-stone-300 italic font-sans max-w-xl mx-auto">
                        {currentDraft.tieu_de_phu}
                      </p>
                    )}
                  </div>

                  {/* Action Motto Banner */}
                  <div className="bg-gradient-to-r from-red-950 via-red-800 to-red-950 border border-amber-500/60 p-3 rounded-xl text-center shadow-inner">
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block">
                      {currentDraft.khau_hieu_hanh_dong}
                    </span>
                  </div>

                  {/* Two-Column Showcase: Authentic AI Officer Image + Golden Quote */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Authentic Officer Image */}
                    <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg bg-stone-900 flex flex-col justify-end min-h-[220px]">
                      <img
                        src={currentDraft.hinh_anh_ai.duong_dan}
                        alt={currentDraft.hinh_anh_ai.ten_hinh_anh}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
                      />
                      <div className="relative z-10 p-3 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          ★ {currentDraft.hinh_anh_ai.ten_hinh_anh}
                        </span>
                        <span className="text-[10px] text-stone-300 block line-clamp-1">
                          {currentDraft.hinh_anh_ai.dac_trung}
                        </span>
                      </div>
                    </div>

                    {/* Golden Quote Box */}
                    <div className="sm:col-span-7 bg-stone-900/60 border border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            Lời Bác Hồ dạy:
                          </span>
                          <button
                            onClick={() => handleCopyQuote(currentDraft.trich_dan_bac_ho?.cau_noi || '')}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white border border-stone-700"
                          >
                            {copiedQuote ? 'Đã sao chép!' : 'Chép lời Bác'}
                          </button>
                        </div>

                        <p className="text-sm sm:text-base italic font-serif-doc text-amber-100/95 leading-relaxed pl-3 border-l-2 border-amber-500">
                          "{currentDraft.trich_dan_bac_ho?.cau_noi}"
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-stone-300 border-t border-stone-800 pt-2">
                        {currentDraft.trich_dan_bac_ho?.hoan_canh && (
                          <p className="text-[11px] text-amber-300/80">
                            <strong>Xuất xứ:</strong> {currentDraft.trich_dan_bac_ho.hoan_canh}
                          </p>
                        )}
                        {currentDraft.trich_dan_bac_ho?.y_nghia && (
                          <p className="text-[11px] text-stone-300 line-clamp-2">
                            <strong>Ý nghĩa thực tiễn:</strong> {currentDraft.trich_dan_bac_ho.y_nghia}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Core Pillars Grid (Nội dung chính / Tiêu chí rèn luyện) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        Nội dung cốt lõi & Tiêu chuẩn rèn luyện:
                      </span>
                      <button
                        onClick={handleAddKeyPoint}
                        className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm điểm
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentDraft.cac_diem_chinh.map((pt, idx) => (
                        <div 
                          key={pt.id}
                          className="bg-stone-900/70 border border-stone-700/80 rounded-xl p-3.5 space-y-1.5 relative group hover:border-amber-500/60 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-amber-300 border border-amber-600/40">
                              {pt.badge || `TIÊU CHÍ ${idx + 1}`}
                            </span>
                            <button
                              onClick={() => handleDeleteKeyPoint(idx)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-400 transition-opacity"
                              title="Xóa điểm này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={pt.title}
                            onChange={(e) => handleUpdateKeyPoint(idx, 'title', e.target.value)}
                            className="w-full bg-transparent font-bold text-stone-100 text-xs border-b border-transparent hover:border-stone-600 focus:border-amber-500 outline-none"
                          />

                          <textarea
                            rows={2}
                            value={pt.desc}
                            onChange={(e) => handleUpdateKeyPoint(idx, 'desc', e.target.value)}
                            className="w-full bg-transparent text-[11px] text-stone-300 border-b border-transparent hover:border-stone-600 focus:border-amber-500 outline-none leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Guidelines for Cadres & Soldiers */}
                  <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                      Hành động của cán bộ, chiến sĩ tại đơn vị:
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-200">
                      {currentDraft.phuong_cham_hanh_dong.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0 mt-0.5">★</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                    {currentDraft.loi_the_danh_du && (
                      <p className="text-[11px] text-amber-300 italic pt-1 border-t border-stone-800">
                        Lời thề danh dự: "{currentDraft.loi_the_danh_du}"
                      </p>
                    )}
                  </div>

                  {/* Dignified Footer with Unit Cadre Signature & QR code */}
                  <div className="pt-4 border-t border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="font-bold text-stone-200 block">
                        Cán bộ biên tập: {currentDraft.cap_bac_nguoi_bien_tap || 'Trợ lý Tuyên huấn'} {currentDraft.nguoi_bien_tap}
                      </span>
                      <span className="text-[11px] text-stone-400 block">
                        Đơn vị: {currentDraft.don_vi_ap_dung} · Ngày: {currentDraft.ngay_bien_tap}
                      </span>
                      <span className="text-[10px] text-amber-400/90 block">
                        Hình ảnh sĩ quan QĐND Việt Nam chính quy ve áo đỏ sao vàng
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                        <QrCode className="w-full h-full text-stone-950" />
                      </div>
                      <div className="text-left text-[10px]">
                        <span className="font-bold text-stone-200 block uppercase">Quét mã di động</span>
                        <span className="text-stone-400 block">Đọc nội dung trên LAN</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Sparkles className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="font-bold text-stone-700">Chưa có bản thảo Infographic</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Hãy chọn nguồn bài giảng ở cột bên trái và bấm "Tự động biên tập bằng AI" để hệ thống tạo áp phích trực quan.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 4. FULLSCREEN / PRINT MODAL VIEWER */}
      {modalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-stone-900 rounded-3xl border border-amber-600/60 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="no-print p-4 sm:px-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-stone-100">
                  Xem & In Áp Phích Tuyên Huấn A4
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadInfographicPNG(modalItem)}
                  disabled={isDownloadingImage}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh PNG</span>
                </button>
                <button
                  onClick={handlePrintPoster}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-800 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>In áp phích</span>
                </button>
                <button
                  onClick={() => setModalItem(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: High Resolution Poster */}
            <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto">
              <div 
                ref={modalPosterRef}
                className={`relative rounded-3xl p-8 sm:p-10 text-white border-4 ${
                  modalItem.mau_sac === 'xanh_quan_doi'
                    ? 'bg-gradient-to-b from-[#1c281a] via-[#141d13] to-[#0b110a] border-amber-600'
                    : modalItem.mau_sac === 'do_sam'
                    ? 'bg-gradient-to-b from-[#3f0c10] via-[#22080a] to-[#110405] border-amber-600'
                    : 'bg-gradient-to-b from-[#5a0c13] via-[#38070b] to-[#1a0507] border-amber-500'
                }`}
              >
                <div className="border border-amber-400/40 rounded-2xl p-6 space-y-6">
                  
                  {/* Header */}
                  <div className="text-center space-y-1.5 border-b border-amber-500/40 pb-4">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                      ★ QUÂN ĐỘI NHÂN DÂN VIỆT NAM · BAN CHÍNH TRỊ ★
                    </div>
                    <div className="text-xs font-semibold text-stone-300 uppercase">
                      {modalItem.don_vi_ap_dung || 'TRUNG ĐOÀN 1 · SƯ ĐOÀN 324'}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif-doc text-amber-200">
                      {modalItem.tieu_de}
                    </h2>
                    {modalItem.tieu_de_phu && (
                      <p className="text-sm text-stone-300 italic">{modalItem.tieu_de_phu}</p>
                    )}
                  </div>

                  {/* Slogan */}
                  <div className="bg-red-950 border border-amber-500/60 p-3 rounded-xl text-center">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      {modalItem.khau_hieu_hanh_dong}
                    </span>
                  </div>

                  {/* Officer + Quote */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
                    <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg min-h-[260px]">
                      <img
                        src={modalItem.hinh_anh_ai.duong_dan}
                        alt={modalItem.hinh_anh_ai.ten_hinh_anh}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-amber-300">
                        ★ {modalItem.hinh_anh_ai.ten_hinh_anh}
                      </div>
                    </div>

                    <div className="sm:col-span-7 bg-stone-900/60 border border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-amber-400 block mb-2">
                          Lời Bác Hồ dạy:
                        </span>
                        <p className="text-base sm:text-lg italic font-serif-doc text-amber-100 pl-3 border-l-2 border-amber-500 leading-relaxed">
                          "{modalItem.trich_dan_bac_ho?.cau_noi}"
                        </p>
                      </div>
                      <div className="text-xs text-stone-300 border-t border-stone-800 pt-2 space-y-1">
                        <p><strong>Xuất xứ:</strong> {modalItem.trich_dan_bac_ho?.hoan_canh}</p>
                        <p><strong>Ý nghĩa:</strong> {modalItem.trich_dan_bac_ho?.y_nghia}</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modalItem.cac_diem_chinh.map((pt, i) => (
                      <div key={pt.id} className="bg-stone-900/70 border border-stone-700/80 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-amber-300 border border-amber-600/40">
                          {pt.badge || `TIÊU CHÍ ${i + 1}`}
                        </span>
                        <h4 className="font-bold text-stone-100 text-sm">{pt.title}</h4>
                        <p className="text-xs text-stone-300 leading-relaxed">{pt.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Guidelines */}
                  <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                      Hành động của cán bộ, chiến sĩ tại đơn vị:
                    </span>
                    <ul className="space-y-1 text-xs text-stone-200">
                      {modalItem.phuong_cham_hanh_dong.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">★</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-amber-500/40 flex items-center justify-between text-xs text-stone-400">
                    <div>
                      <span className="font-bold text-stone-200 block">
                        Cán bộ biên tập: {modalItem.cap_bac_nguoi_bien_tap} {modalItem.nguoi_bien_tap}
                      </span>
                      <span>Đơn vị: {modalItem.don_vi_ap_dung} · {modalItem.ngay_bien_tap}</span>
                    </div>

                    {qrCodeDataUrl && (
                      <div className="w-16 h-16 bg-white p-1 rounded-lg">
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full" />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
