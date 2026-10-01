import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFile, putFile, sendError } from './_github';

function safeName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1EA0-\u1EF9.]/g, '_');
  return `${Date.now()}_${base}`;
}

function chooseFolder(fileName: string, fileType?: string, folder?: string) {
  if (folder) return folder.replace(/[^a-zA-Z0-9_-]/g, '');
  if (fileType === 'audio' || /\.(mp3|wav|ogg|m4a|aac)$/i.test(fileName)) return 'media';
  if (fileType === 'video' || /\.(mp4|webm|mov|mkv)$/i.test(fileName)) return 'media';
  if (fileType === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) return 'images';
  if (fileType === 'questions') return 'questions';
  return 'documents';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
    const { fileName, fileData, fileType, folder } = req.body || {};
    if (!fileName || !fileData) return res.status(400).json({ success: false, error: 'Thiếu tên tệp hoặc dữ liệu tệp.' });

    const match = String(fileData).match(/^data:[^;]+;base64,(.+)$/s);
    const raw = match ? match[1] : String(fileData);
    const buffer = Buffer.from(raw, 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Tệp vượt quá 4 MB khi tải qua API Vercel. Với tệp lớn cần chuyển sang Vercel Blob/Supabase Storage.' });
    }

    const subDir = chooseFolder(String(fileName), fileType, folder);
    const storedName = safeName(String(fileName));
    const repoFile = `public/uploads/${subDir}/${storedName}`;
    await putFile(repoFile, buffer, `Tải lên tệp ${String(fileName)}`);

    // Raw GitHub URL is immediately usable by other devices and does not depend on Vercel's ephemeral filesystem.
    const owner = process.env.GITHUB_OWNER || 'trung47f1-lab';
    const repo = process.env.GITHUB_REPO || 'so-tay-chinh-tri-dien-tu-2';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoFile}`;

    return res.status(200).json({ success: true, fileUrl, fileName: storedName, originalName: fileName, fileSize: buffer.length, folder: subDir });
  } catch (err) {
    return sendError(res, err);
  }
}
