import { redis } from '../../lib/kv';
import { NextResponse } from 'next/server';

/** POST /api/session  – body: { pid: string; data: unknown } */
export async function POST(req: Request) {
  console.log("POST /api/session called");
  const { pid, data } = await req.json();

  // store the whole JSON blob under one key, e.g. u:ABC-123
  await redis.set(`u:${pid}`, JSON.stringify(data));

  /*  ── optional extras ───────────────────────────────
      • TTL: await kv.set(`u:${pid}`, JSON.stringify(data), { ex: 60*60*24 })
      • JSON commands: await kv.json.set(`u:${pid}`, '$', data)
  ───────────────────────────────────────────────────── */
  return NextResponse.json({ ok: true });
}

/** GET /api/session?pid=ABC-123 – read it back */
export async function GET(req: Request) {
  console.log("GET /api/session called");
  const pid = new URL(req.url).searchParams.get('pid');
  if (!pid) return NextResponse.json({ error: 'pid required' }, { status: 400 });

  const raw = await redis.get<string>(`u:${pid}`);
  return NextResponse.json({ data: raw ? JSON.parse(raw) : null });
}
