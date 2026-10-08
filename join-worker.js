// badblood.company worker: static assets + the private /join application API (8 Oct 2026).
// Routes handled here (run_worker_first): /api/join (POST), /api/join/admin|export (RM only, ?k=ADMIN_KEY), /careers → /join. Everything else = ASSETS.
// Stores applications in D1 (binding DB). Never emails or forwards anything. Rows older than 183 days are purged by the daily cron (PDPA: 6 months).
const ROLES = ['01', '02', '03', '04', '05'];
const ORIGINS = ['https://badblood.company', 'https://www.badblood.company'];
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex', ...h } });
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const cleanMulti = (v, n) => String(v ?? '').replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, n);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const eq = (a, b) => { a = String(a || ''); b = String(b || ''); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };
const adminOk = (url, env) => !!env.ADMIN_KEY && eq(url.searchParams.get('k'), env.ADMIN_KEY);

export function validate(b) {
  if (!b || typeof b !== 'object') return { error: 'bad_request' };
  const name = clean(b.name, 80), nickname = clean(b.nickname, 30), phone = clean(b.phone, 20), contact = clean(b.contact, 80), intro = cleanMulti(b.intro, 600);
  const age = Number.parseInt(b.age, 10);
  const roles = [...new Set(Array.isArray(b.roles) ? b.roles.map(String) : [])].filter(r => ROLES.includes(r));
  let portfolio = clean(b.portfolio, 300);
  if (name.length < 2) return { error: 'name', message: 'กรุณากรอกชื่อ-นามสกุล' };
  if (nickname.length < 1) return { error: 'nickname', message: 'กรุณากรอกชื่อเล่น' };
  if (!(age >= 15 && age <= 70)) return { error: 'age', message: 'กรุณากรอกอายุให้ถูกต้อง' };
  if (roles.length < 1 || roles.length > 2) return { error: 'roles', message: 'เลือกตำแหน่งได้ 1–2 ตำแหน่ง' };
  if (!/^[0-9+()\s-]{9,20}$/.test(phone) || phone.replace(/\D/g, '').length < 9) return { error: 'phone', message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' };
  if (contact.length < 2) return { error: 'contact', message: 'กรุณากรอก LINE ID หรือ IG' };
  if (portfolio) { try { const u = new URL(portfolio.startsWith('http') ? portfolio : 'https://' + portfolio); if (!/^https?:$/.test(u.protocol)) throw 0; portfolio = u.href.slice(0, 300); } catch { return { error: 'portfolio', message: 'ลิงก์ผลงานไม่ถูกต้อง' }; } }
  if (intro.length < 10) return { error: 'intro', message: 'กรุณาแนะนำตัวสั้นๆ (ประมาณ 3 บรรทัด)' };
  if (b.consent !== true) return { error: 'consent', message: 'กรุณาให้ความยินยอมก่อนส่งใบสมัคร' };
  return { ok: { name, nickname, age, roles: roles.sort(), phone, contact, portfolio, intro } };
}

async function submit(req, env) {
  const origin = req.headers.get('origin');
  if (origin && !ORIGINS.includes(origin) && !/^https:\/\/[a-z0-9-]+\.hi-badblood\.workers\.dev$/.test(origin)) return J({ ok: false, error: 'origin' }, 403);
  if (!/^application\/json\b/i.test(req.headers.get('content-type') || '')) return J({ ok: false, error: 'content_type' }, 415);
  const raw = await req.text(); if (raw.length > 8000) return J({ ok: false, error: 'too_large' }, 413);
  let body; try { body = JSON.parse(raw); } catch { return J({ ok: false, error: 'bad_json' }, 400); }
  // spam guard 1: honeypot (real people never see this field) → pretend success, store nothing
  if (clean(body?.company_site, 50)) return J({ ok: true });
  // spam guard 2: a form filled in under 3 seconds is a script
  const t = Number(body?.t); if (Number.isFinite(t) && Date.now() - t < 3000) return J({ ok: false, error: 'too_fast', message: 'กรุณาลองอีกครั้ง' }, 429);
  const v = validate(body); if (!v.ok) return J({ ok: false, error: v.error, message: v.message || 'ข้อมูลไม่ถูกต้อง' }, 400);
  const a = v.ok, now = Date.now();
  const ip = req.headers.get('cf-connecting-ip') || 'unknown';
  const iph = await sha(ip + '|' + (env.IP_SALT || 'bb-join'));
  // spam guard 3: rate limit per IP (5 per hour, 15 per day)
  const hr = await env.DB.prepare('SELECT COUNT(*) c FROM join_rl WHERE ip_hash=? AND at>?').bind(iph, now - 3600e3).first();
  const dy = await env.DB.prepare('SELECT COUNT(*) c FROM join_rl WHERE ip_hash=? AND at>?').bind(iph, now - 86400e3).first();
  if ((hr?.c || 0) >= 5 || (dy?.c || 0) >= 15) return J({ ok: false, error: 'rate', message: 'ส่งบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, 429, { 'retry-after': '3600' });
  // same phone twice within 24h = already received (idempotent)
  const dup = await env.DB.prepare('SELECT id FROM applications WHERE phone=? AND created_at>?').bind(a.phone.replace(/\D/g, ''), now - 86400e3).first();
  await env.DB.prepare('INSERT INTO join_rl(ip_hash,at) VALUES(?,?)').bind(iph, now).run();
  if (dup) return J({ ok: true, duplicate: true });
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO applications(id,created_at,name,nickname,age,roles,phone,contact,portfolio,intro,consent_at,ip_hash,ua) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, now, a.name, a.nickname, a.age, JSON.stringify(a.roles), a.phone.replace(/\D/g, ''), a.contact, a.portfolio || null, a.intro, now, iph, clean(req.headers.get('user-agent'), 120)).run();
  return J({ ok: true });
}

async function admin(url, env) {
  if (!env.ADMIN_KEY) return J({ error: 'not_configured' }, 503);
  if (!adminOk(url, env)) return J({ error: 'forbidden' }, 403);
  const rows = (await env.DB.prepare('SELECT id,created_at,name,nickname,age,roles,phone,contact,portfolio,intro FROM applications ORDER BY created_at DESC LIMIT 1000').all()).results || [];
  const fmt = url.pathname.endsWith('/export') ? (url.searchParams.get('format') || 'json') : 'html';
  if (fmt === 'json') return J({ count: rows.length, rows });
  if (fmt === 'csv') {
    const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const cols = ['created_at', 'name', 'nickname', 'age', 'roles', 'phone', 'contact', 'portfolio', 'intro'];
    return new Response('﻿' + cols.join(',') + '\n' + rows.map(r => cols.map(c => q(c === 'created_at' ? new Date(r[c]).toISOString() : r[c])).join(',')).join('\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="applications.csv"', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
  }
  const tr = rows.map(r => `<tr><td>${esc(new Date(r.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }))}</td><td><b>${esc(r.name)}</b><br>${esc(r.nickname)} · ${esc(r.age)}</td><td>${esc(JSON.parse(r.roles).join(', '))}</td><td>${esc(r.phone)}<br>${esc(r.contact)}</td><td>${r.portfolio ? `<a href="${esc(r.portfolio)}" rel="noopener noreferrer">link</a>` : ''}</td><td>${esc(r.intro).replace(/\n/g, '<br>')}</td></tr>`).join('');
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Applications</title><style>body{font:14px/1.5 system-ui,'Noto Sans Thai',sans-serif;margin:16px;color:#1d1d1f}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:8px;vertical-align:top;text-align:left}th{font-size:12px;color:#86868b}</style><h1>Applications · ${rows.length}</h1><p>CSV / JSON: /api/join/export?k=…&amp;format=csv</p><table><tr><th>เวลา</th><th>ผู้สมัคร</th><th>ตำแหน่ง</th><th>ติดต่อ</th><th>ผลงาน</th><th>แนะนำตัว</th></tr>${tr}</table>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'", 'referrer-policy': 'no-referrer' } });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), p = url.pathname.replace(/\/+$/, '') || '/';
    if (p === '/careers') return Response.redirect(url.origin + '/join', 302);
    if (p.startsWith('/api/')) {
      try {
        if (p === '/api/join' && req.method === 'POST') return await submit(req, env);
        if ((p === '/api/join/admin' || p === '/api/join/export') && req.method === 'GET') return await admin(url, env);
      } catch { return J({ ok: false, error: 'temporarily_unavailable', message: 'ระบบขัดข้อง กรุณาลองอีกครั้ง' }, 503); }
      return J({ error: 'not_found' }, 404);
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(_e, env) { await env.DB.prepare('DELETE FROM applications WHERE created_at<?').bind(Date.now() - 183 * 86400e3).run(); await env.DB.prepare('DELETE FROM join_rl WHERE at<?').bind(Date.now() - 2 * 86400e3).run(); }
};
