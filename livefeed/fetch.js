// PFC CMD Prep live feed. Runs on GitHub Actions every 10 minutes.
// Fetches market prices (Yahoo Finance), RBI current rates (rbi.org.in) and 24 news searches (Google News RSS),
// then ENCRYPTS everything with AES-256-GCM; the key is derived from the LIVE_PASS secret with PBKDF2-SHA256 (600,000 rounds).
// Without LIVE_PASS it refuses to publish. Node 20+, no packages.
"use strict";
const crypto = require("crypto");
const PASS = process.env.LIVE_PASS || "";
if (PASS.length < 12) { console.error("LIVE_PASS secret missing or shorter than 12 characters; nothing published."); process.exit(1); }
const UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "Accept-Language": "en-IN,en;q=0.9"};
const MKT = {brent: "BZ=F", pfc: "PFC.NS", rec: "RECLTD.NS", usdinr: "INR=X", nifty: "^NSEI", ust10: "^TNX"};
const NEWS = {"pfc": "\"Power Finance Corporation\" OR \"PFC Ltd\"", "rec": "\"REC Ltd\" OR \"REC Limited\" power", "merger": "PFC REC merger", "rbi_policy": "RBI repo rate MPC", "bonds": "India bond yields G-Sec corporate bonds", "rupee": "rupee RBI forex dollar", "inflation": "India inflation CPI WPI GDP", "geo": "Brent crude Fed West Asia India", "rbi_nbfc": "RBI NBFC norms circular directions", "competition": "power sector lending banks", "mop": "\"Ministry of Power\" OR \"Power Ministry\" India", "cerc": "CERC OR CEA electricity regulation India", "sector": "India power sector renewable capacity storage", "discoms": "discom smart meters RDSS power distribution", "nuclear": "India nuclear power NPCIL NTPC SHANTI", "demand": "India peak power demand record", "digital": "electricity data sharing framework India AI power sector", "global": "GIFT City IFSC", "pesb": "PESB board level appointment CMD", "rbi_notif": "rbi_notif", "rbi_press": "rbi_press", "sebi": "sebi", "infra_lend": "infrastructure lending banks NBFC", "neigh": "Bhutan hydropower OR Nepal hydropower India"};
async function get(url, ms = 15000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, {headers: UA, signal: c.signal}); if (!r.ok) throw new Error("HTTP " + r.status); return await r.text(); } finally { clearTimeout(t); }
}
async function yahoo(sym) {
  let raw, err;
  for (const h of ["query1", "query2"]) { try { raw = await get(`https://${h}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`); break; } catch (e) { err = e; } }
  if (!raw) throw err;
  const r = JSON.parse(raw).chart.result[0], m = r.meta, ts = r.timestamp || [], cl = ((r.indicators.quote || [])[0] || {}).close || [];
  const pts = ts.map((t, i) => [t, cl[i]]).filter(p => p[1] != null), off = m.gmtoffset || 0, day = t => new Date((t + off) * 1000).toISOString().slice(0, 10);
  let pi = pts.length - 1; if (pi >= 0 && day(pts[pi][0]) === day(m.regularMarketTime)) pi--;
  const prev = pi >= 0 ? pts[pi][1] : m.chartPreviousClose, p10 = pts[Math.max(0, pi - 9)], px = m.regularMarketPrice;
  return {value: px, t: m.regularMarketTime * 1000, chg_pct: prev ? +((px / prev - 1) * 100).toFixed(2) : null, chg_10d_pct: p10 ? +((px / p10[1] - 1) * 100).toFixed(2) : null};
}
async function rbi() {
  const txt = (await get("https://www.rbi.org.in/home.aspx")).replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  if (txt.indexOf("Policy Repo Rate") < 0) throw new Error("RBI page layout changed");
  const num = re => { const x = re.exec(txt); return x ? +x[1] : null; }, rng = re => { const x = re.exec(txt); return x ? x[1].replace(/\s+/g, " ") : null; };
  const o = {repo: num(/Policy Repo Rate\s*:\s*([\d.]+)\s*%/), sdf: num(/Standing Deposit Facility Rate\s*:\s*([\d.]+)\s*%/), msf: num(/Marginal Standing Facility Rate\s*:\s*([\d.]+)\s*%/),
    bank_rate: num(/Bank Rate\s*:\s*([\d.]+)\s*%/), frr: num(/Fixed Reverse Repo Rate\s*:\s*([\d.]+)\s*%/), crr: num(/CRR\s*:\s*([\d.]+)\s*%/), slr: num(/SLR\s*:\s*([\d.]+)\s*%/),
    usdinr_rbi: num(/INR\s*\/\s*1 USD\s*:\s*([\d.]+)/), mclr_on: rng(/MCLR \(Overnight\)\s*:\s*([\d.]+%\s*-\s*[\d.]+%)/), base_rate: rng(/Base Rate\s*:\s*([\d.]+%\s*-\s*[\d.]+%)/),
    td_1y: rng(/Term Deposit Rate\s*>\s*1 Year\s*:\s*([\d.]+%\s*-\s*[\d.]+%)/)};
  o.fx_asof = (/\(As at ([^)]+)\)/.exec(txt) || [])[1] || ""; o.gs_asof = (/# as on ([A-Za-z]+ \d{1,2}, \d{4})/.exec(txt) || [])[1] || "";
  const cur = [], re = /(\d+\.\d+% GS \d{4})\s*:\s*([\d.]+)\s*%/g; let x; while ((x = re.exec(txt))) cur.push({paper: x[1], yield: +x[2]}); o.gsec_curve = cur;
  o.tbills = {}; ["91", "182", "364"].forEach(d => { const y = new RegExp(d + " day T-bills\\s*:\\s*([\\d.]+)\\s*%").exec(txt); if (y) o.tbills[d + "d"] = +y[1]; });
  return o;
}
const ent = s => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
async function news(q) {
  const xml = await get("https://news.google.com/rss/search?q=" + encodeURIComponent(q + " when:7d") + "&hl=en-IN&gl=IN&ceid=IN:en");
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 15).map(it => {
    const g = n => { const m = new RegExp("<" + n + "[^>]*>([\\s\\S]*?)</" + n + ">").exec(it); return m ? ent(m[1]) : ""; };
    let title = g("title"); const src = g("source"); if (src && title.endsWith(" - " + src)) title = title.slice(0, -src.length - 3);
    return {title, link: g("link"), source: src, t: Date.parse(g("pubDate")) || 0};
  }).sort((a, b) => b.t - a.t);
}
(async () => {
  const out = {at: Date.now(), mkt: {}, rbi: null, news: {}, errors: []};
  await Promise.all(Object.entries(MKT).map(async ([k, s]) => { try { out.mkt[k] = await yahoo(s); } catch (e) { out.errors.push(k + ": " + e.message); } }));
  try { out.rbi = await rbi(); out.rbi.t = Date.now(); } catch (e) { out.errors.push("rbi: " + e.message); }
  const ks = Object.keys(NEWS);
  for (let i = 0; i < ks.length; i += 6) await Promise.all(ks.slice(i, i + 6).map(async k => { try { out.news[k] = {t: Date.now(), items: await news(NEWS[k])}; } catch (e) { out.errors.push("news " + k + ": " + e.message); } }));
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), it = 600000;
  const key = crypto.pbkdf2Sync(PASS, salt, it, 32, "sha256"), c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(out), "utf8"), c.final(), c.getAuthTag()]);
  process.stdout.write(JSON.stringify({v: 1, alg: "AES-256-GCM/PBKDF2-SHA256", it, at: out.at, salt: salt.toString("base64"), iv: iv.toString("base64"), ct: ct.toString("base64")}));
  console.error(`market ${Object.keys(out.mkt).length}/6, rbi ${out.rbi ? "ok" : "failed"}, news ${Object.keys(out.news).length}/${ks.length}` + (out.errors.length ? "; " + out.errors.join("; ") : ""));
})().catch(e => { console.error(e); process.exit(1); });
