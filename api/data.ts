import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, putFile, sendError } from './_github';

const DB_PATH = 'data/database.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    if (req.method === 'GET') {
      const { data } = await readJson<any>(DB_PATH);
      return res.status(200).json({ success: true, data, lastUpdated: data.lastUpdated || Date.now() });
    }
    if (req.method === 'POST') {
      const { data: current, sha } = await readJson<any>(DB_PATH);
      const payload = req.body || {};
      const updated = { ...current, ...payload, lastUpdated: Date.now() };
      await putFile(DB_PATH, Buffer.from(JSON.stringify(updated, null, 2), 'utf8'), 'Cập nhật dữ liệu Sổ tay chính trị điện tử', sha);
      return res.status(200).json({ success: true, lastUpdated: updated.lastUpdated });
    }
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return sendError(res, err);
  }
}
