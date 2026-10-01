import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
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
} from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents');
const MEDIA_DIR = path.join(UPLOADS_DIR, 'media');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const QUESTIONS_DIR = path.join(UPLOADS_DIR, 'questions');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure all storage directories exist
[DATA_DIR, UPLOADS_DIR, DOCUMENTS_DIR, MEDIA_DIR, IMAGES_DIR, QUESTIONS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface DatabaseSchema {
  chuyenDe: any[];
  taiLieu: any[];
  cauHoi: any[];
  deThi: any[];
  ketQua: any[];
  noiDungHangNgay: any[];
  mocTruyenThong: any[];
  qrCodes: any[];
  baiHat: any[];
  video: any[];
  nhatKy: any[];
  infographics: any[];
  adminAccount: {
    taiKhoan: string;
    matKhau: string;
    hoTen: string;
    capBac: string;
    chucVu: string;
    donVi: string;
  };
  lastUpdated: number;
}

function getInitialDatabase(): DatabaseSchema {
  return {
    chuyenDe: CHUYEN_DE_INITIAL,
    taiLieu: TAI_LIEU_INITIAL,
    cauHoi: CAU_HOI_INITIAL,
    deThi: DE_THI_INITIAL,
    ketQua: KET_QUA_INITIAL,
    noiDungHangNgay: NOI_DUNG_HANG_NGAY_INITIAL,
    mocTruyenThong: MOC_TRUYEN_THONG_INITIAL,
    qrCodes: QR_CODE_INITIAL,
    baiHat: BAI_HAT_INITIAL,
    video: VIDEO_INITIAL,
    nhatKy: NHAT_KY_INITIAL,
    infographics: INFOGRAPHIC_INITIAL,
    adminAccount: {
      taiKhoan: 'admin',
      matKhau: 'admin123',
      hoTen: 'Quản trị viên Hệ thống',
      capBac: 'Thiếu tá',
      chucVu: 'Trợ lý Tuyên huấn - Quản trị',
      donVi: 'Ban Chính trị Trung đoàn'
    },
    lastUpdated: Date.now()
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.taiLieu)) {
        if (!Array.isArray(parsed.infographics) || parsed.infographics.length === 0) {
          parsed.infographics = INFOGRAPHIC_INITIAL;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database.json, initializing default:', err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    data.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database.json:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ------------------- API ROUTES -------------------

  // Health check & status
  app.get('/api/health', (req, res) => {
    const db = loadDatabase();
    res.json({
      status: 'ok',
      lastUpdated: db.lastUpdated,
      documentCount: db.taiLieu.length,
      questionCount: db.cauHoi.length,
      examCount: db.deThi.length
    });
  });

  // Get full synchronized database
  app.get('/api/data', (req, res) => {
    try {
      const db = loadDatabase();
      res.json({
        success: true,
        data: db,
        lastUpdated: db.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Check sync version / timestamp
  app.get('/api/version', (req, res) => {
    try {
      const db = loadDatabase();
      res.json({
        success: true,
        lastUpdated: db.lastUpdated,
        documentCount: db.taiLieu.length
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Update full database or specific collection
  app.post('/api/data', (req, res) => {
    try {
      const current = loadDatabase();
      const payload = req.body;

      // Merge payload
      const updated: DatabaseSchema = {
        ...current,
        ...payload,
        lastUpdated: Date.now()
      };

      const saved = saveDatabase(updated);
      if (saved) {
        res.json({ success: true, lastUpdated: updated.lastUpdated });
      } else {
        res.status(500).json({ success: false, error: 'Không thể ghi tệp nguồn database.json' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Upload ANY file (Word, PDF, Audio, Video, Image, Questions) to disk source files
  app.post('/api/upload-file', (req, res) => {
    try {
      const { fileName, fileData, fileType, folder } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ success: false, error: 'Thiếu tên tệp hoặc dữ liệu tệp.' });
      }

      // fileData can be a data URL (e.g. data:application/...;base64,...) or raw base64
      const matches = fileData.match(/^data:([A-Za-z0-9\-+\/.]+);base64,(.+)$/);
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }

      // Determine target subdirectory
      let targetSubDir = 'documents';
      if (folder) {
        targetSubDir = folder;
      } else if (fileType === 'audio' || fileName.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
        targetSubDir = 'media';
      } else if (fileType === 'video' || fileName.match(/\.(mp4|webm|mov|mkv)$/i)) {
        targetSubDir = 'media';
      } else if (fileType === 'image' || fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        targetSubDir = 'images';
      } else if (fileType === 'questions' || folder === 'questions') {
        targetSubDir = 'questions';
      } else {
        targetSubDir = 'documents';
      }

      const targetDir = path.join(UPLOADS_DIR, targetSubDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Generate clean safe filename with timestamp prefix
      const ext = path.extname(fileName) || (fileType === 'word' ? '.docx' : fileType === 'pdf' ? '.pdf' : '.bin');
      const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
      const safeFileName = `${Date.now()}_${baseName}${ext}`;
      const filePath = path.join(targetDir, safeFileName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${targetSubDir}/${safeFileName}`;
      res.json({
        success: true,
        fileUrl,
        fileName: safeFileName,
        originalName: fileName,
        fileSize: buffer.length,
        folder: targetSubDir
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ------------------- AI EDITORIAL INFOGRAPHIC API -------------------
  app.post('/api/ai/editorial-infographic', async (req, res) => {
    try {
      const { 
        rawContent = '', 
        title = '', 
        sourceType = 'chuyen_de', 
        style = 'ap_phich_co_dong',
        selectedVisualId = '',
        unitName = 'Toàn quân · Đơn vị cơ sở',
        editorName = 'Trợ lý Tuyên huấn'
      } = req.body;

      if (!rawContent && !title) {
        return res.status(400).json({ success: false, error: 'Vui lòng cung cấp nội dung hoặc chuyên đề cần biên tập.' });
      }

      // Default visual selection
      let visual = AI_OFFICER_IMAGES.find(img => img.id === selectedVisualId) || AI_OFFICER_IMAGES[0];

      // Smart rule-based military political editorial extractor (guaranteed fallback)
      const fallbackEditorial = () => {
        const cleanText = (rawContent || title).trim();
        const sentences = cleanText
          .split(/[\n.!?]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 10);

        let extractedQuote = '';
        const quoteMatch = cleanText.match(/["“]([^"”]+)["”]/);
        if (quoteMatch && quoteMatch[1]) {
          extractedQuote = quoteMatch[1];
        } else if (sentences.length > 0) {
          extractedQuote = sentences[0];
        } else {
          extractedQuote = 'Quân đội ta trung với Đảng, hiếu với dân, sẵn sàng chiến đấu hy sinh vì độc lập tự do của Tổ quốc.';
        }

        const mainTitle = title.trim() 
          ? title.trim().toUpperCase() 
          : `CHUYÊN ĐỀ TUYÊN HUẤN: ${sentences[0]?.slice(0, 45) || 'PHÁT HUY PHẨM CHẤT BỘ ĐỘI CỤ HỒ'}`;

        const points: any[] = [];
        const pointBadges = ['TRỌNG TÂM 1', 'TRỌNG TÂM 2', 'TRỌNG TÂM 3', 'TRỌNG TÂM 4'];
        const candidates = sentences.slice(1, 6);

        if (candidates.length >= 2) {
          candidates.slice(0, 4).forEach((sent: string, idx: number) => {
            const words = sent.split(' ');
            const pTitle = words.slice(0, 6).join(' ');
            const pDesc = words.length > 6 ? words.slice(6).join(' ') : sent;
            points.push({
              id: `p-${Date.now()}-${idx}`,
              order: idx + 1,
              title: pTitle.charAt(0).toUpperCase() + pTitle.slice(1),
              desc: pDesc || sent,
              badge: pointBadges[idx] || `TIÊU CHÍ ${idx + 1}`
            });
          });
        }

        if (points.length < 3) {
          points.push(
            {
              id: `p-${Date.now()}-1`,
              order: 1,
              title: 'Kiên định Bản lĩnh Chính trị',
              desc: 'Tuyệt đối trung thành với Đảng, Tổ quốc và Nhân dân; giữ vững lập trường cách mạng trong mọi hoàn cảnh.',
              badge: 'BẢN LĨNH THÉP'
            },
            {
              id: `p-${Date.now()}-2`,
              order: 2,
              title: 'Giữ nghiêm Kỷ luật & Tác phong',
              desc: 'Thực hiện nghiêm 10 Lời thề danh dự, 12 Điều kỷ luật; duy trì nền nếp chính quy, đoàn kết gắn bó.',
              badge: 'KỶ LUẬT SẮT'
            },
            {
              id: `p-${Date.now()}-3`,
              order: 3,
              title: 'Nâng cao Trình độ Huấn luyện',
              desc: 'Tích cực học tập, làm chủ vũ khí trang bị, rèn luyện kỹ chiến thuật và thể lực dẻo dai.',
              badge: 'SẴN SÀNG CHIẾN ĐẤU'
            }
          );
        }

        return {
          tieu_de: mainTitle,
          tieu_de_phu: 'Tóm lược nội dung cốt lõi và hướng dẫn hành động cho cán bộ, chiến sĩ',
          khau_hieu_hanh_dong: 'QUYẾT TÂM THI ĐUA HỌC TỐT, RÈN NGHIÊM, HOÀN THÀNH XUẤT SẮC MỌI NHIỆM VỤ!',
          trich_dan_bac_ho: {
            cau_noi: extractedQuote,
            hoan_canh: 'Tài liệu giáo dục chính trị tại đơn vị cơ sở',
            y_nghia: 'Kim chỉ nam soi sáng tư tưởng và hành động của mỗi quân nhân trong học tập, công tác và sẵn sàng chiến đấu.'
          },
          cac_diem_chinh: points,
          phuong_cham_hanh_dong: [
            'Học đi đôi với hành, lý luận gắn liền với thực tiễn thao trường',
            'Cán bộ nêu gương đi đầu, chiến sĩ noi theo nỗ lực rèn đức luyện tài',
            'Kịp thời phát hiện, biểu dương gương người tốt việc tốt trong đơn vị'
          ],
          chi_tieu_thi_dua: '100% quân số hoàn thành tốt nhiệm vụ chính trị, phân đội an toàn tuyệt đối',
          loi_the_danh_du: 'Nhiệm vụ nào cũng hoàn thành, khó khăn nào cũng vượt qua, kẻ thù nào cũng đánh thắng. Xin thề!',
          recommendedVisualId: visual.id
        };
      };

      let editorialResult = null;

      // Try Gemini API if API key is provided
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI();
          const prompt = `Bạn là Trợ lý Tuyên huấn giàu kinh nghiệm của Quân đội nhân dân Việt Nam.
Hãy tự động biên tập và cô đọng nội dung chuyên đề chính trị / Lời Bác Hồ dạy sau đây thành một bản INFOGRAPHIC TUYÊN HUẤN chuyên nghiệp, trực quan, có tính giáo dục và truyền cảm hứng cao cho cán bộ, chiến sĩ tại đơn vị cơ sở.

Tiêu đề gợi ý: "${title}"
Nguồn: "${sourceType}"
Nội dung gốc:
"""
${rawContent}
"""

Yêu cầu xuất ra định dạng JSON thuần túy (không bọc trong markdown codeblock khác ngoài json):
{
  "tieu_de": "TIÊU ĐỀ IN HOA ĐANH THÉP, SÚC TÍCH (dưới 12 từ)",
  "tieu_de_phu": "Phụ đề nêu bật ý nghĩa (dưới 20 từ)",
  "khau_hieu_hanh_dong": "KHẨU HIỆU HÀNH ĐỘNG IN HOA ĐẦY KHÍ THẾ CHIẾN ĐẤU CỦA QĐND VIỆT NAM (có dấu chấm than)",
  "trich_dan_bac_ho": {
    "cau_noi": "Trích dẫn nổi bật nhất của Bác Hồ hoặc luận điểm tư tưởng cốt lõi",
    "hoan_canh": "Xuất xứ / Bối cảnh lịch sử",
    "y_nghia": "Ý nghĩa hành động thực tiễn cho người chiến sĩ hôm nay"
  },
  "cac_diem_chinh": [
    {
      "order": 1,
      "title": "Tiêu đề ngắn điểm 1",
      "desc": "Giải thích cô đọng 1-2 câu dễ hiểu, dễ nhớ",
      "badge": "TIÊU CHUẨN 1"
    },
    {
      "order": 2,
      "title": "Tiêu đề ngắn điểm 2",
      "desc": "Giải thích cô đọng 1-2 câu",
      "badge": "TIÊU CHUẨN 2"
    },
    {
      "order": 3,
      "title": "Tiêu đề ngắn điểm 3",
      "desc": "Giải thích cô đọng 1-2 câu",
      "badge": "TIÊU CHUẨN 3"
    },
    {
      "order": 4,
      "title": "Tiêu đề ngắn điểm 4",
      "desc": "Giải thích cô đọng 1-2 câu",
      "badge": "TIÊU CHUẨN 4"
    }
  ],
  "phuong_cham_hanh_dong": [
    "Phương châm hành động cụ thể 1",
    "Phương châm hành động cụ thể 2",
    "Phương châm hành động cụ thể 3"
  ],
  "chi_tieu_thi_dua": "Chỉ tiêu thi đua rèn luyện tại đại đội/tiểu đoàn",
  "loai_the_danh_du": "Lời thề danh dự hoặc lời thề quyết tâm của quân nhân",
  "recommendedVisualId": "img-officer-lecture"
}
Lưu ý: recommendedVisualId chỉ được chọn 1 trong 4 giá trị: "img-officer-lecture", "img-officer-troops", "img-officer-salute", "img-officer-research".`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          if (response && response.text) {
            editorialResult = JSON.parse(response.text);
          }
        } catch (aiErr: any) {
          console.warn('[AI Editorial] Gemini API call skipped or errored, using high-fidelity fallback engine:', aiErr.message);
        }
      }

      if (!editorialResult) {
        editorialResult = fallbackEditorial();
      }

      // Re-verify visual
      if (editorialResult.recommendedVisualId && !selectedVisualId) {
        const found = AI_OFFICER_IMAGES.find(img => img.id === editorialResult.recommendedVisualId);
        if (found) visual = found;
      }

      // Assemble final Infographic Item
      const newInfographic = {
        id: `info-${Date.now()}`,
        tieu_de: editorialResult.tieu_de || title.toUpperCase() || 'INFOGRAPHIC CHÍNH TRỊ CƠ SỞ',
        tieu_de_phu: editorialResult.tieu_de_phu || 'Biên tập tự động hóa phục vụ cán bộ, chiến sĩ',
        loai_nguon: sourceType,
        trich_dan_bac_ho: editorialResult.trich_dan_bac_ho,
        khau_hieu_hanh_dong: editorialResult.khau_hieu_hanh_dong,
        cac_diem_chinh: editorialResult.cac_diem_chinh || [],
        phuong_cham_hanh_dong: editorialResult.phuong_cham_hanh_dong || [],
        chi_tieu_thi_dua: editorialResult.chi_tieu_thi_dua,
        loi_the_danh_du: editorialResult.loi_the_danh_du || editorialResult.loai_the_danh_du,
        hinh_anh_ai: {
          id: visual.id,
          duong_dan: visual.duong_dan,
          ten_hinh_anh: visual.ten_hinh_anh,
          mo_ta: visual.mo_ta,
          tac_gia_ai: visual.tac_gia_ai,
          dac_trung: visual.dac_trung
        },
        don_vi_ap_dung: unitName,
        ngay_bien_tap: new Date().toISOString().split('T')[0],
        nguoi_bien_tap: editorName,
        cap_bac_nguoi_bien_tap: 'Trợ lý Tuyên huấn',
        mau_sac: style === 'ap_phich_co_dong' ? 'do_vang' : style === 'infographic_hien_dai' ? 'xanh_quan_doi' : 'do_sam',
        bo_cuc: style,
        so_luot_xem: 1
      };

      // Also persist to current in-memory database
      const db = loadDatabase();
      if (!Array.isArray(db.infographics)) {
        db.infographics = [];
      }
      db.infographics.unshift(newInfographic);
      saveDatabase(db);

      res.json({
        success: true,
        infographic: newInfographic,
        availableVisuals: AI_OFFICER_IMAGES
      });

    } catch (err: any) {
      console.error('Editorial error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct download routes for project source code export (no UI modifications)
  const handleDownloadProjectZip = (_req: express.Request, res: express.Response) => {
    const candidates = [
      path.resolve(UPLOADS_DIR, 'so-tay-chinh-tri-project.zip'),
      path.resolve(__dirname, 'public', 'so-tay-chinh-tri-project.zip'),
      path.resolve(UPLOADS_DIR, 'so-tay-chinh-tri-dien-tu-source.zip'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="so-tay-chinh-tri-dien-tu-source.zip"');
        return res.sendFile(p);
      }
    }
    res.status(404).send('Tệp dự án chưa sẵn sàng. Vui lòng liên hệ quản trị viên.');
  };

  app.get('/api/export-project', handleDownloadProjectZip);
  app.get('/api/download-project', handleDownloadProjectZip);
  app.get('/export-project.zip', handleDownloadProjectZip);
  app.get('/download-project.zip', handleDownloadProjectZip);

  // ------------------- FRONTEND SERVING -------------------
  if (!isProduction) {
    // Development mode: mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[So Tay Chinh Tri] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
