import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, sendError } from './_github';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const { data } = await readJson<any>('data/database.json');
    return res.status(200).json({ success: true, lastUpdated: data.lastUpdated || Date.now(), documentCount: Array.isArray(data.taiLieu) ? data.taiLieu.length : 0 });
  } catch (err) {
    return sendError(res, err);
  }
}
