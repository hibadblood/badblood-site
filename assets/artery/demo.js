/* ARTERY · demo shim. The real interface, sample data, nothing connected.
   Every read returns invented content. Every write is refused. */
(function () {
  const D = 86400, H = 3600;
  const OFF = 420; // Bangkok
  const nowS = Math.floor(Date.now() / 1000);
  const t = new Date(Date.now() + OFF * 60000);
  const Y = t.getUTCFullYear(), M = t.getUTCMonth() + 1, TODAY = t.getUTCDate();
  const daysInMonth = new Date(Date.UTC(Y, M, 0)).getUTCDate();
  const at = (d, hh, mm) => Math.floor(Date.UTC(Y, M - 1, Math.min(d, daysInMonth), hh, mm) / 1000) - OFF * 60;
  const P = '/assets/posters/';

  const BRANDS = [
    { id: 'hor', name: 'Hordooduang', color: '#C99A5B', voice: 'Warm, calm, slightly mystical Thai. Always say วอลเปเปอร์ alongside any brand term. Never promise outcomes; speak of พร and ดวง as guidance. Short lines, one ✦ at most.', language: 'th', hashtags: '#หอดูดวง #วอลเปเปอร์ดวง #ดูดวง', drive_folder_id: '1HorDemoFolderIdXXXXXXXX', default_hours: { ig: '08:00', fb: '08:30', yt: '19:00', tt: '19:00' }, channels: { fb: '1001', ig: '2001' }, sort: 1 },
    { id: 'tob', name: 'Tobtan', color: '#3FB36A', voice: 'Plain, confident Thai for shop owners. Concrete benefit first. No hype words, no emoji. Mention tobtan.chat once at most.', language: 'th', hashtags: '#ตอบแทน #LINEOA #ร้านค้า', drive_folder_id: '1TobDemoFolderIdXXXXXXXX', default_hours: { ig: '12:00', fb: '12:00', yt: '19:00', tt: '19:00' }, channels: { fb: '1002', ig: '2002' }, sort: 2 },
    { id: 'rm', name: 'Rule Maker', color: '#0B0B0D', voice: 'English first, cinematic, restrained. No emoji. No hashtags on YouTube. Never call it a series; call it a world.', language: 'en', hashtags: '#RuleMaker #BadBlood #ShortFilm', drive_folder_id: '1RmDemoFolderIdXXXXXXXXX', default_hours: { ig: '19:00', fb: '19:00', yt: '19:00', tt: '19:30' }, channels: { fb: '1003', ig: '2003' }, sort: 3 }
  ];

  // day of month → a post. Past days are published, future days are waiting, scheduled or drafts.
  const PLAN = [
    [2, 'hor', 'Wallpaper · Rahu', '08:00', ['ig', 'fb'], null],
    [4, 'rm', 'Ep.03 — The Lift', '19:00', ['yt', 'ig', 'tt'], 'the-first-chapter'],
    [5, 'tob', 'Owner story · Sol Cafe', '12:00', ['fb', 'ig'], 'grab-th-every-city-has-a-shortcut'],
    [6, 'hor', 'Weekly horoscope', '07:30', ['ig', 'fb'], null],
    [9, 'rm', 'Ep.04 — The Doorman', '19:00', ['yt', 'ig', 'tt'], 'the-eclipse-chapter'],
    [10, 'hor', 'Wallpaper · Ketu', '08:00', ['ig', 'fb'], null],
    [11, 'tob', 'Answers while you sleep', '12:00', ['ig', 'fb'], null],
    [12, 'rm', 'Ep.04 — cut 2 · 9:16', '18:00', ['ig', 'yt'], 'saint-laurent-fashion-film'],
    [13, 'hor', 'Weekly horoscope', '07:30', ['ig', 'fb'], null],
    [16, 'rm', 'Behind Ep.04 · stills', '18:00', ['ig'], 'nike-0-01'],
    [17, 'tob', 'Feature · reads slips', '12:00', ['fb', 'ig'], null],
    [18, 'hor', 'Wallpaper · Saturn', '08:00', ['ig', 'fb'], null],
    [20, 'hor', 'Weekly horoscope', '07:30', ['ig', 'fb'], null],
    [23, 'rm', 'Ep.05 — The Ledger', '19:00', ['yt', 'ig', 'tt'], 'leica-leica-through-our-eyes'],
    [24, 'tob', 'Owner story · Bel-Belt', '12:00', ['fb', 'ig'], 'th-future-thai-future-fantasy'],
    [26, 'rm', 'Ep.05 — cut 2 · 9:16', '18:00', ['ig', 'yt'], 'the-dream-chapter'],
    [27, 'hor', 'Weekly horoscope', '07:30', ['ig', 'fb'], null],
    [30, 'tob', 'Month in numbers', '12:00', ['fb'], null]
  ];
  const CAPS = {
    rm: { ig: 'A doorman who decides who gets in. Nobody asked what he decides for himself.\nEpisode 04 · Rule Maker\n\n#RuleMaker #BadBlood #ShortFilm', fb: 'Episode 04 — The Doorman. A doorman who decides who gets in. Nobody asked what he decides for himself. Full episode on YouTube tonight.', yt: { title: 'Rule Maker — Ep.04 The Doorman', description: 'A doorman who decides who gets in. Nobody asked what he decides for himself.\n\nRule Maker is a world built by Bad Blood Company.\n\n00:00 Cold open\n00:41 The rule\n02:10 The door' }, tt: 'A doorman who decides who gets in. Ep.04 Rule Maker #rulemaker #shortfilm' },
    hor: { ig: 'วอลเปเปอร์ประจำสัปดาห์ วาดจากดวงของคุณเอง มีใบเดียวในโลก\nผูกดวงแรกพบฟรีที่ hordooduang.com ✦\n\n#หอดูดวง #วอลเปเปอร์ดวง', fb: 'วอลเปเปอร์ประจำสัปดาห์ วาดขึ้นจากดวงและพรของคุณ ผูกดวงแรกพบฟรีก่อน แล้วค่อยเลือกแบบที่ใช่', yt: { title: 'หอดูดวง · วอลเปเปอร์ประจำสัปดาห์', description: 'วอลเปเปอร์ที่วาดจากดวงของคุณ' }, tt: 'วอลเปเปอร์จากดวงคุณเอง #หอดูดวง' },
    tob: { ig: 'ลูกค้าทักตอนตีสอง ร้านปิดแล้ว แต่มีคนตอบ\nตอบแทนคุยแทนคุณใน LINE ของร้าน เริ่มฟรีที่ tobtan.chat', fb: 'ลูกค้าทักตอนตีสอง ร้านปิดแล้ว แต่มีคนตอบ ตอบแทนคุยกับลูกค้าใน LINE OA ของร้านแทนคุณ เหมือนคุณตอบเอง เริ่มฟรีที่ tobtan.chat', yt: { title: 'ตอบแทน · ตอบลูกค้าตอนคุณหลับ', description: 'ตอบแทนคุยกับลูกค้าใน LINE OA แทนคุณ' }, tt: 'ร้านปิดแล้วแต่มีคนตอบ #ตอบแทน' }
  };

  const posts = PLAN.map((row, i) => {
    const [d, b, title, hhmm, channels, poster] = row;
    const [hh, mm] = hhmm.split(':').map(Number);
    const when = at(d, hh, mm);
    const past = d < TODAY || (d === TODAY && when < nowS);
    const status = past ? 'live' : (i % 5 === 0 ? 'wait' : i % 5 === 2 ? 'draft' : 'sched');
    const c = CAPS[b];
    const captions = { ig: { text: c.ig }, fb: { text: c.fb }, yt: c.yt, tt: { text: c.tt } };
    const results = {};
    if (past) for (const ch of channels) results[ch] = { id: 'demo', url: ch === 'yt' ? 'https://youtu.be/' : ch === 'ig' ? 'https://instagram.com/' : 'https://facebook.com/', at: when + 60 };
    const metrics = {};
    if (past) for (const ch of channels) {
      const base = ch === 'yt' ? 5200 : ch === 'ig' ? 2400 : ch === 'fb' ? 900 : 500;
      const v = Math.round(base * (0.6 + ((i * 37) % 100) / 100));
      metrics[ch] = { post_id: 'd' + i, channel: ch, views: v, likes: Math.round(v * 0.06), comments: Math.round(v * 0.012), shares: Math.round(v * 0.008), saves: Math.round(v * (b === 'hor' ? 0.05 : 0.01)), reach: Math.round(v * 0.8), fetched_at: nowS };
    }
    return {
      id: 'd' + i, brand_id: b, asset_id: poster ? 'a' + i : null, title, master_caption: c.fb,
      captions, channels, status, publish_at: when, results,
      approved_at: past ? when - H : null, approved_via: past ? 'line' : null, autonomous: 1,
      created_at: when - 2 * D, updated_at: when,
      asset_name: poster ? poster.replace(/-/g, '_').toUpperCase() + '_master.mp4' : null,
      asset_mime: poster ? 'video/mp4' : null, asset_size: poster ? 214000000 : 0,
      asset_thumb: poster ? P + poster + '.webp' : null,
      asset_sidecar: poster ? '[notes.txt]\nCold open on the door. No music until 00:41.' : null,
      drive_file_id: poster ? 'drive_' + i : null, metrics,
      local: fmtLocal(when)
    };
  });
  function fmtLocal(u) { const d = new Date((u + OFF * 60) * 1000); const p = n => String(n).padStart(2, '0'); return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`; }

  const INBOX = [
    { id: 'ig:1', brand_id: 'hor', channel: 'ig', kind: 'comment', post_id: 'd0', external_id: '1', thread_id: null, author: 'nan.pk', text: 'วอลเปเปอร์นี้สั่งทำเฉพาะดวงเราได้ไหมคะ ราคาเท่าไหร่', received_at: nowS - 840, draft_reply: 'ได้เลยค่ะ วอลเปเปอร์ของหอดูดวงวาดจากดวงของคุณโดยเฉพาะ มีอยู่ใบเดียวในโลก ผูกดวงแรกพบฟรีก่อนได้ที่ hordooduang.com แล้วค่อยเลือกแบบที่ชอบนะคะ ✦', reply_text: null, replied_at: null, route: 'auto', flag: null, status: 'open', post_title: 'Wallpaper · Rahu' },
    { id: 'yt:2', brand_id: 'rm', channel: 'yt', kind: 'comment', post_id: 'd1', external_id: '2', thread_id: null, author: 'Marcus V.', text: 'Is this shot on film? The grain in the door scene is insane.', received_at: nowS - 2 * H, draft_reply: "Digital, graded to behave like it isn't. The door scene is one take. More of the world in Ep.05.", reply_text: null, replied_at: null, route: 'auto', flag: null, status: 'open', post_title: 'Ep.03 — The Lift' },
    { id: 'fb:3', brand_id: 'tob', channel: 'fb', kind: 'dm', post_id: null, external_id: '3', thread_id: 'th3', author: 'Piya (agency)', text: 'สนใจให้ตอบแทนเป็นสปอนเซอร์รายการเราไหมครับ มีงบประมาณอยู่ ขอคุยรายละเอียด', received_at: nowS - 3 * H, draft_reply: 'A business offer counts as work. Sent to RM on LINE.', reply_text: null, replied_at: null, route: 'rm', flag: 'offer', status: 'routed', post_title: null },
    { id: 'ig:4', brand_id: 'tob', channel: 'ig', kind: 'dm', post_id: null, external_id: '4', thread_id: 'th4', author: 'cafe.sol.bkk', text: 'ใช้กับ LINE OA ของร้านกาแฟได้ไหม เริ่มยังไง', received_at: nowS - 5 * H, draft_reply: 'ได้ครับ ตอบแทนต่อกับ LINE OA ของร้านได้ทุกประเภทธุรกิจ เริ่มฟรีที่ tobtan.chat ใช้เวลาตั้งค่าประมาณ 10 นาที ถ้าติดตรงไหนทักมาได้เลย', reply_text: null, replied_at: null, route: 'auto', flag: null, status: 'open', post_title: null },
    { id: 'fb:5', brand_id: 'hor', channel: 'fb', kind: 'comment', post_id: 'd3', external_id: '5', thread_id: null, author: 'Somsak T.', text: 'ดวงสัปดาห์นี้แม่นมาก ขอบคุณครับ', received_at: nowS - 20 * H, draft_reply: '', reply_text: 'ขอบคุณที่แวะมาบอกกันนะคะ สัปดาห์หน้ามีวอลเปเปอร์ใหม่รออยู่ ✦', replied_at: nowS - 19 * H, route: 'auto', flag: null, status: 'answered', post_title: 'Weekly horoscope' }
  ];

  function metricsFor(days) {
    const since = nowS - days * D;
    const byBrand = {}, bestHour = {}; let views = 0, out = 0; const top = [];
    for (const p of posts) {
      if (p.status !== 'live' || p.publish_at < since) continue; out++;
      for (const ch in p.metrics) {
        const m = p.metrics[ch]; views += m.views;
        const b = byBrand[p.brand_id] = byBrand[p.brand_id] || {};
        const c = b[ch] = b[ch] || { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, reach: 0, n: 0 };
        for (const k of ['views', 'likes', 'comments', 'shares', 'saves', 'reach']) c[k] += m[k];
        c.n++;
        const hr = new Date((p.publish_at + OFF * 60) * 1000).getUTCHours();
        bestHour[p.brand_id + ':' + ch] = hr;
        top.push({ id: p.id, title: p.title, brand_id: p.brand_id, publish_at: p.publish_at, channel: ch, views: m.views, likes: m.likes, comments: m.comments, saves: m.saves, shares: m.shares });
      }
    }
    top.sort((a, b) => b.views - a.views);
    return { days, posts_out: out, views, replies: 63, routed: 2, byBrand, bestHour, top: top.slice(0, 12) };
  }

  const STATE = {
    app_url: 'https://artery.hi-badblood.workers.dev', tz_offset_min: OFF, brands: BRANDS,
    settings: { autonomous: true, auto_reply: false, yt_privacy: 'public' },
    connections: {
      google: { label: 'hi.badblood@gmail.com', youtube: { id: 'UCdemo', title: 'Bad Blood Company' } },
      meta: { label: 'Bad Blood', pages: [{ id: '1001', name: 'หอดูดวง', ig: { id: '2001', username: 'hordooduang' } }, { id: '1002', name: 'ตอบแทน', ig: { id: '2002', username: 'tobtan.chat' } }, { id: '1003', name: 'Bad Blood Company', ig: { id: '2003', username: 'badblood.company' } }] },
      tiktok: { label: '@badblood.company' }
    },
    env: { anthropic: true, google: true, meta: true, tiktok: true, line: true, line_boss: true, session: true },
    counts: { waiting: posts.filter(p => p.status === 'wait').length, open: INBOX.filter(m => m.status === 'open').length, routed: INBOX.filter(m => m.status === 'routed').length, drafts: posts.filter(p => p.status === 'draft').length }
  };
  const LOG = [
    { id: 5, at: nowS - 300, area: 'ingest', level: 'info', msg: 'done', data: '{"found":1,"drafted":1}' },
    { id: 4, at: nowS - 900, area: 'ai', level: 'info', msg: 'captions drafted', data: '{"post":"d8"}' },
    { id: 3, at: nowS - 4 * H, area: 'publish', level: 'info', msg: 'live · ig · fb', data: null },
    { id: 2, at: nowS - 6 * H, area: 'inbox', level: 'info', msg: 'routed offer to RM', data: null },
    { id: 1, at: nowS - 20 * H, area: 'youtube', level: 'info', msg: 'uploaded', data: '{"title":"Rule Maker — Ep.03"}' }
  ];
  const FILES = [
    { id: 'f1', name: 'RM_EP05_LEDGER_master.mp4', mime: 'video/mp4', size: 236000000, thumb: P + 'leica-leica-through-our-eyes.webp' },
    { id: 'f2', name: 'RM_EP05_cut2_916.mp4', mime: 'video/mp4', size: 41000000, thumb: P + 'the-dream-chapter.webp' },
    { id: 'f3', name: 'HOR_WALLPAPER_SATURN.jpg', mime: 'image/jpeg', size: 4200000, thumb: null }
  ];

  const REFUSE = { error: 'Demo · read only. This is a picture of the real thing.' };
  const ok = data => ({ status: 200, ok: true, json: async () => data });

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const u = String(typeof input === 'string' ? input : input.url);
    const method = ((init && init.method) || 'GET').toUpperCase();
    if (!/^\/(api|auth|connect|oauth)/.test(u.replace(location.origin, ''))) return realFetch(input, init);
    if (method !== 'GET') return { status: 403, ok: false, json: async () => REFUSE };
    const path = u.split('?')[0].replace(location.origin, '');
    const qs = new URLSearchParams(u.split('?')[1] || '');
    if (path === '/api/state') return ok(STATE);
    if (path === '/api/posts') return ok({ posts });
    if (path.startsWith('/api/posts/')) { const p = posts.find(x => x.id === path.split('/')[3]) || posts[4]; return ok({ ...p, media_url: null }); }
    if (path === '/api/inbox') return ok({ items: INBOX.filter(m => m.status === (qs.get('status') || 'open')) });
    if (path === '/api/metrics') return ok(metricsFor(+qs.get('days') || 7));
    if (path === '/api/log') return ok({ log: LOG });
    if (path === '/api/drive/files') return ok({ files: FILES });
    return ok({});
  };
  // the demo opens Compose on a real post rather than the empty state
  const DEMO_POST = (posts.find(p => p.status === 'wait') || posts[0]).id;
  function fixHash() { if ((location.hash || '') === '#compose') location.hash = '#compose/' + DEMO_POST; }
  fixHash();
  window.addEventListener('hashchange', fixHash);
  // a hash that matches a section id makes the browser jump past the banner
  addEventListener('load', () => setTimeout(() => scrollTo(0, 0), 0));

  // links that would leave the demo (OAuth, sign out) stay put
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="/connect/"], a[href^="/auth/"]');
    if (a) { e.preventDefault(); const t = document.getElementById('toast'); if (t) { t.textContent = REFUSE.error; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); } }
  }, true);
})();
