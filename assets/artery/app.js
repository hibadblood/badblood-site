/* ARTERY · the app. One file, no framework. */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600); };
  async function api(path, opts = {}) {
    const r = await fetch(path, { headers: { 'content-type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (r.status === 401) { location.href = '/'; return {}; }
    const j = await r.json().catch(() => ({})); if (!r.ok) { toast(j.error || ('Error ' + r.status)); throw new Error(j.error || r.status); } return j;
  }
  const CHN = { ig: 'Instagram', fb: 'Facebook', yt: 'YouTube', tt: 'TikTok' };
  const STN = { wait: 'Awaiting approval', sched: 'Scheduled', live: 'Published', draft: 'Draft', failed: 'Failed', publishing: 'Publishing', rejected: 'Held' };

  /* ── 8-bit crew, drawn for Bad Blood ── */
  const INK = '#0B0B0D', W = '#FFFFFF', RED = '#C8102E', GRN = '#3FB36A', OCH = '#C99A5B', GRY = '#7C7F84', CY = '#25F4EE';
  const SPR = {
    iris: { c: { '#': INK, w: W, r: RED }, m: ['....####....', '..########..', '.####ww####.', '.###wwww###.', '###wwrrww###', '###wwrrww###', '.###wwww###.', '.####ww####.', '..########..', '....####....', '...##..##...', '..##....##..'] },
    tobtan: { c: { b: INK, w: W, g: GRN, k: INK }, m: ['..bbbbbbb...', '..bwwwwwb...', '..bwwwwwb...', '..bbbbbbb...', '....bb......', '...gggggg...', '..gggggggg..', '..ggkggkgg..', '..gggggggg..', '..gggggggg..', '...g.gg.g...', '..gg....gg..'] },
    draft: { c: { p: INK, o: OCH, k: INK, r: RED }, m: ['..........p.', '..........p.', '..........p.', '..oooooo..p.', '.oooooooo.p.', '.ookoookoop.', '.oooooooo.r.', '.oooooooo...', '..oooooo....', '...o..o.....', '..oo..oo....', '............'] },
    cut: { c: { '#': INK, k: W }, m: ['..#......#..', '...#....#...', '....#..#....', '.....##.....', '...######...', '..########..', '..##k##k##..', '..########..', '..########..', '...######...', '...#....#...', '..##....##..'] },
    schedule: { c: { '#': INK, w: W, r: RED }, m: ['....####....', '..##wwww##..', '.#wwwwwwww#.', '.#www#wwww#.', '#wwww#wwwww#', '#wwww#rrrww#', '#wwwwwwwwww#', '.#wwwwwwww#.', '.#wwwwwwww#.', '..##wwww##..', '...#....#...', '..##....##..'] },
    post: { c: { r: RED, k: INK, '#': INK }, m: ['..rr....rr..', '.rrrr..rrrr.', 'rrrrrrrrrrrr', 'rrkrrrrrrkrr', 'rrrrrrrrrrrr', '.rrrrrrrrrr.', '..rrrrrrrr..', '...rrrrrr...', '....rrrr....', '.....rr.....', '...#....#...', '..##....##..'] },
    fetch: { c: { '#': INK, w: W, g: GRY, k: W }, m: ['......##....', '.....#ww#...', '.....####...', '..gggggggg..', '.ggggggggg..', '.gkggggkgg..', '.ggggggggg..', '.ggggggggg..', '..gggggggg..', '..g..gg..g..', '.gg..gg..gg.', '............'] },
    ig: { c: { '#': '#E1306C', w: W, k: INK }, m: ['..####..', '.######.', '###ww###', '##wkkw##', '##wkkw##', '###ww###', '.######.', '..#..#..'] },
    yt: { c: { '#': RED, w: W }, m: ['..####..', '.######.', '###w####', '###ww###', '###www##', '###ww###', '###w####', '..#..#..'] },
    fb: { c: { '#': '#1877F2', w: W }, m: ['..####..', '.######.', '###wwww#', '###w####', '##wwww##', '###w####', '###w####', '..#..#..'] },
    tt: { c: { '#': INK, c: CY }, m: ['..####..', '.######.', '####c###', '####c###', '####c###', '##ccc###', '##ccc###', '..#..#..'] }
  };
  function sprite(name, cls) { const s = SPR[name]; let r = ''; for (let y = 0; y < s.m.length; y++) for (let x = 0; x < s.m[y].length; x++) { const ch = s.m[y][x]; if (ch !== '.') r += `<rect x="${x}" y="${y}" width="1" height="1" fill="${s.c[ch]}"/>`; } return `<svg class="${cls || ''}" viewBox="0 0 ${s.m[0].length} ${s.m.length}" aria-hidden="true">${r}</svg>`; }
  const chip = c => `<span class="pill${c === 'tt' ? ' off' : ''}">${sprite(c, 'px')}${CHN[c] || c}</span>`;

  /* ── state ── */
  let S = null, brandFilter = 'all', posts = [], cur = null, month = null, inboxStatus = 'open', pulseDays = 7;
  let view = null, libUsed = '', selected = new Set(), openDayN = null, libItems = [], libQ = '', lastRefresh = 0;
  const store = { get(k, d) { try { return localStorage.getItem('artery.' + k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('artery.' + k, v); } catch {} } };
  const off = () => (S && S.tz_offset_min) || 420;
  const localNow = () => { const d = new Date(Date.now() + off() * 60000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
  const localParts = u => { const d = new Date((u + off() * 60) * 1000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() }; };
  const pad = n => String(n).padStart(2, '0');
  const brandOf = id => (S.brands || []).find(b => b.id === id) || { name: id, color: '#000' };
  const monthName = m => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1];
  function thumbHtml(p, cls) {
    const b = brandOf(p.brand_id);
    const layers = [p.thumb, p.asset_thumb].filter(Boolean).map(u => `url('${esc(u)}')`).join(',');
    if (layers) return `<div class="thumb ${cls || ''}" style="background-image:${layers}"></div>`;
    return `<div class="thumb brand ${p.brand_id} ${cls || ''}"><span class="disp">${esc((p.title || b.name).slice(0, 12))}</span></div>`;
  }

  /* ── boot ── */
  async function boot() {
    S = await api('/api/state');
    const t = localNow(); month = month || { y: t.y, m: t.m };
    view = store.get('view', innerWidth < 820 ? 'list' : 'month');
    renderPills(); renderCrew(); renderChecklist(); renderSettings();
    $('dropBrand').innerHTML = S.brands.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
    [].forEach.call($('viewSeg').children, x => x.setAttribute('aria-pressed', String(x.dataset.v === view)));
    $('auto').setAttribute('aria-pressed', String(S.settings.autonomous)); $('auto').querySelector('span').textContent = 'Autonomous · ' + (S.settings.autonomous ? 'on' : 'off');
    $('nWait').textContent = S.counts.waiting; $('nWait').hidden = !S.counts.waiting; $('nOpen').textContent = S.counts.open; $('nOpen').hidden = !S.counts.open;
    $('sDrafts').textContent = S.counts.drafts; $('sWait').textContent = S.counts.waiting;
    await loadMonth(); route();
  }
  function renderPills() {
    $('brandPills').innerHTML = `<button aria-pressed="${brandFilter === 'all'}" data-b="all"><i style="background:var(--blood)"></i>All</button>` + S.brands.map(b => `<button aria-pressed="${brandFilter === b.id}" data-b="${b.id}"><i style="background:${b.color}"></i>${esc(b.name)}</button>`).join('');
    $('legend').innerHTML = S.brands.map(b => `<span class="tag" style="--dot:${b.color}">${esc(b.name)}</span>`).join('') + '<span class="mi" style="margin-left:auto">Tap a day to open it</span>';
    [].forEach.call($('brandPills').querySelectorAll('button'), btn => btn.addEventListener('click', () => { brandFilter = btn.dataset.b; renderPills(); renderView(); if (!$('library').hidden) loadLibrary(); if (!$('inbox').hidden) loadInbox(); }));
  }
  function renderCrew() {
    const e = S.env, c = S.connections;
    const CREW = [['fetch', 'Fetch', c.google ? 'Watching Drive' : 'Drive not connected', !!c.google], ['draft', 'Draft', e.anthropic ? 'Writes in each voice' : 'No API key', e.anthropic], ['cut', 'Cut', 'Vertical only · 9:16', true], ['schedule', 'Schedule', S.settings.autonomous ? 'Best hour, on its own' : 'Waits for you', true], ['post', 'Post', (c.meta ? 'IG · FB' : '') + (c.google && c.google.youtube ? ' · YT' : '') + (c.tiktok ? ' · TT' : '') || 'Nothing connected', !!(c.meta || c.tiktok || (c.google && c.google.youtube))], ['tobtan', 'Answer', e.anthropic ? (S.settings.auto_reply ? 'Replies on its own' : 'Drafts, you send') : 'No API key', e.anthropic], ['iris', 'Count', 'Numbers for IRIS', true]];
    const GO = ['fetch', 'draft', 'cut', 'schedule', 'post', 'answer', 'count'];
    $('crew').innerHTML = CREW.map((w, i) => `<button class="worker${w[3] ? '' : ' off'}${i === 4 && S.counts.waiting ? ' busy' : ''}" data-go="${GO[i]}" title="${esc(w[2])}">${sprite(w[0])}<b>${w[1]}</b><span>${esc(w[2])}</span></button>`).join('');
  }
  $('crew').addEventListener('click', async e => {
    const b = e.target.closest('[data-go]'); if (!b) return; const job = b.dataset.go;
    if (job === 'fetch') { b.disabled = true; toast('Looking in Drive…'); try { const r = await api('/api/cron/run?job=ingest', { method: 'POST' }); toast(r.drafted ? `${r.drafted} new draft${r.drafted === 1 ? '' : 's'}` : 'Nothing new in Drive'); await refresh(); } finally { b.disabled = false; } }
    else if (job === 'draft') { const d = posts.filter(p => p.status === 'draft').pop(); if (d) location.hash = '#compose/' + d.id; else toast('No drafts waiting'); }
    else if (job === 'cut') toast('Ratio cuts are not built yet. The 9:16 master goes to every channel.');
    else if (job === 'schedule') $('auto').click();
    else if (job === 'post') { const n = posts.filter(p => p.status === 'sched' || p.status === 'wait').sort((x, y) => (x.publish_at || 0) - (y.publish_at || 0))[0]; if (n) location.hash = '#compose/' + n.id; else toast('Nothing waiting to go out'); }
    else if (job === 'answer') location.hash = '#inbox';
    else if (job === 'count') location.hash = '#pulse';
  });

  /* ── upload straight from this device ── */
  function human(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'; }
  function upload(file, brandId, progId) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('no file'));
      if (file.size > 95 * 1024 * 1024) return reject(new Error(`That is ${human(file.size)}. Anything over 95 MB goes into the Drive folder from the desktop.`));
      const box = $(progId), bar = box.querySelector('i'), lab = box.querySelector('span');
      box.hidden = false; bar.style.width = '0%'; lab.textContent = 'Sending ' + human(file.size);
      const q = `?brand=${encodeURIComponent(brandId)}&name=${encodeURIComponent(file.name)}&mime=${encodeURIComponent(file.type || 'application/octet-stream')}&size=${file.size}`;
      const x = new XMLHttpRequest();
      x.open('POST', '/api/upload' + q, true);
      x.setRequestHeader('content-type', file.type || 'application/octet-stream');
      x.upload.onprogress = ev => { if (!ev.lengthComputable) return; const pc = Math.round(ev.loaded / ev.total * 100); bar.style.width = pc + '%'; lab.textContent = pc < 100 ? pc + '%' : 'Filing it in Drive and writing the captions…'; };
      x.onload = () => { box.hidden = true; let j = {}; try { j = JSON.parse(x.responseText); } catch {} if (x.status >= 200 && x.status < 300 && j.id) resolve(j); else reject(new Error(j.error || ('Upload failed (' + x.status + ')'))); };
      x.onerror = () => { box.hidden = true; reject(new Error('The connection dropped.')); };
      x.send(file);
    });
  }
  async function handleFile(file, brandId, progId) {
    try { const r = await upload(file, brandId, progId); toast(r.reused ? 'Already in Drive, opening it' : 'In Drive. Captions written.'); await refresh(); location.hash = '#compose/' + r.id; }
    catch (e) { toast(String(e.message || e).slice(0, 120)); }
  }
  $('dropInput').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) handleFile(f, $('dropBrand').value, 'dropProg'); });
  $('dropBrand').addEventListener('click', e => e.preventDefault());
  ;['dragenter', 'dragover'].forEach(k => $('drop').addEventListener(k, e => { e.preventDefault(); $('drop').classList.add('over'); }));
  ;['dragleave', 'drop'].forEach(k => $('drop').addEventListener(k, e => { e.preventDefault(); $('drop').classList.remove('over'); }));
  $('drop').addEventListener('drop', e => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) handleFile(f, $('dropBrand').value, 'dropProg'); });
  $('pickInput').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) { $('pick').hidden = true; $('pickBack').hidden = true; handleFile(f, $('pickBrand').value, 'pickProg'); } });

  /* ── many at once ── */
  async function bulk(ids, action, confirmText) {
    if (!ids.length) return;
    if (confirmText && !confirm(confirmText)) return;
    const r = await api('/api/posts/bulk', { method: 'POST', body: { ids, action } });
    const bad = (r.results || []).filter(x => x.error).length;
    toast(bad ? `${r.results.length - bad} done, ${bad} failed` : `${r.results.length} done`);
    selected.clear(); await refresh(); if (openDayN) openDay(openDayN);
  }
  $('approveAll').onclick = async () => {
    const w = posts.filter(p => p.status === 'wait');
    const chs = [...new Set(w.flatMap(p => p.channels))].map(c => CHN[c]).join(', ');
    await bulk(w.map(p => p.id), 'approve', `Approve ${w.length} post${w.length === 1 ? '' : 's'} and schedule them on ${chs}?`);
  };
  $('queueAll').onclick = async () => {
    const d = posts.filter(p => p.status === 'draft');
    await bulk(d.map(p => p.id), 'queue', `Put ${d.length} draft${d.length === 1 ? '' : 's'} into the next free slots and send them to your LINE?`);
  };

  /* ── queue ── */
  async function loadMonth() {
    const from = Date.UTC(month.y, month.m - 1, 1) / 1000 - 8 * 86400, to = Date.UTC(month.y, month.m, 1) / 1000 + 8 * 86400;
    posts = (await api(`/api/posts?from=${from}&to=${to}`)).posts || [];
    renderView();
  }
  function visible() { return posts.filter(p => brandFilter === 'all' || p.brand_id === brandFilter); }
  function renderView() {
    $('calWrap').hidden = view !== 'month'; $('listv').hidden = view === 'month';
    if (view === 'month') renderCal(); else renderList();
    countHeader();
  }
  function countHeader() {
    const vis = visible(); let sched = 0; const chCount = {};
    for (const p of vis) { if (!p.publish_at) continue; const l = localParts(p.publish_at); if (l.y === month.y && l.m === month.m && (p.status === 'sched' || p.status === 'live')) { sched++; p.channels.forEach(c => chCount[c] = (chCount[c] || 0) + 1); } }
    $('sSched').textContent = sched;
    $('sSchedD').textContent = Object.keys(chCount).map(c => `${CHN[c]} ${chCount[c]}`).join(' · ') || 'Nothing yet this month.';
    $('qMi').textContent = `${monthName(month.m)} ${month.y} · Bangkok`;
  }
  function miniHtml(p) {
    const l = localParts(p.publish_at);
    return `<div class="mini ${p.status}" data-id="${p.id}" draggable="true">${thumbHtml(p)}<div class="t"><b>${esc(p.title)}</b><span>${pad(l.h)}:${pad(l.min)} · ${p.channels.map(c => c.toUpperCase()).join(' · ')}</span></div></div>`;
  }
  // standing slots that have nothing in them yet, so the rhythm is visible
  function ghosts(y, m, d, dayPosts) {
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(), out = [];
    for (const b of S.brands) {
      if (brandFilter !== 'all' && b.id !== brandFilter) continue;
      for (const s of (b.slots || [])) {
        if (+s.dow !== dow || !s.time) continue;
        const [hh, mm] = String(s.time).split(':').map(Number);
        const at = Date.UTC(y, m - 1, d, hh, mm) / 1000 - off() * 60;
        if (dayPosts.some(p => Math.abs(p.publish_at - at) < 1800)) continue;
        out.push(`<button class="ghost" data-slot="${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}" data-brand="${b.id}" style="--dot:${b.color}"><i></i>${pad(hh)}:${pad(mm)} free</button>`);
      }
    }
    return out.join('');
  }
  function renderCal() {
    const first = new Date(Date.UTC(month.y, month.m - 1, 1)).getUTCDay(), days = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
    const t = localNow(); const vis = visible();
    const byDay = {};
    for (const p of vis) { if (!p.publish_at) continue; const l = localParts(p.publish_at); if (l.y === month.y && l.m === month.m) (byDay[l.d] = byDay[l.d] || []).push(p); }
    let cells = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="dow">${d}</div>`).join('');
    const prevDays = new Date(Date.UTC(month.y, month.m - 1, 0)).getUTCDate();
    for (let i = first - 1; i >= 0; i--) cells += `<div class="cell out"><div class="d"><b>${prevDays - i}</b></div></div>`;
    for (let d = 1; d <= days; d++) {
      const ps = (byDay[d] || []).sort((a, b) => a.publish_at - b.publish_at);
      let inner = ps.slice(0, 2).map(miniHtml).join('');
      if (ps.length > 2) inner += `<div class="more">+${ps.length - 2} more</div>`;
      inner += ghosts(month.y, month.m, d, ps);
      const today = t.y === month.y && t.m === month.m && t.d === d;
      cells += `<button class="cell${today ? ' today' : ''}" data-d="${d}"><div class="d"><b>${d}</b>${d === 1 ? `<small>${monthName(month.m).slice(0, 3)}</small>` : ''}</div><div class="posts">${inner}</div></button>`;
    }
    const tail = (7 - ((first + days) % 7)) % 7; for (let j = 1; j <= tail; j++) cells += `<div class="cell out"><div class="d"><b>${j}</b></div></div>`;
    $('cal').innerHTML = cells;
  }
  function renderList() {
    const vis = visible().filter(p => p.publish_at).sort((a, b) => a.publish_at - b.publish_at);
    const inMonth = vis.filter(p => { const l = localParts(p.publish_at); return l.y === month.y && l.m === month.m; });
    const groups = {};
    for (const p of inMonth) { const l = localParts(p.publish_at); (groups[l.d] = groups[l.d] || []).push(p); }
    const t = localNow();
    const keys = Object.keys(groups).map(Number).sort((a, b) => a - b);
    $('listv').innerHTML = keys.length ? keys.map(d => {
      const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(month.y, month.m - 1, d)).getUTCDay()];
      const today = t.y === month.y && t.m === month.m && t.d === d;
      return `<div class="lday${today ? ' today' : ''}"><div class="lhead"><b>${dow} ${d}</b><span class="mi">${monthName(month.m)}</span></div>${groups[d].map(p => {
        const l = localParts(p.publish_at); const b = brandOf(p.brand_id);
        return `<a class="lrow" href="#compose/${p.id}">${thumbHtml(p)}<div class="lt"><b>${esc(p.title)}</b><span class="mi">${pad(l.h)}:${pad(l.min)} · ${esc(b.name)}</span><div class="lch">${p.channels.map(chip).join('')}</div></div><span class="st ${p.status}">${STN[p.status] || p.status}</span></a>`;
      }).join('')}</div>`;
    }).join('') : '<div class="card"><div class="empty">Nothing this month. Drop a file in Drive, or press New post.</div></div>';
  }

  /* ── drag a post to another day ── */
  let dragId = null, ghostEl = null;
  function canMove(p) {
    if (!p) return 'That post is gone.';
    if (p.status === 'live' || p.status === 'publishing') return 'That one is already out. Duplicate it instead.';
    return null;
  }
  async function moveTo(id, day) {
    const p = posts.find(x => x.id === id); const why = canMove(p); if (why) { toast(why); return; }
    const l = localParts(p.publish_at || (Math.floor(Date.now() / 1000) + 3600));
    const when = `${month.y}-${pad(month.m)}-${pad(day)}T${pad(l.h)}:${pad(l.min)}`;
    if (Date.UTC(month.y, month.m - 1, day, l.h, l.min) / 1000 - off() * 60 < Math.floor(Date.now() / 1000)) { toast('That is in the past.'); return; }
    const before = p.publish_at;
    p.publish_at = Date.UTC(month.y, month.m - 1, day, l.h, l.min) / 1000 - off() * 60; p.local = when.replace('T', ' ');
    renderView();
    try { await api('/api/posts/' + id, { method: 'PUT', body: { publish_local: when } }); toast('Moved to ' + monthName(month.m) + ' ' + day); }
    catch { p.publish_at = before; renderView(); }
  }
  $('cal').addEventListener('dragstart', e => { const m = e.target.closest('.mini'); if (!m) return; dragId = m.dataset.id; m.classList.add('dragging'); if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); } });
  $('cal').addEventListener('dragend', () => { dragId = null; [].forEach.call($('cal').querySelectorAll('.dragging,.over'), x => x.classList.remove('dragging', 'over')); });
  $('cal').addEventListener('dragover', e => { const c = e.target.closest('.cell[data-d]'); if (!c || !dragId) return; e.preventDefault(); [].forEach.call($('cal').querySelectorAll('.cell.over'), x => x.classList.remove('over')); c.classList.add('over'); });
  $('cal').addEventListener('drop', e => { const c = e.target.closest('.cell[data-d]'); if (!c || !dragId) return; e.preventDefault(); const id = dragId; dragId = null; c.classList.remove('over'); moveTo(id, +c.dataset.d); });
  // touch: press and hold, then drag
  let holdT = null, held = null;
  $('cal').addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return; const m = e.target.closest('.mini'); if (!m) return;
    holdT = setTimeout(() => {
      held = m.dataset.id; m.classList.add('dragging');
      ghostEl = document.createElement('div'); ghostEl.className = 'dragghost'; ghostEl.textContent = m.querySelector('b').textContent;
      document.body.appendChild(ghostEl); ghostEl.style.left = e.clientX + 'px'; ghostEl.style.top = e.clientY + 'px';
      document.body.style.overflow = 'hidden';
      if (navigator.vibrate) navigator.vibrate(8);
    }, 350);
  });
  $('cal').addEventListener('pointermove', e => {
    if (!held) { if (holdT) { clearTimeout(holdT); holdT = null; } return; }
    e.preventDefault();
    ghostEl.style.left = e.clientX + 'px'; ghostEl.style.top = e.clientY + 'px';
    const el = document.elementFromPoint(e.clientX, e.clientY); const c = el && el.closest && el.closest('.cell[data-d]');
    [].forEach.call($('cal').querySelectorAll('.cell.over'), x => x.classList.remove('over'));
    if (c) c.classList.add('over');
  });
  function endHold(e) {
    if (holdT) { clearTimeout(holdT); holdT = null; }
    if (!held) return;
    const el = document.elementFromPoint(e.clientX, e.clientY); const c = el && el.closest && el.closest('.cell[data-d]');
    const id = held; held = null;
    if (ghostEl) { ghostEl.remove(); ghostEl = null; }
    document.body.style.overflow = '';
    [].forEach.call($('cal').querySelectorAll('.dragging,.over'), x => x.classList.remove('dragging', 'over'));
    if (c) moveTo(id, +c.dataset.d);
  }
  $('cal').addEventListener('pointerup', endHold);
  $('cal').addEventListener('pointercancel', endHold);
  $('viewSeg').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; view = b.dataset.v; store.set('view', view); [].forEach.call($('viewSeg').children, x => x.setAttribute('aria-pressed', String(x === b))); renderView(); });

  function selBar() {
    const n = selected.size;
    $('sheetSelN').hidden = !n; $('sheetSelN').textContent = n + ' selected';
    ['selApprove', 'selHold', 'selDelete'].forEach(k => $(k).hidden = !n);
    $('sheetNew').hidden = !!n;
  }
  function openDay(d) {
    openDayN = d; selected.clear();
    const vis = visible().filter(p => { if (!p.publish_at) return false; const l = localParts(p.publish_at); return l.y === month.y && l.m === month.m && l.d === d; }).sort((a, b) => a.publish_at - b.publish_at);
    const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(month.y, month.m - 1, d)).getUTCDay()];
    $('sheetMi').textContent = `${dow.slice(0, 3)} · ${d} ${monthName(month.m).slice(0, 3)} ${month.y} · ${vis.length} post${vis.length === 1 ? '' : 's'}`;
    $('sheetTitle').textContent = `${dow} ${d}`;
    $('sheetBody').innerHTML = vis.length ? vis.map(p => { const l = localParts(p.publish_at); const b = brandOf(p.brand_id);
      return `<div class="sp" data-id="${p.id}"><label class="pick"><input type="checkbox" data-sel="${p.id}"></label>${thumbHtml(p)}<div class="in"><div class="meta"><span class="tag" style="--dot:${b.color}">${esc(b.name)}</span><span class="st ${p.status}">${STN[p.status] || p.status}</span></div><h4>${esc(p.title)}</h4><div class="meta"><span class="mi ink">${pad(l.h)}:${pad(l.min)}</span>${p.channels.map(chip).join('')}</div><div class="row">${p.status === 'wait' ? `<button class="act small" data-approve="${p.id}">Approve →</button>` : ''}<a class="act small quiet" href="#compose/${p.id}">Open</a>${p.status === 'live' ? '<a class="act small quiet" href="#pulse">Numbers</a>' : ''}</div></div></div>`;
    }).join('') : '<div class="empty">Nothing planned. Drop a file into Drive or add a post.</div>';
    selBar();
    $('sheetNew').onclick = () => { closeSheet(); openPick(`${month.y}-${pad(month.m)}-${pad(d)}T19:00`); };
    $('sheet').hidden = false; $('sheetBack').hidden = false;
  }
  $('sheetBody').addEventListener('change', e => { const c = e.target.closest('[data-sel]'); if (!c) return; c.checked ? selected.add(c.dataset.sel) : selected.delete(c.dataset.sel); c.closest('.sp').classList.toggle('on', c.checked); selBar(); });
  $('selApprove').onclick = () => bulk([...selected], 'approve', `Approve ${selected.size} post${selected.size === 1 ? '' : 's'} and schedule them?`);
  $('selHold').onclick = () => bulk([...selected], 'hold', null);
  $('selDelete').onclick = () => bulk([...selected], 'delete', `Delete ${selected.size} post${selected.size === 1 ? '' : 's'} for good?`);
  function closeSheet() { $('sheet').hidden = true; $('sheetBack').hidden = true; }
  $('cal').addEventListener('click', e => { const g = e.target.closest('[data-slot]'); if (g) { e.stopPropagation(); brandFilter = g.dataset.brand; renderPills(); openPick(g.dataset.slot); return; } const c = e.target.closest('.cell[data-d]'); if (c) openDay(+c.dataset.d); });
  $('sheetBack').onclick = closeSheet; $('sheetX').onclick = closeSheet;
  $('sheetBody').addEventListener('click', async e => { const a = e.target.closest('[data-approve]'); if (a) { await api(`/api/posts/${a.dataset.approve}/approve`, { method: 'POST' }); toast('Approved'); closeSheet(); await refresh(); } });
  $('prevM').onclick = () => { month.m--; if (month.m < 1) { month.m = 12; month.y--; } loadMonth(); };
  $('nextM').onclick = () => { month.m++; if (month.m > 12) { month.m = 1; month.y++; } loadMonth(); };
  $('todayM').onclick = () => { const t = localNow(); month = { y: t.y, m: t.m }; loadMonth(); };
  $('auto').onclick = async () => { const on = $('auto').getAttribute('aria-pressed') !== 'true'; await api('/api/settings', { method: 'PUT', body: { autonomous: on } }); S.settings.autonomous = on; $('auto').setAttribute('aria-pressed', String(on)); $('auto').querySelector('span').textContent = 'Autonomous · ' + (on ? 'on' : 'off'); renderCrew(); $('sAuto').checked = on; };
  function badges() {
    $('nWait').textContent = S.counts.waiting; $('nWait').hidden = !S.counts.waiting;
    $('nOpen').textContent = S.counts.open; $('nOpen').hidden = !S.counts.open;
    $('nUnused').textContent = S.counts.unused || 0; $('nUnused').hidden = !S.counts.unused;
    $('sDrafts').textContent = S.counts.drafts; $('sWait').textContent = S.counts.waiting;
    $('approveAll').hidden = !S.counts.waiting; $('approveAll').textContent = `Approve all waiting (${S.counts.waiting})`;
    $('queueAll').hidden = !S.counts.drafts; $('queueAll').textContent = `Put ${S.counts.drafts} draft${S.counts.drafts === 1 ? '' : 's'} in the queue`;
  }
  async function refresh() { lastRefresh = Date.now(); S = await api('/api/state'); badges(); renderCrew(); renderChecklist(); await loadMonth(); }

  /* ── first run: the five things that have to be true ── */
  function renderChecklist() {
    const c = S.connections, e = S.env, out = [];
    const need = (done, label, hint, go) => out.push({ done, label, hint, go });
    need(e.anthropic, 'Give the crew its brain', 'Set ANTHROPIC_API_KEY so captions and replies can be written.', null);
    need(!!c.google, 'Connect Google', 'Drive is where every post starts. The same consent covers YouTube.', '/connect/google');
    const noFolder = S.brands.filter(b => !b.drive_folder_id);
    need(!noFolder.length, 'Point each brand at a Drive folder', noFolder.length ? noFolder.map(b => b.name).join(', ') + ' still has none.' : 'All three brands have a folder.', '#settings');
    need(!!c.meta, 'Connect Meta', 'Your Facebook Pages and the Instagram accounts linked to them.', '/connect/meta');
    const noMap = S.brands.filter(b => !(b.channels && (b.channels.fb || b.channels.ig)));
    need(!!c.meta && !noMap.length, 'Map every brand to a Page and an Instagram account', noMap.length ? noMap.map(b => b.name).join(', ') + ' is not mapped.' : 'All mapped.', '#settings');
    need(e.line && e.line_boss, 'Connect LINE', 'Approvals land on your phone. Add the bot, say the word artery, it replies with your id.', '#settings');
    const left = out.filter(x => !x.done).length;
    const box = $('checklist');
    if (!left && store.get('checklistDone') === '1') { box.innerHTML = ''; return; }
    if (!left) store.set('checklistDone', '1');
    box.innerHTML = `<div class="card check"><div class="ch-head"><span class="mi${left ? ' hot' : ' ok'}">${left ? left + ' thing' + (left === 1 ? '' : 's') + ' left before the crew can work' : 'Everything is connected'}</span>${left ? '' : '<button class="act quiet small" id="chDismiss">Hide this</button>'}</div>${out.map(x => `<div class="ch-row${x.done ? ' done' : ''}"><i></i><div><b>${esc(x.label)}</b><span>${esc(x.hint)}</span></div>${x.done || !x.go ? '' : `<a class="act quiet small" href="${x.go}">Fix</a>`}</div>`).join('')}</div>`;
    const d = $('chDismiss'); if (d) d.onclick = () => { store.set('checklistDone', '1'); $('checklist').innerHTML = ''; };
  }

  /* ── new post picker ── */
  let pickWhen = null;
  function openPick(when) {
    pickWhen = when || null; $('pickBrand').innerHTML = S.brands.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
    $('pick').hidden = false; $('pickBack').hidden = false; loadPickFiles();
  }
  async function loadPickFiles() {
    const b = $('pickBrand').value; $('pickFiles').innerHTML = '<div class="empty">Looking in Drive…</div>';
    try { const { files } = await api(`/api/drive/files?brand=${b}`); $('pickFiles').innerHTML = files.length ? files.map(f => `<button class="sp" style="text-align:left" data-file="${f.id}"><div class="thumb brand"></div><div class="in"><h4>${esc(f.name)}</h4><span class="mi">${esc(f.mime)} · ${(f.size / 1048576).toFixed(0)} MB</span></div></button>`).join('') : '<div class="empty">No files in this brand\'s folder yet (or no folder set in Settings).</div>'; }
    catch (e) { $('pickFiles').innerHTML = '<div class="empty">Drive is not connected. Connect it in Settings, or start without a file.</div>'; }
  }
  $('pickBrand').onchange = loadPickFiles; $('pickBack').onclick = $('pickX').onclick = () => { $('pick').hidden = true; $('pickBack').hidden = true; };
  $('pickFiles').addEventListener('click', async e => { const f = e.target.closest('[data-file]'); if (!f) return; const { id } = await api('/api/posts', { method: 'POST', body: { brand_id: $('pickBrand').value, drive_file_id: f.dataset.file, title: f.querySelector('h4').textContent.replace(/\.[^.]+$/, ''), publish_local: pickWhen, mime: /video/.test(f.querySelector('.mi').textContent) ? 'video/mp4' : 'image/jpeg' } }); $('pick').hidden = true; $('pickBack').hidden = true; location.hash = '#compose/' + id; });
  $('pickNoFile').onclick = async () => { const { id } = await api('/api/posts', { method: 'POST', body: { brand_id: $('pickBrand').value, title: 'Untitled', publish_local: pickWhen, channels: ['fb'] } }); $('pick').hidden = true; $('pickBack').hidden = true; location.hash = '#compose/' + id; };
  $('newPost').onclick = () => openPick(null);

  /* ── compose ── */
  async function loadCompose(id) {
    cur = await api('/api/posts/' + id); const b = brandOf(cur.brand_id);
    $('cEmpty').hidden = true; $('cForm').hidden = false;
    $('cMi').textContent = `${b.name} · ${cur.asset_name || 'no file'}`; $('cStatus').innerHTML = `<span class="st ${cur.status}">${STN[cur.status] || cur.status}</span>`;
    $('cBrand').textContent = b.name; $('cBrand').style.setProperty('--dot', b.color);
    const isVideo = /^video/.test(cur.asset_mime || '');
    $('cThumb').className = 'thumb' + (cur.asset_thumb ? '' : ' brand ' + cur.brand_id); $('cThumb').style.backgroundImage = cur.asset_thumb ? `url('${cur.asset_thumb}')` : ''; $('cThumb').innerHTML = cur.asset_thumb ? '' : `<span class="disp">${esc(b.name)}</span>`;
    $('cSrc').innerHTML = cur.asset_name ? `Drive · ${esc(cur.asset_name)}<br>${cur.asset_mime || ''} · ${cur.asset_size ? (cur.asset_size / 1048576).toFixed(0) + ' MB' : ''}${cur.asset_sidecar ? '<br>Notes found next to the file ✓' : ''}` : 'No file. Text post.';
    $('cRatios').innerHTML = isVideo ? '<span class="pill">9:16 · vertical everywhere</span><span class="pill off">keep faces and words inside 4:5</span>' : (cur.asset_name ? '<span class="pill">image · 4:5 for feeds</span>' : '');
    $('fTitle').value = cur.title || ''; $('fMaster').value = cur.master_caption || '';
    $('fChannels').innerHTML = ['ig', 'fb', 'yt', 'tt'].map(c => `<label><input type="checkbox" value="${c}" ${cur.channels.includes(c) ? 'checked' : ''}>${sprite(c, 'px')} ${CHN[c]}</label>`).join('');
    $('fWhen').value = cur.local ? cur.local.replace(' ', 'T') : '';
    const bh = (b.default_hours || {}); $('fBest').textContent = `Brand default hours · IG ${bh.ig || '—'} · FB ${bh.fb || '—'} · YT ${bh.yt || '—'} · TT ${bh.tt || '—'}. The crew learns better hours from your numbers.`;
    renderPreviews(); $('fChannels').onchange = renderPreviews;
    const live = cur.status === 'live' || cur.status === 'publishing';
    $('bLine').disabled = live; $('bApprove').disabled = live; $('bNow').disabled = live; $('bHold').disabled = live;
    $('cHint').innerHTML = live ? Object.keys(cur.results).map(c => `${CHN[c]}: ${cur.results[c].error ? '<span class="mi hot">' + esc(cur.results[c].error) + '</span>' : (cur.results[c].url ? `<a href="${esc(cur.results[c].url)}" target="_blank" rel="noopener" style="text-decoration:underline">open</a>` : 'ok')}`).join(' · ') + (cur.status === 'failed' ? ' <button class="act small quiet" id="bRetry">Retry</button>' : '') : 'Approval goes to your LINE with all previews. Nothing goes live without you.';
    const rt = $('bRetry'); if (rt) rt.onclick = async () => { await api(`/api/posts/${cur.id}/retry`, { method: 'POST' }); toast('Retried'); loadCompose(cur.id); };
    const fc = $('bFirstComment'); if (fc) fc.onclick = async () => { await save(true); await api(`/api/posts/${cur.id}/first-comment`, { method: 'POST', body: { text: (capsFromForm().ig || {}).first_comment || '' } }); toast('Posted'); loadCompose(cur.id); };
  }
  function capsFromForm() {
    const caps = JSON.parse(JSON.stringify(cur.captions || {}));
    [].forEach.call(document.querySelectorAll('[data-cap]'), el => { const [ch, k] = el.dataset.cap.split('.'); caps[ch] = caps[ch] || {}; caps[ch][k] = el.value; });
    return caps;
  }
  function channelsFromForm() { return [].map.call($('fChannels').querySelectorAll('input:checked'), i => i.value); }
  function renderPreviews() {
    const caps = cur.captions || {}, chs = channelsFromForm(), b = brandOf(cur.brand_id);
    const isVideo = /^video/.test(cur.asset_mime || ''); const mu = cur.media_url || '';
    const media = () => isVideo ? `<video src="${esc(mu)}" muted playsinline preload="metadata"></video>` : `<div class="img" style="background-image:url('${esc(cur.asset_thumb || '')}')"></div>`;
    const block = {
      ig: () => `<div class="stage"><div class="phone"><div class="scr">${media()}<div class="topbar"><span>Reels</span><span>●</span></div><div class="rail"><i></i><i></i><i></i></div><div class="ov"><b>${esc(b.name.toLowerCase())}</b>${esc((caps.ig && caps.ig.text) || cur.master_caption || '')}${(caps.ig && caps.ig.first_comment) ? `<em>${esc(caps.ig.first_comment)}</em>` : ''}</div></div></div></div><div class="edit"><div class="field"><label>Instagram caption</label><textarea rows="4" data-cap="ig.text">${esc((caps.ig && caps.ig.text) || '')}</textarea></div><div class="field"><label>First comment · where the hashtags go</label><textarea rows="2" data-cap="ig.first_comment" placeholder="#RuleMaker #BadBlood">${esc((caps.ig && caps.ig.first_comment) || '')}</textarea></div>${/^video/.test(cur.asset_mime || '') ? '<span class="mi">Alt text cannot be set on Reels, only on photos.</span>' : `<div class="field"><label>Alt text · for people who cannot see it</label><input data-cap="ig.alt_text" value="${esc((caps.ig && caps.ig.alt_text) || '')}"></div>`}${(cur.results.ig && cur.results.ig.first_comment_error) ? '<button class="act small quiet" id="bFirstComment">The first comment failed. Try again</button>' : ''}</div>`,
      fb: () => `<div class="stage"><div class="fb"><div class="h"><div class="av"></div><div><b>${esc(b.name)}</b><span>${cur.local ? esc(cur.local) : 'Unscheduled'} · Public</span></div></div><p>${esc((caps.fb && caps.fb.text) || cur.master_caption || '')}</p>${cur.asset_thumb ? `<div class="v" style="background-image:url('${esc(cur.asset_thumb)}')"></div>` : ''}<div class="r"><span>Like</span><span>Comment</span><span>Share</span></div></div></div><div class="edit"><div class="field"><label>Facebook text</label><textarea rows="4" data-cap="fb.text">${esc((caps.fb && caps.fb.text) || '')}</textarea></div></div>`,
      yt: () => `<div class="stage"><div class="yt"><div class="v" style="background-image:url('${esc(cur.asset_thumb || '')}')"><div class="play"></div></div><div class="m"><div class="av"></div><div><b>${esc((caps.yt && caps.yt.title) || cur.title || '')}</b><span>${esc(b.name)} · ${cur.local ? esc(cur.local.slice(11)) : ''}</span></div></div></div></div><div class="edit"><div class="field"><label>YouTube title</label><input data-cap="yt.title" value="${esc((caps.yt && caps.yt.title) || '')}"></div><div class="field"><label>Description</label><textarea rows="4" data-cap="yt.description">${esc((caps.yt && caps.yt.description) || '')}</textarea></div></div>`,
      tt: () => `<div class="stage"><div class="phone"><div class="scr">${media()}<div class="topbar"><span>Following</span><span>For You</span></div><div class="rail"><i></i><i></i><i></i></div><div class="ov"><b>@${esc(b.name.toLowerCase())}</b>${esc((caps.tt && caps.tt.text) || '')}</div></div></div></div><div class="edit"><div class="field"><label>TikTok caption</label><textarea rows="3" data-cap="tt.text">${esc((caps.tt && caps.tt.text) || '')}</textarea></div><span class="mi hot">One-tap share from LINE until TikTok's audit clears</span></div>`
    };
    $('previews').innerHTML = chs.map(c => `<div class="card pv"><header><b>${sprite(c, 'px')} ${CHN[c]}</b><span class="mi">${c === 'yt' ? '9:16 Shorts' : c === 'fb' ? 'auto' : '9:16'}</span></header>${block[c]()}<footer><span class="st ${(caps[c] && (caps[c].text || caps[c].title)) ? 'sched' : 'draft'}">${(caps[c] && (caps[c].text || caps[c].title)) ? 'Ready' : 'Needs a caption'}</span></footer></div>`).join('');
    if (store.get('guides', '0') === '1') $('previews').classList.add('guides');
    [].forEach.call($('previews').querySelectorAll('.phone .scr'), s => s.insertAdjacentHTML('beforeend',
      '<div class="guide"><i class="c45"></i><i class="c11"></i></div>'));
  }
  async function save(quiet) {
    const body = { title: $('fTitle').value, master_caption: $('fMaster').value, captions: capsFromForm(), channels: channelsFromForm(), publish_local: $('fWhen').value || null };
    await api('/api/posts/' + cur.id, { method: 'PUT', body }); Object.assign(cur, { title: body.title, master_caption: body.master_caption, captions: body.captions, channels: body.channels }); if (!quiet) toast('Saved');
  }
  $('bSave').onclick = () => save();
  $('bRedraft').onclick = async () => { await save(true); $('bRedraft').disabled = true; try { const { captions } = await api(`/api/posts/${cur.id}/redraft`, { method: 'POST' }); cur.captions = captions; if (captions.title && (!$('fTitle').value || $('fTitle').value === 'Untitled')) $('fTitle').value = captions.title; renderPreviews(); toast('Drafted'); } finally { $('bRedraft').disabled = false; } };
  $('bLine').onclick = async () => { await save(true); const r = await api(`/api/posts/${cur.id}/send-line`, { method: 'POST' }); toast(r.line ? 'Sent to your LINE' : 'Marked as waiting (LINE not set up yet)'); await refresh(); loadCompose(cur.id); };
  $('bApprove').onclick = async () => { await save(true); await api(`/api/posts/${cur.id}/approve`, { method: 'POST' }); toast('Scheduled'); await refresh(); loadCompose(cur.id); };
  $('bHold').onclick = async () => { await save(true); await api(`/api/posts/${cur.id}/hold`, { method: 'POST' }); toast('Held'); await refresh(); loadCompose(cur.id); };
  $('bNow').onclick = async () => { if (!confirm('Publish to the selected channels now?')) return; await save(true); $('bNow').disabled = true; const r = await api(`/api/posts/${cur.id}/publish-now`, { method: 'POST' }); toast(r.status === 'live' ? 'Out' : 'Some channels failed'); await refresh(); loadCompose(cur.id); };
  $('bDuplicate').onclick = async () => { await save(true); const { id } = await api(`/api/posts/${cur.id}/duplicate`, { method: 'POST' }); toast('Copied'); await refresh(); location.hash = '#compose/' + id; };
  $('bDelete').onclick = async () => { if (!confirm('Delete this post?')) return; await api('/api/posts/' + cur.id, { method: 'DELETE' }); cur = null; await refresh(); location.hash = '#queue'; };

  /* ── library ── */
  async function loadLibrary() {
    const q = `/api/library?${brandFilter === 'all' ? '' : 'brand=' + brandFilter + '&'}${libUsed === '' ? '' : 'used=' + libUsed}`;
    libItems = (await api(q)).items || [];
    renderLib();
  }
  function renderLib() {
    const needle = libQ.trim().toLowerCase();
    const items = needle ? libItems.filter(a => (a.name || '').toLowerCase().includes(needle)) : libItems;
    $('libMi').textContent = needle
      ? `${items.length} of ${libItems.length} file${libItems.length === 1 ? '' : 's'} match “${libQ.trim()}”`
      : `${items.length} file${items.length === 1 ? '' : 's'}${brandFilter === 'all' ? ' in every folder' : ' · ' + brandOf(brandFilter).name}`;
    $('libGrid').innerHTML = items.length ? items.map(a => {
      const b = brandOf(a.brand_id); const vid = /^video/.test(a.mime || '');
      const dur = a.duration_ms ? `${Math.floor(a.duration_ms / 60000)}:${pad(Math.round(a.duration_ms % 60000 / 1000))}` : '';
      const layers = [a.thumb, a.thumb_url].filter(Boolean).map(u => `url('${esc(u)}')`).join(','); const src = layers; const thumb = layers ? `style="background-image:${layers}"` : '';
      return `<button class="lib${a.post_id ? '' : ' unused'}" data-asset="${a.id}" data-brand="${a.brand_id}" data-mime="${esc(a.mime || '')}" data-post="${a.post_id || ''}">
        <span class="libthumb ${src ? '' : 'brand ' + a.brand_id}" ${thumb}>${src ? '' : `<span class="disp">${esc(b.name.slice(0, 10))}</span>`}${dur ? `<span class="dur">${dur}</span>` : ''}${vid ? '<span class="vid"></span>' : ''}</span>
        <span class="libt"><b>${esc(a.name)}</b><span class="mi">${esc(b.name)} · ${a.size ? (a.size / 1048576).toFixed(1) + ' MB' : ''}</span>
        ${a.post_id ? `<span class="st ${a.post_status}">${STN[a.post_status] || a.post_status}</span>` : '<span class="st hot">Never used</span>'}</span></button>`;
    }).join('') : `<div class="card"><div class="empty">${needle ? 'No file matches that name.' : 'Nothing here yet. Connect Google and give each brand a Drive folder.'}</div></div>`;
  }
  $('libQ').addEventListener('input', () => { libQ = $('libQ').value; clearTimeout($('libQ')._t); $('libQ')._t = setTimeout(renderLib, 120); });
  $('libGrid').addEventListener('click', async e => {
    const b = e.target.closest('[data-asset]'); if (!b) return;
    if (b.dataset.post) return void (location.hash = '#compose/' + b.dataset.post);
    const { id } = await api('/api/posts', { method: 'POST', body: { brand_id: b.dataset.brand, asset_id: b.dataset.asset, title: b.querySelector('b').textContent.replace(/\.[^.]+$/, ''), mime: b.dataset.mime || '' } });
    toast('New draft'); await refresh(); location.hash = '#compose/' + id;
  });
  $('libSeg').addEventListener('click', e => { const b = e.target.closest('button[data-u]'); if (!b) return; libUsed = b.dataset.u; [].forEach.call($('libSeg').children, x => x.setAttribute('aria-pressed', String(x === b))); loadLibrary(); });

  /* ── inbox ── */
  async function loadInbox() {
    const { items } = await api('/api/inbox?status=' + inboxStatus);
    const vis = items.filter(m => brandFilter === 'all' || m.brand_id === brandFilter);
    $('inboxList').innerHTML = vis.length ? vis.map(m => { const b = brandOf(m.brand_id); const ago = Math.max(1, Math.round((Date.now() / 1000 - m.received_at) / 60)); const when = ago < 60 ? ago + ' min ago' : ago < 1440 ? Math.round(ago / 60) + ' h ago' : Math.round(ago / 1440) + ' d ago';
      return `<div class="card msg${m.flag && m.flag !== 'skip' ? ' flag' : ''}" data-id="${esc(m.id)}"><div class="in"><div class="meta"><span class="tag" style="--dot:${b.color}">${esc(b.name)}</span><span class="pill">${sprite(m.channel, 'px')}${CHN[m.channel]} ${m.kind}</span><span class="mi">${when}</span>${m.flag && m.flag !== 'skip' ? `<span class="st hot">${m.flag} · routed to RM</span>` : ''}${m.post_title ? `<span class="mi">on · ${esc(m.post_title)}</span>` : ''}</div><span class="who"><i>${esc((m.author || '?').slice(0, 1).toUpperCase())}</i>${esc(m.author)}</span><div class="bubble">${esc(m.text)}</div></div>
      <div class="out">${m.status === 'answered' ? `<span class="mi ink">Answered</span><div class="bubble reply">${esc(m.reply_text)}</div>` : m.status === 'routed' ? `<span class="mi hot">The crew will not answer this one</span><div class="bubble reply">${esc(m.draft_reply || 'Sent to RM on LINE.')}</div><div class="row"><button class="act small quiet" data-act="reopen">Reopen</button></div>` : `<span class="mi ink">Drafted by the crew · ${esc(b.name)} voice</span><textarea class="reply">${esc(m.draft_reply || '')}</textarea><div class="row"><button class="act small" data-act="reply">Send →</button><button class="act small quiet" data-act="redraft">Redraft</button><button class="act small quiet" data-act="route">Send to RM</button><button class="act small quiet" data-act="skip">Skip</button></div>`}</div></div>`; }).join('') : '<div class="card"><div class="empty">Nothing here.</div></div>';
  }
  $('inboxList').addEventListener('click', async e => { const btn = e.target.closest('[data-act]'); if (!btn) return; const card = btn.closest('.msg'); const id = encodeURIComponent(card.dataset.id); const act = btn.dataset.act; btn.disabled = true;
    try { if (act === 'reply') await api(`/api/inbox/${id}/reply`, { method: 'POST', body: { text: card.querySelector('textarea.reply').value } }); else if (act === 'redraft') { const d = await api(`/api/inbox/${id}/redraft`, { method: 'POST' }); card.querySelector('textarea.reply').value = d.reply || ''; btn.disabled = false; return; } else await api(`/api/inbox/${id}/${act}`, { method: 'POST' }); toast('Done'); await refresh(); loadInbox(); } catch (err) { btn.disabled = false; } });
  $('inboxSeg').addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; inboxStatus = b.dataset.s; [].forEach.call($('inboxSeg').children, x => x.setAttribute('aria-pressed', String(x === b))); loadInbox(); });

  /* ── pulse ── */
  async function loadPulse() {
    const m = await api('/api/metrics?days=' + pulseDays); $('pMi').textContent = `Last ${pulseDays} days`;
    const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
    $('tiles').innerHTML = [['Posts out', m.posts_out, ''], ['Views', fmt(m.views), 'across every channel'], ['Replies sent', m.replies, 'by the crew or by you'], ['Sent to RM', m.routed, 'offers · complaints · press']].map((t, i) => `<div class="card tile"><span class="mi${i === 3 ? ' hot' : ''}">${t[0]}</span><div class="n"${i === 3 ? ' style="color:var(--blood)"' : ''}>${t[1]}</div><div class="d">${t[2]}</div></div>`).join('');
    $('charts').innerHTML = S.brands.map(b => { const ch = m.byBrand[b.id] || {}; const rows = Object.keys(ch).sort((a, c) => ch[c].views - ch[a].views); const max = rows.length ? ch[rows[0]].views || 1 : 1; const best = ['ig', 'fb', 'yt', 'tt'].map(c => m.bestHour[b.id + ':' + c] != null ? `${CHN[c]} ${pad(m.bestHour[b.id + ':' + c])}:00` : null).filter(Boolean).join(' · ');
      return `<div class="card chart"><h4>${esc(b.name)} · views by channel</h4>${rows.length ? rows.map((c, i) => `<div class="brow${i === 0 ? ' top' : ''}"><span>${CHN[c]}</span><div class="track"><div class="fill" style="width:${Math.max(2, ch[c].views / max * 100)}%"></div></div><span class="v">${fmt(ch[c].views)}</span></div>`).join('') : '<div class="empty">No numbers yet.</div>'}<div class="foot">${best ? 'Best hours so far: ' + best : 'Best hours appear once a few posts have numbers.'}</div></div>`; }).join('');
    $('topTable').innerHTML = `<tr><th>Post</th><th>Brand</th><th>Channel</th><th>Views</th><th>Likes</th><th>Comments</th><th>Saves</th></tr>` + (m.top.length ? m.top.map(r => `<tr><td>${esc(r.title)}</td><td>${esc(brandOf(r.brand_id).name)}</td><td>${CHN[r.channel]}</td><td>${fmt(r.views)}</td><td>${r.likes}</td><td>${r.comments}</td><td>${r.saves || 0}</td></tr>`).join('') : '<tr><td colspan="7" class="empty">Nothing published yet.</td></tr>');
  }
  $('pulseSeg').addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; pulseDays = +b.dataset.d; [].forEach.call($('pulseSeg').children, x => x.setAttribute('aria-pressed', String(x === b))); loadPulse(); });

  /* ── settings ── */
  const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function slotRow(s) {
    return `<div class="slot"><select data-s="dow">${DOWS.map((d, i) => `<option value="${i}" ${+((s && s.dow) || 0) === i ? 'selected' : ''}>${d}</option>`).join('')}</select><input data-s="time" type="time" value="${esc((s && s.time) || '19:00')}"><button class="x" data-delslot aria-label="Remove this slot">×</button></div>`;
  }
  function renderSettings() {
    const c = S.connections, e = S.env;
    const ok = v => v ? '<span class="st sched">Connected</span>' : '<span class="st draft">Not yet</span>';
    const env = v => v ? '<span class="mi ok">key set</span>' : '<span class="mi hot">key missing</span>';
    const metaPages = c.meta ? c.meta.pages.map(p => `${esc(p.name)}${p.ig ? ' · IG @' + esc(p.ig.username) : ' · no IG linked'}`).join('<br>') : '';
    $('conns').innerHTML = `
      <div class="card conn"><div class="h"><b>${sprite('fetch', 'px')} Google · Drive</b>${ok(c.google)}</div><div class="d">${c.google ? esc(c.google.label) + (c.google.youtube ? ' · default YouTube channel: ' + esc(c.google.youtube.title) : ' · no YouTube channel on this account') : 'Drive is where every post starts.'} ${env(e.google)}<br><span class="mi">Uploads into Drive need write access. If you connected before 6 Sep, reconnect once.</span></div><div><a class="act small${e.google ? '' : ' quiet'}" href="/connect/google">${c.google ? 'Reconnect' : 'Connect Google'} →</a></div></div>
      <div class="card conn"><div class="h"><b>${sprite('yt', 'px')} YouTube · one channel per brand</b>${ok(Object.keys(c.youtube || {}).length)}</div>
        <div class="d">Each brand can own its own channel. Pick the right channel on Google's screen when you connect; a brand with no channel of its own falls back to the account above.</div>
        <div class="ytrows">${S.brands.map(b => { const y = (c.youtube || {})[b.id]; const dupe = y && y.channel && S.brands.some(o => o.id !== b.id && ((c.youtube || {})[o.id] || {}).channel && c.youtube[o.id].channel.id === y.channel.id);
          return `<div class="ytrow"><span class="tag" style="--dot:${b.color}">${esc(b.name)}</span><span class="d">${y ? (y.channel ? esc(y.channel.title) : esc(y.label)) : (c.google && c.google.youtube ? 'falls back to ' + esc(c.google.youtube.title) : 'no channel yet')}${dupe ? ' <span class="mi hot">same channel as another brand</span>' : ''}</span><span class="row"><a class="act small quiet" href="/connect/youtube/${b.id}">${y ? 'Change' : 'Connect'} →</a>${y ? `<button class="act small quiet danger" data-unyt="${b.id}">Unbind</button>` : ''}</span></div>`; }).join('')}</div></div>
      <div class="card conn"><div class="h"><b>${sprite('post', 'px')} Meta · Facebook Page + Instagram</b>${ok(c.meta)}</div><div class="d">${c.meta ? metaPages : 'Your Facebook Pages and the Instagram Business accounts linked to them. Development mode is enough for your own accounts.'} ${env(e.meta)}</div><div><a class="act small${e.meta ? '' : ' quiet'}" href="/connect/meta">${c.meta ? 'Reconnect' : 'Connect Meta'} →</a></div></div>
      <div class="card conn"><div class="h"><b>${sprite('tt', 'px')} TikTok</b>${ok(c.tiktok)}</div><div class="d">${c.tiktok ? esc(c.tiktok.label) : 'Direct posting needs TikTok\'s audit. Until then the crew sends the file and caption to your LINE for a one-tap share.'} ${env(e.tiktok)}</div><div><a class="act small${e.tiktok ? '' : ' quiet'}" href="/connect/tiktok">${c.tiktok ? 'Reconnect' : 'Connect TikTok'} →</a></div></div>
      <div class="card conn"><div class="h"><b>${sprite('tobtan', 'px')} LINE · approvals</b>${ok(e.line && e.line_boss)}</div><div class="d">Channel ${env(e.line)} · your user id ${env(e.line_boss)}. Add the bot as a friend, send the word <b>artery</b>, and it replies with your id.</div></div>
      <div class="card conn"><div class="h"><b>${sprite('draft', 'px')} The crew's brain · Anthropic</b>${ok(e.anthropic)}</div><div class="d">Writes captions in each brand's voice and drafts replies. ${env(e.anthropic)}</div></div>
      <div class="card conn"><div class="h"><b>${sprite('iris', 'px')} This app</b>${ok(e.session)}</div><div class="d">${esc(S.app_url)} · timezone Bangkok · signed media URLs ${env(e.session)}</div></div>`;
    $('sAuto').checked = S.settings.autonomous; $('sReply').checked = S.settings.auto_reply; $('sYtPrivate').checked = S.settings.yt_privacy === 'private';
    $('sAuto').onchange = async () => { await api('/api/settings', { method: 'PUT', body: { autonomous: $('sAuto').checked } }); S.settings.autonomous = $('sAuto').checked; $('auto').setAttribute('aria-pressed', String(S.settings.autonomous)); $('auto').querySelector('span').textContent = 'Autonomous · ' + (S.settings.autonomous ? 'on' : 'off'); renderCrew(); };
    $('sReply').onchange = async () => { await api('/api/settings', { method: 'PUT', body: { auto_reply: $('sReply').checked } }); S.settings.auto_reply = $('sReply').checked; renderCrew(); };
    $('sYtPrivate').onchange = async () => { await api('/api/settings', { method: 'PUT', body: { yt_privacy: $('sYtPrivate').checked ? 'private' : 'public' } }); };
    const pages = c.meta ? c.meta.pages : [];
    $('brandsEdit').innerHTML = S.brands.map(b => `<div class="card" style="padding:16px 18px;display:grid;gap:12px" data-brand="${b.id}"><div class="h" style="display:flex;justify-content:space-between;align-items:center"><span class="tag" style="--dot:${b.color};font-size:12px">${esc(b.name)}</span><button class="act small quiet" data-save="${b.id}">Save</button></div>
      <div class="kv"><div class="field"><label>Drive folder · link or id</label><input data-f="drive_folder_id" value="${esc(b.drive_folder_id)}" placeholder="https://drive.google.com/drive/folders/…"></div><div class="field"><label>Hashtags</label><input data-f="hashtags" value="${esc(b.hashtags)}"></div></div>
      <div class="field"><label>Voice · how this brand speaks</label><textarea data-f="voice" rows="3">${esc(b.voice)}</textarea></div>
      <div class="kv"><div class="field"><label>Facebook Page</label><select data-f="fb"><option value="">—</option>${pages.map(p => `<option value="${p.id}" ${b.channels.fb === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div><div class="field"><label>Instagram account</label><select data-f="ig"><option value="">—</option>${pages.filter(p => p.ig).map(p => `<option value="${p.ig.id}" ${b.channels.ig === p.ig.id ? 'selected' : ''}>@${esc(p.ig.username)}</option>`).join('')}</select></div></div>
      <div class="kv" style="grid-template-columns:repeat(4,minmax(0,1fr))">${['ig', 'fb', 'yt', 'tt'].map(ch => `<div class="field"><label>${CHN[ch]} hour</label><input data-h="${ch}" value="${esc((b.default_hours || {})[ch] || '')}" placeholder="19:00"></div>`).join('')}</div>
      <div class="field"><label>Language</label><select data-f="language"><option value="th" ${b.language === 'th' ? 'selected' : ''}>Thai</option><option value="en" ${b.language === 'en' ? 'selected' : ''}>English</option></select></div>
      <div class="field"><label>Standing slots · the rhythm this brand keeps</label>
        <div class="slots" data-slots>${(b.slots || []).map(s => slotRow(s)).join('')}</div>
        <button class="act quiet small" data-addslot>Add a slot</button>
        <span style="font-size:13px;color:var(--ink2)">A queued post drops into the next free slot on its own. Empty slots show on the calendar so the gaps are visible.</span>
      </div></div>`).join('');
    if (!$('brandsEdit')._wired) {
      $('brandsEdit')._wired = 1;
      $('brandsEdit').addEventListener('click', async e => {
        const add = e.target.closest('[data-addslot]');
        if (add) { add.closest('[data-brand]').querySelector('[data-slots]').insertAdjacentHTML('beforeend', slotRow({ dow: 0, time: '19:00' })); return; }
        const del = e.target.closest('[data-delslot]'); if (del) { del.closest('.slot').remove(); return; }
        const btn = e.target.closest('[data-save]'); if (!btn) return;
        const card = btn.closest('[data-brand]'); const g = k => card.querySelector(`[data-f="${k}"]`).value;
        const hours = {}; [].forEach.call(card.querySelectorAll('[data-h]'), i => { if (i.value) hours[i.dataset.h] = i.value; });
        const slots = [].map.call(card.querySelectorAll('.slot'), s => ({ dow: +s.querySelector('[data-s="dow"]').value, time: s.querySelector('[data-s="time"]').value })).filter(s => s.time);
        const b = S.brands.find(x => x.id === card.dataset.brand); const channels = { ...b.channels, fb: g('fb') || undefined, ig: g('ig') || undefined };
        await api('/api/brands/' + card.dataset.brand, { method: 'PUT', body: { drive_folder_id: g('drive_folder_id'), hashtags: g('hashtags'), voice: g('voice'), language: g('language'), default_hours: hours, channels, slots } });
        toast('Saved'); S = await api('/api/state'); renderCrew(); renderChecklist(); renderView();
      });
    }
    loadLog();
  }
  async function loadLog() { const { log } = await api('/api/log'); $('logBox').textContent = log.map(l => `${new Date(l.at * 1000).toISOString().slice(5, 16).replace('T', ' ')} ${l.level === 'error' ? '✕' : l.level === 'warn' ? '!' : '·'} ${l.area}: ${l.msg}${l.data ? ' ' + l.data.slice(0, 160) : ''}`).join('\n') || 'Quiet.'; }
  $('bRun').onclick = async () => { $('bRun').disabled = true; try { const r = await api('/api/cron/run', { method: 'POST' }); toast('Ran'); await refresh(); loadLog(); console.log(r); } finally { $('bRun').disabled = false; } };
  $('conns').addEventListener('click', async e => {
    const b = e.target.closest('[data-unyt]'); if (!b) return;
    if (!confirm('Unbind this brand from its YouTube channel? It will fall back to the main Google account.')) return;
    await api('/api/connections/' + encodeURIComponent('youtube:' + b.dataset.unyt), { method: 'DELETE' });
    toast('Unbound'); S = await api('/api/state'); renderSettings();
  });
  $('bChecklist').onclick = () => { store.set('checklistDone', '0'); renderChecklist(); location.hash = '#queue'; };
  $('bGuides').onclick = () => {
    const on = !$('previews').classList.contains('guides');
    $('previews').classList.toggle('guides', on); $('bGuides').setAttribute('aria-pressed', String(on));
    store.set('guides', on ? '1' : '0');
    toast(on ? 'Keep faces and words inside the 4:5 box' : 'Guides off');
  };
  $('barMore').onclick = () => { const bar = $('barMore').closest('.bar'); bar.classList.toggle('open'); $('barMore').textContent = bar.classList.contains('open') ? 'Fewer' : 'More'; };
  $('bLineTest').onclick = async () => { const r = await api('/api/line/test', { method: 'POST' }); toast(r.ok ? 'Sent to LINE' : 'LINE not configured'); };


  /* ── the map: where each brand publishes, and what is missing ── */
  let mapData = null;
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const ago = u => { if (!u) return 'never'; const l = localParts(u); return `${l.d} ${monthName(l.m).slice(0, 3)}`; };
  async function loadMap() {
    mapData = await api('/api/map');
    const t = localNow();
    $('mapAt').textContent = `${t.d} ${monthName(t.m)} · Bangkok`;
    $('mapList').innerHTML = mapData.brands.map(b => {
      const nodes = ['ig', 'fb', 'yt', 'tt'].map(c => {
        const x = b.channels[c];
        const state = !x.on ? 'off' : (x.needs ? 'broken' : 'live');
        const when = x.next_at ? (() => { const l = localParts(x.next_at); return `next ${l.d} ${monthName(l.m).slice(0, 3)} ${pad(l.h)}:${pad(l.min)}`; })() : (x.hour ? 'usual hour ' + x.hour : 'no time set');
        return `<div class="mnode ch ${state}" id="n-${b.id}-${c}">
          <div class="chh">${sprite(c, 'px')}<b>${CHN[c]}</b><button class="sw" data-ch="${b.id}:${c}" aria-pressed="${x.on}">${x.on ? 'On' : 'Off'}</button></div>
          <div class="chb">${x.bound ? esc(x.bound) : `<span class="mi hot">${esc(x.needs || 'not connected')}</span>`}</div>
          <div class="mi">${x.out30} out · 30 days${x.failed30 ? ` · <span class="hot">${x.failed30} failed</span>` : ''}</div>
          <div class="mi">last ${ago(x.last_at)} · ${esc(when)}</div>
        </div>`;
      }).join('');
      const slots = (b.slots || []).length ? b.slots.map(s => `${DOW[s.dow]} ${s.time}`).join(' · ') : 'no standing slot';
      return `<div class="card mapb" data-brand="${b.id}" style="--dot:${b.color}">
        <div class="mapgrid">
          <div class="mnode brand" id="n-${b.id}">
            <span class="tag">${b.language === 'th' ? 'Thai' : 'English'}</span>
            <b class="disp">${esc(b.name)}</b>
            <span class="mi">${b.drive ? 'Drive folder set' : '<span class="hot">no Drive folder</span>'}</span>
            <span class="mi">${esc(slots)}</span>
            <span class="mi">${b.publish_to.length} channel${b.publish_to.length === 1 ? '' : 's'} on</span>
          </div>
          <div class="mchans">${nodes}</div>
          <svg class="mlinks" aria-hidden="true"></svg>
        </div>
        ${b.gaps.length ? `<div class="gaps"><span class="mi hot">Missing</span><ul>${b.gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div>` : '<div class="gaps ok"><span class="mi ok">Nothing missing</span></div>'}
      </div>`;
    }).join('') || '<div class="card"><div class="empty">No brands yet.</div></div>';
    requestAnimationFrame(drawLinks);
  }
  function drawLinks() {
    if (!mapData || $('map').hidden) return;
    for (const b of mapData.brands) {
      const wrap = $('mapList').querySelector(`[data-brand="${b.id}"] .mapgrid`);
      const svg = wrap && wrap.querySelector('.mlinks'); const from = $('n-' + b.id);
      if (!svg || !from || getComputedStyle(svg).display === 'none') continue;
      const box = wrap.getBoundingClientRect(), a = from.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      svg.setAttribute('width', box.width); svg.setAttribute('height', box.height);
      const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top;
      svg.innerHTML = ['ig', 'fb', 'yt', 'tt'].map(c => {
        const el = $(`n-${b.id}-${c}`); if (!el) return '';
        const r = el.getBoundingClientRect();
        const x2 = r.left - box.left, y2 = r.top + r.height / 2 - box.top, dx = Math.max(24, (x2 - x1) / 2);
        const x = b.channels[c];
        const cls = !x.on ? 'off' : (x.needs ? 'broken' : 'live');
        return `<path class="${cls}" d="M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}"${cls === 'live' ? ` style="stroke:${b.color}"` : ''}/>`;
      }).join('');
    }
  }
  $('mapList').addEventListener('click', async e => {
    const sw = e.target.closest('.sw'); if (!sw) return;
    const [bid, ch] = sw.dataset.ch.split(':');
    const b = mapData.brands.find(x => x.id === bid); if (!b) return;
    const on = !b.publish_to.includes(ch);
    const next = on ? b.publish_to.concat(ch) : b.publish_to.filter(c => c !== ch);
    sw.disabled = true;
    try { await api('/api/brands/' + bid, { method: 'PUT', body: { publish_to: next } }); toast(on ? CHN[ch] + ' on for ' + b.name : CHN[ch] + ' off for ' + b.name); await loadMap(); S = await api('/api/state'); }
    finally { sw.disabled = false; }
  });
  $('mapRefresh').onclick = () => loadMap();
  addEventListener('resize', () => { clearTimeout(drawLinks._t); drawLinks._t = setTimeout(drawLinks, 120); });

  /* ── routing ── */
  const tabs = [].slice.call(document.querySelectorAll('.tabs [role=tab]'));
  const TABSPR = { queue: 'schedule', compose: 'draft', library: 'cut', inbox: 'tobtan', pulse: 'iris', map: 'post', settings: 'fetch' };
  tabs.forEach(t => t.insertAdjacentHTML('afterbegin', sprite(TABSPR[t.dataset.t], 'tabpx')));
  function show(id) { tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.t === id))); ['queue', 'compose', 'library', 'inbox', 'pulse', 'map', 'settings'].forEach(k => $(k).hidden = k !== id); }
  function route() {
    const h = (location.hash || '#queue').slice(1); const [tab, arg] = h.split('/');
    if (!['queue', 'compose', 'library', 'inbox', 'pulse', 'map', 'settings'].includes(tab)) return show('queue');
    show(tab);
    if (tab === 'compose' && arg) loadCompose(arg); else if (tab === 'compose' && !cur) { $('cEmpty').hidden = false; $('cForm').hidden = true; }
    if (tab === 'library') loadLibrary(); if (tab === 'inbox') loadInbox(); if (tab === 'pulse') loadPulse(); if (tab === 'map') loadMap(); if (tab === 'settings') { renderSettings(); }
    if (tab === 'queue') refresh();
  }
  tabs.forEach(t => t.addEventListener('click', () => { location.hash = '#' + t.dataset.t + (t.dataset.t === 'compose' && cur ? '/' + cur.id : ''); }));
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !S || Date.now() - lastRefresh < 45000) return;
    refresh().catch(() => {});
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); $('pick').hidden = true; $('pickBack').hidden = true; } });
  boot().catch(e => { console.error(e); toast('Could not load. Sign in again.'); });
})();
