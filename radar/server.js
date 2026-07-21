#!/usr/bin/env node
/* ============================================================================
 * PFC RADAR ONE — STANDALONE SERVER (for PFC IT deployment)
 * ============================================================================
 * Runs the SAME classification engine file (engine.gs) that powers the Google
 * Sheet — loaded verbatim, so the two deployments can never drift.
 *
 * What it does, once per cycle:
 *   fetch Google News RSS feeds  ->  window/stale filters  ->  classify
 *   ->  six-register items  ->  data.json  ->  served with the dashboard
 *
 * Zero npm dependencies. Node.js 18+ (built-in fetch). Outbound HTTPS to
 * news.google.com only. No inbound internet required — intranet-only is fine.
 *
 * Usage:
 *   node server.js                 # fetch on boot + every N minutes + serve
 *   node server.js --once          # one fetch cycle, write data.json, exit
 *   node server.js --serve-only    # serve existing data.json, no fetching
 *   node server.js --test          # use built-in fixture instead of network
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

/* ---------- config ---------- */
const ROOT = __dirname;
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
const DATA_DIR = path.resolve(ROOT, CFG.dataDir || './data');
const STORE_F = path.join(DATA_DIR, 'store.json');
const DATA_F  = path.join(DATA_DIR, 'data.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ARGS = new Set(process.argv.slice(2));
const backfillMode = ARGS.has('--backfill');
const log = (...a) => console.log(new Date().toISOString(), '|', ...a);

/* ---------- load the shared engine (engine.gs) with Google-API stubs ------ */
/* The engine file is executed as-is. Only the classifier surface is used:
 * defaultFeeds_(), classifyLocal_(), pfcStaleByText_(). Google services are
 * stubbed to inert objects; kmFeeds_() sees no sheet and falls back to the
 * built-in Keyword Master feeds. */
function loadEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'engine.gs'), 'utf8');
  const sandbox = `
    var SpreadsheetApp={getActive:function(){return{getSheetByName:function(){return null},toast:function(){}}}};
    var Session={getScriptTimeZone:function(){return 'Asia/Kolkata'},getActiveUser:function(){return{getEmail:function(){return ''}}}};
    var Utilities={formatDate:function(){return ''},sleep:function(){},DigestAlgorithm:{},Charset:{},base64Encode:function(){return ''}};
    var PropertiesService={getScriptProperties:function(){return{getProperty:function(){return null},setProperty:function(){},deleteProperty:function(){}}}};
    var UrlFetchApp={fetch:function(){throw new Error('UrlFetchApp not available on server')}};
    var MailApp={sendEmail:function(){}}; var GmailApp={sendEmail:function(){}};
    var Logger={log:function(){}}; var console={log:function(){},info:function(){},error:function(){}};
    var HtmlService={}; var ScriptApp={newTrigger:function(){return{timeBased:function(){return{everyHours:function(){return{create:function(){}}}}}}},getProjectTriggers:function(){return[]},deleteTrigger:function(){}};
    ${src}
    ;return { defaultFeeds_: defaultFeeds_, classifyLocal_: classifyLocal_,
              staleByText_: (typeof pfcStaleByText_==='function'?pfcStaleByText_:function(){return false}),
              version: (typeof PFC_VERSION!=='undefined'?PFC_VERSION:'unknown'),
              resetCaches: function(){ if(typeof pfcKmCache_!=='undefined')pfcKmCache_=[]; if(typeof pfcRulesCache_!=='undefined')pfcRulesCache_=[]; } };
  `;
  const eng = new Function(sandbox)();
  eng.resetCaches();
  return eng;
}
const ENGINE = loadEngine();
log('engine loaded:', ENGINE.version);

/* ---------- tiny RSS parser (Google News RSS is regular XML) -------------- */
function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function parseRss(xml) {
  const items = [];
  const blocks = String(xml).split(/<item[\s>]/).slice(1);
  for (const b of blocks) {
    const grab = (tag) => {
      const m = b.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
      return m ? m[1] : '';
    };
    const title = decodeEntities(grab('title'));
    const link = decodeEntities(grab('link'));
    const pub = grab('pubDate');
    const src = decodeEntities(grab('source'));
    const desc = decodeEntities(grab('description'));
    if (!title || !link) continue;
    const d = pub ? new Date(pub) : null;
    items.push({ title, link, source: src, snippet: desc.slice(0, 400),
                 pubDate: (d && !isNaN(d)) ? d : null });
  }
  return items;
}

