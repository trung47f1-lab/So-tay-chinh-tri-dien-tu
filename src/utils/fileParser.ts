import mammoth from 'mammoth';
import { CauHoi } from '../types';

export interface ParsedQuestionItem {
  id: string;
  noi_dung: string;
  cac_dap_an: string[];
  dap_an_dung: number; // 0: A, 1: B, 2: C, 3: D
  giai_thich: string;
  muc_do: 'co_ban' | 'nang_cao';
  chuyen_de_id: string;
}

/**
 * Đọc file dưới dạng Data URL (dùng để lưu trữ tệp đính kèm hoặc xem trước)
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Đọc file văn bản thuần
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file, 'utf-8');
  });
};

/**
 * Trích xuất nội dung văn bản từ tệp Word (.docx) bằng Mammoth
 */
export const extractTextFromWord = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Lỗi giải nén tệp docx bằng mammoth:', error);
    // Fallback: nếu giải nén thất bại, thử đọc dạng text thông thường
    return await readFileAsText(file);
  }
};

/**
 * Trích xuất nội dung văn bản thô từ tệp PDF (quét stream text trong PDF)
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawStr = decoder.decode(arrayBuffer);
    
    // Tìm các khối text trong PDF theo cú pháp PDF stream: BT (Begin Text) ... ET (End Text)
    // hoặc các chuỗi trong ngoặc đơn (text) Tj
    const textPieces: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(rawStr)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        textPieces.push(match[1]);
      }
    }
    
    if (textPieces.length > 5) {
      return textPieces.join(' ');
    }
    
    // Nếu PDF mã hóa nén FlateDecode không lấy được trực tiếp bằng regex, trả về thông báo để người dùng xem tệp đính kèm
    return `[Tệp PDF: ${file.name} - Dung lượng: ${(file.size / 1024).toFixed(1)} KB. Tệp PDF đã được đính kèm thành công vào hệ thống để đọc và tải về].`;
  } catch (err) {
    console.warn('Lỗi đọc nội dung PDF thô:', err);
    return `[Tệp PDF: ${file.name}]`;
  }
};

/**
 * Trích xuất văn bản từ bất kỳ loại file văn bản (Word .docx, PDF .pdf, Text .txt, Markdown)
 */
export const extractTextFromFile = async (file: File): Promise<{
  text: string;
  fileType: 'word' | 'pdf' | 'text' | 'khac';
  fileName: string;
  fileSize: number;
  dataUrl?: string;
}> => {
  const fileName = file.name;
  const fileSize = file.size;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let fileType: 'word' | 'pdf' | 'text' | 'khac' = 'khac';

  if (ext === 'docx' || ext === 'doc') {
    fileType = 'word';
    text = await extractTextFromWord(file);
  } else if (ext === 'pdf') {
    fileType = 'pdf';
    text = await extractTextFromPdf(file);
  } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'json') {
    fileType = 'text';
    text = await readFileAsText(file);
  } else {
    fileType = 'khac';
    text = await readFileAsText(file).catch(() => '');
  }

  // Luôn tạo dataUrl để có thể tải về hoặc xem nguyên bản
  const dataUrl = await readFileAsDataURL(file).catch(() => undefined);

  return {
    text: text.trim(),
    fileType,
    fileName,
    fileSize,
    dataUrl
  };
};

/**
 * Phân tích nội dung văn bản thành danh sách câu hỏi trắc nghiệm
 * Hỗ trợ các định dạng:
 * Câu 1: [Nội dung]
 * A. ...
 * B. ...
 * C. ...
 * D. ...
 * Đáp án: A
 * Giải thích: ...
 */
