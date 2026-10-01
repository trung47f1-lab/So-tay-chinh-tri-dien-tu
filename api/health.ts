import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJson, sendError } from './_github';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { data } = await readJson<any>('data/database.json');
    return res.status(200).json({ status: 'ok', storage: 'github', lastUpdated: data.lastUpdated || Date.now(), documentCount: data.taiLieu?.length || 0, questionCount: data.cauHoi?.length || 0, examCount: data.deThi?.length || 0 });
  } catch (err) {
    return sendError(res, err);
  }
}