/* ---------- fixture (for --test in restricted environments) --------------- */
const FIXTURE = [
  ['Power', 'NTPC floats Rs 28,000 crore nuclear EPC tender for indigenous reactors', 'Reuters'],
  ['Power', 'Tata Power to invest $1 billion in renewable capacity addition', 'Economic Times'],
  ['W-Probe', 'NCLT admits insolvency plea against Coastal Energen; moratorium declared', 'Business Standard'],
  ['W-Probe', 'Banks declare KSK Mahanadi promoter a wilful defaulter', 'PTI'],
  ['B-Bonds', 'REC raises Rs 5,000 crore via 10-year bonds at 7.18% coupon', 'Moneycontrol'],
  ['T-Macro', 'RBI holds repo rate at 5.50%, retains neutral stance', 'Mint'],
  ['R-RBI', 'RBI issues master direction on NBFC-IFC scale-based regulation', 'Business Line'],
  ['T-Macro', 'Kazakhstan central bank holds policy rate at 14.75%', 'Some Wire'],
  ['Power', '10 Best Inflation-Proof Investments in 2026', 'Advice Blog']
];
function fixtureFeed() {
  const now = new Date().toUTCString();
  return FIXTURE.map(([tag, t, s]) => ({
    tag, title: t, source: s, snippet: '', pubDate: new Date(now), link: 'https://example.org/' + Buffer.from(t).toString('base64').slice(0, 24)
  }));
}

/* ---------- store ---------- */
function loadStore() { try { return JSON.parse(fs.readFileSync(STORE_F, 'utf8')); } catch (e) { return {}; } }
function saveStore(s) { fs.writeFileSync(STORE_F, JSON.stringify(s)); }

/* ---------- classify one raw item into a dashboard payload item ----------- */
/* Up to three terms explaining WHY this item was picked up: the standing search
   that fetched it, plus the entity/theme the classifier actually matched. */
function keywordsFor(raw, r) {
  const kw = [];
  const push = v => {
    v = String(v || '').trim();
    if (!v || v.length < 2) return;
    if (kw.some(k => k.toLowerCase() === v.toLowerCase())) return;
    if (kw.length < 3) kw.push(v);
  };
  push(String(raw.tag || '').replace(/^(AR|W|T|B|R|C)-/, ''));
  if (r.watch) { push(r.watch.borrower); push(r.watch.subtype); }
  if (r.bus)   { push(r.bus.sector); push(r.bus.state); }
  if (r.borr)  { push(r.borr.source); push(r.borr.instrument); }
  if (r.tre)   { push(r.tre.theme); }
  if (r.comp)  { push(r.comp.competitor); push(r.comp.activity); }
  if (r.reg)   { push(r.reg.regulator); push(r.reg.theme); }
  return kw;
}

/* Google News honours after:/before: in the query. Swap the standing when:Nd
   for an explicit window so we can walk backwards through the quarter. */
function windowedUrl(url, from, to) {
  return url
    .replace(/when(%3A|:)\d+[dhm]/i, '')
    .replace(/([?&]q=)/, '$1' + encodeURIComponent('after:' + from + ' before:' + to + ' '))
    .replace(/\s{2,}/g, ' ');
}
function dateWindows(days, stepDays) {
  const out = [], day = 86400000, now = Date.now();
  for (let start = days; start > 0; start -= stepDays) {
    const from = new Date(now - start * day).toISOString().slice(0, 10);
    const to   = new Date(now - Math.max(start - stepDays, 0) * day).toISOString().slice(0, 10);
    if (from !== to) out.push({ from, to });
  }
  return out;
}

