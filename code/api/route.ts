import { Redis } from '@upstash/redis';

/** Upstash Redis client (HTTP, stateless). */
const kv = Redis.fromEnv();

export default async function handler(req: any, res: any) {
  /** POST /api/session  – body: { pid: string; data: unknown } */
  if (req.method === 'POST') {
    const { pid, data } = req.body;
    await kv.set(`u:${pid}`, JSON.stringify(data));
    return res.status(200).json({ ok: true });
  }

  /** GET /api/session?pid=ABC-123 – read it back */
  if (req.method === 'GET') {
    const pid = req.query.pid as string | undefined;
    if (!pid) return res.status(400).json({ error: 'pid required' });
    const raw = await kv.get<string>(`u:${pid}`);
    return res.status(200).json({ data: raw ? JSON.parse(raw) : null });
  }

  res.status(405).json({ error: 'method not allowed' });
}