export const parseQuestionsFromText = (
  rawText: string,
  targetChuyenDeId: string = 'cd-1',
  defaultMucDo: 'co_ban' | 'nang_cao' = 'co_ban'
): ParsedQuestionItem[] => {
  if (!rawText || !rawText.trim()) return [];

  const questions: ParsedQuestionItem[] = [];

  // Tách văn bản thành các khối câu hỏi dựa trên pattern "Câu 1", "Câu 2", "1.", "1:"
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let currentQuestion: Partial<ParsedQuestionItem> | null = null;
  let currentOptions: string[] = [];
  let detectedCorrectAnswer: number = 0;
  let explanation: string = '';

  const finalizeCurrentQuestion = () => {
    if (currentQuestion && currentQuestion.noi_dung) {
      // Đảm bảo có đủ ít nhất 2 đáp án, nếu thiếu bổ sung đáp án mẫu
      const finalOptions = [...currentOptions];
      while (finalOptions.length < 4) {
        finalOptions.push(`Phương án ${String.fromCharCode(65 + finalOptions.length)}`);
      }

      questions.push({
        id: `ch-upload-${Date.now()}-${questions.length + 1}`,
        noi_dung: currentQuestion.noi_dung.trim(),
        cac_dap_an: finalOptions.slice(0, 4),
        dap_an_dung: Math.min(Math.max(0, detectedCorrectAnswer), 3),
        giai_thich: explanation.trim() || 'Căn cứ chương trình giáo dục chính trị tại đơn vị.',
        muc_do: defaultMucDo,
        chuyen_de_id: targetChuyenDeId
      });
    }

    currentQuestion = null;
    currentOptions = [];
    detectedCorrectAnswer = 0;
    explanation = '';
  };

  // Regex nhận diện đầu câu hỏi: "Câu 1:", "Câu 1.", "1.", "1:", "[Câu 1]"
  const questionStartRegex = /^(?:câu\s*\d+[\s:.-]*|\d+[\s:.-]+)(.*)/i;
  
  // Regex nhận diện phương án: "A.", "A)", "a.", "*A.", "A -", "[x] A."
  const optionRegex = /^(?:[*[\]xX\s]*)([A-Da-d])(?:[.\s):-]+)(.*)/;
  
  // Regex nhận diện đáp án đúng: "Đáp án: A", "Đ/A: B", "Đáp án đúng: C", "Key: D"
  const answerRegex = /^(?:đáp\s*án(?:\s*đúng)?|đ\/a|key|chọn)[\s:.-]*([A-Da-d])/i;
  
  // Regex nhận diện lời giải thích: "Giải thích:", "Căn cứ:", "Lý do:"
  const explanationRegex = /^(?:giải\s*thích|căn\s*cứ|lý\s*do|ghi\s*chú)[\s:.-]*(.*)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Kiểm tra dòng bắt đầu giải thích
    const explMatch = line.match(explanationRegex);
    if (explMatch) {
      explanation = explMatch[1] || '';
      continue;
    }

    // 2. Kiểm tra dòng chỉ rõ đáp án đúng (VD: "Đáp án: B")
    const ansMatch = line.match(answerRegex);
    if (ansMatch) {
      const char = ansMatch[1].toUpperCase();
      const code = char.charCodeAt(0) - 65; // A -> 0, B -> 1, C -> 2, D -> 3
      if (code >= 0 && code <= 3) {
        detectedCorrectAnswer = code;
      }
      continue;
    }

    // 3. Kiểm tra dòng phương án A, B, C, D
    const optMatch = line.match(optionRegex);
    if (optMatch) {
      const char = optMatch[1].toUpperCase();
      const optIdx = char.charCodeAt(0) - 65;
      const optText = optMatch[2]?.trim() || '';

      // Kiểm tra nếu có dấu * hoặc (đúng) đánh dấu đáp án đúng
      if (line.includes('*') || line.toLowerCase().includes('(đúng)') || line.toLowerCase().includes('[x]')) {
        detectedCorrectAnswer = optIdx;
      }

      currentOptions.push(optText);
      continue;
    }

    // 4. Kiểm tra dòng bắt đầu câu hỏi mới
    const qMatch = line.match(questionStartRegex);
    if (qMatch && qMatch[1]?.trim().length > 3) {
      finalizeCurrentQuestion();
      currentQuestion = {
        noi_dung: qMatch[1].trim()
      };
      continue;
    }

    // Nếu không khớp regex nào, nếu đang trong câu hỏi thì nối tiếp nội dung
    if (currentQuestion && currentOptions.length === 0) {
      currentQuestion.noi_dung += ' ' + line;
    } else if (currentOptions.length > 0 && currentOptions.length <= 4 && !line.startsWith('Câu')) {
      // Nối tiếp phương án hiện tại
      currentOptions[currentOptions.length - 1] += ' ' + line;
    }
  }

  // Kết thúc khối câu hỏi cuối cùng
  finalizeCurrentQuestion();

  return questions;
};