function toPayloadItem(raw, r) {
  const d = raw.pubDate.toISOString().slice(0, 10);
  const base = { i: r.importance || 'Low', d, t: raw.title, l: raw.link, s: raw.source || '', f: raw.tag || '', kw: keywordsFor(raw, r) };
  const out = [];
  if (r.radar === 'BUSINESS' && r.bus) {
    out.push({ r: 'BUSINESS', ...base, x: { cr: r.bus.size_cr || r.bus.exposure_cr || null, ben: r.bus.why || '' } });
  } else if (r.radar === 'WATCH' && r.watch) {
    out.push({ r: 'WATCH', ...base, x: { bor: r.watch.borrower || '', sub: r.watch.subtype || '', cls: r.watch.cls || '', cr: r.watch.est_cr || null, why: r.watch.signal || '' } });
    if (/new capex/i.test(String(r.watch.subtype))) {   // dual-post: capex is also a lending lead
      out.push({ r: 'BUSINESS', ...base, x: { cr: r.watch.est_cr || null, ben: 'Borrower capex — concurrent lending lead. BD: engage sponsor on funding plan.' } });
    }
  } else if (r.radar === 'BORROWING' && r.borr) {
    out.push({ r: 'BORROWING', ...base, x: { src: r.borr.source || '', icls: r.borr.issuer_class || '', inst: r.borr.instrument || '', amt: r.borr.amount || '', cr: r.borr.est_cr || null, ten: r.borr.tenor || '', cpn: r.borr.pricing || '', ben: r.borr.benefit || '' } });
  } else if (r.radar === 'TREASURY' && r.tre) {
    out.push({ r: 'TREASURY', ...base, x: { th: r.tre.theme || '', rt: r.tre.rate_dir || '', inr: r.tre.inr_dir || '', imp: r.tre.impact || '', hed: r.tre.hedging || '' } });
  } else if (r.radar === 'COMPETITOR' && r.comp) {
    out.push({ r: 'COMPETITOR', ...base, x: { comp: r.comp.competitor || '', act: r.comp.activity || '', det: r.comp.details || '', cr: r.comp.est_cr || null, terms: r.comp.pricing || '', why: r.comp.implication || '' } });
  } else if (r.radar === 'REGULATORY' && r.reg) {
    out.push({ r: 'REGULATORY', ...base, x: { reg: r.reg.regulator || '', inst: r.reg.instrument || '', appl: r.reg.appliesAs || '', th: r.reg.theme || '', chg: r.reg.changed || '', impl: r.reg.implication || '', owner: r.reg.owner || '', due: r.reg.deadline || '' } });
  }
  return out;
}

/* ---------- one fetch-classify-publish cycle ------------------------------ */
async function fetchOne(url, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': CFG.userAgent || 'PFC-Radar/1.0' }, redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally { clearTimeout(t); }
}

