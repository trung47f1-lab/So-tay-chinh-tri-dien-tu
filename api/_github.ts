import type { VercelRequest, VercelResponse } from '@vercel/node';

const owner = process.env.GITHUB_OWNER || 'trung47f1-lab';
const repo = process.env.GITHUB_REPO || 'so-tay-chinh-tri-dien-tu-2';
const branch = process.env.GITHUB_BRANCH || 'main';
const token = process.env.GITHUB_TOKEN;

export function repoPath(filePath: string) {
  return filePath.replace(/^\/+/, '').replace(/\\/g, '/');
}

export async function githubApi(path: string, init: RequestInit = {}) {
  if (!token) throw new Error('Thiếu GITHUB_TOKEN trên Vercel.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('X-GitHub-Api-Version', '2022-11-28');
  headers.set('User-Agent', 'so-tay-chinh-tri-dien-tu');
  return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${repoPath(path)}`, { ...init, headers });
}

export async function getFile(filePath: string) {
  const res = await githubApi(filePath + `?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${filePath}: ${res.status} ${await res.text()}`);
  return await res.json() as { content?: string; sha: string; download_url?: string; path: string };
}

export async function readJson<T = any>(filePath: string): Promise<{ data: T; sha: string }> {
  const file = await getFile(filePath);
  if (!file?.content) throw new Error(`Không tìm thấy ${filePath} trên GitHub.`);
  const content = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return { data: JSON.parse(content), sha: file.sha };
}

export async function putFile(filePath: string, bytes: Buffer, message: string, sha?: string) {
  const body: any = {
    message,
    content: bytes.toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await githubApi(filePath, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${filePath}: ${res.status} ${await res.text()}`);
  return await res.json();
}

export function sendError(res: VercelResponse, err: any) {
  console.error(err);
  return res.status(500).json({ success: false, error: err?.message || 'Lỗi máy chủ.' });
}
