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
  const off = () => (S && S.tz_offset_min) || 420;
  const localNow = () => { const d = new Date(Date.now() + off() * 60000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
  const localParts = u => { const d = new Date((u + off() * 60) * 1000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), min: d.getUTCMinutes() }; };
  const pad = n => String(n).padStart(2, '0');
  const brandOf = id => (S.brands || []).find(b => b.id === id) || { name: id, color: '#000' };
  const monthName = m => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1];
  function thumbHtml(p, cls) {
    const b = brandOf(p.brand_id);
    if (p.asset_thumb) return `<div class="thumb ${cls || ''}" style="background-image:url('${esc(p.asset_thumb)}')"></div>`;
    return `<div class="thumb brand ${p.brand_id} ${cls || ''}"><span class="disp">${esc((p.title || b.name).slice(0, 12))}</span></div>`;
  }

  /* ── boot ── */
  async function boot() {
    S = await api('/api/state');
    const t = localNow(); month = month || { y: t.y, m: t.m };
    renderPills(); renderCrew(); renderSettings();
    $('auto').setAttribute('aria-pressed', String(S.settings.autonomous)); $('auto').querySelector('span').textContent = 'Autonomous · ' + (S.settings.autonomous ? 'on' : 'off');
    $('nWait').textContent = S.counts.waiting; $('nWait').hidden = !S.counts.waiting; $('nOpen').textContent = S.counts.open; $('nOpen').hidden = !S.counts.open;
    $('sDrafts').textContent = S.counts.drafts; $('sWait').textContent = S.counts.waiting;
    await loadMonth(); route();
  }
  function renderPills() {
    $('brandPills').innerHTML = `<button aria-pressed="${brandFilter === 'all'}" data-b="all"><i style="background:var(--blood)"></i>All</button>` + S.brands.map(b => `<button aria-pressed="${brandFilter === b.id}" data-b="${b.id}"><i style="background:${b.color}"></i>${esc(b.name)}</button>`).join('');
    $('legend').innerHTML = S.brands.map(b => `<span class="tag" style="--dot:${b.color}">${esc(b.name)}</span>`).join('') + '<span class="mi" style="margin-left:auto">Tap a day to open it</span>';
    [].forEach.call($('brandPills').querySelectorAll('button'), btn => btn.addEventListener('click', () => { brandFilter = btn.dataset.b; renderPills(); renderCal(); if (!$('inbox').hidden) loadInbox(); }));
  }
  function renderCrew() {
    const e = S.env, c = S.connections;
    const CREW = [['fetch', 'Fetch', c.google ? 'Watching Drive' : 'Drive not connected', !!c.google], ['draft', 'Draft', e.anthropic ? 'Writes in each voice' : 'No API key', e.anthropic], ['cut', 'Cut', 'Every ratio · soon', false], ['schedule', 'Schedule', S.settings.autonomous ? 'Best hour, on its own' : 'Waits for you', true], ['post', 'Post', (c.meta ? 'IG · FB' : '') + (c.google && c.google.youtube ? ' · YT' : '') + (c.tiktok ? ' · TT' : '') || 'Nothing connected', !!(c.meta || c.tiktok || (c.google && c.google.youtube))], ['tobtan', 'Answer', e.anthropic ? (S.settings.auto_reply ? 'Replies on its own' : 'Drafts, you send') : 'No API key', e.anthropic], ['iris', 'Count', 'Numbers for IRIS', true]];
    $('crew').innerHTML = CREW.map((w, i) => `<div class="worker${w[3] ? '' : ' off'}${i === 4 && S.counts.waiting ? ' busy' : ''}">${sprite(w[0])}<b>${w[1]}</b><span>${esc(w[2])}</span></div>`).join('');
  }

  /* ── queue ── */
  async function loadMonth() {
    const from = Date.UTC(month.y, month.m - 1, 1) / 1000 - 8 * 86400, to = Date.UTC(month.y, month.m, 1) / 1000 + 8 * 86400;
    posts = (await api(`/api/posts?from=${from}&to=${to}`)).posts || [];
    renderCal();
  }
  function renderCal() {
    $('qMi').textContent = `${monthName(month.m)} ${month.y} · Bangkok`;
    const first = new Date(Date.UTC(month.y, month.m - 1, 1)).getUTCDay(), days = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
    const t = localNow(); const vis = posts.filter(p => brandFilter === 'all' || p.brand_id === brandFilter);
    const byDay = {}; let sched = 0; const chCount = {};
    for (const p of vis) { if (!p.publish_at) continue; const l = localParts(p.publish_at); if (l.y === month.y && l.m === month.m) { (byDay[l.d] = byDay[l.d] || []).push(p); if (p.status === 'sched' || p.status === 'live') { sched++; p.channels.forEach(c => chCount[c] = (chCount[c] || 0) + 1); } } }
    $('sSched').textContent = sched; $('sSchedD').textContent = Object.keys(chCount).map(c => `${CHN[c]} ${chCount[c]}`).join(' · ') || 'Nothing yet this month.';
    let cells = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="dow">${d}</div>`).join('');
    const prevDays = new Date(Date.UTC(month.y, month.m - 1, 0)).getUTCDate();
    for (let i = first - 1; i >= 0; i--) cells += `<div class="cell out"><div class="d"><b>${prevDays - i}</b></div></div>`;
    for (let d = 1; d <= days; d++) {
      const ps = (byDay[d] || []).sort((a, b) => a.publish_at - b.publish_at);
      let inner = ps.slice(0, 2).map(p => { const l = localParts(p.publish_at); return `<div class="mini ${p.status}" data-id="${p.id}">${thumbHtml(p)}<div class="t"><b>${esc(p.title)}</b><span>${pad(l.h)}:${pad(l.min)} · ${p.channels.map(c => c.toUpperCase()).join(' · ')}</span></div></div>`; }).join('');
      if (ps.length > 2) inner += `<div class="more">+${ps.length - 2} more</div>`;
      const today = t.y === month.y && t.m === month.m && t.d === d;
      cells += `<button class="cell${today ? ' today' : ''}" data-d="${d}"><div class="d"><b>${d}</b>${d === 1 ? `<small>${monthName(month.m).slice(0, 3)}</small>` : ''}</div><div class="posts">${inner}</div></button>`;
    }
    const tail = (7 - ((first + days) % 7)) % 7; for (let j = 1; j <= tail; j++) cells += `<div class="cell out"><div class="d"><b>${j}</b></div></div>`;
    $('cal').innerHTML = cells;
  }
  function openDay(d) {
    const vis = posts.filter(p => brandFilter === 'all' || p.brand_id === brandFilter).filter(p => { if (!p.publish_at) return false; const l = localParts(p.publish_at); return l.y === month.y && l.m === month.m && l.d === d; }).sort((a, b) => a.publish_at - b.publish_at);
    const dow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(Date.UTC(month.y, month.m - 1, d)).getUTCDay()];
    $('sheetMi').textContent = `${dow.slice(0, 3)} · ${d} ${monthName(month.m).slice(0, 3)} ${month.y} · ${vis.length} post${vis.length === 1 ? '' : 's'}`; $('sheetTitle').textContent = `${dow} ${d}`;
    $('sheetBody').innerHTML = vis.length ? vis.map(p => { const l = localParts(p.publish_at); const b = brandOf(p.brand_id); return `<div class="sp">${thumbHtml(p)}<div class="in"><div class="meta"><span class="tag" style="--dot:${b.color}">${esc(b.name)}</span><span class="st ${p.status}">${STN[p.status] || p.status}</span></div><h4>${esc(p.title)}</h4><div class="meta"><span class="mi ink">${pad(l.h)}:${pad(l.min)}</span>${p.channels.map(chip).join('')}</div><div class="row">${p.status === 'wait' ? `<button class="act small" data-approve="${p.id}">Approve →</button>` : ''}<a class="act small quiet" href="#compose/${p.id}">Open</a>${p.status === 'live' ? '<a class="act small quiet" href="#pulse">Numbers</a>' : ''}</div></div></div>`; }).join('') : '<div class="empty">Nothing planned. Drop a file into Drive or add a post.</div>';
    $('sheetNew').onclick = () => { closeSheet(); openPick(`${month.y}-${pad(month.m)}-${pad(d)}T19:00`); };
    $('sheet').hidden = false; $('sheetBack').hidden = false;
  }
  function closeSheet() { $('sheet').hidden = true; $('sheetBack').hidden = true; }
  $('cal').addEventListener('click', e => { const c = e.target.closest('.cell[data-d]'); if (c) openDay(+c.dataset.d); });
  $('sheetBack').onclick = closeSheet; $('sheetX').onclick = closeSheet;
  $('sheetBody').addEventListener('click', async e => { const a = e.target.closest('[data-approve]'); if (a) { await api(`/api/posts/${a.dataset.approve}/approve`, { method: 'POST' }); toast('Approved'); closeSheet(); await refresh(); } });
  $('prevM').onclick = () => { month.m--; if (month.m < 1) { month.m = 12; month.y--; } loadMonth(); };
  $('nextM').onclick = () => { month.m++; if (month.m > 12) { month.m = 1; month.y++; } loadMonth(); };
  $('todayM').onclick = () => { const t = localNow(); month = { y: t.y, m: t.m }; loadMonth(); };
  $('auto').onclick = async () => { const on = $('auto').getAttribute('aria-pressed') !== 'true'; await api('/api/settings', { method: 'PUT', body: { autonomous: on } }); S.settings.autonomous = on; $('auto').setAttribute('aria-pressed', String(on)); $('auto').querySelector('span').textContent = 'Autonomous · ' + (on ? 'on' : 'off'); renderCrew(); $('sAuto').checked = on; };
  async function refresh() { S = await api('/api/state'); $('nWait').textContent = S.counts.waiting; $('nWait').hidden = !S.counts.waiting; $('nOpen').textContent = S.counts.open; $('nOpen').hidden = !S.counts.open; $('sDrafts').textContent = S.counts.drafts; $('sWait').textContent = S.counts.waiting; renderCrew(); await loadMonth(); }

  /* ── new post picker ── */
  let pickWhen = null;
  function openPick(when) {
    pickWhen = when || null; $('pickBrand').innerHTML = S.brands.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
    $('pick').hidden = false; $('pickBack').hidden = false; loadPickFiles();
  }
  async function loadPickFiles() {
    const b = $('pickBrand').value; $('pickFiles').innerHTML = '<div class="empty">Looking in Drive…</div>';
    try { const { files } = await api(`/api/drive/files?brand=${b}`); $('pickFiles').innerHTML = files.length ? files.map(f => `<button class="sp" style="text-align:left" data-file="${f.id}"><div class="thumb" style="background-image:url('${esc(f.thumb || '')}')"></div><div class="in"><h4>${esc(f.name)}</h4><span class="mi">${esc(f.mime)} · ${(f.size / 1048576).toFixed(0)} MB</span></div></button>`).join('') : '<div class="empty">No files in this brand\'s folder yet (or no folder set in Settings).</div>'; }
    catch (e) { $('pickFiles').innerHTML = '<div class="empty">Drive is not connected. Connect it in Settings, or start without a file.</div>'; }
  }
  $('pickBrand').onchange = loadPickFiles; $('pickBack').onclick = $('pickX').onclick = () => { $('pick').hidden = true; $('pickBack').hidden = true; };
  $('pickFiles').addEventListener('click', async e => { const f = e.target.closest('[data-file]'); if (!f) return; const { id } = await api('/api/posts', { method: 'POST', body: { brand_id: $('pickBrand').value, drive_file_id: f.dataset.file, title: f.querySelector('h4').textContent.replace(/\.[^.]+$/, ''), publish_local: pickWhen, channels: /video/.test(f.querySelector('.mi').textContent) ? ['ig', 'fb', 'yt', 'tt'] : ['ig', 'fb'] } }); $('pick').hidden = true; $('pickBack').hidden = true; location.hash = '#compose/' + id; });
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
    $('cRatios').innerHTML = isVideo ? '<span class="pill">9:16 master</span><span class="pill off">16:9 · YouTube uses the master for now</span>' : (cur.asset_name ? '<span class="pill">image</span>' : '');
    $('fTitle').value = cur.title || ''; $('fMaster').value = cur.master_caption || '';
    $('fChannels').innerHTML = ['ig', 'fb', 'yt', 'tt'].map(c => `<label><input type="checkbox" value="${c}" ${cur.channels.includes(c) ? 'checked' : ''}>${sprite(c, 'px')} ${CHN[c]}</label>`).join('');
    $('fWhen').value = cur.local ? cur.local.replace(' ', 'T') : '';
    const bh = (b.default_hours || {}); $('fBest').textContent = `Brand default hours · IG ${bh.ig || '—'} · FB ${bh.fb || '—'} · YT ${bh.yt || '—'} · TT ${bh.tt || '—'}. The crew learns better hours from your numbers.`;
    renderPreviews(); $('fChannels').onchange = renderPreviews;
    const live = cur.status === 'live' || cur.status === 'publishing';
    $('bLine').disabled = live; $('bApprove').disabled = live; $('bNow').disabled = live; $('bHold').disabled = live;
    $('cHint').innerHTML = live ? Object.keys(cur.results).map(c => `${CHN[c]}: ${cur.results[c].error ? '<span class="mi hot">' + esc(cur.results[c].error) + '</span>' : (cur.results[c].url ? `<a href="${esc(cur.results[c].url)}" target="_blank" rel="noopener" style="text-decoration:underline">open</a>` : 'ok')}`).join(' · ') + (cur.status === 'failed' ? ' <button class="act small quiet" id="bRetry">Retry</button>' : '') : 'Approval goes to your LINE with all previews. Nothing goes live without you.';
    const rt = $('bRetry'); if (rt) rt.onclick = async () => { await api(`/api/posts/${cur.id}/retry`, { method: 'POST' }); toast('Retried'); loadCompose(cur.id); };
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
      ig: () => `<div class="stage"><div class="phone"><div class="scr">${media()}<div class="topbar"><span>Reels</span><span>●</span></div><div class="rail"><i></i><i></i><i></i></div><div class="ov"><b>${esc(b.name.toLowerCase())}</b>${esc((caps.ig && caps.ig.text) || cur.master_caption || '')}</div></div></div></div><div class="edit"><div class="field"><label>Instagram caption</label><textarea rows="4" data-cap="ig.text">${esc((caps.ig && caps.ig.text) || '')}</textarea></div></div>`,
      fb: () => `<div class="stage"><div class="fb"><div class="h"><div class="av"></div><div><b>${esc(b.name)}</b><span>${cur.local ? esc(cur.local) : 'Unscheduled'} · Public</span></div></div><p>${esc((caps.fb && caps.fb.text) || cur.master_caption || '')}</p>${cur.asset_thumb ? `<div class="v" style="background-image:url('${esc(cur.asset_thumb)}')"></div>` : ''}<div class="r"><span>Like</span><span>Comment</span><span>Share</span></div></div></div><div class="edit"><div class="field"><label>Facebook text</label><textarea rows="4" data-cap="fb.text">${esc((caps.fb && caps.fb.text) || '')}</textarea></div></div>`,
      yt: () => `<div class="stage"><div class="yt"><div class="v" style="background-image:url('${esc(cur.asset_thumb || '')}')"><div class="play"></div></div><div class="m"><div class="av"></div><div><b>${esc((caps.yt && caps.yt.title) || cur.title || '')}</b><span>${esc(b.name)} · ${cur.local ? esc(cur.local.slice(11)) : ''}</span></div></div></div></div><div class="edit"><div class="field"><label>YouTube title</label><input data-cap="yt.title" value="${esc((caps.yt && caps.yt.title) || '')}"></div><div class="field"><label>Description</label><textarea rows="4" data-cap="yt.description">${esc((caps.yt && caps.yt.description) || '')}</textarea></div></div>`,
      tt: () => `<div class="stage"><div class="phone"><div class="scr">${media()}<div class="topbar"><span>Following</span><span>For You</span></div><div class="rail"><i></i><i></i><i></i></div><div class="ov"><b>@${esc(b.name.toLowerCase())}</b>${esc((caps.tt && caps.tt.text) || '')}</div></div></div></div><div class="edit"><div class="field"><label>TikTok caption</label><textarea rows="3" data-cap="tt.text">${esc((caps.tt && caps.tt.text) || '')}</textarea></div><span class="mi hot">One-tap share from LINE until TikTok's audit clears</span></div>`
    };
    $('previews').innerHTML = chs.map(c => `<div class="card pv"><header><b>${sprite(c, 'px')} ${CHN[c]}</b><span class="mi">${c === 'yt' ? '16:9 or 9:16 Shorts' : c === 'fb' ? 'auto' : '9:16'}</span></header>${block[c]()}<footer><span class="st ${(caps[c] && (caps[c].text || caps[c].title)) ? 'sched' : 'draft'}">${(caps[c] && (caps[c].text || caps[c].title)) ? 'Ready' : 'Needs a caption'}</span></footer></div>`).join('');
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
  $('bDelete').onclick = async () => { if (!confirm('Delete this post?')) return; await api('/api/posts/' + cur.id, { method: 'DELETE' }); cur = null; await refresh(); location.hash = '#queue'; };

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
  function renderSettings() {
    const c = S.connections, e = S.env;
    const ok = v => v ? '<span class="st sched">Connected</span>' : '<span class="st draft">Not yet</span>';
    const env = v => v ? '<span class="mi ok">key set</span>' : '<span class="mi hot">key missing</span>';
    const metaPages = c.meta ? c.meta.pages.map(p => `${esc(p.name)}${p.ig ? ' · IG @' + esc(p.ig.username) : ' · no IG linked'}`).join('<br>') : '';
    $('conns').innerHTML = `
      <div class="card conn"><div class="h"><b>${sprite('fetch', 'px')} Google · Drive + YouTube</b>${ok(c.google)}</div><div class="d">${c.google ? esc(c.google.label) + (c.google.youtube ? ' · YouTube: ' + esc(c.google.youtube.title) : ' · no YouTube channel on this account') : 'Drive is where every post starts. One consent covers Drive and YouTube.'} ${env(e.google)}</div><div><a class="act small${e.google ? '' : ' quiet'}" href="/connect/google">${c.google ? 'Reconnect' : 'Connect Google'} →</a></div></div>
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
      <div class="field"><label>Language</label><select data-f="language"><option value="th" ${b.language === 'th' ? 'selected' : ''}>Thai</option><option value="en" ${b.language === 'en' ? 'selected' : ''}>English</option></select></div></div>`).join('');
    $('brandsEdit').addEventListener('click', async e => { const btn = e.target.closest('[data-save]'); if (!btn) return; const card = btn.closest('[data-brand]'); const g = k => card.querySelector(`[data-f="${k}"]`).value; const hours = {}; [].forEach.call(card.querySelectorAll('[data-h]'), i => { if (i.value) hours[i.dataset.h] = i.value; });
      const b = S.brands.find(x => x.id === card.dataset.brand); const channels = { ...b.channels, fb: g('fb') || undefined, ig: g('ig') || undefined };
      await api('/api/brands/' + card.dataset.brand, { method: 'PUT', body: { drive_folder_id: g('drive_folder_id'), hashtags: g('hashtags'), voice: g('voice'), language: g('language'), default_hours: hours, channels } }); toast('Saved'); S = await api('/api/state'); renderCrew(); });
    loadLog();
  }
  async function loadLog() { const { log } = await api('/api/log'); $('logBox').textContent = log.map(l => `${new Date(l.at * 1000).toISOString().slice(5, 16).replace('T', ' ')} ${l.level === 'error' ? '✕' : l.level === 'warn' ? '!' : '·'} ${l.area}: ${l.msg}${l.data ? ' ' + l.data.slice(0, 160) : ''}`).join('\n') || 'Quiet.'; }
  $('bRun').onclick = async () => { $('bRun').disabled = true; try { const r = await api('/api/cron/run', { method: 'POST' }); toast('Ran'); await refresh(); loadLog(); console.log(r); } finally { $('bRun').disabled = false; } };
  $('bLineTest').onclick = async () => { const r = await api('/api/line/test', { method: 'POST' }); toast(r.ok ? 'Sent to LINE' : 'LINE not configured'); };

  /* ── routing ── */
  const tabs = [].slice.call(document.querySelectorAll('.tabs [role=tab]'));
  function show(id) { tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.t === id))); ['queue', 'compose', 'inbox', 'pulse', 'settings'].forEach(k => $(k).hidden = k !== id); }
  function route() {
    const h = (location.hash || '#queue').slice(1); const [tab, arg] = h.split('/');
    if (!['queue', 'compose', 'inbox', 'pulse', 'settings'].includes(tab)) return show('queue');
    show(tab);
    if (tab === 'compose' && arg) loadCompose(arg); else if (tab === 'compose' && !cur) { $('cEmpty').hidden = false; $('cForm').hidden = true; }
    if (tab === 'inbox') loadInbox(); if (tab === 'pulse') loadPulse(); if (tab === 'settings') { renderSettings(); }
    if (tab === 'queue') refresh();
  }
  tabs.forEach(t => t.addEventListener('click', () => { location.hash = '#' + t.dataset.t + (t.dataset.t === 'compose' && cur ? '/' + cur.id : ''); }));
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); $('pick').hidden = true; $('pickBack').hidden = true; } });
  boot().catch(e => { console.error(e); toast('Could not load. Sign in again.'); });
})();