async function runCycle(testMode) {
  const t0 = Date.now();
  const lookback = (CFG.lookbackDays || 90) * 86400000;
  const cutoff = new Date(Date.now() - lookback);
  const store = loadStore();
  let fetched = 0, fresh = 0, kept = 0, errors = 0;

  let rawItems = [];
  if (testMode) {
    rawItems = fixtureFeed();
    fetched = 1;
  } else {
    const feeds = ENGINE.defaultFeeds_();
    const list = CFG.maxFeeds > 0 ? feeds.slice(0, CFG.maxFeeds) : feeds;

    // Every standing feed asks Google News for when:7d, so a normal cycle can
    // only ever see the last week. Backfill re-runs each query across a series
    // of explicit date windows, which is the only way to reach genuine history.
    // Auto-backfill once: if the book has no real history yet, walk the quarter
    // rather than waiting 90 days for when:7d to accumulate it.
    let autoBackfill = false;
    if (!backfillMode && !store.__backfilled) {
      let oldest = Infinity;
      for (const k of Object.keys(store)) {
        if (k === '__engine' || k === '__backfilled') continue;
        if (store[k] && store[k].ts && store[k].ts < oldest) oldest = store[k].ts;
      }
      const ageDays = isFinite(oldest) ? (Date.now() - oldest) / 86400000 : 0;
      if (ageDays < (CFG.lookbackDays || 90) * 0.7) {
        autoBackfill = true;
        log('book only ' + Math.round(ageDays) + ' days deep - running one-off backfill');
      }
    }
    if (windows.length > 1) { store.__backfilled = Date.now(); log('backfill complete'); }
    const windows = (backfillMode || autoBackfill) ? dateWindows(CFG.lookbackDays || 90, 7) : [null];
    if (windows.length > 1) log('backfill: ' + list.length + ' feeds x ' + windows.length + ' windows');

    for (const f of list) {
      for (const w of windows) {
        const url = w ? windowedUrl(f.url, w.from, w.to) : f.url;
        try {
          const xml = await fetchOne(url, (CFG.fetchTimeoutSec || 20) * 1000);
          fetched++;
          for (const it of parseRss(xml)) {
            if (!it.pubDate) continue;                                   // never fabricate a date
            if (it.pubDate < cutoff) continue;                            // honour the window
            if (ENGINE.staleByText_(it.title + ' ' + it.snippet, cutoff)) continue;  // re-served old article
            it.tag = f.tag;
            rawItems.push(it);
          }
        } catch (e) { errors++; }
        await new Promise(r => setTimeout(r, CFG.feedDelayMs || 150));    // be polite to the source
      }
    }
  }

  for (const raw of rawItems) {
    if (store[raw.link]) continue;                                      // already classified
    fresh++;
    let r;
    try { r = ENGINE.classifyLocal_({ title: raw.title, snippet: raw.snippet, tag: raw.tag }); }
    catch (e) { errors++; continue; }
    if (!r || r.radar === 'IGNORE' || !r.radar) { store[raw.link] = { ig: 1, ts: raw.pubDate.getTime() }; continue; }
    const items = toPayloadItem(raw, r);
    if (items.length) { store[raw.link] = { items, ts: raw.pubDate.getTime() }; kept += items.length; }
  }

  // prune beyond the window, assemble payload
  const minTs = Date.now() - lookback;
  const all = [];
  // v10.8: a rule fix should clean the existing book too. When the engine
  // version changes, re-run every stored headline through the classifier - it
  // is pure regex over ~2k items, so it costs a fraction of a second.
  const stamp = 'engine:' + ENGINE.version;
  if (store.__engine !== stamp) {
    let dropped = 0, rescored = 0;
    for (const k of Object.keys(store)) {
      if (k === '__engine' || k === '__backfilled') continue;
      const rec = store[k];
      const head = rec.items && rec.items[0] ? rec.items[0].t : null;
      if (!head) continue;
      let r = null;
      try { r = ENGINE.classifyLocal_({ title: head, snippet: '', tag: (rec.items[0].f || '') }); }
      catch (e) { continue; }
      if (!r || !r.radar || r.radar === 'IGNORE') { store[k] = { ig: 1, ts: rec.ts }; dropped++; }
      else {
        if (rec.items[0].r !== r.radar) { rec.items[0].r = r.radar; rescored++; }
        // refresh the "why we picked this up" terms for the whole book
        const kw = keywordsFor({ tag: rec.items[0].f || '' }, r);
        rec.items.forEach(it => { it.kw = kw; });
      }
    }
    store.__engine = stamp;
    log('reclassified book for ' + stamp + ': ' + dropped + ' dropped, ' + rescored + ' moved');
  }

  for (const k of Object.keys(store)) {
    if (k === '__engine' || k === '__backfilled') continue;
    if (store[k].ts < minTs) { delete store[k]; continue; }
    if (store[k].items) all.push(...store[k].items);
  }
  all.sort((a, b) => b.d.localeCompare(a.d));
  // Keep the book bounded: newest first, hard cap so the payload stays light.
  all.sort((x, y) => String(y.d).localeCompare(String(x.d)));
  if (all.length > 5000) { log('capping book at 5000 (was ' + all.length + ')'); all.length = 5000; }
  const istNow = new Date(Date.now() + 330*60000).toISOString().slice(0,16).replace('T',' ');
  const payload = { generatedAt: istNow, sourceNote: 'PFC-NRD auto-publisher ' + ENGINE.version, items: all };
  fs.writeFileSync(DATA_F, JSON.stringify(payload));
  saveStore(store);
  STATE.lastRun = new Date().toISOString();
  STATE.items = all.length;
  log(`cycle done in ${((Date.now() - t0) / 1000).toFixed(1)}s | feeds ok:${fetched} err:${errors} | new raw:${fresh} | items now:${all.length}`);
}

/* ---------- HTTP server ---------- */
const STATE = { lastRun: null, items: 0, started: new Date().toISOString() };
const DASH = path.join(ROOT, 'dashboard.html');
function serve() {
  const srv = http.createServer((req, res) => {
    const u = (req.url || '/').split('?')[0];
    try {
      if (u === '/' || u === '/index.html') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(fs.readFileSync(DASH));
      } else if (u === '/data.json') {
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(fs.existsSync(DATA_F) ? fs.readFileSync(DATA_F) : JSON.stringify({ generatedAt: null, items: [] }));
      } else if (u === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true, engine: ENGINE.version, ...STATE }));
      } else {
        res.writeHead(404); res.end('not found');
      }
    } catch (e) { res.writeHead(500); res.end('error'); }
  });
  srv.listen(CFG.port || 8080, CFG.host || '0.0.0.0',
    () => log(`serving on http://${CFG.host || '0.0.0.0'}:${CFG.port || 8080}  (/, /data.json, /health)`));
}

/* ---------- main ---------- */
(async () => {
  const test = ARGS.has('--test');
  if (ARGS.has('--once')) { await runCycle(test); process.exit(0); }
  if (!ARGS.has('--serve-only')) {
    await runCycle(test).catch(e => log('cycle error:', e.message));
    setInterval(() => runCycle(test).catch(e => log('cycle error:', e.message)),
      Math.max(10, CFG.fetchIntervalMinutes || 60) * 60000);
  }
  serve();
})();
