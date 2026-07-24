/**
 * ============================================================================
 * PFC NEWS RADAR DASHBOARD (PFC-NRD) — v11.3
 * ============================================================================
 * One Apps Script, one sheet, one pipeline, SIX registers:
 *
 *   1. Potential Business — lending opportunities for PFC
 *   2. Borrower Watch     — existing borrowers, promoter groups, credit events
 *   3. Borrowing Radar    — PFC / top-10 banks / NBFCs / MDBs / AAA corporates
 *   4. Treasury Radar     — rates, FX, macro, economists and editorials
 *   5. Competitor Radar   — REC, IREDA, HUDCO, IRFC, NaBFID, IIFCL
 *   6. Regulatory Radar   — SEBI, RBI, NSE/BSE, CERC, Companies Act, tax, CERSAI, PFRDA
 *                           (PFC as a listed entity and an NBFC-ND-IFC)
 *
 * BORROWER WATCH SUB-TYPES (credit-event lexicon)
 * ----------------------------------------------
 *   NCLT / IBC                 — NCLT/NCLAT, CIRP, moratorium, liquidation, RP, CoC
 *   Fraud / Forensic           — fraud tagging, forensic audit, SFIO/ED/CBI, auditor exit
 *   Wilful Default / Recovery  — wilful defaulter, SARFAESI, DRT, guarantee/pledge invocation
 *   Restructuring / OTS        — one-time settlement, haircut, debt recast, SMA-0/1/2
 *   Rating Downgrade           — only for PFC borrowers, promoter groups, or Indian
 *                                private power/infra players rated by a recognised agency
 *   plus Borrowing by Borrower, Operational Progress, New Capex, Adverse / Halt, Activity
 *
 * CHANGELOG (most recent first)
 * -----------------------------
 *   v10.5 The minute tick published only when it found something new, so the
 *         published clock stalled through any quiet stretch - which looks
 *         exactly like a dead trigger, and the v10.4 banner then said so.
 *         The tick now also republishes on a 4-minute heartbeat, so the
 *         clock keeps moving while the trigger is alive and a stalled clock
 *         once again means what it says.
 *   v10.1 Dashboard: cards reduced to headline, date and news house - every
 *         other tag now lives in the filters. Fixed the date window: item
 *         dates carry no time, so comparing them against a rolling clock
 *         dropped the newest day entirely (Daily showed nothing the morning
 *         after a publish). Windows are now whole calendar days anchored to
 *         the latest day held, and the count states that date. Live refresh
 *         now reports what it fetched and when the sheet last published.
 *   v10.0 Radars renamed to the brand set - Business, Borrower, Borrowings,
 *         Treasury, Peers, Regulatory - on the dashboard, on the cards and in
 *         the segment e-mails. Sheet tab names are left as they are so no
 *         existing data is orphaned. PFC-NRD brandmark added to the masthead.
 *   v9.9  Dates are now confirmed against the article itself for newly added
 *         items (VERIFY_DATES / VERIFY_MAX): if the publisher's page says the
 *         story is materially older than the feed claims, the page wins. This
 *         is what a 9 May article arriving stamped 18 July needed - nothing
 *         in the feed reveals it. Reads JSON-LD, Open Graph, <time> and the
 *         visible dateline; on any failure the feed date simply stands.
 *         Dashboard: 'Sort: Source' now groups by outlet name (it was sorting
 *         by source tier, so the order barely moved); outlet names cleaned of
 *         stray feed punctuation; non-borrower quarterly-results headlines
 *         dropped client-side to match the engine.
 *   v9.8  Relevance gates: ordinary departmental procurement (currency and
 *         banknote printing, security paper, stationery, uniforms, catering)
 *         is never a lending lead, whoever floats the tender - the RBI's own
 *         printing arm included. Airline route/flight announcements are
 *         separated from airport PROJECTS, which remain financeable.
 *         Stale-date detection widened to day-first and numeric forms
 *         ('9 May 2026', '09-05-2026', '2026-05-09'), not just 'May 9, 2026'.
 *   v9.7  Equity gate rebuilt structurally. Chasing verbs ('surge', then
 *         'extend', then 'zoom', then 'down 3%') never converged, so the
 *         test is now: an equity word TOGETHER WITH a price move, a
 *         percentage, an explainer framing or a results-driven move is
 *         market chatter - whoever the company is. A concrete lending or
 *         credit event overrides, so real news wrapped in equity framing
 *         ('shares in focus: signs PSA for 1,600 MW') still comes through.
 *   v9.6  Importance is no longer printed anywhere - not on the dashboard
 *         cards, not in the radar tiles, not in the e-mails, not on the
 *         radar tabs (which now show rank position instead). The grade is
 *         retained internally purely to drive 'Sort: Priority'.
 *         Equity-market noise gate: share/stock price moves, re-rating and
 *         earnings-outlook stories, stock-pick lists, IPO/listing mechanics
 *         and 'every investor should know' framing are ignored - unless the
 *         headline also carries a concrete lending/credit event, so
 *         'Board approves Rs 20,000 cr capex; shares rise' still counts.
 *   v9.5a Fixed a dead branch in the Watch scorer: it still tested the old
 *         sub-type name 'Rating Downgrade', so the intended +50 for a rating
 *         action never applied and downgrades could grade Low. Now keyed to
 *         'Credit Rating Change', with adverse actions (+50) outranking
 *         favourable ones (+30); adverse-text match widened for word order.
 *   v9.5  Renamed to PFC News Radar Dashboard (PFC-NRD). Near-real-time
 *         auto-fetch: a 1-minute trigger fetches a rotating slice of feeds
 *         (TICK_FEEDS, default 6), classifies, rebuilds and republishes, so
 *         the dashboard refreshes every minute while the full feed list is
 *         swept about every half hour - within Apps Script fetch and trigger
 *         runtime quotas. Overlapping runs are skipped via a script lock.
 *   v9.4  Rating-action detection widened (S&P/Moody's outlook revisions,
 *         order-independent); sovereign-rating theme no longer trips on
 *         substrings (oper-ATING) or bare upgrade/outlook. Treasury now
 *         requires a real rate/FX/macro word, so solar/battery/airport/
 *         rail items no longer masquerade as Treasury. Publication editorial
 *         feeds (BS/Mint, ET Opinion, Hindu Ed) tightened to rate/policy
 *         topics -- the masthead is a source filter, not a content keyword.
 *   v9.3  Share-price chatter gate: 52-week high/low, shares surge/plunge,
 *         target price, "what should investors do" -> IGNORE for every entity,
 *         borrowers included. Price moves are equity noise; the underlying
 *         events (orders, capex, defaults, ratings) arrive via their own
 *         headlines and are unaffected.
 *   v9.2  CMD build: Borrower Watch sub-types reworked — 'Credit Rating Change'
 *         (upgrades + downgrades), 'Wilful Default' only when the headline says
 *         so, 'Recovery / SARFAESI' for other recovery actions. Data window
 *         widened to 90 days (Daily/Weekly/Monthly/Quarterly views). Central
 *         Asia (Kazakhstan etc.) treated as foreign; systemic-macro list
 *         restricted to named global drivers (Fed/ECB/BoJ/BoE/PBoC/OPEC...).
 *   v9.1  Wilful-default attribution (declared entity, not the declaring bank);
 *         non-infra industry gate (paper/textile/FMCG/hotels...); mutual-fund/
 *         NAV chatter ignored; borrower capex dual-posts to Potential Business.
 *   v9.0  Stale re-served articles rejected (explicit old date in text);
 *         personal-finance listicles ignored; cement/metro word-bounded.
 *   v8.9  Universal relevance + source fixes: retail-lending NBFCs (home/gold/
 *         micro/vehicle loans) excluded from Borrower Watch; credit events under
 *         Rs 100 cr at unknown entities dropped; media-house name joined into
 *         every register payload (link -> source map from Raw News), so cards
 *         show and rank real outlets; regulatory importance thresholds aligned.
 *   v8.8  Amount normalisation (1 trillion = 1 lakh crore = 1,00,000 cr; $1bn ~
 *         Rs 8,500 cr) with 2% tolerant duplicate matching; desk-priority sort
 *         (importance > source authority > deal size > recency) in every radar;
 *         roundups/"editor's picks" never High; large firm deals floor to High.
 *   v8.7  Sixth radar: Regulatory & Compliance (SEBI/RBI/NSE/BSE/CERC/Companies
 *         Act/Income-Tax/GST/CERSAI/PFRDA...). Regulator + theme sub-filters.
 *   v8.6  Duplicate amounts collapse to the best media house's copy.
 *   v8.5  Positive India-anchor gate; foreign bonds dropped without a blocklist.
 *   v8.4  MDB news counts only when it is FOR India (an EIB loan to Austria's OMV
 *         is not ours); foreign-geography list widened (Austria, Switzerland,
 *         Singapore, Taiwan ...); step0_Version self-tests competitor routing.
 *   v8.3  wrapLocal_ was dropping the competitor payload — the Competitor register
 *         could never fill. Fixed. 'wind' matched HEAD-WIND-S, giving an Apple
 *         analyst note a fake power-sector nexus: bounded. Equity-research gate
 *         added (price target, buy/hold/sell, "(Rating Downgrade)").
 *   v8.2  Credit-event lexicon (IBC, fraud, forensic audit, wilful default, OTS);
 *         severe events captured even outside the borrower bank; Indian statutes
 *         (NCLT, SARFAESI, CRISIL ...) now count as an India nexus.
 *   v8.1  'stall' matched IN-STALL-ATION — a 10 GW growth story was tagged
 *         ADVERSE/Halt. All adverse terms word-bounded; consumer load-shedding
 *         is no longer a borrower credit event.
 *   v8.0  Five radars; promoter/group names; contextual filters; date integrity
 *         (undated items rejected, never stamped 'today'); AAA corporate coupons;
 *         economists and editorials; Borrowing limited to top-10 banks/NBFCs/peers.
 *   v7.9  Settings tab upserted, so keys added by newer versions (GITHUB_REPO ...)
 *         appear in upgraded installs. One-click GitHub publishing setup.
 *   v7.8  getSetting_ cached — it was a Sheets API call per news item (500/pass).
 *   v7.7  classifyPending_ read/wrote the WHOLE Raw sheet per pass (95 s). Block I/O.
 *   v7.6  Manual step mode (step0..step5); every heavy function logs before it starts.
 *   v7.4  newsHash_ called Utilities.computeDigest per item — an API round-trip
 *         each time, ~10,000 per deep fetch. Replaced with a pure-JS hash.
 *
 * SETUP
 * -----
 *   1. Paste over Code.gs, Save, reload the sheet.
 *   2. Menu ▶▶ RUN EVERYTHING  (migrates sheets, fetches 30 days, classifies, publishes)
 *   3. Menu ⚙ Set up GitHub publishing → owner/repo + token → dashboard goes live.
 *   4. If a run ever times out: Manual steps → step0_Version, then step1..step5.
 */

var PFC_VERSION = 'PFC News Radar Dashboard (PFC-NRD) v11.3';

/* ==========================================================================
 * >>> START HERE <<<  —  runEverything()
 * --------------------------------------------------------------------------
 * ONE action that does the whole pipeline, resumable across Google's 6-min
 * execution limit (auto-continues every minute until done):
 *   1. SETUP      — creates/repairs all tabs incl. Keyword Master & Radar Rules
 *   2. RESET      — clears the four registers, marks all raw rows for
 *                   reclassification under the CURRENT rules/keywords
 *   3. FETCH      — 30-day deep fetch across ALL feeds (keyword master,
 *                   borrower banks, watchlist, treasury, borrowing, user)
 *   4. CLASSIFY   — routes everything into the four radars with importance
 *   5. FINISH     — sorts registers, rebuilds Dashboard + Daily + Weekly +
 *                   30-Day Radar tabs
 * Emails are NOT sent by this action (use the Send items in the menu, or the
 * daily/weekly schedules). Being the first function in this file, it is the
 * default selection in the Apps Script editor: paste > Save > Run.
 * ========================================================================== */

var GR_KEY = 'GR_STATE';

/* ==========================================================================
 * >>> IF RUN EVERYTHING KEEPS TIMING OUT, USE THESE <<<
 * Pick the function in the editor's dropdown and press RUN (never Debug).
 * Each one finishes in seconds and logs exactly what it did.
 *   step0_Version      -> proves which version is actually pasted
 *   step1_ResetAll     -> clears state, Raw News and the four registers
 *   step2_FetchBatch   -> fetches the NEXT 10 feeds only. Repeat until it says DONE.
 *   step3_ClassifyBatch-> classifies the next 500 items. Repeat until it says DONE.
 *   step4_BuildTabs    -> sorts registers and rebuilds Dashboard + the 3 radar tabs
 *   step5_Publish      -> pushes data.json to GitHub
 * ========================================================================== */

function step0_Version() {
  var r = classifyLocal_({ title: 'REC Limited sanctions Rs 12,000 crore loan to Maharashtra discom', snippet: '', tag: 'Test' });
  var compSheet = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.COMP) ? 'exists' : 'MISSING';
  var regSheet = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.REG) ? 'exists' : 'MISSING (run RUN EVERYTHING)';
  var v = PFC_VERSION +
    ' | hash=' + (String(newsHash_('test', 'x')).length === 16 ? 'FAST' : 'SLOW MD5 (old paste)') +
    ' | competitor routing=' + (r.radar === 'COMPETITOR' && r.comp ? 'OK' : 'BROKEN') +
    ' | Competitor sheet=' + compSheet + ' | Regulatory sheet=' + regSheet;
  log_('INFO', 'VERSION: ' + v);
  return v;
}

function step1_ResetAll() {
  var t = Date.now();
  cancelAllRuns();
  PropertiesService.getScriptProperties().deleteProperty('STEP_FEED_IDX');
  runSetup();
  [CFG.SHEETS.RAW, CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE].forEach(function (n) {
    var sh = SpreadsheetApp.getActive().getSheetByName(n);
    if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  });
  log_('INFO', 'STEP1 reset done in ' + (Date.now() - t) + ' ms. Now run step2_FetchBatch repeatedly.');
  return 'reset OK';
}

function step2_FetchBatch() {
  var t = Date.now();
  var props = PropertiesService.getScriptProperties();
  var idx = Number(props.getProperty('STEP_FEED_IDX') || 0);
  var feeds = deep30Feeds_();
  if (idx >= feeds.length) {
    props.deleteProperty('STEP_FEED_IDX');
    log_('INFO', 'STEP2 DONE \u2014 all ' + feeds.length + ' feeds fetched. Now run step3_ClassifyBatch.');
    return 'DONE';
  }
  var slice = feeds.slice(idx, idx + 10);
  var r = fetchFeedsWindowed_(slice, 90, 60, 0, Date.now() + 120000);
  props.setProperty('STEP_FEED_IDX', String(idx + 10));
  var msg = 'STEP2: feeds ' + Math.min(idx + 10, feeds.length) + '/' + feeds.length +
            ', +' + r.added + ' rows, ' + (Date.now() - t) + ' ms. RUN AGAIN for the next batch.';
  log_('INFO', msg);
  return msg;
}

function step3_ClassifyBatch() {
  var t = Date.now();
  var c = classifyPending_();
  var msg = c.classified === 0
    ? 'STEP3 DONE \u2014 nothing left to classify. Now run step4_BuildTabs.'
    : 'STEP3: ' + c.classified + ' classified (Bus ' + c.bus + ', Watch ' + c.watch + ', Borr ' + c.borr +
      ', Tre ' + c.tre + ') in ' + (Date.now() - t) + ' ms. RUN AGAIN.';
  log_('INFO', msg);
  return msg;
}

function step4_BuildTabs() {
  var t = Date.now();
  sortOutputs_();
  applyImportanceFormatting_();
  buildDashboard_();
  buildDailyRadar();
  buildWeeklyRadar();
  build30DayRadar();
  var msg = 'STEP4: registers sorted, Dashboard + Daily + Weekly + 30-Day tabs built in ' + (Date.now() - t) + ' ms.';
  log_('INFO', msg);
  return msg;
}

function step5_Publish() {
  var ok = publishDataToGitHub();
  return ok ? 'STEP5: published to GitHub.' : 'STEP5: publish skipped (set GITHUB_REPO + token).';
}

/** >>> RUN THIS FIRST <<<  pfcHealthCheck()
 *  A 10-second self-test: 3 feeds, parse, hash, classify, write, timed.
 *  If this passes, the script is healthy and any timeout is an environment
 *  problem (almost always: you pressed DEBUG instead of RUN).
 *  Run it from the sheet menu, or pick it in the editor's function dropdown
 *  and press RUN (never Debug \u2014 the debugger is 10-50x slower and will
 *  hit the same 6-minute wall no matter how fast the code is). */
function pfcHealthCheck() {
  var t0 = Date.now();
  var out = [];
  function mark(label) { out.push(label + ': ' + (Date.now() - t0) + ' ms'); }

  runSetup();                                     mark('setup');
  var feeds = getFeeds_().slice(0, 3);
  var got = fetchFeedsWindowed_(feeds, 7, 10, 0, Date.now() + 60000);
  mark('fetch 3 feeds (+' + got.added + ' rows)');
  var t1 = Date.now();
  var h = 0;
  for (var i = 0; i < 2000; i++) h += newsHash_('test headline number ' + i, 'x').length;
  out.push('hash 2,000 items: ' + (Date.now() - t1) + ' ms   <-- must be < 500 ms');
  var t2 = Date.now();
  for (var j = 0; j < 500; j++) classifyLocal_({ title: 'NTPC approves Rs 5,000 crore solar project ' + j, snippet: '', tag: 'Power' });
  out.push('classify 500 items: ' + (Date.now() - t2) + ' ms   <-- must be < 3,000 ms');
  var c = classifyPending_();                     mark('classify pending (' + c.classified + ' routed)');

  var total = Date.now() - t0;
  var verdict = total < 45000 ? 'HEALTHY \u2014 proceed with RUN EVERYTHING.'
              : 'SLOW \u2014 send the timings above; the slowest line names the culprit.';
  out.push('TOTAL: ' + total + ' ms');
  out.push(verdict);
  out.forEach(function (l) { log_('INFO', 'HEALTH ' + l); });
  try { toast_('Health check: ' + verdict, 12); } catch (e) {}   // never getUi().alert(): it BLOCKS
  return out.join(' | ');
}

function runEverything() {
  var st = grState_();
  if (!st) grSave_({ stage: 'SETUP', feedIndex: 0, added: 0, classified: 0, started: new Date().toISOString() });
  globalRunStep_();
}

function grState_() {
  var raw = PropertiesService.getScriptProperties().getProperty(GR_KEY);
  return raw ? JSON.parse(raw) : null;
}
function grSave_(st) { PropertiesService.getScriptProperties().setProperty(GR_KEY, JSON.stringify(st)); }
function grClear_() { PropertiesService.getScriptProperties().deleteProperty(GR_KEY); }

function globalRunContinue() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'globalRunContinue') ScriptApp.deleteTrigger(t);
  });
  if (grState_()) globalRunStep_();
}

function globalRunStep_() {
  var deadline = Date.now() + D30_BUDGET_MS;
  var st = grState_();
  if (!st) return;
  pfcClearCaches_();

  try {
    log_('INFO', 'RUN EVERYTHING: entering stage ' + st.stage + ' (feedIndex ' + (st.feedIndex || 0) + ').');

    if (st.stage === 'SETUP') {
      runSetup();
      st.stage = 'RESET'; grSave_(st);
    }

    if (st.stage === 'RESET') {
      var sh = sheet_(CFG.SHEETS.RAW);
      var n = sh.getLastRow() - 1;
      if (n > 0) sh.getRange(2, 1, n, sh.getLastColumn()).clearContent();   // clean 30-day rebuild
      [CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE, CFG.SHEETS.COMP, CFG.SHEETS.REG].forEach(function (name) {
        var t = SpreadsheetApp.getActive().getSheetByName(name);
        if (t && t.getLastRow() > 1) t.getRange(2, 1, t.getLastRow() - 1, t.getLastColumn()).clearContent();
      });
      log_('INFO', 'RUN EVERYTHING: registers + Raw News cleared (' + Math.max(0, n) + ' old rows). Fetching 30 days fresh.');
      st.stage = 'FETCH'; grSave_(st);
    }

    if (st.stage === 'FETCH') {
      var feeds = deep30Feeds_();
      log_('INFO', 'RUN EVERYTHING: fetch starting at feed ' + st.feedIndex + ' of ' + feeds.length + '.');
      toast_('RUN EVERYTHING: fetching feeds ' + st.feedIndex + '/' + feeds.length + '\u2026', 15);
      var r = fetchFeedsWindowed_(feeds, 90, 60, st.feedIndex, deadline);
      st.added += r.added;
      if (r.nextIndex >= 0) { st.feedIndex = r.nextIndex; grSave_(st); return grDefer_(st); }
      st.stage = 'CLASSIFY'; grSave_(st);
      log_('INFO', 'RUN EVERYTHING: fetch complete, +' + st.added + ' new raw items.');
    }

    if (st.stage === 'CLASSIFY') {
      while (Date.now() < deadline) {
        var c = classifyPending_();
        st.classified += c.classified;
        grSave_(st);
        if (c.classified === 0) { st.stage = 'FINISH'; grSave_(st); break; }
      }
      if (st.stage !== 'FINISH') return grDefer_(st);
      log_('INFO', 'RUN EVERYTHING: classification complete, ' + st.classified + ' items routed.');
    }

    if (st.stage === 'FINISH') {
      var tasks = st.tasks || ['SORT', 'FORMAT', 'DASH', 'DAILY', 'WEEKLY', 'D30', 'PUBLISH'];
      while (tasks.length && Date.now() < deadline) {
        var t = tasks.shift();
        try { runFinishTask_(t); }
        catch (e) { log_('ERROR', 'RUN EVERYTHING task ' + t + ' failed: ' + e.message); }
        st.tasks = tasks; grSave_(st);
      }
      if (tasks.length) return grDefer_(st);          // out of budget: resume in a minute
      grClear_();
      toast_('RUN EVERYTHING COMPLETE: +' + st.added + ' fetched, ' + st.classified + ' classified; all tabs rebuilt.', 12);
      log_('INFO', 'RUN EVERYTHING COMPLETE: +' + st.added + ' fetched, ' + st.classified + ' classified.');
    }
  } catch (e) {
    log_('ERROR', 'RUN EVERYTHING step failed (' + st.stage + '): ' + e.message + ' \u2014 will retry via continuation.');
    grDefer_(st);
  }
}

/** v7.2 — one finish task per call, so any single step can be checkpointed. */
function runFinishTask_(t) {
  if (t === 'SORT')        { sortOutputs_(); }
  else if (t === 'FORMAT') { applyImportanceFormatting_(); }
  else if (t === 'DASH')   { buildDashboard_(); sheet_(CFG.SHEETS.DASH).getRange('B2').setValue(nowStr_()); }
  else if (t === 'DAILY')  { buildDailyRadar(); }
  else if (t === 'WEEKLY') { buildWeeklyRadar(); }
  else if (t === 'D30')    { build30DayRadar(); }
  else if (t === 'EMAIL')  { if (pfcMailMode_() === 'SEGMENTS') sendAll30DayRadars(); else sendCombined30Day(); }
  else if (t === 'PUBLISH'){ publishDataToGitHub(); }
  log_('INFO', 'Finish task done: ' + t);
}

function grDefer_(st) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'globalRunContinue') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('globalRunContinue').timeBased().after(60 * 1000).create();
  toast_('RUN EVERYTHING: budget reached at stage ' + st.stage + ' \u2014 auto-resuming in ~1 minute. Watch the Log tab.', 10);
  log_('INFO', 'RUN EVERYTHING checkpoint: stage=' + st.stage + ', feedIndex=' + (st.feedIndex || 0) + ', added=' + st.added + ', classified=' + st.classified + '.');
}

/** Abort any running job (global run and 30-day run) and clear checkpoints. */
function cancelAllRuns() {
  grClear_(); d30Clear_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === 'globalRunContinue' || f === 'deep30Continue') ScriptApp.deleteTrigger(t);
  });
  toast_('All running jobs cancelled; checkpoints cleared.');
}

const CFG = {
  SHEETS: {
    RAW:   'Raw News',
    BUS:   'Potential Business',
    WATCH: 'Borrower Watch',
    BORR:  'Borrowing Radar',
    TRE:   'Treasury Radar',
    COMP:  'Competitor Radar',
    REG:   'Regulatory Radar',
    RULES: 'Radar Rules',
    KM:    'Keyword Master',
    KWU:   'My Keywords',
    DASH:  'Dashboard',
    SET:   'Settings',
    LOG:   'Log'
  },
  PROP_API_KEY: 'AI_API_KEY',

  RAW_HEADERS: ['Hash', 'Fetched At', 'Published At', 'Source', 'Title', 'Snippet',
                'Link', 'Feed Tag', 'Status', 'Radar', 'Importance'],

  BUS_HEADERS: ['Date', 'Importance', 'Company / Entity', 'Sector / Product', 'State',
                'Est. Size \u20B9Cr', 'Potential PFC Exposure \u20B9Cr', 'Why It Matters',
                'Suggested PFC Product', 'Next Action', 'Risk Flags', 'Source Link', 'Headline'],

  WATCH_HEADERS: ['Date', 'Importance', 'Borrower / Promoter Group', 'Sub-type', 'Borrower Class',
                  'Signal', 'Est. \u20B9Cr', 'Why It Matters', 'Next Action', 'Source Link', 'Headline'],

  BORR_HEADERS: ['Date', 'Importance', 'Issuer', 'Issuer Class', 'Instrument', 'Amount (as stated)',
                 'Est. \u20B9Cr', 'Currency', 'Tenor', 'Pricing / Coupon', 'Benefit to PFC',
                 'Next Action', 'Source Link', 'Headline'],

  TRE_HEADERS: ['Date', 'Importance', 'Treasury Keyword', 'Region', 'Signal', 'Rate Direction',
                'INR Direction', 'Impact on PFC', 'Hedging Implication',
                'Instrument / Tenor Angle', 'Next Action', 'Source Link', 'Headline'],

  COMP_HEADERS: ['Date', 'Importance', 'Competitor', 'Activity', 'Details', 'Est. \u20B9Cr',
                 'Pricing / Terms', 'Implication for PFC', 'Next Action', 'Source Link', 'Headline'],

  REG_HEADERS: ['Date', 'Importance', 'Regulator', 'Instrument Type', 'Applies As',
                'Theme', 'What Changed', 'Compliance Implication for PFC', 'Action Owner',
                'Effective / Deadline', 'Source Link', 'Headline'],

  KM_HEADERS: ['Enabled (Y/N)', 'Domain', 'Sub-part', 'Radar Hint',
               'Keywords / Phrases (semicolon-separated)', 'Event Trigger Keywords (semicolon-separated)'],

  RULES_HEADERS: ['Active (Y/N)', 'Keywords (comma-separated; any one matches)',
                  'Match In (Title / Any)', 'Radar (BUSINESS/WATCH/BORROWING/TREASURY/IGNORE or blank)',
                  'Importance (High/Medium/Low or blank)', 'Notes'],

  KW_HEADERS: ['Added On', 'Type (Search / Borrower)', 'Keywords (comma-separated)'],

  STATUS: { NEW: 'NEW', DONE: 'CLASSIFIED', ERR: 'ERROR' },

  DEFAULTS: {
    AI_PROVIDER: 'LOCAL',            // LOCAL | ANTHROPIC | GEMINI
    AI_MODEL: 'claude-haiku-4-5',
    BATCH_SIZE: 12,
    MAX_CLASSIFY_PER_RUN: 500,       // LOCAL is instant; use ~60 for AI providers
    MAX_ITEMS_PER_FEED: 60,
    LOOKBACK_DAYS: 7,
    PAMPHLET_HOURS: 24
  }
};

/* ============================ SETTINGS ==================================== */

var pfcSettingsCache_ = null;

/** v7.8 — read the Settings sheet ONCE per execution, then serve from memory.
 *  Previously every getSetting_() call was a Sheets API round-trip, and
 *  pfcAiProvider_() calls it per news item: 500 items = 500 sheet reads. */
/** v7.9 — upsert the Settings tab: adds any key introduced by a newer version.
 *  (Old behaviour seeded settings ONLY when the tab was empty, so upgraded
 *  installs silently lacked GITHUB_REPO, MIN_IMPORTANCE, MAIL_MODE, etc.) */
var PFC_SETTING_KEYS = [
  ['AI_PROVIDER', 'LOCAL'], ['AI_MODEL', ''], ['BATCH_SIZE', '12'],
  ['MAX_CLASSIFY_PER_RUN', '2000'], ['MAX_ITEMS_PER_FEED', '60'],
  ['LOOKBACK_DAYS', '7'], ['PAMPHLET_HOURS', '24'], ['MIN_IMPORTANCE', 'Medium'],
  ['GITHUB_REPO', ''], ['GITHUB_BRANCH', 'main'], ['GITHUB_DATA_PATH', 'data.json'],
  ['TICK_MINUTES', '1'], ['TICK_FEEDS', '6'],
  ['VERIFY_DATES', 'yes'], ['VERIFY_MAX', '25'],
  ['MAIL_TO', ''], ['MAIL_MODE', 'COMBINED'], ['MAIL_BUSINESS', ''], ['MAIL_WATCH', ''],
  ['MAIL_BORROWING', ''], ['MAIL_TREASURY', ''], ['MAIL_COMPETITOR', ''], ['MAIL_REGULATORY', '']
];

function pfcEnsureSettings_() {
  var sh = sheet_(CFG.SHEETS.SET);
  if (sh.getLastRow() < 1 || String(sh.getRange(1, 1).getValue()).trim() === '') {
    sh.getRange(1, 1, 1, 5).setValues([['Setting', 'Value', '', 'Feed Tag', 'Feed URL']])
      .setFontWeight('bold').setBackground('#1a3c6e').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  var have = {};
  var n = sh.getLastRow() - 1;
  if (n > 0) {
    sh.getRange(2, 1, n, 1).getValues().forEach(function (r) {
      var k = String(r[0]).trim();
      if (k) have[k] = true;
    });
  }
  var add = PFC_SETTING_KEYS.filter(function (kv) { return !have[kv[0]]; });
  if (add.length) {
    sh.getRange(sh.getLastRow() + 1, 1, add.length, 2).setValues(add);
    log_('INFO', 'SETTINGS: added ' + add.length + ' missing key(s): ' +
         add.map(function (kv) { return kv[0]; }).join(', '));
  }
  pfcSettingsCache_ = null;
}

function getSetting_(key) {
  if (!pfcSettingsCache_) {
    pfcSettingsCache_ = {};
    var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.SET);
    if (sh && sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
        var k = String(r[0]).trim();
        var v = String(r[1]).trim();
        if (k && v !== '') pfcSettingsCache_[k] = v;
      });
    }
  }
  if (pfcSettingsCache_[key] !== undefined) return pfcSettingsCache_[key];
  return CFG.DEFAULTS[key] !== undefined ? String(CFG.DEFAULTS[key]) : '';
}

/** Call when Settings may have changed (start of every run). */
function pfcClearCaches_() {
  pfcSettingsCache_ = null; pfcRulesCache_ = null; pfcKmCache_ = null;
  pfcUserKwCache_ = null; pfcUserWatchReCache_ = null;
}

function getSettingNum_(key) {
  var raw = Number(getSetting_(key));
  var fallback = Number(CFG.DEFAULTS[key]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

/* ============================ FEEDS ======================================= */

function gnews_(q) {
  return 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en-IN&gl=IN&ceid=IN:en';
}

/** Business/lending + borrowing + institutional scans. */
function pfcBaseFeeds_() {
  return [
    { tag: 'Power',          url: gnews_('power project investment OR commissioning India when:7d') },
    { tag: 'Transmission',   url: gnews_('transmission project TBCB OR "green energy corridor" when:7d') },
    { tag: 'Renewables',     url: gnews_('solar OR wind project financial closure OR PPA India when:7d') },
    { tag: 'Green Hydrogen', url: gnews_('green hydrogen OR ammonia plant investment when:7d') },
    { tag: 'BESS/Battery',   url: gnews_('battery storage BESS project OR "ACC PLI" investment when:7d') },
    { tag: 'EV',             url: gnews_('EV manufacturing plant OR charging infrastructure investment India when:7d') },
    { tag: 'Data Centres',   url: gnews_('data centre investment India OR hyperscale campus when:7d') },
    { tag: 'Ports',          url: gnews_('port expansion OR terminal PPP investment India when:7d') },
    { tag: 'Airports',       url: gnews_('airport capex OR expansion OR PPP India when:7d') },
    { tag: 'Railways',       url: gnews_('railway project tender OR metro rail approved India when:7d') },
    { tag: 'Roads',          url: gnews_('highway project awarded OR HAM OR BOT NHAI when:7d') },
    { tag: 'Urban/Water',    url: gnews_('smart city OR water treatment OR sewage project investment India when:7d') },
    { tag: 'Mining',         url: gnews_('mining project investment OR critical minerals India when:7d') },
    { tag: 'Oil & Gas',      url: gnews_('pipeline OR city gas OR refinery capex project India when:7d') },
    { tag: 'Manufacturing',  url: gnews_('greenfield plant investment OR capex announcement India when:7d') },
    { tag: 'Telecom',        url: gnews_('telecom tower OR fibre network investment India when:7d') },
    { tag: 'AR-RDSS/Meters', url: gnews_('RDSS OR smart metering OR distribution infrastructure loan India when:7d') },
    { tag: 'AR-LPS/Discom',  url: gnews_('late payment surcharge OR discom liquidity scheme when:7d') },
    { tag: 'AR-PSP/Nuclear', url: gnews_('pumped storage project OR nuclear SMR investment India when:7d') },
    { tag: 'AR-Metro/RRTS',  url: gnews_('metro rail OR RRTS OR regional rapid transit project approved when:7d') },
    { tag: 'AR-HAM/InvIT',   url: gnews_('HAM road project OR InvIT acquisition OR asset monetisation when:7d') },
    { tag: 'AR-Refinery/CGD',url: gnews_('refinery OR petrochemical OR city gas distribution capex India when:7d') },
    { tag: 'AR-Water/WtE',   url: gnews_('desalination OR waste to energy OR biomass project India when:7d') },
    { tag: 'PIB',            url: gnews_('site:pib.gov.in power energy infrastructure finance when:7d') },
    { tag: 'ET Energy',      url: 'https://energy.economictimes.indiatimes.com/rss/topstories' }
  ];
}

/** Borrowing-side scans (funding prints, MDB, ECAs, PFC AR instrument stack). */
function borrowingFeeds_() {
  return [
    { tag: 'B-Domestic Bonds', url: gnews_('bond issuance NBFC OR PSU India crore coupon when:7d') },
    { tag: 'B-Green/ESG',      url: gnews_('green bond OR social bond OR sustainability bond issuance India when:7d') },
    { tag: 'B-Offshore',       url: gnews_('masala bond OR yankee bond OR dollar bond Indian issuer when:7d') },
    { tag: 'B-ECB Windows',    url: gnews_('external commercial borrowing India pricing OR loan signed when:7d') },
    { tag: 'B-MDB',            url: gnews_('World Bank OR ADB OR AIIB OR NDB loan India energy infrastructure when:7d') },
    { tag: 'B-Bilateral/ECA',  url: gnews_('JICA OR KfW OR EIB OR export credit agency line of credit India when:7d') },
    { tag: 'B-Climate Funds',  url: gnews_('Green Climate Fund OR climate finance facility India when:7d') },
    { tag: 'B-Global Capital', url: gnews_('sovereign wealth fund OR pension fund infrastructure debt India when:7d') },
    { tag: 'B-Peer Issuers',   url: gnews_('IREDA OR HUDCO OR IRFC OR NABFID OR IIFCL bond OR borrowing when:7d') },
    { tag: 'B-PFC/REC',        url: gnews_('"Power Finance Corporation" OR REC Limited bond OR ECB OR fundraise when:7d') },
    { tag: 'B-Bank Lines',     url: gnews_('term loan facility OR syndicated loan NBFC India signed when:7d') },
    { tag: 'B-CP/CD',          url: gnews_('commercial paper issuance OR certificate of deposit NBFC India when:7d') },
    { tag: 'B-54EC/CapGain',   url: gnews_('54EC bonds OR capital gain bonds PFC REC IRFC when:7d') },
    { tag: 'B-FPI Debt',       url: gnews_('FPI debt inflow OR foreign investment Indian bonds when:7d') },
    { tag: 'B-TaxFree/Infra',  url: gnews_('tax free bond OR infrastructure bond issuance India when:7d') },
    { tag: 'B-Perp/Sub',       url: gnews_('perpetual bond OR subordinated bond OR Tier II issuance India when:7d') },
    { tag: 'B-GMTN/FC',        url: gnews_('GMTN OR medium term note OR foreign currency bond Indian issuer when:7d') },
    { tag: 'B-SOFR Loans',     url: gnews_('SOFR OR EURIBOR linked loan Indian borrower OR NBFC when:7d') },
    { tag: 'B-ZeroCoupon',     url: gnews_('zero coupon bond issuance India when:7d') },
    { tag: 'B-Liquidity',      url: gnews_('banking system liquidity surplus OR deficit RBI VRRR OMO when:7d') }
  ];
}

/** Treasury/market scans. */
function treasuryFeeds_() {
  return [
    { tag: 'T-RBI Policy',     url: gnews_('RBI monetary policy OR repo rate OR MPC decision when:7d') },
    { tag: 'T-G-Sec Yields',   url: gnews_('10-year g-sec yield OR government bond yield India when:7d') },
    { tag: 'T-Govt Borrowing', url: gnews_('treasury bill auction OR government borrowing calendar India when:7d') },
    { tag: 'T-USDINR',         url: gnews_('rupee dollar OR USDINR OR rupee depreciation OR rupee appreciation when:7d') },
    { tag: 'T-FX Reserves',    url: gnews_('India forex reserves RBI when:7d') },
    { tag: 'T-Global FX',      url: gnews_('dollar index OR euro OR yen OR pound sterling currency move when:7d') },
    { tag: 'T-Fed',            url: gnews_('Federal Reserve rate decision OR FOMC OR Powell interest rates when:7d') },
    { tag: 'T-Global CBs',     url: gnews_('ECB OR "Bank of Japan" OR "Bank of England" rate decision when:7d') },
    { tag: 'T-India Prices',   url: gnews_('India CPI inflation OR WPI inflation data when:7d') },
    { tag: 'T-India Macro',    url: gnews_('India GDP growth OR fiscal deficit OR current account deficit when:7d') },
    { tag: 'T-Global Macro',   url: gnews_('US inflation OR recession risk OR global growth outlook when:7d') },
    { tag: 'T-Corp Bonds',     url: gnews_('corporate bond spread OR yield curve India AAA NBFC when:7d') },
    { tag: 'T-Hedging',        url: gnews_('currency swap OR interest rate swap OR forward premium OR hedging cost India when:7d') },
    { tag: 'T-MoF/Budget',     url: gnews_('ministry of finance OR union budget borrowing OR disinvestment when:7d') },
    { tag: 'T-Sov Rating',     url: gnews_('India sovereign rating Moody\'s OR "S&P" OR Fitch outlook when:7d') }
  ];
}

/** Borrower-group / sector-watch scans. */
function borrowerFeeds_() {
  return [
    { tag: 'W-IPP Groups',      url: gnews_('Adani OR JSW OR ReNew OR Greenko OR Avaada OR ACME OR Serentica power project when:7d') },
    { tag: 'W-Discom Dues',     url: gnews_('discom dues OR payment delay genco OR tariff true-up when:7d') },
    { tag: 'W-State Utilities', url: gnews_('MSEDCL OR TANGEDCO OR UPPCL OR BESCOM OR PSPCL loan OR project OR smart meter when:7d') },
    { tag: 'W-Stressed Power',  url: gnews_('power plant NCLT OR insolvency OR stressed asset resolution when:7d') },
    { tag: 'W-CPSE Power',      url: gnews_('NTPC OR NHPC OR SJVN OR NPCIL OR DVC project OR expansion when:7d') },
    { tag: 'W-Bank Infra',      url: gnews_('bank lending power OR infrastructure project loan sanction India when:7d') },
    { tag: 'W-NBFC Sector',     url: gnews_('NBFC RBI regulation OR co-lending OR infrastructure finance company when:7d') },
    { tag: 'W-Global DFIs',     url: gnews_('IFC OR development bank power OR renewable financing India when:7d') }
  ];
}

/** Query aliases for watchlist names ambiguous as plain search terms. */
var PFC_WATCHLIST_QUERY_ALIAS = {
  'ReNew': '"ReNew Power"',
  'ACME': '"ACME Solar"',
  'Adani': '"Adani" power OR energy OR transmission',
  'Vedanta': '"Vedanta" power OR energy',
  'Essar Power': '"Essar Power"'
};

function watchlistFeeds_() {
  var terms = PFC_WATCHLIST.map(function (n) {
    if (PFC_WATCHLIST_QUERY_ALIAS[n]) return PFC_WATCHLIST_QUERY_ALIAS[n];
    return /\s/.test(n) ? '"' + n + '"' : n;
  });
  var feeds = [];
  var chunkSize = 8;
  for (var i = 0; i < terms.length; i += chunkSize) {
    var q = terms.slice(i, i + chunkSize).join(' OR ') + ' when:7d';
    feeds.push({ tag: 'WL-' + (Math.floor(i / chunkSize) + 1), url: gnews_(q) });
  }
  return feeds;
}

/** v6.3 — scans built from the PFC News Keyword Master (AR 2024-25 taxonomy),
 *  combining domain + event-trigger keywords per its recommended-use note. */
function keywordMasterFeeds_() {
  return [
    { tag: 'KM-FinClosure',   url: gnews_('"achieves financial closure" OR "emerges lowest bidder" OR "debt tie-up" India when:7d') },
    { tag: 'KM-Tender/LOA',   url: gnews_('"floats tender" OR "invites bids" OR "letter of award" power OR transmission OR storage India when:7d') },
    { tag: 'KM-PSP/LDES',     url: gnews_('"pumped storage" OR BESS OR "energy storage" tender OR award OR approved India when:7d') },
    { tag: 'KM-TBCB/HVDC',    url: gnews_('TBCB OR ISTS OR HVDC transmission project awarded OR bids when:7d') },
    { tag: 'KM-GreenMol',     url: gnews_('"green hydrogen" OR "green ammonia" OR electrolyser OR CBG OR "waste-to-energy" project India when:7d') },
    { tag: 'KM-Discom/LPS',   url: gnews_('DISCOM "late payment surcharge" OR RBPF OR "liquidity support" OR RDSS loan when:7d') },
    { tag: 'KM-NCD/Shelf',    url: gnews_('"files shelf prospectus" OR "issues NCDs" OR "private placement" NBFC OR PSU India when:7d') },
    { tag: 'KM-GIFT/IFSC',    url: gnews_('"GIFT City" OR IFSC borrowing OR bond OR subsidiary finance when:7d') },
    { tag: 'KM-RatingAction', url: gnews_('rating upgrade OR downgrade OR "rating watch" NBFC OR PSU OR power India when:7d') },
    { tag: 'KM-HedgeCost',    url: gnews_('"hedging cost" OR "forward premium" OR "swap rate" OR MIBOR OR "cross-currency swap" India when:7d') },
    { tag: 'KM-CallMoney',    url: gnews_('"call money rate" OR TREPS OR "banking system liquidity" OR VRRR when:7d') },
    { tag: 'KM-UMPP/Nuclear', url: gnews_('UMPP OR supercritical OR "nuclear power" project approved OR investment India when:7d') }
  ];
}

/** v8.0 — the five peer lenders PFC competes with. */
function competitorFeeds_() {
  return [
    { tag: 'C-REC',      url: gnews_('"REC Limited" OR "Rural Electrification Corporation" loan OR sanction OR bond OR borrowing when:7d') },
    { tag: 'C-IREDA',    url: gnews_('IREDA loan OR sanction OR disbursement OR bond OR fundraise when:7d') },
    { tag: 'C-HUDCO',    url: gnews_('HUDCO loan OR sanction OR bond OR borrowing when:7d') },
    { tag: 'C-IRFC',     url: gnews_('IRFC lending OR bond OR borrowing OR sanction when:7d') },
    { tag: 'C-NABFID',   url: gnews_('NaBFID loan OR sanction OR bond OR infrastructure financing when:7d') },
    { tag: 'C-IIFCL',    url: gnews_('IIFCL loan OR sanction OR bond OR credit enhancement when:7d') },
    { tag: 'C-PeerLend', url: gnews_('REC OR IREDA OR HUDCO OR NaBFID sanctions OR disburses OR signs loan agreement when:7d') },
    { tag: 'C-PeerBorr', url: gnews_('REC OR IREDA OR IRFC OR HUDCO raises OR issues bonds OR ECB OR "term loan" when:7d') }
  ];
}

/** v8.0 — promoter/group stress: NCLT, IBC, downgrades, promoter fundraises. */
function promoterFeeds_() {
  return [
    { tag: 'W-NCLT',      url: gnews_('NCLT OR insolvency OR IBC resolution power OR infrastructure company India when:7d') },
    { tag: 'W-Downgrade', url: gnews_('rating downgrade CRISIL OR ICRA OR "India Ratings" OR CARE power OR infrastructure company when:7d') },
    { tag: 'W-PromoterFR',url: gnews_('Adani OR Tata OR JSW OR Vedanta OR Torrent OR GMR OR Essar raises OR refinances debt when:7d') },
    { tag: 'W-Group',     url: gnews_('Adani Group OR Tata Group OR Birla OR Jindal OR Hinduja OR Shapoorji power OR infrastructure when:7d') },
    { tag: 'W-StressRes', url: gnews_('stressed power asset resolution OR one-time settlement OR debt recast India when:7d') }
  ];
}

/** v8.0 — Treasury sub-filter: economists on India + newspaper/magazine editorials. */
/** v8.2 — credit-event feeds: IBC, fraud, forensic audit, recovery. */
function regulatoryFeeds_() {
  return [
    { tag: 'R-RBI',      url: gnews_('RBI circular OR "master direction" NBFC OR IFC OR infrastructure finance company when:7d') },
    { tag: 'R-SEBI',     url: gnews_('SEBI circular OR LODR OR "listing obligations" OR disclosure listed company when:7d') },
    { tag: 'R-Exch',     url: gnews_('NSE OR BSE compliance OR circular OR filing listed company India when:7d') },
    { tag: 'R-CERC',     url: gnews_('CERC OR "Central Electricity Regulatory" regulation OR order OR tariff when:7d') },
    { tag: 'R-CEA/MNRE', url: gnews_('CEA OR MNRE guidelines OR notification power OR renewable India when:7d') },
    { tag: 'R-MoP/MoF',  url: gnews_('"Ministry of Power" OR "Ministry of Finance" OR DIPAM circular OR notification CPSE when:7d') },
    { tag: 'R-Cos Act',  url: gnews_('"Companies Act" OR MCA OR NFRA amendment OR circular OR rules India when:7d') },
    { tag: 'R-Tax',      url: gnews_('CBDT OR "income tax" OR GST circular OR notification corporate India when:7d') },
    { tag: 'R-CERSAI',   url: gnews_('CERSAI OR PFRDA OR IBBI circular OR regulation OR notification when:7d') },
    { tag: 'R-Penalty',  url: gnews_('SEBI OR RBI penalty OR "show cause" OR enforcement NBFC OR listed company India when:7d') }
  ];
}

function creditEventFeeds_() {
  return [
    { tag: 'W-IBC',       url: gnews_('NCLT OR NCLAT OR CIRP insolvency power OR infrastructure OR energy company India when:7d') },
    { tag: 'W-Liquidate', url: gnews_('liquidation OR liquidator OR "winding up" power OR infrastructure company India when:7d') },
    { tag: 'W-Fraud',     url: gnews_('"forensic audit" OR "declared fraud" OR "red-flagged account" power OR infrastructure OR NBFC India when:7d') },
    { tag: 'W-Probe',     url: gnews_('"Enforcement Directorate" OR SFIO OR CBI probe power OR energy OR infrastructure company India when:7d') },
    { tag: 'W-Wilful',    url: gnews_('"wilful defaulter" OR SARFAESI OR "debt recovery tribunal" power OR infrastructure India when:7d') },
    { tag: 'W-OTS',       url: gnews_('"one-time settlement" OR "debt restructuring" OR haircut power OR infrastructure lender India when:7d') },
    { tag: 'W-Guarantee', url: gnews_('lenders invoke guarantee OR pledge invoked promoter power OR infrastructure India when:7d') },
    { tag: 'W-Auditor',   url: gnews_('auditor resigns OR "going concern" doubt power OR infrastructure OR energy company India when:7d') }
  ];
}

function editorialFeeds_() {
  return [
    { tag: 'T-Economists', url: gnews_('"Raghuram Rajan" OR "Arvind Subramanian" OR "Gita Gopinath" OR "Kaushik Basu" OR "Ashima Goyal" India economy when:7d') },
    { tag: 'T-CEA/RBI',    url: gnews_('"chief economic adviser" OR "Nageswaran" OR "RBI deputy governor" OR "monetary policy committee member" India when:7d') },
    { tag: 'T-Global Econ',url: gnews_('IMF OR "World Bank" OR OECD chief economist India growth OR outlook when:7d') },
    { tag: 'T-Hindu Ed',   url: gnews_('site:thehindu.com (repo rate OR RBI policy OR G-Sec yield OR rupee OR bond market OR sovereign rating) when:7d') },
    { tag: 'T-ET Opinion', url: gnews_('site:economictimes.indiatimes.com (repo rate OR RBI policy OR bond yield OR rupee OR interest rate outlook OR sovereign rating) when:7d') },
    { tag: 'T-BS/Mint',    url: gnews_('(site:business-standard.com OR site:livemint.com) (repo rate OR monetary policy OR G-Sec OR bond yield OR rupee OR interest rate) when:7d') },
    { tag: 'T-Magazines',  url: gnews_('"Business Today" OR "Outlook Business" OR Forbes India economy OR interest rates analysis when:7d') }
  ];
}

/** v8.0 — Borrowing sub-filter: AAA corporate bond coupons, cut-offs, spreads. */
function aaaBondFeeds_() {
  return [
    { tag: 'B-AAA Coupon',  url: gnews_('AAA rated bond issue coupon OR cut-off India when:7d') },
    { tag: 'B-AAA Spread',  url: gnews_('AAA corporate bond spread OR yield over g-sec India when:7d') },
    { tag: 'B-TopBanks',    url: gnews_('SBI OR HDFC Bank OR ICICI Bank OR Axis Bank OR Kotak infrastructure bond OR AT1 OR tier II issue when:7d') },
    { tag: 'B-TopNBFC',     url: gnews_('"Bajaj Finance" OR "Shriram Finance" OR "L&T Finance" OR "Tata Capital" OR "Cholamandalam" bond issue OR NCD when:7d') }
  ];
}

function defaultFeeds_() {
  return pfcBaseFeeds_()
    .concat(borrowingFeeds_())
    .concat(treasuryFeeds_())
    .concat(borrowerFeeds_())
    .concat(watchlistFeeds_())
    .concat((function () { var f = kmFeeds_(); return f.length ? f : keywordMasterFeeds_(); })())
    .concat(competitorFeeds_())
    .concat(promoterFeeds_())
    .concat(creditEventFeeds_())
    .concat(regulatoryFeeds_())
    .concat(editorialFeeds_())
    .concat(aaaBondFeeds_())
    .concat(borrowerBankFeeds_());
}

/** Feeds = Settings feeds + user query keywords (deduped by URL). */
function getFeeds_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.SET);
  var feeds = [];
  if (sh && sh.getLastRow() > 1) {
    var vals = sh.getRange(2, 4, sh.getLastRow() - 1, 2).getValues();
    vals.forEach(function (row) {
      var tag = String(row[0]).trim() || 'General';
      var url = String(row[1]).trim();
      if (/^https?:\/\//i.test(url)) feeds.push({ tag: tag, url: url });
    });
  }
  if (!feeds.length) feeds = defaultFeeds_();
  var user = pfcUserKeywords_();
  var seen = {};
  feeds.forEach(function (f) { seen[f.url] = true; });
  user.queries.forEach(function (f) { if (!seen[f.url]) { seen[f.url] = true; feeds.push(f); } });
  return feeds;
}

/** Append any default feed missing from Settings!D:E. Idempotent. */
function feedSync_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(CFG.SHEETS.SET);
  if (!sh) return;
  var have = {};
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 5, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { have[String(r[0]).trim()] = true; });
  }
  var rows = [];
  defaultFeeds_().forEach(function (f) { if (!have[f.url]) rows.push([f.tag, f.url]); });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 4, rows.length, 2).setValues(rows);
}

/* ============================ UTILITIES =================================== */

function log_(level, msg) {
  try {
    var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.LOG);
    if (sh) sh.appendRow([new Date(), level, String(msg).slice(0, 2000)]);
    if (sh && sh.getLastRow() > 502) sh.deleteRows(2, sh.getLastRow() - 502);
  } catch (e) { /* logging must never break the run */ }
  console.log(level + ': ' + msg);
}

/** v7.4 — pure-JS hash. The old version called Utilities.computeDigest() once per
 *  news item: an API round-trip each time. On a 160-feed deep fetch that is ~16,000
 *  round-trips and guarantees a 6-minute timeout. This is ~10,000x cheaper. */
function newsHash_(title, link) {
  var norm = String(title).toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  var key = norm.length > 25 ? norm : norm + '|' + String(link);
  var h1 = 2166136261, h2 = 5381;
  for (var i = 0; i < key.length; i++) {
    var c = key.charCodeAt(i);
    h1 ^= c;
    h1 = (h1 + ((h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24))) >>> 0;   // FNV-1a
    h2 = (((h2 << 5) + h2) + c) >>> 0;                                                // djb2
  }
  return ('0000000' + h1.toString(16)).slice(-8) + ('0000000' + h2.toString(16)).slice(-8);
}

/** Self-healing: creates a missing tab with correct headers instead of throwing. */
function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    var headers = pfcHeadersFor_(name);
    if (headers) setHeadersOn_(sh, headers);
    if (name === CFG.SHEETS.RULES) seedRadarRules_(sh);
    if (name === CFG.SHEETS.KM) seedKeywordMaster_(sh);
    if (name === CFG.SHEETS.KWU) seedMyKeywords_(sh);
  }
  return sh;
}

function pfcHeadersFor_(name) {
  if (name === CFG.SHEETS.RAW)   return CFG.RAW_HEADERS;
  if (name === CFG.SHEETS.BUS)   return CFG.BUS_HEADERS;
  if (name === CFG.SHEETS.WATCH) return CFG.WATCH_HEADERS;
  if (name === CFG.SHEETS.BORR)  return CFG.BORR_HEADERS;
  if (name === CFG.SHEETS.TRE)   return CFG.TRE_HEADERS;
  if (name === CFG.SHEETS.COMP)  return CFG.COMP_HEADERS;
  if (name === CFG.SHEETS.REG)   return CFG.REG_HEADERS;
  if (name === CFG.SHEETS.RULES) return CFG.RULES_HEADERS;
  if (name === CFG.SHEETS.KM)    return CFG.KM_HEADERS;
  if (name === CFG.SHEETS.KWU)    return CFG.KW_HEADERS;
  if (name === CFG.SHEETS.LOG)   return ['Timestamp', 'Level', 'Message'];
  return null;
}

function setHeadersOn_(sh, headers) {
  if (!sh) return;
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#1a3c6e').setFontColor('#ffffff');
  sh.setFrozenRows(1);
}

function existingHashes_() {
  var sh = sheet_(CFG.SHEETS.RAW);
  var n = sh.getLastRow() - 1;
  if (n < 1) return new Set();
  return new Set(sh.getRange(2, 1, n, 1).getValues().map(function (r) { return String(r[0]); }));
}

function parseJson_(text) {
  var t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  var start = t.indexOf('['), end = t.lastIndexOf(']');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

function nowStr_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy HH:mm');
}

function toast_(msg, secs) { SpreadsheetApp.getActive().toast(msg, 'PFC-NRD', secs || 5); }

function fq_(s) { return String(s == null ? '' : s).replace(/"/g, '""'); }
function escapeHtml_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ============================ FETCH PIPELINE ============================== */

/** Batched, isolated fetch: a bad URL or failed batch never kills the run. */
function fetchAllFeeds_() {
  return fetchFeedsCore_(getFeeds_(), getSettingNum_('LOOKBACK_DAYS'), getSettingNum_('MAX_ITEMS_PER_FEED'));
}

function fetchFeedsCore_(feedList, lookbackDays, maxPerFeed) {
  return fetchFeedsWindowed_(feedList, lookbackDays, maxPerFeed, 0, Date.now() + 20 * 60000).added;
}

/** Resumable fetch: starts at feed index `startIdx`, stops when past `deadline`.
 *  Returns { added, nextIndex } where nextIndex = -1 when all feeds are done. */
/** v9.0 — Google News sometimes re-serves months-old articles with a fresh RSS
 *  pubDate. If the title/snippet itself carries an explicit date older than the
 *  lookback window (e.g. "May 9, 2026"), the item is stale: reject it. */
function pfcStaleByText_(text, cutoff) {
  var s = String(text);
  var MON = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
  var found = [];
  var m;
  // "May 9, 2026" / "May 9 2026"
  var reA = new RegExp('\\b(' + MON + ')[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(20\\d{2})\\b', 'ig');
  while ((m = reA.exec(s))) { found.push(new Date(m[1].slice(0,3) + ' ' + m[2] + ', ' + m[3])); if (m.index === reA.lastIndex) reA.lastIndex++; }
  // "9 May 2026" / "9th May, 2026"  - the common Indian form
  var reB = new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(' + MON + ')[a-z]*\\.?,?\\s+(20\\d{2})\\b', 'ig');
  while ((m = reB.exec(s))) { found.push(new Date(m[2].slice(0,3) + ' ' + m[1] + ', ' + m[3])); if (m.index === reB.lastIndex) reB.lastIndex++; }
  // "2026-05-09"
  var reC = /\b(20\d{2})-(\d{2})-(\d{2})\b/g;
  while ((m = reC.exec(s))) { found.push(new Date(+m[1], +m[2] - 1, +m[3])); if (m.index === reC.lastIndex) reC.lastIndex++; }
  // "09-05-2026" / "09/05/2026"  - day-first, as Indian outlets write it
  var reD = /\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/g;
  while ((m = reD.exec(s))) { found.push(new Date(+m[3], +m[2] - 1, +m[1])); if (m.index === reD.lastIndex) reD.lastIndex++; }
  for (var i = 0; i < found.length; i++) {
    if (!isNaN(found[i]) && found[i] < cutoff) return true;
  }
  return false;
}

/** v9.9 - DATE VERIFICATION.
 *  Google News sometimes re-dates an older article to the day it re-serves it
 *  (a 9 May story arriving stamped 18 July). Nothing in the feed reveals this,
 *  so for NEWLY ADDED items only - a few dozen a day, not the whole book - we
 *  open the article and read the publisher's own date. If the page says the
 *  story is materially older, the page wins. Capped per run and time-boxed;
 *  on any failure the feed date simply stands. */
function pfcArticleDate_(url) {
  try {
    var res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true, followRedirects: true,
      headers: { 'User-Agent': 'Mozilla/5.0 (PFC-NRD AppsScript)' }
    });
    if (res.getResponseCode() !== 200) return null;
    var html = String(res.getContentText()).slice(0, 80000);
    var m = html.match(/"datePublished"\s*:\s*"([^"]{8,40})"/i)
         || html.match(/<meta[^>]+(?:property|name)=["']article:published_time["'][^>]*content=["']([^"']+)/i)
         || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']article:published_time["']/i)
         || html.match(/<meta[^>]+(?:name|itemprop)=["'](?:pubdate|publish-date|publishdate|datePublished|date)["'][^>]*content=["']([^"']+)/i)
         || html.match(/<time[^>]+datetime=["']([^"']{8,40})["']/i);
    var d = m ? new Date(m[1]) : null;
    if (d && !isNaN(d) && d.getFullYear() > 2000) return d;
    // fall back to a visible dateline such as "May 9, 2026" or "9 May 2026"
    var MON = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
    var t = html.replace(/<[^>]+>/g, ' ').slice(0, 20000);
    var a = t.match(new RegExp('\\b(' + MON + ')[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(20\\d{2})\\b', 'i'));
    if (a) { d = new Date(a[1].slice(0,3) + ' ' + a[2] + ', ' + a[3]); if (!isNaN(d)) return d; }
    var bb = t.match(new RegExp('\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(' + MON + ')[a-z]*\\.?,?\\s+(20\\d{2})\\b', 'i'));
    if (bb) { d = new Date(bb[2].slice(0,3) + ' ' + bb[1] + ', ' + bb[3]); if (!isNaN(d)) return d; }
    return null;
  } catch (e) { return null; }
}

function fetchFeedsWindowed_(feedList, lookbackDays, maxPerFeed, startIdx, deadline) {
  var all = feedList.filter(function (f) {
    if (f.url.length > 1900) { log_('WARN', 'Feed "' + f.tag + '" skipped: URL too long.'); return false; }
    return true;
  });
  var seen = existingHashes_();
  var cutoff = new Date(Date.now() - lookbackDays * 86400000);
  var runSeen = {};
  var sh = sheet_(CFG.SHEETS.RAW);
  var added = 0, nextIndex = -1, undated = 0, verified = 0, redated = 0;
  var verifyOn  = String(getSetting_('VERIFY_DATES') || 'yes').toLowerCase() !== 'no';
  var verifyCap = parseInt(getSetting_('VERIFY_MAX') || '25', 10); if (!(verifyCap >= 0)) verifyCap = 25;
  var BATCH = 10;
  log_('INFO', 'FETCH: starting at feed ' + startIdx + ' of ' + all.length + ' (existing hashes: ' + seen.size + ').');                       // smaller batches = more frequent checkpoints

  for (var b = startIdx; b < all.length; b += BATCH) {
    if (Date.now() > deadline) { nextIndex = b; break; }          // checkpoint between batches
    var slice = all.slice(b, b + BATCH);
    var responses;
    try {
      responses = UrlFetchApp.fetchAll(slice.map(function (f) {
        return { url: f.url, muteHttpExceptions: true, followRedirects: true,
                 headers: { 'User-Agent': 'Mozilla/5.0 (PFC-Radar AppsScript)' } };
      }));
    } catch (e) {
      log_('WARN', 'Fetch batch at feed ' + b + ' failed: ' + e.message);
      continue;
    }

    var rows = [];
    responses.forEach(function (resp, i) {
      var feed = slice[i];
      try {
        if (resp.getResponseCode() !== 200) throw new Error('HTTP ' + resp.getResponseCode());
        var items = parseFeed_(resp.getContentText());
        var count = 0;
        for (var j = 0; j < items.length && count < maxPerFeed; j++) {
          var it = items[j];
          if (!it.pubDate) { undated++; continue; }        // v8.0: never fabricate a date
          if (it.pubDate < cutoff) continue;               //        and honour the lookback window
          if (pfcStaleByText_(it.title + ' ' + it.snippet, cutoff)) continue;   // v9.0: re-served old article
          var h = newsHash_(it.title, it.link);
          if (seen.has(h) || runSeen[h]) continue;
          runSeen[h] = 1;
          // v9.9 - confirm the date against the article itself (new items only)
          if (verifyOn && verified < verifyCap && Date.now() < deadline - 5000) {
            verified++;
            var real = pfcArticleDate_(it.link);
            if (real && (it.pubDate - real) > 3 * 86400000) {      // feed is >3 days newer
              it.pubDate = real; redated++;
              if (real < cutoff) continue;                          // genuinely outside the window
            }
          }
          rows.push([h, new Date(), it.pubDate || '', it.source || feed.tag,
                     it.title, String(it.snippet).slice(0, 400), it.link, feed.tag,
                     CFG.STATUS.NEW, '', '']);
          count++;
        }
      } catch (e) { log_('WARN', 'Feed "' + feed.tag + '" failed: ' + e.message); }
    });

    // FLUSH EVERY BATCH: if the execution is killed, nothing fetched is lost.
    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      added += rows.length;
    }
    if (redated) log_('INFO', 'DATE CHECK: ' + redated + ' of ' + verified + ' verified items re-dated from the article page.');
    log_('INFO', 'Fetch: feeds ' + (b + slice.length) + '/' + all.length + ' done, +' + rows.length +
         ' rows (run total ' + added + (undated ? ', ' + undated + ' undated skipped' : '') + ').');
    if (b + BATCH < all.length) Utilities.sleep(300);
  }
  return { added: added, nextIndex: nextIndex };
}

/** Parse RSS 2.0 or Atom into {title, link, snippet, pubDate, source}[]. */
function parseFeed_(xmlText) {
  var doc = XmlService.parse(xmlText);
  var root = doc.getRootElement();
  var out = [];
  if (root.getName() === 'rss') {
    var channel = root.getChild('channel');
    if (!channel) return out;
    channel.getChildren('item').forEach(function (el) {
      var rawTitle = txt_(el, 'title');
      var pub = toDate_(txt_(el, 'pubDate')) || toDate_(txt_(el, 'date')) || toDate_(txt_(el, 'published'));
      if (!pub) {
        var dc = el.getChild('date', XmlService.getNamespace('http://purl.org/dc/elements/1.1/'));
        if (dc) pub = toDate_(dc.getText());
      }
      out.push({
        title: cleanTitle_(stripHtml_(rawTitle)),
        link: txt_(el, 'link'),
        snippet: stripHtml_(txt_(el, 'description')).slice(0, 400),
        pubDate: pub,
        source: sourceFromTitle_(stripHtml_(rawTitle))
      });
    });
  } else if (root.getName() === 'feed') {
    var ns = root.getNamespace();
    root.getChildren('entry', ns).forEach(function (el) {
      var linkEl = el.getChild('link', ns);
      out.push({
        title: cleanTitle_(stripHtml_(el.getChild('title', ns) ? el.getChild('title', ns).getText() : '')),
        link: linkEl ? (linkEl.getAttribute('href') ? linkEl.getAttribute('href').getValue() : '') : '',
        snippet: stripHtml_(el.getChild('summary', ns) ? el.getChild('summary', ns).getText() : '').slice(0, 400),
        pubDate: toDate_(el.getChild('updated', ns) ? el.getChild('updated', ns).getText() : ''),
        source: ''
      });
    });
  }
  return out;
}

function txt_(el, name) { var c = el.getChild(name); return c ? c.getText() : ''; }
function stripHtml_(s) { return String(s || '').replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim(); }
/** v8.0 — robust date parsing. Old code fell back to "today" when a feed had no
 *  parseable date, which is why April/June stories appeared with July dates. */
function toDate_(s) {
  if (!s) return '';
  var str = String(s).trim();
  var d = new Date(str);
  if (!isNaN(d) && d.getFullYear() > 2000) return d;
  var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);                       // ISO
  if (m) { d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); if (!isNaN(d)) return d; }
  m = str.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i);
  if (m) {
    var mm = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
      .indexOf(m[2].toLowerCase());
    d = new Date(Number(m[3]), mm, Number(m[1]));
    if (!isNaN(d)) return d;
  }
  return '';
}
function sourceFromTitle_(t) { var m = String(t).match(/ - ([^-]{2,40})$/); return m ? m[1].trim() : ''; }
function cleanTitle_(t) { return String(t).replace(/ - [^-]{2,40}$/, '').trim(); }

/* ============================ EXTRACTORS ================================== */

function pfcExtractAmount_(value) {
  var text = String(value || '').replace(/[\u2013\u2014-]/g, ' ').replace(/\s+/g, ' ');
  var match = text.match(/(?:\u20B9|rs\.?|inr)\s*([\d,.]+)\s*(lakh\s*crore|trillion|tn\b|crore|cr\b|billion|bn\b|million|mn\b)?/i);
  if (match) {
    var number = Number(match[1].replace(/,/g, ''));
    var unit = String(match[2] || 'crore').toLowerCase();
    var multiplier = /lakh|trillion|\btn/.test(unit) ? 100000 : /billion|\bbn/.test(unit) ? 100 : /million|\bmn/.test(unit) ? 0.1 : 1;
    return { crore: Number.isFinite(number) ? number * multiplier : null, raw: match[0], currency: 'INR' };
  }
  match = text.match(/([\d,.]+)\s*(lakh\s*crore|trillion|crore|cr)\b/i);   // bare "5000 crore" / "1 trillion"
  if (match) {
    var bare = Number(match[1].replace(/,/g, ''));
    var bareMultiplier = /lakh|trillion/i.test(match[2]) ? 100000 : 1;
    return { crore: Number.isFinite(bare) ? bare * bareMultiplier : null, raw: match[0], currency: 'INR' };
  }
  match = text.match(/(?:us\$|usd|\$)\s*([\d,.]+)\s*(billion|bn\b|million|mn\b)?/i);
  if (match) {
    var usd = Number(match[1].replace(/,/g, ''));
    var usdMultiplier = /billion|\bbn/.test(String(match[2] || 'million').toLowerCase()) ? 8500 : 8.5;
    return { crore: Number.isFinite(usd) ? usd * usdMultiplier : null, raw: match[0], currency: 'USD' };
  }
  match = text.match(/(?:\u20AC|eur)\s*([\d,.]+)\s*(billion|bn\b|million|mn\b)?/i);
  if (match) {
    var eur = Number(match[1].replace(/,/g, ''));
    var eurMultiplier = /billion|\bbn/.test(String(match[2] || 'million').toLowerCase()) ? 9200 : 9.2;
    return { crore: Number.isFinite(eur) ? eur * eurMultiplier : null, raw: match[0], currency: 'EUR' };
  }
  return { crore: null, raw: '', currency: '' };
}

function pfcEntity_(title) {
  var clean = String(title || '').replace(/\s+/g, ' ').trim();
  var parts = clean.split(/,|\s+(?:to|will|plans?|set to|seeks?|raises?|inks?|signs?|announces?|launches?|invests?|invest|awarded|wins?|gets?|secures?|approves?|files?|issues?|allots?|prices?|lists?)\b/i);
  var entity = (parts[0] || clean).replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '').trim();
  var words = entity.split(' ');
  if (words.length > 12) entity = words.slice(0, 12).join(' ');
  return entity || 'Entity not clear';
}

function pfcTenor_(text) {
  var match = String(text || '').match(/\b(\d+(?:\.\d+)?)\s*(?:year|yr)s?\b/i);
  return match ? match[1] + ' years' : 'Not stated';
}

function pricingSignal_(text) {
  var m = String(text || '').match(/\b(\d{1,2}(?:\.\d{1,3})?)\s*(?:%|per\s*cent|percent)/i);
  return m ? m[1] + '%' : 'Not stated';
}

function pfcMw_(text) {
  var m = String(text).replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(gw|mw)\b/i);
  if (!m) return null;
  return /gw/i.test(m[2]) ? Number(m[1]) * 1000 : Number(m[1]);
}

var PFC_STATE_MAP = [
  ['Maharashtra', /maharashtra|mumbai|pune|nagpur|solapur|vidarbha/],
  ['Madhya Pradesh', /madhya pradesh|\bmp\b|bhopal|indore|morena|rewa/],
  ['Chhattisgarh', /chhattisgarh|raipur|bhilai|korba/],
  ['Gujarat', /gujarat|ahmedabad|kutch|khavda|mundra|bhuj/],
  ['Rajasthan', /rajasthan|jaipur|jaisalmer|jodhpur|bikaner|barmer|pokhran|phalodi/],
  ['Tamil Nadu', /tamil nadu|chennai|kamuthi|tuticorin/],
  ['Karnataka', /karnataka|bengaluru|bangalore|tumkur|chitradurga|pavagada/],
  ['Andhra Pradesh', /andhra pradesh|amaravati|visakhapatnam|vizag|kadapa/],
  ['Telangana', /telangana|hyderabad|dundigal/],
  ['Uttar Pradesh', /uttar pradesh|\bup\b|lucknow|noida|jawaharpur|meja|buxar/],
  ['Odisha', /odisha|bhubaneswar|gopalpur|talabira/],
  ['Jharkhand', /jharkhand|ranchi|patratu|godda/],
  ['Bihar', /\bbihar\b|patna/],
  ['West Bengal', /west bengal|kolkata|mejia/],
  ['Punjab', /\bpunjab\b|talwandi|rajpura|nabha/],
  ['Haryana', /haryana|gurugram|jhajjar/],
  ['Himachal Pradesh', /himachal|shimla|karcham|larji|shongtong/],
  ['Uttarakhand', /uttarakhand|dehradun/],
  ['Jammu & Kashmir', /kashmir|jammu|kwar|chenab|ladakh/],
  ['Kerala', /kerala|kochi|thiruvananthapuram/],
  ['Assam', /\bassam\b|guwahati/],
  ['Sikkim', /sikkim/],
  ['Goa', /\bgoa\b|tamnar/],
  ['Delhi NCR', /\bdelhi\b|tehkhand/]
];

function pfcStateOf_(text) {
  var lower = String(text || '').toLowerCase();
  for (var i = 0; i < PFC_STATE_MAP.length; i++) {
    if (PFC_STATE_MAP[i][1].test(lower)) return PFC_STATE_MAP[i][0];
  }
  return 'Pan-India / Other';
}

function pfcSector_(lower, tag) {
  if (/green hydrogen|ammonia/.test(lower)) return 'Green Hydrogen';
  if (/battery|\bbess\b|energy storage/.test(lower)) return 'Battery Storage';
  if (/solar|wind|renewable/.test(lower)) return 'Renewable Energy';
  if (/transmission|grid|corridor/.test(lower)) return 'Transmission';
  if (/data cent|hyperscale/.test(lower)) return 'Data Centres';
  if (/electric vehicle|\bev\b|charging/.test(lower)) return 'Electric Vehicles';
  if (/airport|aviation/.test(lower)) return 'Airports';
  if (/port|terminal|shipping/.test(lower)) return 'Ports';
  if (/rail|metro/.test(lower)) return 'Railways / Metro';
  if (/highway|expressway|road|\bham\b|\bbot\b/.test(lower)) return 'Roads / Highways';
  if (/water|sewage|urban|smart city/.test(lower)) return 'Urban / Water';
  if (/mine|mining|mineral|aluminium|steel/.test(lower)) return 'Mining / Metals';
  if (/pipeline|refinery|oil|gas/.test(lower)) return 'Oil & Gas';
  if (/telecom|fibre|tower|5g/.test(lower)) return 'Telecom';
  if (/manufactur|factory|plant/.test(lower)) return 'Manufacturing';
  if (/power|electricity|generation/.test(lower)) return 'Power';
  return tag || 'Infrastructure';
}

function pfcProduct_(sector) {
  if (/Renewable|Hydrogen|Battery|Electric/.test(sector)) return 'Green project finance / RTL';
  if (/Road|Port|Airport|Rail|Data|Urban/.test(sector)) return 'Infrastructure project finance / RTL';
  if (/Transmission|Power/.test(sector)) return 'Project finance / term loan';
  return 'Term loan / project finance';
}

function pfcFundingSource_(text, title) {
  var value = String(text || '');
  var sources = [
    ['World Bank', /world bank/i], ['Asian Development Bank (ADB)', /asian development bank|\badb\b/i],
    ['AIIB', /\baiib\b/i], ['New Development Bank (NDB)', /new development bank|\bndb\b/i],
    ['JICA', /\bjica\b/i], ['KfW', /\bkfw\b/i], ['European Investment Bank', /european investment bank|\beib\b/i],
    ['Green Climate Fund', /green climate fund/i]
  ];
  for (var i = 0; i < sources.length; i++) if (sources[i][1].test(value)) return sources[i][0];
  return pfcEntity_(title);
}

/* ==========================================================================
 * v8.0 — ENTITY UNIVERSES
 * ========================================================================== */

/** PFC's direct competitors / peer lenders. Their news gets its own radar. */
var PFC_COMPETITORS = [
  ['REC', /\brec limited\b|\brec ltd\b|\brural electrification\b|\brec\b(?=[^a-z])/i],
  ['IREDA', /\bireda\b|indian renewable energy development/i],
  ['IRFC', /\birfc\b|indian railway finance/i],
  ['HUDCO', /\bhudco\b|housing and urban development corp/i],
  ['NaBFID', /\bnabfid\b|national bank for financing infrastructure/i],
  ['IIFCL', /\biifcl\b|india infrastructure finance company/i],
  ['SIDBI', /\bsidbi\b/i],
  ['NABARD', /\bnabard\b/i],
  ['EXIM Bank', /\bexim bank\b/i],
  ['PTC India Financial', /\bpfs\b|ptc india financial/i],
  ['IFCI', /\bifci\b/i]
];
var PFC_COMPETITOR_RE = new RegExp(PFC_COMPETITORS.map(function (c) { return c[1].source; }).join('|'), 'i');

function pfcCompetitorName_(text) {
  for (var i = 0; i < PFC_COMPETITORS.length; i++) {
    if (PFC_COMPETITORS[i][1].test(text)) return PFC_COMPETITORS[i][0];
  }
  return '';
}

/** Borrowing radar universe: top-10 banks + top NBFCs + competitors + PFC.
 *  Anything outside this (and outside MDB / RBI liquidity) is NOT a useful
 *  pricing benchmark and is dropped. */
var PFC_TOP_BANKS_RE = /\bsbi\b|state bank of india|\bhdfc bank\b|\bicici bank\b|\baxis bank\b|\bkotak\b|punjab national bank|\bpnb\b|bank of baroda|\bbob\b|canara bank|union bank of india|indusind bank|bank of india\b/i;
var PFC_TOP_NBFC_RE  = /bajaj finance|bajaj finserv|shriram finance|cholamandalam|\bl&t finance\b|muthoot|mahindra finance|tata capital|aditya birla (capital|finance)|piramal|lic housing|pnb housing|hdb financial|sundaram finance|\bnbfc\b|indiabulls|iifl finance|poonawalla/i;
var PFC_MDB_RE = /world bank|asian development bank|\badb\b|\baiib\b|new development bank|\bndb\b|\bjica\b|\bjbic\b|\bkfw\b|european investment bank|\beib\b|green climate fund|\bifc\b|proparco|export credit/i;
var PFC_SELF_RE = /power finance corporation|\bpfc\b/i;

function pfcIssuerClass_(text) {
  if (PFC_SELF_RE.test(text)) return 'PFC';
  if (PFC_COMPETITOR_RE.test(text)) return 'Competitor';
  if (PFC_TOP_BANKS_RE.test(text)) return 'Bank (top-10)';
  if (PFC_TOP_NBFC_RE.test(text)) return 'NBFC';
  if (PFC_MDB_RE.test(text)) return 'MDB / bilateral';
  if (/\brbi\b|reserve bank/i.test(text)) return 'RBI / money market';
  return '';
}

/** Indian promoter / corporate groups (Borrower Watch: NCLT/IBC, rating actions,
 *  borrowings). Multi-word or unambiguous only \u2014 no bare initialisms that could
 *  collide with foreign entities or finance jargon. */
var PFC_PROMOTER_GROUPS = [
  'Adani', 'Tata Group', 'Tata Power', 'Tata Sons', 'Reliance Industries', 'Reliance Power',
  'Reliance Infrastructure', 'Anil Ambani', 'Mukesh Ambani', 'JSW Group', 'JSW Energy', 'JSW Steel',
  'Sajjan Jindal', 'Naveen Jindal', 'Jindal Steel', 'Jindal Power', 'Vedanta', 'Anil Agarwal',
  'Aditya Birla', 'Hindalco', 'Essar Group', 'Essar Power', 'Ruia', 'GMR Group', 'GMR Energy',
  'GVK Group', 'Lanco', 'Jaiprakash', 'Jaypee Group', 'Shapoorji Pallonji', 'Hinduja Group',
  'Torrent Group', 'Torrent Power', 'CESC', 'Sterlite Power', 'Suzlon', 'Greenko', 'ReNew',
  'Avaada', 'ACME Solar', 'Serentica', 'Juniper Green', 'Continuum Green', 'CleanMax',
  'Ayana Renewable', 'Sembcorp', 'Hero Future Energies', 'O2 Power', 'Fourth Partner',
  'Amp Energy', 'Amplus', 'Gentari', 'Vikram Solar', 'Waaree', 'Premier Energies', 'Gensol',
  'Welspun', 'Mytrah', 'Sanjiv Goenka', 'RP-Sanjiv Goenka', 'KSK Energy', 'Coastal Energen',
  'Ind-Barath', 'Meenakshi Energy', 'Athena', 'Sravanthi', 'RattanIndia',
  // v10.9: names below are NOT in PFC's lending universe (housing finance,
  // NBFC, media, retail, aviation, steel, edtech). They were generating
  // borrower alerts for companies we have no exposure to. Removed:
  // IL&FS, DHFL/Dewan Housing, SREI, Reliance Capital, Zee/Subhash Chandra,
  // Byju, Go First, Future Group, Alok Industries, Videocon, Bhushan Power,
  // Monnet Ispat. Add any back to this list if exposure exists.
];
var PFC_PROMOTER_RE = new RegExp('\\b(' + PFC_PROMOTER_GROUPS.map(function (n) {
  return n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')\\b', 'i');

/** State-sector markers (to tag a borrower as State vs Private vs CPSE). */
var PFC_STATE_ENTITY_RE = /\b(discom|genco|transco|\w{2,8}(vvnl|pdcl|pgcl|ptcl|sedcl|setcl|gcl|tcl)|state (government|utility|power|discom)|nigam|vidyut|urja vikas|electricity board|\bseb\b)\b/i;
var PFC_CPSE_RE = /\bntpc\b|\bnhpc\b|\bsjvn\b|\bthdc\b|\bneepco\b|\bnlc\b|\bnpcil\b|\bpowergrid\b|\bpgcil\b|\bdvc\b|\bbhel\b|\bcoal india\b|\bgail\b|\bongc\b|\biocl\b|\bbpcl\b|\bhpcl\b|\bsail\b|\beesl\b/i;

function pfcBorrowerClass_(text) {
  if (PFC_CPSE_RE.test(text)) return 'CPSE';
  if (PFC_STATE_ENTITY_RE.test(text)) return 'State';
  if (PFC_PROMOTER_RE.test(text) || PFC_WATCHLIST_RE.test(text.toLowerCase())) return 'Private';
  return 'Other';
}

/** NCLT / IBC and rating-downgrade detectors (Borrower Watch sub-types). */
/* ==========================================================================
 * v8.2 — CREDIT EVENT LEXICON
 * The vocabulary a lending / compliance desk actually uses. Each tier becomes
 * a Borrower Watch sub-type so the desk can filter to one class of risk.
 * ========================================================================== */
var PFC_CE_IBC_RE = /\bnclt\b|\bnclat\b|insolven(cy|t)|\bibc\b|bankruptcy code|corporate insolvency|\bcirp\b|section (7|9|10) (plea|application|petition)|insolvency (plea|petition|proceedings)|resolution plan|resolution professional|committee of creditors|\bcoc\b|moratorium|liquidat(e|es|ed|ion|or)|winding[- ]up|admitted (to|for|under) (insolvency|cirp)/i;

var PFC_CE_FRAUD_RE = /\bfraud\b|fraudulent|forensic audit|red[- ]flagged account|\brfa\b|\bsfio\b|serious fraud investigation|enforcement directorate|\bed\b (raid|attaches|probe|summons|searches)|attaches assets|asset attachment|\bcbi\b (probe|fir|case)|\bfir\b filed|siphon(ing|ed)?|diversion of funds|fund diversion|round[- ]tripping|money launder|\bpmla\b|look[- ]out circular|auditor (resigns?|quits?|resignation)|going concern|qualified opinion|adverse opinion|accounting irregularit|misstatement|whistleblower/i;

var PFC_CE_RECOVERY_RE = /wil+ful defaulter|\bsarfaesi\b|\bdrt\b|debt recovery tribunal|takes? possession|took possession|e[- ]auction|auction of (assets|plant|unit)|invoke[sd]?\b[^.]{0,25}guarantee|guarantee invocation|invoke[sd]?\b[^.]{0,20}pledge|pledged shares? invoked|recovery (suit|proceedings)|\bnpa\b|non[- ]performing (asset|loan)|written off|write[- ]off/i;

var PFC_CE_RESTRUCTURE_RE = /one[- ]time settlement|\bots\b|debt (recast|restructur\w*)|restructuring (plan|package|proposal)|haircut|\bsma[- ]?[012]\b|special mention account|standstill agreement|resolution framework|debt rejig|refinancing package/i;

var PFC_CE_DOWNGRADE_RE = /downgrade[sd]?|rating (cut|lowered|revised down|withdrawn|suspended|affirmed?|revised)|(outlook|rating) revised (to |down)?|revised to (negative|stable|positive)|(negative|positive|stable) (outlook|watch)|outlook (revised|changed|cut|lowered|to)|placed (on|under) (credit )?watch|junk (status|grade)|credit watch|(moody'?s|fitch|s&p|crisil|icra|care ratings|india ratings)[^.]{0,40}(revis|affirm|downgrad|upgrad|assign|outlook|rating)/i;

/** Most severe class first, or ''. */
/** Title-case a matched entity fragment ("adani group" -> "Adani Group"). */
function pfcTitleCase_(s) {
  return String(s || '').replace(/\w\S*/g, function (w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}

function pfcCreditEvent_(lower) {
  if (PFC_CE_IBC_RE.test(lower))         return 'NCLT / IBC';
  if (PFC_CE_FRAUD_RE.test(lower))       return 'Fraud / Forensic';
  if (PFC_CE_RECOVERY_RE.test(lower))    return 'Recovery / SARFAESI';
  if (PFC_CE_RESTRUCTURE_RE.test(lower)) return 'Restructuring / OTS';
  if (PFC_CE_DOWNGRADE_RE.test(lower))   return 'Credit Rating Change';
  if (/\brating (upgrade[sd]?|raised|revised up)\b|upgrades? .{0,30}rating/i.test(lower)) return 'Credit Rating Change';
  return '';
}

/** A severe credit event is captured even when the company is not yet in the
 *  borrower bank: the bank is never complete, and insolvency / fraud inside
 *  PFC's lending universe is intelligence in its own right.  India + sector
 *  nexus is required so foreign or unrelated corporate news stays out. */
var PFC_RATING_AGENCY_RE = /\bcrisil\b|\bicra\b|care ratings|india ratings|\bbrickwork\b|\bacuite\b|moody'?s|standard & poor|\bs&p\b|\bfitch\b/i;

/** The SUBJECT must be an Indian power / infra / finance entity — not a foreign
 *  corporate that merely mentions India somewhere in the headline. */
var PFC_ENTITY_SECTOR_RE = /\bpower\b|energy|electricity|infrastructur|\binfra\b|discom|genco|transco|utility|transmission|renewable|thermal|hydro|solar|\bwind (power|energy|farm)\b|\bnbfc\b|lender|\bbank\b|financ|\bsteel\b|\bcement\b|highway|\bport\b|airport|\bmetro\b|refiner|petrochemical|\bcoal\b|\bgas\b/i;

function pfcCreditEventHit_(lower, title, text) {
  var ce = pfcCreditEvent_(lower);
  if (!ce) return null;
  // v9.2 — 'Wilful Default' only when the HEADLINE itself says so; body-only
  // mentions stay under Recovery / SARFAESI.
  if (ce === 'Recovery / SARFAESI' && /wil+ful default/i.test(title)) ce = 'Wilful Default';
  var named = PFC_PROMOTER_RE.test(lower) || PFC_WATCHLIST_RE.test(lower) ||
              PFC_BORROWER_NAMES_RE.test(lower) || PFC_BORROWER_CODES_RE.test(text);
  /* v8.9 — PFC-universe sector test for UNNAMED entities. The old gate accepted
   * any headline containing "loan"/"debt"/"lenders" — words present in every
   * credit story, including a Rs 17-crore housing financier's restructuring.
   * Now an unnamed entity's credit event counts only if the STORY is in PFC's
   * lending world: power / energy / infrastructure, or systemic finance
   * (a bank or large NBFC-IFC as the SUBJECT, not merely as a word). */
  var sectorish = PFC_ENTITY_SECTOR_RE.test(lower);
  var offSector = /home loan|housing finance|\bhfc\b|microfinance|\bmfi\b|gold loan|vehicle (finance|loan)|consumer (finance|loan)|personal loan|education loan|fintech|\bnbfc-mfi\b|real estate developer|textile|pharma|hospitality|retail(er)?\b|e-?commerce|logistics(?! park)|jewell?er/i.test(lower);

  if (ce === 'Credit Rating Change' && !named) {
    if (!(pfcIndiaNexus_(lower) && sectorish && !offSector && PFC_RATING_AGENCY_RE.test(lower))) return null;
  }
  var lenderSubject = /\bbanks?\b|lenders?|creditors?|consortium/i.test(lower);
  if (!named) {
    if (!pfcIndiaNexus_(lower)) return null;
    // Wilful-default declared by lenders is a lending event whatever the borrower's
    // industry — the headline itself is the sector signal.
    var wilfulPass = ce === 'Wilful Default' && lenderSubject && !offSector;
    if (!wilfulPass && (!sectorish || offSector)) return null;   // in-sector, and not an off-sector lender
    // materiality: an unnamed entity's event needs size OR severity
    var amt = pfcExtractAmount_(text).crore || 0;
    var severe = ce === 'NCLT / IBC' || ce === 'Fraud / Forensic';
    if (!severe && amt > 0 && amt < 100) return null;            // sub-Rs 100 cr restructuring/OTS = noise
  }

  // "Lender declares/classifies/tags <BORROWER> (as) wilful defaulter / fraud":
  // the subject of the action is the borrower, never the declaring bank.
  var declared = String(title).match(/(?:declares?|classif(?:y|ies)|tags?|names?)\s+(?:m\/s\.?\s+)?(.{3,45}?)\s+(?:as\s+)?(?:an?\s+)?(?:wil+ful|fraud|npa|defaulter)/i);
  var m = lower.match(PFC_PROMOTER_RE) || lower.match(PFC_WATCHLIST_RE) || lower.match(PFC_BORROWER_NAMES_RE);
  var amount = pfcExtractAmount_(text);
  return {
    borrower: declared ? pfcTitleCase_(declared[1].trim()) : (m ? pfcTitleCase_(m[0]) : pfcEntity_(title)),
    subtype: ce,
    cls: pfcBorrowerClass_(text),
    signal: title.slice(0, 140),
    est_cr: amount.crore,
    mw: pfcMw_(text),
    known: named,
    why: named
      ? 'Credit event at a PFC borrower / promoter group (' + ce + ') \u2014 direct exposure risk.'
      : 'Credit event inside PFC\'s lending universe (' + ce + ') \u2014 check exposure, co-lending and guarantees.',
    action: ce === 'NCLT / IBC'
      ? 'LPCU/Recovery: confirm exposure, file claim with the RP, review security cover and provisioning.'
      : ce === 'Fraud / Forensic'
      ? 'LPCU/CRO: check exposure, RBI fraud-reporting obligation and early-warning-signal review.'
      : (ce === 'Wilful Default' || ce === 'Recovery / SARFAESI')
      ? 'Recovery: verify exposure, guarantee/pledge position and SARFAESI/DRT options.'
      : ce === 'Restructuring / OTS'
      ? 'LPCU: assess sacrifice, provisioning and asset classification under RBI Stressed Assets Directions.'
      : 'CRO: reassess internal rating, pricing and covenant triggers.'
  };
}

var PFC_NCLT_RE = /\bnclt\b|\bnclat\b|insolvency|\bibc\b|bankruptcy code|resolution plan|corporate insolvency|liquidation|moratorium|\bcirp\b|resolution professional|committee of creditors|\bcoc\b approves|one[- ]time settlement|\bots\b proposal|debt resolution|haircut/i;
var PFC_DOWNGRADE_RE = /downgrade[sd]?|rating (cut|lowered|revised down)|negative (outlook|watch)|\bdefault\b|\bd\b rating|junk (status|grade)|credit watch/i;

/** AAA corporate-bond pricing news (Borrowing sub-type). */
var PFC_AAA_BOND_RE = /\baaa\b[^.]{0,40}(bond|coupon|yield|paper|issuance|spread|cut[- ]?off)|(bond|coupon|yield|spread)[^.]{0,30}\baaa\b|\baa\+\b|corporate bond (yield|spread|coupon|cut[- ]?off)/i;

/** Economist commentary / newspaper editorials on India (Treasury sub-type). */
var PFC_EDITORIAL_RE = /editorial|\bop[- ]ed\b|opinion\b|column\b|\bview\b:|analysis:|(economist|chief economist|ex[- ]rbi|former rbi|professor|mit\b|imf|world bank)[^.]{0,40}(says|writes|argues|warns|expects|sees)|(raghuram rajan|arvind subramanian|kaushik basu|jayati ghosh|montek|bibek debroy|krishnamurthy subramanian|arvind panagariya|abhijit banerjee|gita gopinath|nouriel roubini|paul krugman|kenneth rogoff|larry summers|olivier blanchard)/i;

/* ============================ WATCHLIST =================================== */

var PFC_WATCHLIST = [
  // Corporate / IPP groups
  'Adani', 'JSW Energy', 'JSW Neo', 'ReNew', 'ACME', 'Avaada', 'Greenko', 'CleanMax',
  'Continuum Green', 'Mytrah', 'Juniper Green', 'Serentica', 'Gensol', 'Suzlon',
  'Vedanta', 'Talwandi Sabo', 'Sasan Power', 'Rosa Power', 'Mahan Energen', 'MB Power',
  'GMR Energy', 'GKEL', 'Essar Power', 'Sravanthi Energy', 'Sikkim Urja', 'Mundra Petrochem',
  'Chenab Valley', 'CVPPL', 'Khorlochhu', 'Patratu Vidyut', 'PVUNL',
  // CPSEs / large borrowers
  'NHPC', 'SJVN', 'THDC', 'NEEPCO', 'NLC India', 'Torrent Power', 'CESC', 'Tata Power',
  'Sembcorp', 'Ayana', 'Hero Future', 'O2 Power', 'Fourth Partner', 'Amp Energy',
  'NTPC', 'NPCIL', 'BHEL', 'EESL', 'HPCL Rajasthan Refinery', 'MRPL', 'RINL',
  'Northern Coalfields', 'Meja Urja', 'MUNPL', 'NUPPL', 'DVC', 'KMRL', 'MMRDA', 'KIIFB',
  'Vadhvan Port',
  // State gencos
  'APGENCO', 'TSGENCO', 'TGGENCO', 'RRVUNL', 'UPRVUNL', 'MSPGCL', 'MPPGCL', 'WBPDCL',
  'CSPGCL', 'KPCL', 'OPGC', 'GSECL', 'HPGCL', 'HPPCL', 'TNPGCL', 'HNPCL',
  // Discoms
  'MSEDCL', 'TANGEDCO', 'UPPCL', 'BESCOM', 'HESCOM', 'GESCOM', 'CESCOM', 'KSEBL',
  'PSPCL', 'JVVNL', 'AVVNL', 'JDVVNL', 'JBVNL', 'WBSEDCL', 'APSPDCL', 'APEPDCL',
  'APCPDCL', 'APPDCL', 'TGSPDCL', 'TGNPDCL', 'TSNPDCL', 'TSSPDCL', 'CSPDCL',
  'MPMKVVCL', 'UHBVNL', 'DHBVNL', 'SBPDCL', 'TSECL', 'TVNL', 'HPSEBL', 'TNPDCL', 'TNGECL',
  // Transcos
  'APTRANSCO', 'TGTRANSCO', 'TSTRANSCO', 'TANTRANSCO', 'KPTCL', 'MPPTCL', 'OPTCL',
  'HVPNL', 'PSTCL', 'RRVPNL', 'UPPTCL', 'HPPTCL', 'WBSETCL', 'CSPTCL', 'PTCUL'
];

var PFC_WATCHLIST_RE = new RegExp('\\b(' + PFC_WATCHLIST.map(function (n) {
  return n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')\\b', 'i');

var PFC_FIN_CONTEXT_RE = /loan|lend|financ|refinanc|debt|bond|credit|sanction|disburs|borrow|project|plant|facility|\bunit\b|capacity|\bcrore\b|\bmw\b|\bgw\b|solar|wind|hydro|thermal|transmission|substation|smart meter|commission|\bppa\b|tariff|nclt|nclat|insolven|\bibc\b|\bcirp\b|liquidat|moratorium|resolution plan|default|dues|rating|downgrade|upgrade|fraud|forensic|wil+ful|sarfaesi|\bdrt\b|guarantee|pledge|haircut|settlement|restructur|\bsma\b|\bnpa\b|auditor|going concern|capex|invest|acquisition|stake|merger|\bipo\b|fundrais|tender|award|begins?/;

var PFC_ADVERSE_RE = /\bnclt\b|insolven|bankrupt|\bdefault(s|ed|ing)?\b|delay(s|ed)? payment|payment delay|unpaid dues|mounting dues|overdue|downgrad|penalt|curtail|terminat(e|es|ed|ion)|cancell?(s|ed|ation)?\b|scrapp?ed\b|stressed asset|distressed|\bfraud\b|\bprobe[sd]?\b|investigat|\braid(s|ed)?\b|\bfire\b(?! safety| fighting| drill)|explosion|\bblast\b(?! furnace)|accident|\boutage\b|shutdown|shuts? down|\bhalt(s|ed|ing)?\b|\bstall(s|ed|ing)\b|\bstrikes?\b(?! (price|a deal|deal|pact|agreement|partnership))|lock ?out|force majeure|\barbitration\b|\bnpa\b|non[- ]performing/i;

/** Consumer load-shedding is not a credit event at a borrower. */
var PFC_CONSUMER_OUTAGE_RE = /power cut|load ?shedding|blackout|residents|households|consumers? (face|hit)|areas? (to|will) face|scheduled maintenance|supply disruption/i;

/** Adverse only if it touches the borrower's assets or money, not its customers. */
function pfcAdverseHit_(lower) {
  if (!PFC_ADVERSE_RE.test(lower)) return false;
  if (PFC_CONSUMER_OUTAGE_RE.test(lower) &&
      !/plant|unit \d|generation halted|\bloan\b|\bdues\b|default|nclt|insolven|fraud|downgrad|financ/i.test(lower)) return false;
  return true;
}

/** Operational PROGRESS at a borrower — High importance per LPCU brief. */
var PFC_PROGRESS_RE = /\bcommission(s|ed|ing)\b|synchronis|synchroniz|\bcod\b|commercial operation|financial closure|\bppa\b signed|signs? ppa|unit \d.{0,20}(operational|online)|begins? (generation|operations?)|achiev(es|ed).{0,25}(capacity|milestone)|full load|first (power|unit)|inaugurat/;

function pfcProgressHit_(lower) {
  if (/(electricity|regulatory|central|state|election|planning|finance|pay|appellate) commission|commissioner|commission of india/i.test(lower) &&
      !/\bcommissioned\b|\bcommissioning\b|synchronis|synchroniz|\bcod\b|commercial operation/i.test(lower)) return false;
  return PFC_PROGRESS_RE.test(lower);
}

var PFC_INDIA_NEXUS_RE = /\bindia\b|\bindian\b|\u20B9|\brs\.?\s?\d|\bcrore\b|\blakh\b|\bdiscom\b|\bnhai\b|\bseci\b|\bpib\b|delhi|mumbai|gujarat|rajasthan|maharashtra|karnataka|tamil nadu|telangana|andhra|odisha|uttar pradesh|madhya pradesh|bihar|jharkhand|chhattisgarh|punjab|haryana|kerala|assam|west bengal|himachal|uttarakhand|kashmir|ladakh|sikkim|arunachal|meghalaya|manipur|mizoram|tripura|chennai|hyderabad|bengaluru|bangalore|kolkata|pune|ahmedabad|noida|gurugram|lucknow|jaipur|bhopal|patna|ranchi|guwahati|\birfc\b|\bireda\b|\bhudco\b|\bnabfid\b|\biifcl\b|\brec\b|\bpfc\b|power finance|\bntpc\b|\bnhpc\b|\bsjvn\b|\bnpcil\b|\bsail\b|\bgail\b|\bongc\b|\biocl\b|\bbpcl\b|\bhpcl\b|coal india|powergrid|\bpgcil\b|\bnabard\b|\bsidbi\b|exim bank|\bsbi\b|\blic\b|\bhdfc\b|\bicici\b|\baxis bank\b|\bkotak\b|\bpnb\b|bank of baroda|canara bank|union bank|\bsebi\b|\bnse\b|\bbse\b|\b\w{2,8}(vvnl|pdcl|pgcl|ptcl|gcl|tcl|mcl|genco|transco|discom)s?\b|\btata\b|reliance industries|\bril\b|ambani|aditya birla|\bbirla\b|jindal|larsen|toubro|\bl&t\b|mahindra|bajaj|godrej|waaree|premier energies|vikram solar|torrent power|\bcesc\b|sterlite|tata power|hindalco|jsw steel|ultratech|bharti|airtel|indus towers|\bdlf\b|infosys|\bitc\b|maruti|hero motocorp|shriram|bajaj finance|muthoot|piramal|\biifl\b|yes bank|indusind|federal bank|\bidfc\b|au small finance|bandhan|ceigall|\bircon\b|\brvnl\b|\bnbcc\b|\bhal\b|\bbel\b/;

/* ==========================================================================
 * v6.3 — PFC BORROWER MONITORING BANKS (from LPCU borrower register)
 * CODES  : SPV/utility abbreviations — matched CASE-SENSITIVELY against the
 *          raw headline+snippet (uppercase word), so 'best'/'apl' in prose
 *          never false-trigger while 'BEST'/'APL' as entities do.
 * NAMES  : multi-word borrower/project names — matched case-insensitively.
 * ========================================================================== */

var PFC_BORROWER_CODES = [
  'ABEPL',
  'ABRPL',
  'ACME',
  'ACSPL',
  'AECEPL',
  'AGE23L',
  'AGE25BL',
  'AGE26AL',
  'AGGHPL',
  'AHEJ',
  'ALREPL',
  'APCPDCL',
  'APDISCOMS',
  'APEPDCL',
  'APGENCO',
  'APJL',
  'APPDCL',
  'APSPDCL',
  'APSPL',
  'APSSDCL',
  'APTRANSCO',
  'ARE1L',
  'ARE41L',
  'ARE48L',
  'ARPL',
  'ARTL',
  'ASHL',
  'ASUPL',
  'AUOPL',
  'AVAADA',
  'AVVNL',
  'AWEK3L',
  'AWEK4L',
  'AWEKFL',
  'AWEKTL',
  'AWEMP1L',
  'AWEMP1PL',
  'BCGCL',
  'BESCOM',
  'BEST',
  'BGCL',
  'BGCPTL',
  'BHEL',
  'BLERPL',
  'BPDCL',
  'BRPL',
  'BSUL',
  'BVPCL',
  'BWWMPL',
  'BYPL',
  'CBCMPL',
  'CBRPL',
  'CERL',
  'CESCOM',
  'CEWRL',
  'CGEH',
  'CGERPL',
  'CMTPL',
  'CSPCPL',
  'CSPDCL',
  'CSPGCL',
  'CSPTCL',
  'CVPPL',
  'CVPPPL',
  'DBLSCMPL',
  'DEPL',
  'DHBVNL',
  'DMSWSL',
  'DRPL',
  'DVC',
  'EESL',
  'EI3PL',
  'EPCL',
  'EPGL',
  'FBTL',
  'FDPL',
  'FDPL(F',
  'FUPL',
  'GAIPL',
  'GAPIPL',
  'GENSOL',
  'GESCOM',
  'GKEL',
  'GPGSL',
  'GSECL',
  'GSPCL',
  'GSPL',
  'GTTPL',
  'HESCOM',
  'HMESPL',
  'HNPCL',
  'HPDCAPL',
  'HPGCL',
  'HPPCL',
  'HPPL',
  'HPPTCL',
  'HPSEBL',
  'HRRL',
  'HSTPL',
  'HSTPSL',
  'HVPNL',
  'JBVNL',
  'JCRL',
  'JDVVNL',
  'JGBPL',
  'JGBTPL',
  'JGCPL',
  'JGCPL1',
  'JKPCL',
  'JROPL',
  'JRTPL',
  'JSRECR',
  'JSREPPL',
  'JSWREL',
  'JUWMJL',
  'JUWMJOL',
  'JVVNL',
  'K4CPTL',
  'KBPMPL',
  'KEPL',
  'KEPL-KE',
  'KGPCL',
  'KHPL',
  'KIIFB',
  'KIPCL',
  'KMRL',
  'KPCL',
  'KPSTL',
  'KPTCL',
  'KSATL',
  'KSEBL',
  'KSKMPCL',
  'MAPL',
  'MBPL',
  'MGFL',
  'MMRDA',
  'MMRDA-MM',
  'MPDCL',
  'MPMKVVCL',
  'MPPGCL',
  'MPPTCL',
  'MRPL',
  'MSEDCL',
  'MSPGCL',
  'MUML',
  'MUNPL',
  'MVMPL',
  'MVSBPL',
  'MWSL',
  'MYTRAH',
  'NETCL',
  'NGEAL',
  'NKTL',
  'NLBFPL',
  'NMSCEL',
  'NPCIL',
  'NTPC',
  'NUPPL',
  'NWWMPL',
  'OKPPL',
  'OPGC',
  'OPGCL',
  'OPTCL',
  'OVNPL',
  'PBESPL',
  'PROJECTS',
  'PSPCL',
  'PSTCL',
  'PSTCL-FLC',
  'PTCUL',
  'RAPPL',
  'RDJPL',
  'RDUPL',
  'RGMHS1',
  'RGMHS3',
  'RGMOPL',
  'RHHPL',
  'RHPPL',
  'RINL',
  'RKMPPL',
  'RMESPL',
  'RPCL',
  'RPDCL',
  'RPSCL',
  'RPVPL',
  'RRVPNL',
  'RRVUNL',
  'RSHPL',
  'RSPPL',
  'RWEKFPL',
  'SBEL',
  'SBPDCL',
  'SCCMPL',
  'SEPC',
  'SEPL',
  'SGEOPL',
  'SGSL',
  'SHEPL',
  'SHPL',
  'SMPL',
  'SPCPL',
  'SPPL',
  'SREIPL',
  'SRI1PL',
  'SRI5PL',
  'SRI7PL',
  'SRSSFPL',
  'STPL',
  'SUSHEE',
  'SWPPL',
  'TANGEDCO',
  'TANTRANSCO',
  'TBVNL',
  'TGDISCOMS',
  'TGGENCO',
  'TGNPDCL',
  'TGPXIIPL',
  'TGSPDCL',
  'TGTRANSCO',
  'TMPL',
  'TNGECL',
  'TNPDCL',
  'TNPGCL',
  'TNPL',
  'TOWMCL',
  'TSECL',
  'TSGENCO',
  'TSNPDCL',
  'TSPL',
  'TSSPDCL',
  'TSTRANSCO',
  'TSWRIDCL',
  'TVNL',
  'TWTEPL',
  'UHBVNL',
  'UPPCL',
  'UPPTCL',
  'UPRVUNL',
  'VEDANTA',
  'VJNL',
  'VPLPL',
  'VPPL',
  'WBPDCL',
  'WBSEDCL',
  'WBSETCL',
  'WSPTL',
  'ZREPL'
];

var PFC_BORROWER_NAMES = [
  'ABEPL',
  'ABRPL',
  'Acme Aklera',
  'Acme Deoghar',
  'ACME Eco Clean',
  'ACME Eco Clean Energy',
  'ACME Jupiter',
  'ACME Oman',
  'ACME Oman AGGHPL',
  'Acme Phalodi',
  'ACME Pokhran',
  'Acme Pokhran Solar',
  'Acme Renewtech',
  'Acme Sigma Urja',
  'ACME Sikar',
  'Acme Urja One',
  'Adani AESL',
  'Adani Jaisalmer',
  'Adani Jharkhand TPP',
  'Adani Kamuthi',
  'Adani New Industries',
  'Adani Renewable Energy Forty One',
  'Adani Wind Energy Kutchh Three',
  'AGE25BL',
  'Amplus Tumkur Solar Energy One',
  'AP Discoms',
  'APDiscoms',
  'Assam Bio Refinery',
  'Avaada MSKVY',
  'Avaada Sustainable Urja',
  'Bhuj Wind Energy',
  'Buxar TPP',
  'CGE Hybrid Energy',
  'CGE II',
  'CGE Shree Digvijay Cement',
  'CGE Shree Digvijay Cement Green Energy',
  'Chargezone',
  'Chenab Valley Power Projects CVPPPL',
  'Clean Max Zeus',
  'Clean Solar Power Chitradurga',
  'CleanMax',
  'Continuum',
  'CSPTCL C',
  'CVPPL Kwar HEP',
  'Dans Energy',
  'DHBVNL RDSS Loans',
  'Dundigal Waste 2 Energy',
  'DVC Mejia TPS',
  'Essar Ports',
  'EVEY BEST',
  'FBTL Interim Collateral Release 6 Mar',
  'FPEL Daylight',
  'FPEL Ujwal',
  'GASML GTSML',
  'Gensol',
  'Gentari Renewables India Castor One',
  'GKSML for Smart Metering',
  'GMR Upper karnali Hydropower',
  'GMTN Update Dec2024 Information Documents required for Due Diligence',
  'Goa Tamnar Transmission Project',
  'Gopalpur',
  'Green Energy',
  'Greenko Sironj',
  'HMESPL Substitution Agreement',
  'HPCL Rajasthan Refinery',
  'HPCL Renewable',
  'HPPL Preliminary Scrutiny Report',
  'HPSEBL RDSS',
  'IGTL for Gas Meter Manufacturing',
  'IIPL Eight Beed',
  'IIPL One Solar',
  'IndianOil NTPC Green Energy',
  'IoCL IFSC refinancing',
  'Jaipur Jindal',
  'Jakson Power',
  'JdVVNL',
  'Jindal Jaipur',
  'Jindal Urban Waste Management',
  'JSREPPL HAM Road Project',
  'JSW Mytrah',
  'JSWREL J',
  'Juniper Beta',
  'Juniper Green Beam',
  'Juniper Green Beta',
  'Juniper Green Stellar',
  'Juniper Green Three',
  'Juniper Group',
  'Juniper Nirjara',
  'Juniper Nirjara Energy',
  'Khorlochhu Hydro Power',
  'Kleio Solar Power',
  'Kosol Energie KE',
  'LGEPL 3 SPVs',
  'Mahan Energen',
  'MB Power',
  'Meja Urja',
  'MIPL Pachwara Coal Mine',
  'MPPaKVVCL',
  'MSPGCL 65 MW Solar Power Project at Lakhmapur under RE Bundling Scheme',
  'MSPGCL Financial Assistance of',
  'MSRDC Sea Link MSL',
  'Mumbai Urja Marg',
  'Mundra Petrochem',
  'Navinal Adani',
  'Navinal Transmission',
  'NLC Talabira TPS',
  'Northern Coalfields',
  'NTPC REL',
  'Opera Narmada',
  'Opera Solar Energy',
  'Opera SPV',
  'Ostro Kannada Power',
  'Pachwara MDO',
  'Patratu Vidyut Utpadan Nigam',
  'Punjab State Transmission Corporation',
  'Raj discoms',
  'Rajasthan Discoms',
  'Rajasthan State Discoms',
  'REL MSKVY 6 SPVs',
  'ReNew Agni',
  'Renew Green',
  'ReNew MHS',
  'ReNew MHS1',
  'ReNew Photovoltaics',
  'ReNew Solar Energy Rajasthan',
  'Rosa Power',
  'RPSCL TRA',
  'Sandhya Hydro',
  'Sasan Power',
  'Saunda Mining',
  'SEL NTPCREL',
  'Serentica Renewables India',
  'Shongtong Karcham HEP of HPPCL',
  'Sikkim Urja',
  'SP Desal SPVs',
  'SP Group',
  'Sravanthi Energy',
  'STPL Buxar',
  'Suzlon Energy PSF',
  'Talwandi Sabo Power',
  'Tecso Charge Zone One',
  'Tehkhand',
  'TGDISCOMs',
  'TGSPDCL TGNPDCL',
  'Transmission Corporation of Andhra Pradesh',
  'Transvolt BEST NMC',
  'TSGenco Yadadri TPS',
  'UP RVUNL',
  'Vadhvan Port Project',
  'Vedanta',
  'Vedanta Athena',
  'Veh Jayin',
  'Veh Jayin Kleio',
  'Veh Jayin Renewables',
  'Vijaya WB',
  'Vriddhi Energy India',
  'WRSR CoD'
];

var PFC_BORROWER_CODES_RE = new RegExp('\\b(' + PFC_BORROWER_CODES.map(function (c) {
  return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')\\b');   // NOTE: no /i — deliberate case-sensitive match

var PFC_BORROWER_NAMES_RE = new RegExp('\\b(' + PFC_BORROWER_NAMES.map(function (n) {
  return n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}).join('|') + ')\\b', 'i');

/** Borrower-name search feeds: names chunked 6/query, codes 12/query. */
function borrowerBankFeeds_() {
  var feeds = [];
  var searchNames = PFC_BORROWER_NAMES.filter(function (n) {
    var w = n.split(/\s+/).length;
    return w >= 2 && w <= 5 && n.length <= 40;
  });
  for (var i = 0; i < searchNames.length; i += 6) {
    var q = searchNames.slice(i, i + 6).map(function (n) { return '"' + n + '"'; }).join(' OR ') + ' when:7d';
    feeds.push({ tag: 'BW-' + (Math.floor(i / 6) + 1), url: gnews_(q) });
  }
  for (var j = 0; j < PFC_BORROWER_CODES.length; j += 12) {
    feeds.push({ tag: 'BWC-' + (Math.floor(j / 12) + 1),
                 url: gnews_(PFC_BORROWER_CODES.slice(j, j + 12).join(' OR ') + ' when:7d') });
  }
  return feeds;
}

/* ---------------- v6.3 — FOREIGN-NOISE GATE (Texas fix) ------------------- */
var PFC_FOREIGN_GEO_RE = /\b(texas|kentucky|iowa|ohio|kansas|california|florida|arizona|nevada|oklahoma|georgia usa|virginia|colorado|missouri|alabama|tennessee|indiana county|wisconsin|minnesota|louisiana|oregon usa|utah|nebraska|idaho|wyoming|dakota|vermont|new hampshire|new jersey|new mexico|pennsylvania|massachusetts|connecticut|maryland usa|michigan|illinois|arkansas|mississippi river|united states|u\.s\. (state|city|county|grid|utility|aviation)|american (state|city|midwest)|congress passes|white house|donald trump|biden administration|federal aviation|\w+ county\b|congressman|senator\b|puerto rico|canada|canadian|australia|australian|brazil|indonesia|vietnam|philippines|nigeria|kenya|south africa|egypt|saudi arabia|\buae\b|\begypt\b|egyptian|\begp\b|mexico|argentina|chile|peru|colombia|thailand|malaysia|bangladesh|pakistan|sri lanka|nepal|europe(an union)?|germany|france|spain|italy|poland|netherlands|austria|austrian|switzerland|swiss|sweden|norway|denmark|finland|belgium|portugal|greece|ireland|luxembourg|czech|hungary|romania|turkey|israel|qatar|kuwait|oman|bahrain|jordan|morocco|ghana|tanzania|uganda|zambia|ethiopia|peru|colombia|ecuador|venezuela|panama|taiwan|singapore|hong kong|new zealand|kazakhstan|kazakh republic|uzbekistan|kyrgyzstan|tajikistan|turkmenistan|azerbaijan|mongolia|belarus|ukraine|\buk\b|united kingdom|britain|china|chinese|japan(ese)? (city|prefecture|utility)|korea)\b/i;

/* ==========================================================================
 * v7.1 — CMD-GRADE RELEVANCE GATES (Board-level review fixes)
 * ========================================================================== */

var PFC_RETAIL_RE = /gold (price|rate)s?|silver (price|rate)s?|bullion|petrol (price|rate)|diesel (price|rate)|\blpg\b price|mutual fund|kisan vikas patra|small savings|post office scheme|\bppf\b|dividend yield|how should (you|investors)|should you (buy|invest|switch)|what it means for (you|your)|your (money|savings|emi|loan)|common man|retirement corpus|tax[- ]saving/i;

var PFC_EQUITY_CHATTER_RE = /dalal street|d[- ]street|\bsensex\b|\bnifty\b|stock market (this|next|today|week)|market (wrap|preview|this week)|week ahead|closing bell|opening bell|bulls? and bears?|shares? (end|close|settle) (higher|lower)|stocks? (end|close|settle)/i;

var PFC_SPECULATIVE_RE = /\bmay\b|\bmight\b|\bcould\b|\blikely\b|(expected|likely|set|projected|forecast|poised|seen|slated|due) to\b|expected to|expectations?|\bodds\b|prospects?|\bbets\b|hopes|speculation|scope for|says? (economist|analyst|expert|brokerage|report|bofa|ing|nomura|morgan|goldman|citi|jefferies|hsbc|barclays)|experts? (say|see|expect|believe)|analysts? (say|see|expect)|economists? (say|see|expect)|\bpoll\b|survey (says|shows)|forecasts?|projections?|preview|what to expect|here'?s (how|what|why)|find out|\?\s*$/i;

/** DONE = it actually happened (past/present-tense completion), so speculation
 *  words elsewhere in the headline don't demote a genuine decision. Deliberately
 *  excludes bare infinitives: "expected to hold" is not "holds". */
var PFC_EVENT_RE = /\b(unchanged|held|kept|keeps|holds|maintained|maintains|slashed|slashes|hiked|hikes (repo|rates?) (by|to)|cut by|cuts? (repo|rates?) (by|to)|announced|announces|approved|approves|sanctioned|sanctions|signed|signs|inked|inks|awarded|awards|\bwon\b|wins|commissioned|commissions|raised|raises|priced|prices \$|issued|issues|allotted|allots|filed|files|achieves? financial closure|invites? bids|floats? tender|invests|invested)\b/i;

var PFC_INDIA_SOVEREIGN_RE = /(india|indian|india'?s)[^.]{0,45}(sovereign (rating|credit)|credit rating|\bratings?\b (agency|action|outlook|upgrade|downgrade|affirm)|\bmoody'?s\b|\bfitch\b|\bs&p\b|standard\s*&\s*poor)|(moody'?s|fitch|s&p|standard\s*&\s*poor)[^.]{0,45}(india|india'?s|sovereign)|sovereign (rating|credit)[^.]{0,25}india/i;

var PFC_RATING_ACTION_RE = /(rating|ratings)[^.]{0,45}(upgrade|downgrade|affirm|assign|revis|outlook|watch)|(upgrades?|downgrades?|affirms?|assigns?|revises?)[^.]{0,35}(rating|outlook)|investment[- ]grade (rating|issuer)|(moody'?s|s&p|fitch|crisil|icra|care ratings|india ratings)[^.]{0,40}(rating|upgrade|downgrade|affirm|assign)/i;
function pfcRatingAction_(lower) {
  return PFC_RATING_ACTION_RE.test(lower) && !PFC_INDIA_SOVEREIGN_RE.test(lower);
}

var PFC_SYSTEMIC_RE = /\bfed\b|federal reserve|\becb\b|european central bank|\bboj\b|bank of japan|\bboe\b|bank of england|\bpboc\b|people'?s bank of china|\bfomc\b|\bopec\b|brent|crude oil|\bchina('s)? (economy|gdp|stimulus|rates?)|us (treasury|yields?|cpi|inflation|jobs)|dollar index|\bdxy\b|central banks in (the )?(us|west)|eurozone|euro ?zone/i;

/** v6.9.1 — stock-tip / share-recommendation gate: brokerage calls, target
 *  prices, "stocks to buy" listicles etc. are IGNOREd outright. Corporate
 *  actions (stake buys, buybacks by issuers) are NOT caught by this. */
var PFC_STOCKTIP_RE_EXTRA = /loading up on|\bthis 1 etf\b|best etfs?|top etfs?|i'?m buying|my top pick/i;
/** v9.8 - NON-LENDING PROCUREMENT.
 *  A tender is only a lead if the thing being bought is financeable by PFC.
 *  Currency/banknote printing, security paper, stationery, uniforms, catering
 *  and the like are ordinary departmental procurement, whoever floats them -
 *  including the RBI's own printing arm. */
/** v10.7 - RETAIL DEPOSIT & SMALL-SAVINGS PRODUCTS.
 *  FD/RD rate tables, senior-citizen rates, savings-account interest, PPF/NSC
 *  and the like are household personal finance - not PFC's cost of funds,
 *  however often they say "rates". */
/** v10.8 - Sovereign Gold Bonds and other retail investment instruments.
 *  SGB issue/redemption prices, gold/silver ETFs and RBI retail direct are
 *  household investment products, not PFC's borrowing programme. */
/** v10.9 - Ordinary crime and law-and-order reporting. Cyber-fraud explainers,
 *  local police files, murder/assault/kidnapping and traffic cases are not
 *  credit events. Corporate financial crime against a borrower still comes
 *  through, because those headlines carry the borrower's name and the
 *  fraud/NCLT/ED vocabulary the Watch radar tests for separately. */
var PFC_CRIME_NOISE_RE = /crime file|police (file|complaint|station|arrest)|\bfir\b (lodged|filed|registered)|murder|rape\b|assault|kidnap|abduct|molest|theft|burglar|robbery|chain snatch|drug (haul|bust|seiz)|narcotic|liquor (haul|seiz)|road accident|hit[- ]and[- ]run|traffic (police|challan)|cyber (fraud|crime) (network|racket|gang)|mule account|sextortion|honeytrap|matrimonial fraud|dowry|missing person/i;

/** v10.9 - Crime blotter and local police news. Murder, assault, theft, traffic
 *  accidents and court reporting of ordinary crime carry no lending signal.
 *  Economic offences against a borrower stay in Borrower Watch via the fraud
 *  and NCLT rules, which run before this gate. */
/** v11.1 - Ceremonial coverage. Inaugurations, foundation stones and flag-offs
 *  are event reporting; they matter only when something material rides along -
 *  a real amount, real capacity, or PFC/REC itself. */
var PFC_CEREMONY_RE = /\binaugurat|foundation stone|bhoomi ?pujan|flags? off|flagged off|dedicat(e[sd]?|ion)s?\b[^.]{0,60}to the nation|lays? (the )?foundation/i;

/** v11.2 - what makes a ceremony ignorable: the OBJECT being inaugurated, not
 *  the ceremony itself. Exhibitions, portals, offices and scheme launches are
 *  events; plants, units and lines are projects and must flow to the desks. */
var PFC_CEREMONY_FLUFF_RE = /exhibition|\bexpo\b|\bmela\b|awareness|campaign|portal|website|\bapp\b|mobile application|logo|\bbook\b|magazine|conclave|summit|workshop|seminar|celebration|samaroh|mahotsav|\bweek\b|\bdivas\b|\bday\b celebrat|office|bhavan|\bbuilding\b|centre of excellence|center of excellence|training (centre|center|programme|program)|statue|museum|\bpark\b(?! project)|gallery|\bbus(es)? fleet\b|\bbus service\b|train service|\bcoach\b|\brally\b|\byatra\b|marathon|\brun\b for|(scheme|yojana|policy|programme|program) (launch|inaugurat)/i;

var PFC_CRIME_BLOTTER_RE = /\bcrime (file|files|branch|news|report|diary)\b|\bmurder(ed|s)?\b|\bmurder case\b|\brape[sd]?\b|\bmolest|\bkidnap|\babduct|\bassault(ed)?\b|\bstabb(ed|ing)|\bshot dead\b|\bloot(ed)?\b|\bchain snatch|\bburglar|\bpickpocket|\bhit[- ]and[- ]run\b|road accident|\bmishap\b|\bdrowned?\b|\bsuicide\b|\bmissing (girl|boy|woman|man|child)\b|\bmob\b|\briot|\bdacoity\b|\beve[- ]teas/i;

/** v11.3 - RESIDENTIAL REAL ESTATE. Developers' pre-sales, booking values,
 *  launch pipelines, housing and apartment projects are outside PFC's lending
 *  universe. Kept only when genuine power/energy context rides along - a
 *  developer's captive solar plant or a data-centre power tie-up still matters. */
var PFC_RESI_REALTY_RE = /\brealty\b|real[- ]estate|\bhousing (project|society|sales|finance|demand|market|segment|launch)|residential (project|propert|sales|segment|launch|market|demand|realty|space)|\bapartments?\b|\bflats?\b|\bvillas?\b|plotted development|home ?buyers?\b|\bpre[- ]?sales\b|booking (value|volume)s?\b|\brera\b|luxury hom|\bsq[ .]?ft\b|per square (foot|feet)|property (price|market|sales|registrat)/i;

var PFC_RETAIL_INVEST_RE = /sovereign gold bond|\bsgbs?\b|gold bonds?\b|gold (etf|scheme|price|rate)|silver (etf|price)|\brbi retail direct\b|retail direct (scheme|platform)|premature redemption|redemption price[^.]{0,20}(sgb|gold)|\bnps\b (scheme|return)|mutual fund|index fund|\b(regular|direct)[- ](growth|plan)\b|\bnfo\b|new fund offer|\bidcw\b|nifty ?\d+|\bsensex\b|momentum \d+|gilt fund|debt fund|liquid fund|hybrid fund|arbitrage fund|\belss\b|(flexi|multi|small|mid|large)[- ]?cap fund/i;

var PFC_RETAIL_DEPOSIT_RE = /\b(fixed|term|recurring) deposits?\b|\bfds?\b[^.]{0,20}(rate|interest|return)|\b(fd|rd) (rates?|interest)|senior citizens?[^.]{0,30}(fd|deposit|rate|scheme|saving)|savings? (account|bank) (interest|rate)|\bppf\b|\bnsc\b|\bkvp\b|sukanya|post office (scheme|deposit|saving)|small savings? (scheme|rate)|highest (interest|fd) rate|best (fd|deposit) rate|which bank (offers|gives)/i;

/** v10.7 - Regional-language reposts. If most of the headline is not Latin
 *  script the desk cannot read it, and the English version of the same story is
 *  normally already in the book. */
function pfcNonLatinHeadline_(title) {
  var t = String(title || '');
  // Devanagari, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Odia,
  // Gurmukhi, Cyrillic, Arabic, CJK, Kana.
  var other = (t.match(/[\u0900-\u0DFF\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF]/g) || []).length;
  if (other >= 10) return true;                 // a real block of regional script
  var latin = (t.match(/[A-Za-z]/g) || []).length;
  return other > 0 && latin < 12;               // mostly script, little English
}

var PFC_NON_LENDING_PROC_RE = /currency (printing|note|paper|chest)|bank ?note|polymer note|security (printing|paper|ink)|\bmints?\b[^.]{0,25}(coin|currency|note)|coinage|stationery|uniforms?|liver(y|ies)|furniture|catering|housekeeping|manpower supply|security guard|\bhousekeeping\b|office (supplies|equipment)|printer cartridge|air ?conditioner|\bfurnishing/i;

/** v9.8 - AIRLINE / ROUTE OPERATIONS.
 *  'Airport' is in the infrastructure list because airport PROJECTS are
 *  financeable. Flight routes, new services and passenger-facing announcements
 *  are airline operations and are not. The gate stands down for an actual
 *  airport construction or financing story. */
var PFC_AIRLINE_OPS_RE = /\bflights?\b|\bair route|flight route|route (expansion|network)|new (routes?|destinations?)|air service|airlines?\b|air ?fare|travell?ers?|passenger (options|convenience|traffic growth)|non[- ]?stop (flight|service)|travel alert|boarding|check[- ]in|air connectivity|\bcodeshare\b|frequent flyer/i;
var PFC_AIRPORT_PROJECT_RE = /airport (project|construction|terminal (building|project)|expansion project|development|upgradation|modernisation|modernization)|greenfield airport|new airport at|building (a |the )?airport|airport[^.]{0,40}(crore|\bepc\b|contract award|financial closure|concession|\bppp\b|bid document)/i;

/** v9.7 - EQUITY-MARKET NOISE, decided structurally rather than by verb list.
 *  Chasing verbs ('surge', 'extend', 'zoom', 'down 3%') never converges. The
 *  reliable test is: does the headline TREAT THE SHARE as its subject? If an
 *  equity word appears together with a price move, a percentage, a price
 *  explainer, or a results-driven move, it is market chatter - whoever the
 *  company is. A concrete lending/credit event overrides, so a genuine
 *  development wrapped in equity framing still comes through. */
var PFC_EQ_WORD_RE  = /\b(shares?|stocks?|scrips?|equit(y|ies)|share price|stock price|\bmcap\b|market cap)\b/i;
var PFC_EQ_MOVE_RE  = /\b(up|down|zoom\w*|gain\w*|los[et]\w*|surge\w*|jump\w*|ris\w+|rose|fall\w*|fell|slip\w*|drop\w*|plunge\w*|rall\w+|soar\w*|tank\w*|slid\w*|climb\w*|advanc\w*|declin\w*|tumbl\w*|crash\w*|spike\w*|extend\w*|rebound\w*|recover\w*|outperform\w*|underperform\w*|in focus|in the (red|green)|52[- ]week|target price|price target|re-?rating|rerating|multibagger|buy ?back|stock split|bonus issue|valuation|upside|downside|all[- ]time high|record high|hit[s]? \w+ (high|low))\b/i;
var PFC_EQ_PCT_RE   = /\d+(\.\d+)?\s*(%|per ?cent)/i;
var PFC_EQ_WHY_RE   = /^(why|what|how|should|is|are|will|can)\b|\bexplained\b|here'?s (why|what|how)|\?/i;
var PFC_EQ_RESULT_RE= /\b(q[1-4]|quarterly|qoq|yoy|profit|revenue|earnings|net income|topline|bottomline|margin)\b/i;
var PFC_EQ_PICK_RE  = /\b(growth|value|penny|small[- ]?cap|mid[- ]?cap|large[- ]?cap|multibagger|dividend)\s+(shares?|stocks?)\b|\bstocks? to (buy|watch|pick|avoid)\b|\b\d+\s+(indian\s+)?(growth\s+|top\s+|best\s+)?(shares?|stocks?)\b|\b(every|any)?\s*investors?\s+(should|must|need to|ought to)\b|\bshould (you|investors?)\b|\bkey rule\b|\bbrokerage[s]? (say|see|raise|cut)|\banalysts? (say|see|expect)/i;
var PFC_EQ_LIST_RE  = /\bipo\b[^.]{0,30}(filing|listing|launch|opens?|subscri|price band|grey market|allot)|\b(listing|list) on (the )?(nse|bse|exchange|bourses?)\b|\bwon'?t list\b|\bde[- ]?list/i;

/** A concrete lending / credit / funding event. When one is present the equity
 *  gate stands down, so "Adani Power shares in focus: signs PSA for 1,600 MW"
 *  and "Board approves Rs 20,000 cr capex; shares rise" still come through. */
var PFC_HARD_EVENT_RE = /financial closure|invites? bids?|\btender\b|\bppa\b|\bpsa\b|power (purchase|supply) agreement|sign(s|ed|ing)?\b[^.]{0,30}(agreement|pact|\bmou\b|\bmoa\b|contract|deal|\bppa\b|\bpsa\b)|awards? (a )?contract|wins? (the )?(bid|order|project|contract|tender)|\bbags\b|sanction(s|ed|ing)?|disburs|raises? (rs|inr|\u20B9|\$|usd)|bond (issue|issuance|sale)|\bncds?\b|commission(s|ed|ing)?|\bcod\b|\bnclt\b|insolven|wil+ful default|sarfaesi|downgrade|rating (affirm|revis|cut|lowered)|outlook revised|capex|board (approves?|clears?)|cabinet approv|loan (agreement|sanction)|line of credit|acquir(es?|ed|ing)|stake (sale|buy)/i;

function pfcEquityNoise_(lower) {
  if (!PFC_EQ_WORD_RE.test(lower)) return PFC_EQ_PICK_RE.test(lower) || PFC_EQ_LIST_RE.test(lower);
  if (PFC_EQ_MOVE_RE.test(lower))   return true;   // share + any direction/valuation word
  if (PFC_EQ_PCT_RE.test(lower))    return true;   // share + a percentage figure
  if (PFC_EQ_WHY_RE.test(lower))    return true;   // share + explainer framing
  if (PFC_EQ_RESULT_RE.test(lower)) return true;   // share + results-driven move
  if (PFC_EQ_PICK_RE.test(lower))   return true;   // recommendation / stock list
  if (PFC_EQ_LIST_RE.test(lower))   return true;   // IPO / listing plumbing
  return false;
}

var PFC_SHARE_PRICE_RE = /52[- ]week (high|low)|shares? (hit|surge|jump|rall(y|ie[sd])|plunge|tank|soar|gain|fall|slip|climb|crash)|stock (hits?|surges?|jumps?|rallies|plunges?|soars?|gains?|falls?|crashes)|share price|stock price|target price|price target|market cap|m-?cap\b|multibagger|intraday (high|low|gain)|(what|why) should investors|should you (buy|sell|invest)|buy,? sell or hold|\bbuy or sell\b|investors? (do|watch out|take note)\?/i;

var PFC_MF_RE = /mutual fund|\bnav\b|\bamc\b(?! infra)|\bsip\b (inflow|book|contribution)|\belss\b|debt schemes?|equity schemes?|\bfolio\b|new fund offer|\bnfo\b/i;

var PFC_NON_INFRA_RE = /\bpaper[s]?\b|textile|apparel|garment|\bfmcg\b|dairy|\bsugar\b|distiller|brewer|hotel|hospitality|jewell?er|\bretail\b|e[- ]?commerce|fashion|footwear|\btyre\b|pharma|biotech|hospital\b|diagnostic|\bit services\b|software|\bbpo\b|media|entertainment|gaming|real estate developer|\bmall\b/i;

var PFC_INVEST_ADVICE_RE = /\b\d+ best\b|best .{0,30}invest|inflation[- ]proof|recession[- ]proof|investment (ideas|options|plans|strategies)|where to (invest|park)|safe havens?|how to (invest|grow|build wealth)|wealth creation|portfolio (tips|ideas)|retirement (planning|corpus)|\bsip\b (calculator|returns)|fixed deposits? vs|gold vs/i;

var PFC_EQUITY_RESEARCH_RE = /\(rating (downgrade|upgrade)\)|downgraded from (buy|hold|sell|overweight|neutral)|upgraded from (buy|hold|sell|underweight|neutral)|\b(buy|hold|sell|overweight|underweight|neutral) rating\b|price target|target price|valuation concerns?|rally is overextended|seeking alpha|analyst (downgrade|upgrade)|fair value estimate/i;

var PFC_STOCKTIP_SOFT_RE = /stocks? in focus|shares? in focus|stocks? in news|stock to watch|stocks? to track/i;
var PFC_SUBSTANCE_RE = /\b\d[\d,.]*\s*(mw|gw)\b|crore|\bppa\b|\bmoa\b|\bmou\b|tender|financial closure|\bbonds?\b|\bloan\b|order (win|book)|contract worth/i;
var PFC_STOCKTIP_RE = /(stocks?|shares?) to (buy|watch|sell|pick|track)|top \d+(\s+\w+){0,3}\s+(stocks?|shares?|picks?)|these \d+(\s+\w+){0,3}\s+stocks?|\d+ stocks? (to|that|for|are)|multibagger|target price|price target|buy or sell|intraday (picks?|calls?|trading)|brokerage (calls?|picks?|radar|view)|(buy|sell|hold|accumulate|reduce) (rating|call|recommendation)|(initiates?|maintains?|upgrades? to|downgrades? to) (buy|sell|hold|overweight|underweight)|stock (recommendation|pick|idea|tip)s?|technical picks?|hot stocks|penny stocks?|momentum picks?|stocks? (that|to) (gained|rallied|surged) |52[- ]week (high|low) stocks|shares? (of .{3,40})? (jump|surge|rall(y|ied)|gain|slip|fall|crash)(s|ed)? \d+(\.\d+)?%/i;

/** True = clearly foreign story with no India nexus and no market relevance. */
function pfcForeignNoise_(lower) {
  // v8.5 — a bond / loan / fundraise with no India anchor is foreign noise,
  // even if the specific country is not in the geography list.
  if (/\bbond\b|\bloan\b|\bncd\b|notes?\b|fundrais|raises? \$|\becb\b|debt issue|sovereign|diaspora/i.test(lower) &&
      !pfcHasIndiaAnchor_(lower, lower) && !PFC_AAA_BOND_RE.test(lower)) return true;
  if (!PFC_FOREIGN_GEO_RE.test(lower)) return false;
  if (pfcIndiaNexus_(lower)) return false;
  if (PFC_SYSTEMIC_RE.test(lower)) return false;   // Fed/ECB/BoJ/BoE/China/oil move PFC's cost of funds
  if (pfcLiquiditySignal_(lower)) return false;
  if (PFC_MDB_RE.test(lower) && !PFC_FOREIGN_GEO_RE.test(lower)) return false;   // v8.4: global MDB window, no foreign borrower
  return true;
}

/* ====================== MY KEYWORDS (user searches) ======================= */

function pfcSplitKeywordCell_(cell) {
  return String(cell || '').split(/[,;\n]+/)
    .map(function (k) { return k.trim(); })
    .filter(function (k) {
      if (k.length < 3 || k.length > 120) return false;
      if (k.split(/\s+/).length > 8) return false;
      return true;
    });
}

var pfcUserKwCache_ = null;
function pfcUserKeywords_() {
  if (pfcUserKwCache_) return pfcUserKwCache_;
  var out = { queries: [], borrowers: [] };
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.KWU);
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (r) {
      var type = String(r[1] || '').trim().toLowerCase();
      var raw = String(r[2] || '').trim();
      if (!raw) return;
      var parts = pfcSplitKeywordCell_(raw);
      if (/borrower/.test(type)) {
        parts.forEach(function (p) { if (p.split(/\s+/).length <= 5) out.borrowers.push(p); });
      } else {
        parts.forEach(function (p) {
          if (out.queries.length < 40) out.queries.push({ tag: 'U-KW', url: gnews_(p + ' when:7d') });
        });
      }
    });
  }
  pfcUserKwCache_ = out;
  return out;
}

var pfcUserWatchReCache_ = null;
function pfcUserWatchRe_() {
  if (pfcUserWatchReCache_ !== null) return pfcUserWatchReCache_ || null;
  var names = pfcUserKeywords_().borrowers;
  if (!names.length) { pfcUserWatchReCache_ = ''; return null; }
  pfcUserWatchReCache_ = new RegExp('\\b(' + names.map(function (n) {
    return n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('|') + ')\\b', 'i');
  return pfcUserWatchReCache_;
}

function seedMyKeywords_(sh) {
  sh.getRange(2, 1, 2, 3).setValues([
    [new Date(), 'Search',   ''],
    [new Date(), 'Borrower', '']
  ]);
}

var PFC_INDIA_LEGAL_RE = /\bnclt\b|\bnclat\b|\bibbi\b|\bcirp\b|sarfaesi|debt recovery tribunal|\bsfio\b|\bpmla\b|enforcement directorate|reserve bank of india|\brbi\b|\bsebi\b|\bcerc\b|\bcea\b|\bmnre\b|ministry of power|niti aayog|insolvency and bankruptcy|wil+ful defaulter|\bcrisil\b|\bicra\b|india ratings|care ratings/i;

/* v8.5 — POSITIVE gate. Borrowing / Business items must carry an India anchor,
 * a PFC-universe entity, or an Indian regulator/agency. If none is present the
 * item is foreign or irrelevant, regardless of which country it names. This is
 * the reliable inverse of the endless foreign-country blocklist. */
function pfcHasIndiaAnchor_(lower, text) {
  if (PFC_INDIA_NEXUS_RE.test(lower)) return true;      // india, rupee, ₹, indian states/cities
  if (PFC_INDIA_LEGAL_RE.test(lower)) return true;      // NCLT, SARFAESI, RBI, SEBI, CERC, CRISIL...
  if (PFC_PROMOTER_RE.test(lower)) return true;         // Adani, Tata, JSW, Vedanta...
  if (PFC_WATCHLIST_RE.test(lower)) return true;
  if (PFC_BORROWER_NAMES_RE.test(lower)) return true;
  if (PFC_COMPETITOR_RE.test(lower)) return true;       // REC, IREDA, HUDCO, IRFC, NaBFID, IIFCL
  if (PFC_BORROWER_CODES_RE.test(text || lower)) return true;
  if (PFC_TOP_BANKS_RE.test(lower) || PFC_TOP_NBFC_RE.test(lower)) return true;
  return false;
}

function pfcIndiaNexus_(lower) {
  if (PFC_INDIA_LEGAL_RE.test(lower)) return true;   // v8.2: Indian statute/regulator = India nexus
  var userRe = pfcUserWatchRe_();
  return PFC_INDIA_NEXUS_RE.test(lower) || PFC_WATCHLIST_RE.test(lower) ||
         PFC_BORROWER_NAMES_RE.test(lower) || (userRe ? userRe.test(lower) : false);
}

/* ==========================================================================
 * v6.5 — KEYWORD MASTER TAB (mirrors the Codex sheet architecture)
 * --------------------------------------------------------------------------
 * Columns: Enabled | Domain | Sub-part | Radar Hint | Keywords | Event Triggers
 * Seeded from the PFC News Keyword Master (AR 2024-25 taxonomy), 31 sub-parts,
 * ~900 keywords. Fully user-editable; edits apply on next classify/fetch.
 * Runtime uses:
 *   1. FEEDS  — one Google News scan per enabled row:
 *               (top keywords OR'd) (top triggers OR'd), per the master's
 *               recommended boolean pattern.
 *   2. ROUTING — keyword + trigger co-occurrence routes the item to the
 *               row's Radar Hint (after Radar Rules, funding print, liquidity
 *               and borrower watch; before generic detectors).
 *   3. IMPORTANCE — trigger evidence floors the grade at Medium unless the
 *               headline carries noise patterns (opinion/listicle/price talk).
 * ========================================================================== */

var PFC_KM_SEED = [
  ['Business', 'A. Power & Energy - Core Sector', 'BUSINESS', 'Power sector; Electricity sector; Energy sector; Power infrastructure; Energy infrastructure; Power financing; Electricity financing; Energy financing; Power project; Energy project; Power investment; Energy investment; Power capacity; Generation capacity; Installed capacity; Capacity addition; Power supply; Electricity supply; Energy security; 24x7 power; Reliable power; Affordable power; Clean power; Power value chain; Energy value chain', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'B. Conventional Generation', 'BUSINESS', 'Thermal power; Thermal power plant; Coal power; Coal-fired power; Lignite power; Gas-based power; Gas power plant; Combined cycle power plant; CCGT; Open cycle gas turbine; OCGT; Supercritical power; Ultra-supercritical power; Baseload power; Dispatchable power; Merchant power plant; Captive power plant; Independent power producer; IPP; Ultra Mega Power Project; UMPP; Nuclear power; Nuclear energy; Atomic power; Ammonia co-firing; Biomass co-firing; Flue gas desulphurisation; FGD; Emission control system; Pollution-control equipment', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'C. Renewable Energy', 'BUSINESS', 'Renewable energy; Renewable power; Clean energy; Green energy; Non-fossil fuel; Solar power; Solar PV; Utility-scale solar; Solar park; Floating solar; Rooftop solar; Distributed solar; Captive solar; Open-access solar; Group captive solar; Wind power; Wind energy; Onshore wind; Offshore wind; Wind farm; Wind turbine generator; WTG; Solar-wind hybrid; Hybrid renewable; Round-the-clock renewable; RTC power; Firm renewable energy; Renewable portfolio; Renewable capacity; Renewable energy financing; RE financing; Energy transition; Low-carbon transition; Decarbonisation', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'D. Hydro & Storage', 'BUSINESS', 'Hydropower; Hydroelectric project; Large hydro; Small hydro; Run-of-river hydro; Reservoir hydro; Pumped hydro; Pumped storage project; Pumped storage plant; PSP; Battery Energy Storage System; BESS; Battery storage; Energy storage system; Grid-scale storage; Standalone storage; Co-located storage; Long-duration energy storage; LDES; Lithium-ion battery; Sodium-ion battery; Flow battery; Storage tender; Storage capacity; Peak power storage', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'E. Green Molecules & Emerging Clean Technologies', 'BUSINESS', 'Green hydrogen; Renewable hydrogen; Green ammonia; Renewable ammonia; Green methanol; Electrolyser; Electrolyzer; Electrolyser manufacturing; Fuel cell; Hydrogen hub; Hydrogen project; Ammonia project; Biomass power; Bioenergy; Biofuel; Ethanol; Compressed biogas; CBG; Biogas; Waste-to-energy; Municipal solid waste power; RDF plant; Carbon capture; Carbon capture utilisation and storage; CCUS; Carbon capture and storage; CCS', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'F. Transmission & Grid', 'BUSINESS', 'Power transmission; Transmission line; Transmission project; Transmission system; Transmission network; Inter-State Transmission System; ISTS; Intra-State transmission; CTU; Central Transmission Utility; STU; State Transmission Utility; Independent Transmission Project; ITP; Tariff-based competitive bidding; TBCB; HVDC; High-voltage direct current; EHV transmission; UHV transmission; Substation; GIS substation; AIS substation; Switchyard; Power evacuation; Grid connectivity; Grid expansion; Grid strengthening; Grid modernisation; Renewable evacuation; Green Energy Corridor; National grid; Grid stability; Reactive power compensation; STATCOM; FACTS', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'G. Distribution & Government Reform Schemes', 'BUSINESS', 'Power distribution; Electricity distribution; Distribution company; DISCOM; State DISCOM; Private DISCOM; Distribution reform; Distribution modernisation; Distribution infrastructure; Distribution network; Smart grid; Smart meter; Smart metering; Advanced Metering Infrastructure; AMI; Prepaid smart meter; Feeder metering; Feeder separation; Distribution transformer; AT&C loss; Aggregate Technical and Commercial loss; Loss reduction; Revamped Distribution Sector Scheme; RDSS; Integrated Power Development Scheme; IPDS; R-APDRP; Late Payment Surcharge; LPS mechanism; Revolving Bill Payment Facility; RBPF; Liquidity support to DISCOMs; Rural electrification; Household electrification; Last-mile connectivity; Universal electricity access', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'H. Infrastructure & Allied Sectors', 'BUSINESS', 'Infrastructure finance; Infrastructure project; E-mobility; Electric mobility; EV charging; Charging infrastructure; Fast charging; Battery swapping; Electric bus; E-bus; Metro rail; Rail infrastructure; Rail electrification; Road project; Highway project; Expressway; Bridge project; Tunnel project; Port infrastructure; Port project; Airport infrastructure; Logistics infrastructure; Logistics park; Multimodal logistics park; Smart city; Urban infrastructure; Industrial corridor; Data centre; Digital infrastructure; Telecom infrastructure; Water infrastructure; Wastewater infrastructure', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'I. Financing Products & Customer Solutions', 'BUSINESS', 'Project term loan; Rupee term loan; Foreign currency loan; Short-term loan; Short-term funding; Bridge finance; Lease financing; Debt refinancing; Project refinancing; Corporate refinancing; Buyer\'s line of credit; Line of credit; Working capital finance; Construction finance; Takeout finance; Transitional support; Customized financing; Structured finance; Sustainable finance; Green finance; Climate finance; Project finance; Long-term finance; Infrastructure lending; Energy lending', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Business', 'J. Project Development & Transaction Lifecycle', 'BUSINESS', 'Project announcement; Project development; Project approval; Investment approval; Cabinet approval; Board approval; Detailed Project Report; DPR; Feasibility study; Pre-feasibility study; Land acquisition; Environmental clearance; Forest clearance; Wildlife clearance; Statutory clearance; Grid approval; Connectivity approval; PPA; Power Purchase Agreement; FSA; Fuel Supply Agreement; TSA; Transmission Service Agreement; EPC contract; EPC award; Engineering Procurement and Construction; Turnkey contract; Tender; Bid; RFP; RFQ; EOI; Letter of Award; LOA; Letter of Intent; LOI; Reverse auction; Financial closure; Debt tie-up; Equity tie-up; Groundbreaking; Construction start; Project commissioning; Commercial Operation Date; COD; Scheduled COD; SCOD; Capacity expansion; Greenfield project; Brownfield expansion', 'announces project; approves project; sanctions project; clears project; launches project; plans investment; proposes investment; commits investment; seeks funding; seeks debt; seeks lender; invites financing; raises project debt; achieves financial closure; signs financing agreement; awards contract; floats tender; invites bids; wins bid; emerges lowest bidder; signs PPA; signs MoU; forms joint venture; incorporates SPV; acquires stake; expands capacity; develops project; commences construction; orders equipment; achieves COD; commissions capacity; revives project; restructures project; privatises utility; monetises asset; asset recycling'],
  ['Borrowing', 'A. Borrowing Strategy & Resource Mobilisation', 'BORROWING', 'Borrowing; Fund raising; Fundraising; Resource mobilisation; Debt mobilisation; Capital raising; Funding strategy; Borrowing programme; Annual borrowing plan; Funding plan; Liability strategy; Liability management; Funding mix; Liability mix; Domestic funding; International funding; Long-term funding; Medium-term funding; Short-term funding; Wholesale funding; Institutional funding; Low-cost funding; Diversified funding; Funding diversification', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'B. Domestic Bonds & Debt Securities', 'BORROWING', 'Domestic bond; Bond issue; Bond issuance; NCD; Non-convertible debenture; Secured NCD; Unsecured NCD; Taxable bond; Infrastructure bond; PSU bond; 54EC bond; Capital gains bond; Private placement; Public issue; Shelf issue; Tranche issue; Bond tap; Bond reopening; Listed debt; Debt securities; Perpetual bond; Perpetual debt; Subordinated debt; Tier II bond; Hybrid security; Commercial paper; CP issuance; Short-term debt instrument; Certificate of deposit', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'C. International & Foreign Currency Borrowings', 'BORROWING', 'Foreign currency borrowing; Foreign currency loan; FCY borrowing; External Commercial Borrowing; ECB; Offshore borrowing; International borrowing; Cross-border borrowing; Syndicated loan; Club loan; Bilateral loan; Multilateral loan; USD loan; Dollar loan; JPY loan; Yen loan; Euro loan; Multicurrency loan; Samurai loan; Global bond; Offshore bond; Eurobond; Masala bond; Medium Term Note; MTN; Euro Medium Term Note; EMTN; Foreign currency facility; Overseas loan facility', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'D. Green, ESG & Thematic Funding', 'BORROWING', 'Green bond; Climate bond; Sustainability bond; Sustainability-linked bond; ESG bond; Social bond; Transition bond; Green loan; Sustainability-linked loan; Climate finance facility; Renewable financing facility; Green financing agreement; Use-of-proceeds bond; Green framework; Sustainable finance framework; ESG-linked borrowing; Climate-linked borrowing', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'E. Banks, DFIs & Multilateral Sources', 'BORROWING', 'Bank term loan; Term loan from banks; Loan from financial institutions; Bank consortium; Consortium loan; Development finance institution; DFI; Multilateral Development Bank; MDB; World Bank; International Finance Corporation; IFC; Asian Development Bank; ADB; Asian Infrastructure Investment Bank; AIIB; New Development Bank; NDB; Japan Bank for International Cooperation; JBIC; Japan International Cooperation Agency; JICA; KfW; AFD; Export-Import Bank; EXIM Bank; Export credit agency; ECA financing; NaBFID; IIFCL', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'F. GIFT City & IFSC Funding Platform', 'BORROWING', 'GIFT City; IFSC; International Financial Services Centre; IFSC subsidiary; Foreign subsidiary; Offshore finance subsidiary; Global treasury centre; International finance platform; IFSC borrowing; GIFT City borrowing; IFSC bond; IFSC loan; Tax-efficient funding; International financial market access', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'G. Pricing, Benchmark & Issue Terms', 'BORROWING', 'Coupon; Coupon rate; Fixed coupon; Floating coupon; Coupon reset; Issue yield; Bond yield; Yield to maturity; YTM; Credit spread; Benchmark spread; Pricing guidance; Final pricing; Issue price; Par issue; Premium issue; Discount issue; SOFR; Term SOFR; SONIA; EURIBOR; TONA; MIBOR; Treasury benchmark; G-Sec benchmark; All-in cost; Cost of borrowing; Cost of debt; Weighted average cost of borrowing; Funding cost', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'H. Credit Rating, Guarantee & Credit Enhancement', 'BORROWING', 'Credit rating; AAA rating; Rating affirmation; Rating upgrade; Rating downgrade; Rating outlook; Rating watch; Sovereign rating; Government support; Sovereign guarantee; Government guarantee; State government guarantee; Credit guarantee; Partial credit guarantee; Credit enhancement; First-loss guarantee; Letter of comfort; Debt service undertaking; DSU; Security cover; Credit support', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'I. Documentation, Security & Covenants', 'BORROWING', 'Loan agreement; Facility agreement; Financing agreement; Common loan agreement; Common terms agreement; Inter-creditor agreement; ICA; Debenture trust deed; Security trustee; Debenture trustee; Charge creation; Pari passu charge; Exclusive charge; First charge; Second charge; Mortgage; Hypothecation; Pledge; Assignment of receivables; Escrow account; Trust and Retention Account; TRA; Debt Service Reserve Account; DSRA; Financial covenant; Debt covenant; Information covenant; Event of default; Cross default; Waiver; Covenant relaxation', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Borrowing', 'J. Refinancing, Repayment & Liability Optimisation', 'BORROWING', 'Debt refinancing; Liability refinancing; Loan refinancing; Bond refinancing; High-cost debt replacement; Low-cost debt replacement; Prepayment; Early repayment; Debt buyback; Bond buyback; Call option; Put option; Early redemption; Make-whole; Debt maturity; Maturity profile; Average maturity; Weighted average maturity; Amortisation schedule; Bullet repayment; Balloon repayment; Principal repayment; Interest servicing; Debt service; Debt restructuring; Liability optimisation', 'raises funds; raises debt; plans bond issue; launches bond issue; prices bond; allots bonds; issues NCDs; files shelf prospectus; opens public issue; closes bond issue; receives bids; oversubscribed; appoints arrangers; mandates banks; signs loan agreement; secures loan; obtains credit line; refinances debt; prepays loan; redeems bonds; extends maturity; rolls over debt; receives rating; rating upgraded; rating affirmed; obtains guarantee; hedges borrowing; mobilises funds; draws down facility; closes financing'],
  ['Treasury', 'A. Asset-Liability Management', 'TREASURY', 'Asset Liability Management; ALM; ALCO; Asset Liability Committee; ALM framework; ALM policy; ALM statement; Maturity profile; Maturity ladder; Maturity mismatch; Cumulative mismatch; Structural liquidity; Repricing gap; Interest-rate gap; Duration gap; Gap analysis; Asset duration; Liability duration; Weighted average maturity; Behavioural maturity; Liquidity bucket; Time bucket; Negative gap; Positive gap', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'B. Liquidity & Cash Management', 'TREASURY', 'Liquidity management; Liquidity planning; Liquidity position; Liquidity buffer; Liquidity reserve; Cash management; Cash flow forecasting; Cash forecasting; Daily liquidity; Short-term liquidity; Contingency funding plan; Liquidity stress test; High-quality liquid assets; HQLA; Liquidity Coverage Ratio; LCR; Net Stable Funding Ratio; NSFR; Working capital management; Surplus cash; Cash deployment; Cash pooling; Treasury cash balance; Funding gap', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'C. Interest Rates & Monetary Policy', 'TREASURY', 'Interest rate; Policy rate; Repo rate; Reverse repo rate; Standing Deposit Facility; SDF; Marginal Standing Facility; MSF; Cash Reserve Ratio; CRR; Statutory Liquidity Ratio; SLR; Monetary Policy Committee; MPC; RBI monetary policy; Rate hike; Rate cut; Rate pause; Liquidity injection; Liquidity absorption; Open Market Operations; OMO; Variable Rate Repo; VRR; Variable Rate Reverse Repo; VRRR; Government bond yield; G-Sec yield; Yield curve; Yield inversion; Yield steepening; Yield flattening', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'D. Foreign Exchange & Currency Risk', 'TREASURY', 'Foreign exchange; Forex; FX; Currency risk; Exchange-rate risk; Foreign currency exposure; Unhedged exposure; Hedged exposure; USD INR; JPY INR; EUR INR; GBP INR; Dollar index; DXY; Currency depreciation; Currency appreciation; Spot rate; Forward rate; Forward premium; Forward discount; FX forward; Currency forward; FX swap; Currency swap; Cross-currency swap; CCS; Natural hedge; Hedge ratio; Foreign currency translation; Exchange fluctuation', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'E. Derivatives & Hedging', 'TREASURY', 'Hedging; Hedge strategy; Interest-rate hedge; Currency hedge; FX hedge; Economic hedge; Cash-flow hedge; Fair-value hedge; Interest-rate swap; IRS; Overnight Index Swap; OIS; Basis swap; Cross-currency interest-rate swap; Forward Rate Agreement; FRA; Futures; Options; Derivative; Treasury derivative; Swap curve; Hedge effectiveness; Hedge accounting; Derivative valuation; Counterparty exposure; Collateral margin', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'F. Investment & Surplus Deployment', 'TREASURY', 'Treasury investment; Investment portfolio; Surplus fund deployment; Short-term investment; Money-market investment; Government securities; G-Sec; Treasury Bills; T-Bills; State Development Loan; SDL; PSU bond; Corporate bond; Certificate of deposit; Commercial paper investment; Triparty repo; TREPS; Repo investment; Fixed-income portfolio; Debt securities portfolio; Held-to-maturity; Available-for-sale; Fair value through profit and loss; FVTPL; Amortised cost; Portfolio duration; Portfolio yield; Yield pickup; Carry trade; Roll-down strategy', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'G. Cost of Funds, Margins & Treasury Performance', 'TREASURY', 'Cost of funds; Weighted average cost of funds; Marginal cost of funds; Funding cost; Interest expense; Interest income; Net interest income; NII; Net interest margin; NIM; Interest spread; Lending spread; Borrowing spread; Treasury income; Investment income; Treasury profit; Treasury gain; Treasury loss; Mark-to-market gain; Mark-to-market loss; MTM; Fair-value gain; Fair-value loss; Carry income; Cost optimisation; Financial efficiency', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'H. Market, Liquidity & Counterparty Risk', 'TREASURY', 'Market risk; Liquidity risk; Interest-rate risk; IRRBB; Foreign-exchange risk; Counterparty risk; Credit risk; Settlement risk; Concentration risk; Basis risk; Reinvestment risk; Refinancing risk; Risk appetite; Exposure limit; Counterparty limit; Dealer limit; Stop-loss limit; Value at Risk; VaR; Stress testing; Scenario analysis; Sensitivity analysis; Back testing; Risk monitoring; Limit breach', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'I. Accounting, Valuation & Reporting', 'TREASURY', 'Ind AS 109; IFRS 9; Expected Credit Loss; ECL; Stage 1 asset; Stage 2 asset; Stage 3 asset; Impairment; Provisioning; Write-off; Write-back; Fair value; Mark to market; MTM valuation; Effective Interest Rate; EIR; Amortised cost; Accrued interest; Accrued income; Derivative accounting; Hedge accounting; Treasury reconciliation; Treasury MIS; Treasury reporting; Valuation adjustment; Other comprehensive income; OCI', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'J. Macro & Market Intelligence', 'TREASURY', 'Inflation; CPI inflation; WPI inflation; Core inflation; GDP growth; Fiscal deficit; Current account deficit; Balance of payments; Foreign exchange reserves; Capital inflows; FPI flows; FII flows; FDI inflows; Banking system liquidity; Call money rate; Overnight rate; Money-market rate; Bond-market volatility; Global interest rates; US Federal Reserve; Federal Reserve; Bank of Japan; European Central Bank; ECB policy; Crude oil price; Commodity price; Geopolitical risk; Sovereign risk; Country risk', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases'],
  ['Treasury', 'K. Treasury Operations, Controls & Systems', 'TREASURY', 'Treasury operations; Treasury desk; Front office; Middle office; Back office; Treasury policy; Investment policy; Funding policy; Dealer operations; Trade confirmation; Settlement; Clearing; Custody; CCIL; SWIFT; RTGS; NEFT; Treasury Management System; TMS; SAP Treasury; Treasury automation; Digital treasury; Treasury dashboard; Treasury analytics; Treasury audit; Treasury compliance; Maker-checker control; Reconciliation; Payment control; Operational risk', 'RBI hikes repo rate; RBI cuts repo rate; RBI keeps rates unchanged; bond yields rise; bond yields fall; rupee depreciates; rupee appreciates; dollar strengthens; yen weakens; liquidity tightens; liquidity improves; banking liquidity deficit; banking liquidity surplus; funding cost rises; funding cost falls; spread widens; spread narrows; hedging cost rises; hedging cost falls; swap rate rises; swap rate falls; rating changes; foreign exchange volatility; market volatility; inflation accelerates; inflation moderates; Fed rate decision; BoJ policy change; ECB rate decision; government borrowing increases; government borrowing decreases']
];

function seedKeywordMaster_(sh) {
  var rows = PFC_KM_SEED.map(function (r) { return ['Y', r[0], r[1], r[2], r[3], r[4]]; });
  sh.getRange(2, 1, rows.length, 6).setValues(rows);
  sh.setColumnWidth(3, 260); sh.setColumnWidth(5, 480); sh.setColumnWidth(6, 380);
  sh.getRange(2, 5, rows.length, 2).setWrap(true);
}

/** Menu action: restore the 31 factory rows on the Keyword Master tab.
 *  WARNING: replaces current tab contents. Export first if you have edits. */
/** Menu action: restore the factory rows on the Radar Rules tab.
 *  WARNING: replaces current tab contents. */
function reseedRadarRules() {
  var sh = sheet_(CFG.SHEETS.RULES);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  seedRadarRules_(sh);
  pfcRulesCache_ = null;
  toast_('Radar Rules reseeded with the v7.3 factory rows.');
}

function reseedKeywordMaster() {
  var sh = sheet_(CFG.SHEETS.KM);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  seedKeywordMaster_(sh);
  pfcKmCache_ = null;
  toast_('Keyword Master reseeded with 31 factory rows (~900 keywords).');
}

var pfcKmCache_ = null;
function loadKmRows_() {
  if (pfcKmCache_) return pfcKmCache_;
  var out = [];
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.KM);
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(function (r) {
      var en = String(r[0] || '').trim().toUpperCase();
      if (en && en !== 'Y' && en !== 'YES' && en !== 'TRUE') return;
      var radar = String(r[3] || '').trim().toUpperCase();
      if (['BUSINESS', 'WATCH', 'BORROWING', 'TREASURY'].indexOf(radar) < 0) return;
      var kws = String(r[4] || '').split(';').map(function (k) { return k.trim().toLowerCase(); })
                  .filter(function (k) { return k.length >= 3; });
      var trigs = String(r[5] || '').split(';').map(function (k) { return k.trim().toLowerCase(); })
                  .filter(function (k) { return k.length >= 3; });
      if (kws.length) out.push({ domain: String(r[1] || ''), sub: String(r[2] || ''),
                                 radar: radar, kws: kws, trigs: trigs });
    });
  }
  pfcKmCache_ = out;
  return out;
}

/** One scan per Keyword Master row: (kw1 OR kw2 OR kw3) (trig1 OR trig2 OR trig3). */
function kmFeeds_() {
  var feeds = [];
  loadKmRows_().forEach(function (row, i) {
    var kws = row.kws.filter(function (k) { return k.length >= 5 && k.length <= 28; }).slice(0, 3)
                     .map(function (k) { return /\s/.test(k) ? '"' + k + '"' : k; });
    var trigs = row.trigs.filter(function (t) { return t.length <= 28; }).slice(0, 3)
                     .map(function (t) { return /\s/.test(t) ? '"' + t + '"' : t; });
    if (!kws.length) return;
    var q = '(' + kws.join(' OR ') + ')' + (trigs.length ? ' (' + trigs.join(' OR ') + ')' : '') + ' when:7d';
    feeds.push({ tag: 'KM-' + row.sub.slice(0, 2).replace('.', '') + row.radar.slice(0, 3), url: gnews_(q) });
  });
  return feeds;
}

/** Keyword + trigger co-occurrence -> {radar, sub} or null. */
function kmMatch_(lower) {
  var rows = loadKmRows_();
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var kwHit = false;
    for (var k = 0; k < row.kws.length; k++) {
      if (lower.indexOf(row.kws[k]) >= 0) { kwHit = true; break; }
    }
    if (!kwHit) continue;
    for (var t = 0; t < row.trigs.length; t++) {
      if (lower.indexOf(row.trigs[t]) >= 0) return { radar: row.radar, sub: row.sub };
    }
  }
  return null;
}

/* ==========================================================================
 * RADAR RULES — USER-TUNABLE CLASSIFICATION TAB (v6.0 core feature)
 * --------------------------------------------------------------------------
 * Each row: Active | Keywords | Match In | Radar | Importance | Notes
 * - Rules are evaluated TOP TO BOTTOM; first active match wins.
 * - Radar set  -> item is FORCED to that radar (or IGNORED).
 * - Radar blank-> importance-only override; built-in engine picks the radar.
 * - Importance blank -> built-in importance engine decides.
 * ========================================================================== */

var pfcRulesCache_ = null;
function readRadarRules_() {
  if (pfcRulesCache_) return pfcRulesCache_;
  var rules = [];
  var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.RULES);
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().forEach(function (r) {
      var active = String(r[0] || '').trim().toUpperCase();
      if (active && active !== 'Y' && active !== 'YES') return;
      var kws = pfcSplitKeywordCell_(r[1]).map(function (k) { return k.toLowerCase(); });
      if (!kws.length) return;
      var scope = /title/i.test(String(r[2])) && !/any|snippet/i.test(String(r[2])) ? 'TITLE' : 'ANY';
      var radar = String(r[3] || '').trim().toUpperCase();
      if (radar && ['BUSINESS', 'WATCH', 'BORROWING', 'TREASURY', 'IGNORE'].indexOf(radar) < 0) radar = '';
      var imp = pfcImp_(r[4]);
      rules.push({ keywords: kws, scope: scope, radar: radar, importance: imp });
    });
  }
  pfcRulesCache_ = rules;
  return rules;
}

function pfcImp_(v) {
  var s = String(v || '').trim().toLowerCase();
  if (s.indexOf('high') === 0) return 'High';
  if (s.indexOf('med') === 0) return 'Medium';
  if (s.indexOf('low') === 0) return 'Low';
  return '';
}

/** First matching active rule, or null. */
function applyUserRules_(titleLower, anyLower) {
  var rules = readRadarRules_();
  for (var i = 0; i < rules.length; i++) {
    var r = rules[i];
    var hay = r.scope === 'TITLE' ? titleLower : anyLower;
    for (var j = 0; j < r.keywords.length; j++) {
      if (hay.indexOf(r.keywords[j]) >= 0) return r;
    }
  }
  return null;
}

/** Seed the Radar Rules tab with the four LPCU-brief examples + noise killers.
 *  These rows are EDITABLE — the user owns this tab. */
function seedRadarRules_(sh) {
  var rows = [
    ['Y', 'financial closure, invites bids, floats tender, seeks debt, seeks loan, debt tie-up, term loan tie-up, signs PPA, PPA signed',
     'Any', 'BUSINESS', 'High', 'Concrete lending window for PFC'],
    ['Y', 'commissioned, synchronised, synchronized, commercial operation, unit shut, plant shut, shutdown, plant halt, halted, stalled, outage, NCLT, insolvency, defaults on',
     'Any', 'WATCH', 'High', 'Operational progress or halt at existing borrowers'],
    ['Y', 'cuts repo rate, hikes repo rate, repo rate unchanged, repo rate cut by, repo rate hike by, MPC cuts, MPC hikes, RBI cuts rate, RBI hikes rate, Fed cuts rates, Fed hikes rates',
     'Any', 'TREASURY', 'High', 'Actual rate DECISIONS only \u2014 keep speculation out of High'],
    ['Y', 'liquidity surplus, liquidity deficit, banking system liquidity, VRRR, VRR auction, OMO purchase, OMO sale, CRR cut, durable liquidity',
     'Any', 'BORROWING', 'High', 'High/low liquidity of funds in market drives issuance timing'],
    ['Y', 'IPL, cricket, bollywood, film review, box office, wedding, obituary',
     'Title', 'IGNORE', '', 'Noise killer \u2014 edit freely'],
    ['N', '<your keywords here>', 'Any', '', 'Medium', 'Example: importance-only override \u2014 engine still picks the radar']
  ];
  sh.getRange(2, 1, rows.length, 6).setValues(rows);
  sh.getRange(2, 1, rows.length, 6).setWrap(true);
  sh.setColumnWidth(2, 420);
  sh.setColumnWidth(6, 300);
}

/* ==========================================================================
 * BUILT-IN DETECTORS (self-capable classification — no rules tab needed)
 * Chain order: user rule > funding print/liquidity (BORROWING) >
 *              watchlist (WATCH) > market theme (TREASURY) >
 *              infra lifecycle / lending (BUSINESS) > IGNORE
 * ========================================================================== */

/** BORROWING — funding print detector (PFC AR instrument stack). */
function pfcFundingPrint_(lower, title, text) {
  var instrument = /\bbonds?\b|\bncds?\b|debenture|tax[- ]?free|54ec|capital gain|infrastructure bond|subordinated|perpetual|tier[- ]?ii|zero coupon|\bgmtn\b|\bemtn\b|medium[- ]term note|floating rate note|\bfrn\b|senior notes?|notes? due|fixed rate note|foreign currency (loan|note|bond)|external commercial borrowing|line of credit|term loan|syndicated loan|club loan|sofr|euribor|commercial paper|certificate of deposit|samurai|private placement|shelf prospectus|borrowing (programme|program|plan)|fund[- ]?rais(e|ing)|resource mobili[sz]ation/.test(lower);
  var mdb = PFC_MDB_RE.test(lower) &&
            /\bloan\b|credit|financing|facility|line of|support|assistance|package|window|\bfund(s|ing)?\b|programme|program|approves? \$|commits? \$/.test(lower);
  var action = /raises?|raised|raising|issues?|issued|issuance|prices?|priced|secures?|secured|signs?|signed|launches?|launched|lists?|listed|subscrib|allot|files?|filed|approves?|approved|extends?|extended|provides?|provided|commits?|committed|plans? to (raise|issue|borrow)/.test(lower);
  var rating = pfcRatingAction_(lower);
  if (!((instrument || mdb) && action) && !rating) return null;
  var amount = pfcExtractAmount_(text);
  var inst =
      /tax[- ]?free/.test(lower) ? 'Tax-free bond'
    : /54ec|capital gain/.test(lower) ? '54EC capital-gain bond'
    : /infrastructure bond/.test(lower) ? 'Infrastructure bond'
    : /perpetual/.test(lower) ? 'Perpetual bond'
    : /subordinated|tier[- ]?ii/.test(lower) ? 'Subordinated / Tier-II bond'
    : /zero coupon/.test(lower) ? 'Zero-coupon bond'
    : /\bgmtn\b|medium[- ]term note/.test(lower) ? 'GMTN / MTN'
    : /green bond/.test(lower) ? 'Green bond'
    : /social bond/.test(lower) ? 'Social bond'
    : /sustainability bond/.test(lower) ? 'Sustainability bond'
    : /masala/.test(lower) ? 'Masala bond'
    : /dollar bond|yankee/.test(lower) ? 'USD bond'
    : /samurai/.test(lower) ? 'Samurai bond'
    : /sofr|euribor|foreign currency (loan|note)/.test(lower) ? 'FC loan (SOFR/EURIBOR)'
    : /commercial paper/.test(lower) ? 'Commercial paper'
    : /certificate of deposit/.test(lower) ? 'Certificate of deposit'
    : rating && !instrument ? 'Rating action'
    : mdb ? 'MDB / bilateral line'
    : /external commercial borrowing|\becb\b/.test(lower) ? 'ECB'
    : /term loan|syndicated/.test(lower) ? 'Term loan'
    : 'Bond';
  return {
    source: pfcFundingSource_(text, title),
    instrument: inst,
    amount: amount.raw || 'Not stated',
    est_cr: amount.crore,
    currency: amount.currency || 'Not stated',
    tenor: pfcTenor_(text),
    pricing: pricingSignal_(text),
    benefit: /\birfc\b|\bireda\b|\bhudco\b|\bnabfid\b|\biifcl\b|\brec\b/.test(lower)
      ? 'Peer print \u2014 direct pricing/tenor benchmark for PFC issuance.'
      : mdb ? 'Potential new funding window \u2014 diversification, tenor, cost or ESG-label advantage.'
            : 'Market print \u2014 pricing/tenor benchmark for PFC issuance.',
    action: 'RM desk: compare pricing with PFC secondary curve and issuance calendar; check eligibility and hedging cost.'
  };
}

/** BORROWING — market liquidity signal (routed here per LPCU brief:
 *  high/low liquidity of funds directly drives PFC issuance timing). */
function pfcLiquiditySignal_(lower) {
  // Unambiguous phrases stand on their own.
  if (/open market operation|liquidity (surplus|deficit|injection|absorption)|banking system liquidity|durable liquidity|\bcrr\b (cut|hike|change)|cash reserve ratio/.test(lower)) return true;
  // Bare acronyms (VRR/VRRR/OMO) are three letters that turn up in ordinary
  // words and song titles alike, so they count only with money-market context.
  if (/\bvrr\b|\bvrrr\b|\bomo\b/.test(lower)) {
    return /\brbi\b|reserve bank|auction|repo|liquidity|money market|banking system|\bcrore\b|lakh crore|central bank|\bbonds?\b|\bg[- ]?sec\b|treasury bill|\bt[- ]?bill/.test(lower);
  }
  return false;
}

function buildLiquidityBorrowingHit_(lower, title, text) {
  var amount = pfcExtractAmount_(text);
  var surplus = /surplus|injection|infus|vrr\b|omo purchase|crr cut/.test(lower);
  var deficit = /deficit|absorption|vrrr|omo sale|crr hike/.test(lower);
  return {
    source: 'RBI / money market',
    instrument: 'System liquidity signal',
    amount: amount.raw || 'Not stated',
    est_cr: amount.crore,
    currency: amount.currency || 'INR',
    tenor: 'N/A',
    pricing: 'Not stated',
    benefit: surplus ? 'Liquidity surplus \u2014 window to tap CP and short bonds cheaply; front-load prints.'
           : deficit ? 'Liquidity deficit \u2014 expect wider cut-offs; stagger issuance; watch CP rollover cost.'
           : 'Liquidity condition shift \u2014 time issuance around surplus phases.',
    action: 'RM desk: align issuance calendar with liquidity phase; check CP/CD spreads before next print.'
  };
}

/** WATCH — existing PFC borrower / promoter-group activity. */
function pfcWatchHit_(lower, title, text) {
  var m = lower.match(PFC_WATCHLIST_RE);
  var viaCode = null;
  var userRe = pfcUserWatchRe_();
  if (!m && userRe) m = lower.match(userRe);
  if (!m) { var mn = lower.match(PFC_BORROWER_NAMES_RE); if (mn) m = mn; }
  if (!m) { var mp = lower.match(PFC_PROMOTER_RE); if (mp) m = mp; }        // v8.0: promoter groups
  if (!m) { viaCode = text.match(PFC_BORROWER_CODES_RE); }
  if (!m && !viaCode) return null;
  // v8.0: a bare code must sit in an India + power/finance context, so a short
  // form can never be mistaken for a foreign entity or an unrelated business.
  if (viaCode && !m && !(pfcIndiaNexus_(lower) && PFC_FIN_CONTEXT_RE.test(lower))) return null;
  if (!PFC_FIN_CONTEXT_RE.test(lower)) return null;
  if (viaCode && !m) m = [viaCode[0], viaCode[0]];

  var adverse = pfcAdverseHit_(lower);
  var progress = pfcProgressHit_(lower);
  var capex = /approves?\b[^.]{0,45}(investment|capex|project|expansion)|board (approves?|okays?|clears?|nods?)|investment approval|crore investment|to invest|plans? to invest/.test(lower);
  var amount = pfcExtractAmount_(text);
  var name = m[1].length <= 10 && !/[a-z]/.test(m[1]) ? m[1].toUpperCase()
           : m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); });

  var subtype = adverse ? 'ADVERSE / Halt'
              : capex ? 'New Capex / Lending Lead'
              : progress ? 'Operational Progress' : 'Activity';
  return {
    borrower: name + (viaCode ? ' (PFC borrower code)' : ''),
    subtype: subtype,
    cls: pfcBorrowerClass_(text),
    signal: title.slice(0, 140),
    est_cr: amount.crore,
    mw: pfcMw_(text),
    why: adverse ? 'Halt/adverse development at an existing PFC borrower/group \u2014 credit-risk relevant.'
       : capex ? 'Existing PFC borrower has approved fresh capex \u2014 direct lending window with a known counterparty.'
       : progress ? 'Operational progress at an existing PFC borrower \u2014 project on track; disbursement/monitoring relevant.'
       : 'Activity at an existing PFC borrower/group; possible incremental lending.',
    action: adverse ? 'Alert LPCU/CRO: verify PFC exposure, covenants, security cover and asset classification.'
          : capex ? 'BD/Projects: approach the borrower before financial closure; check exposure headroom and single-borrower limits.'
          : progress ? 'Update project monitoring; confirm COD/milestone against sanction terms; assess next-phase lending.'
          : 'Check existing exposure and headroom; scope incremental lending with BD/Projects.'
  };
}

/** TREASURY — market theme / rates / FX. */
function pfcMarketTheme_(lower, tag) {
  if (PFC_EDITORIAL_RE.test(lower) &&
      /econom|inflation|growth|\bgdp\b|rate|rupee|fiscal|deficit|budget|\brbi\b|monetary|reform|bond|market/.test(lower)) {
    return 'Economist / Editorial';                            // v8.0 sub-filter
  }
  if (/\bsofr\b|\beuribor\b|benchmark rate transition/.test(lower)) return 'Global FX';
  if (/\brepo rate\b|monetary policy|\bmpc\b|rbi policy|\bslr\b|policy stance/.test(lower)) return 'RBI Policy';
  if (/\bg[- ]?secs?\b|government bond|10[- ]?year yield|\bgilts?\b|treasury bill|\bt[- ]?bills?\b|borrowing calendar|sovereign bond yield/.test(lower)) return 'G-Sec / Govt Borrowing';
  if (/rupee|usd[\/ ]?inr|usdinr|forex reserve|forward premi/.test(lower)) return 'USD/INR & FX';
  if (/dollar index|\beuro\b|\byen\b|pound sterling|\bgbp\b|\bjpy\b|currency market/.test(lower)) return 'Global FX';
  if (/federal reserve|\bfomc\b|fed (rate|chair|cut|hike)|powell|us treasury yield/.test(lower)) return 'US Fed / UST';
  if (/european central bank|bank of japan|\bboj\b|bank of england|\bboe\b|central banks?|rate (cut|hike) cycle|easing cycle|monetary (easing|tightening)/.test(lower)) return 'Global Central Banks';
  if (/union budget|ministry of finance|disinvestment|dipam|fiscal consolidation/.test(lower)) return 'Budget / MoF';
  if (PFC_INDIA_SOVEREIGN_RE.test(lower)) return 'Sovereign Rating';
  if (/\bcpi\b|\bwpi\b|inflation|deflation/.test(lower)) return 'Inflation';
  if (/\bgdp\b|recession|growth (forecast|outlook|projection)|fiscal deficit|current account/.test(lower)) return 'Growth / Fiscal';
  if (/corporate bond|bond spread|yield curve|debt market|\bnbfc\b.{0,25}(spread|yield|pricing)/.test(lower)) return 'Corporate Bond Market';
  if (/\bcd rates?\b|money market rate/.test(lower)) return 'CP / Money Market';
  if (/currency swap|interest rate swap|principal[- ]only swap|seagull|call spread|cross[- ]currency|hedging cost/.test(lower)) return 'Hedging / Swaps';
  // v9.4 — a Treasury-feed tag alone is NOT enough. The item must actually be about
  // rates, currency, macro, government borrowing or a rating action. Otherwise a
  // solar tender or a rail accident pulled by a Treasury feed would masquerade as
  // Treasury. Those fall through to Business / Ignore below.
  if (/^T-/.test(tag) &&
      /\brates?\b|\byield|repo|\bmpc\b|inflation|\bcpi\b|\bwpi\b|\bgdp\b|fiscal|deficit|rupee|\bforex\b|currency|\bfed\b|\brbi\b|bond|\bg[- ]?sec|monetary|liquidity|sovereign|budget|borrowing cost|basis points?|\bbps\b/.test(lower)) {
    return String(tag).replace(/^T-/, '');
  }
  return null;
}

function pfcRateDir_(lower) {
  var up = /hike|hikes|hiked|raises? (rates?|repo)|tighten|hawkish|yields? (rise|risen|surge|spike|harden|jump)|inflation (rises|accelerat|spikes|hotter|higher than)/.test(lower);
  var down = /\bcut\b|\bcuts\b|slash|ease[sd]?|easing|dovish|yields? (fall|fell|soften|decline|drop|cool)|inflation (cools|eases|falls|slows|below)/.test(lower);
  if (up && down) return 'MIXED';
  if (up) return 'UP';
  if (down) return 'DOWN';
  return 'NEUTRAL';
}

function pfcInrDir_(lower) {
  if (/rupee (falls|fell|weakens|weakened|slides|slid|slips|hits? (a |an )?(all[- ]time |record |fresh )?low|depreciat)|rupee under pressure/.test(lower)) return 'WEAKER';
  if (/rupee (gains|gained|strengthens|strengthened|rises|rose|recovers|appreciat)/.test(lower)) return 'STRONGER';
  return 'NEUTRAL';
}

function pfcMarketImpact_(theme, rateDir, inrDir) {
  var impact = 'Monitor; transmission to PFC borrowing cost unclear from headline.';
  var hedging = 'No immediate hedging action indicated.';
  var instrument = 'No specific tenor bias.';
  if (rateDir === 'DOWN') {
    impact = 'Softer rates lower fresh issuance cost; window to front-load long-tenor domestic borrowing.';
    instrument = 'Favour 10/15-year bonds to lock lower coupons; trim CP reliance.';
    hedging = 'Consider receiving fixed via IRS on floating book; pause new payer swaps.';
  } else if (rateDir === 'UP') {
    impact = 'Rising rates raise incremental borrowing cost; re-price transmission to lending spreads.';
    instrument = 'Shorten fresh tenors (3/5-year, CP) until curve stabilises; defer 15-year prints.';
    hedging = 'Assess paying fixed on floating exposure; re-run duration gap on ALCO template.';
  }
  if (inrDir === 'WEAKER') {
    impact = 'Rupee weakness raises MTM and rollover cost on unhedged/partially hedged FC book.';
    hedging = 'Review hedge ratio on USD/JPY/EUR liabilities; compare forwards vs POS vs seagull cost.';
    instrument = 'Re-test landed cost of new ECB vs domestic bond before fresh FC drawdown.';
  } else if (inrDir === 'STRONGER') {
    impact = 'Rupee strength cheapens FC servicing; landed cost of ECB/offshore bonds improves.';
    hedging = 'Window to top up hedges at better forward points; evaluate unwinding costly structures.';
    instrument = 'Reassess ECB/offshore issuance vs domestic curve.';
  }
  if (theme === 'Sovereign Rating') {
    impact = 'Rating action moves offshore spreads for all quasi-sovereign issuers including PFC.';
    hedging = 'Re-check ECB all-in cost assumptions and covenant rating triggers.';
  }
  if (theme === 'Budget / MoF') {
    impact = 'Gross borrowing and fiscal signals set G-sec supply and crowd-out risk for CPSE bonds.';
    instrument = 'Align issuance calendar away from heavy G-sec auction weeks.';
  }
  if (theme === 'Corporate Bond Market' || theme === 'CP / Money Market') {
    impact = 'Spread/pricing benchmark for PFC prints; compare with own secondary levels.';
  }
  return { impact: impact, hedging: hedging, instrument: instrument };
}

/** BUSINESS — project-lifecycle lending detector. */
var PFC_INFRA_SECTOR_RE = /solar|\bwind\b|wind (power|energy|farm|turbine)|offshore wind|hydro|hydel|pumped storage|\bpsp\b|\bbess\b|battery (energy )?storage|energy storage|storage (tender|project|capacity)|\bfdre\b|firm (and )?dispatchable|round[- ]the[- ]clock|\brtc\b power|thermal|nuclear|\bsmr\b|\bumpp\b|supercritical|transmission|\btbcb\b|\bists\b|\bhvdc\b|substation|smart meter|\bami\b|\brdss\b|distribution infra|green hydrogen|green ammonia|ammonia|electrolyser|electrolyzer|compressed biogas|\bcbg\b|waste[- ]to[- ]energy|\bccus\b|carbon capture|ev charging|charging infrastructure|battery swapping|e[- ]bus|airport|\bport\b|\bports\b|metro|\brrts\b|railway|rail electrification|highway|expressway|refinery|petrochemical|city gas|data cent(re|er)|desalination|biomass|floating solar|solar park|renewable|hydropower|reservoir|green (energy|investment)/;

var PFC_PROJECT_ACTION_RE = /invit(es?|ed|ing) bids?|tender|\bbid\b|\bppa\b|power purchase agreement|\bmous?\b|memorandum|approv(es?|ed|al)|launch(es|ed)?|secur(es?|ed)|award(s|ed)?|wins?|\bwon\b|commission(s|ed|ing)?|inaugurat|foundation stone|financial closure|\bloi\b|\bloa\b|letter of (intent|award)|develop(s|ed|ing)?|construct|implement|roll[- ]?out|rollout|begins?|starts?|breaks ground|signs?|invest(s|ed|ing|ment)?|expan(ds?|sion)|sets? up|to build/;

function pfcLendingStage_(lower) {
  if (/invit(es?|ed|ing) bids?|tender/.test(lower)) return 'Tender / bids invited';
  if (/\bppa\b|power purchase agreement/.test(lower)) return 'PPA signed';
  if (/financial closure/.test(lower)) return 'Financial closure';
  if (/\bmous?\b|memorandum/.test(lower)) return 'MoU stage';
  if (/commission/.test(lower)) return 'Commissioned / commissioning';
  if (/approv/.test(lower)) return 'Approved';
  if (/roll[- ]?out|rollout/.test(lower)) return 'Programme rollout';
  return 'Development activity';
}

function pfcBusinessHit_(lower, title, text, tag) {
  var infra = (PFC_INFRA_SECTOR_RE.test(lower) || pfcMw_(text) !== null) && PFC_PROJECT_ACTION_RE.test(lower);
  var strongLendingAction = /\b(to invest|will invest|plans? to invest|announc(?:e|ed|es) (?:an? )?investment|approv(?:e|ed|es).{0,35}(?:project|plant|facility)|award(?:ed|s)?.{0,25}(?:project|contract|tender)|wins?.{0,25}(?:project|contract|tender)|achieves? financial closure|financial closure|signs? (?:an? )?ppa|to build|will build|plans? to build|set up|setting up|to develop|will develop|floats? tender|invites? bids|capex plan|capital expenditure|construction begins|breaks ground|seeks? (?:debt|loan|financing)|debt tie[- ]?up)\b/i.test(lower);
  var amount = pfcExtractAmount_(text);
  var sizedProject = amount.crore !== null && /\b(project|plant|facility|capacity|corridor|airport|port|highway|expressway|metro|solar|wind|battery|data cent|transmission|pipeline|refinery|mine|mining|hydrogen|ammonia)\b/i.test(lower) && /\b(invest|investment|capex|build|develop|expand|award|approve|launch|set up|construction)\b/i.test(lower);
  var reportOnly = /\b(report|study|analysis|outlook|forecast|opinion|editorial|survey|share price|stock price|quarterly results?|profit rises|profit falls|political row|election)\b/i.test(lower) && !strongLendingAction;
  if (reportOnly || !(infra || strongLendingAction || sizedProject)) return null;
  var mw = pfcMw_(text);
  var sector = pfcSector_(lower, tag);
  var stage = pfcLendingStage_(lower);
  return {
    entity: pfcEntity_(title),
    sector: sector,
    state: pfcStateOf_(text),
    size_cr: amount.crore,
    exposure_cr: amount.crore === null ? null : Math.round(amount.crore * 0.50 * 100) / 100,
    mw: mw,
    stage: stage,
    why: stage + (mw ? ' \u2014 ' + mw + ' MW' : '') + '; project-lifecycle lead with potential debt-financing need for PFC.',
    product: /tender|bids?/.test(lower) ? 'Bid-stage engagement / project finance' : pfcProduct_(sector),
    action: 'BD/Projects: verify sponsor, project stage, approvals and funding plan; assess PFC financing window.',
    risks: /\bmous?\b|memorandum/.test(lower) ? 'Early stage \u2014 MoU only.' : 'Validate source, approvals, execution readiness and promoter strength.'
  };
}

/* ==========================================================================
 * IMPORTANCE ENGINE — built-in High/Medium/Low defaults per radar
 * (User rules on the Radar Rules tab override these when they specify one.)
 * ========================================================================== */

/* ==========================================================================
 * v6.3 — IMPORTANCE SCORING ENGINE
 * --------------------------------------------------------------------------
 * Additive keyword scores built from the PFC News Keyword Master event
 * triggers (Business K, Borrowing K, Treasury L) + size/severity weights,
 * with penalties for opinion/listicle/price-chatter noise.
 * Thresholds: see PFC_IMP_CUTOFF. User rules on the Radar Rules tab still
 * override the computed grade when they specify an Importance.
 * ========================================================================== */

var PFC_IMP_CUTOFF = {
  BUSINESS:   { high: 55, med: 30 },
  WATCH:      { high: 45, med: 20 },
  TREASURY:   { high: 45, med: 20 },
  BORROWING:  { high: 50, med: 25 },
  COMPETITOR: { high: 50, med: 25 }
};

function gradeOf_(radar, score) {
  var c = PFC_IMP_CUTOFF[radar];
  return score >= c.high ? 'High' : score >= c.med ? 'Medium' : 'Low';
}

/** Common noise penalty: opinion, explainer, listicle, price chatter. */
function pfcNoisePenalty_(lower) {
  var p = 0;
  if (/\bopinion\b|editorial|explainer|explained\b|what is |what are |why (is|are|does|did) |how (to|does|did) |top \d+|\blist of\b|here's|in charts|decoded|faq/.test(lower)) p -= 20;
  if (/share price|stock (price|rises|falls|jumps)|intraday|target price|buy or sell|multibagger|q[1-4] (results|earnings)|net profit (rises|falls|up|down)/.test(lower)) p -= 25;
  if (/\boutlook\b|forecasts?\b|analysis:|study says|report says|survey/.test(lower)) p -= 12;
  if (/mutual fund investors|home loan|\bemi\b|should you|what it means for (you|investors)|your (loan|emi|money|savings)|personal finance|fixed deposit|common man|impacts? (you|your)|find out here|here'?s (how|what|why)|check (july|august|latest) rates|how should|strategy after/.test(lower)) p -= 50;
  if (/\?\s*$|^(will|should|can|is|are|why|how|what)\b/.test(lower)) p -= 20;
  return p;
}

/** BUSINESS — lending-window strength. */
function importanceBusiness_(hit, lower) {
  var s = 0;
  if (/achieves? financial closure|financial closure|debt tie[- ]?up|seeks? (funding|debt|lender|financing)|secures?\b.{0,30}(financing|funding|loan|debt)|invites? financing|raises? project debt|signs? financing agreement|takeout financ/.test(lower)) s += 45;
  if (/invites? bids|floats?\b.{0,40}tender|tender (floated|issued|for)|\brfp\b|\brfq\b|\beoi\b|reverse auction|emerges? lowest bidder|wins? bid|letter of award|\bloa\b|letter of intent|\bloi\b/.test(lower)) s += 40;
  if (/signs? ppa|power purchase agreement|epc (award|contract)|awards? contract|wins?\b.{0,40}(project|contract|order|tender)|bags\b.{0,30}(order|project|contract)|inks?\b.{0,35}(pact|deal|agreement|ppa)|seals?\b.{0,30}(deal|pact)|cabinet approv|approves? project|sanctions? project|clears? project|investment approval|board approval/.test(lower)) s += 35;
  if (/commences? construction|groundbreaking|breaks ground|orders? equipment|construction start/.test(lower)) s += 30;
  if (/plans? invest|proposes? invest|commits? invest|announces? project|to invest|will invest|\binvests?\b|announces?\b[^.]{0,45}investment|crore investment|investment (in|of|for)\b|capex plan|capacity expansion|expansion of\b|to expand\b|sets? up\b[^.]{0,35}(plant|unit|facility|park)|greenfield|brownfield expansion/.test(lower)) s += 25;
  if (/commissions?|achieves? cod|commercial operation/.test(lower)) s += 15;   // done project: next-phase lead only
  if (/signs? mou|memorandum|joint venture|incorporates? spv|acquires? stake|feasibility|\bdpr\b|pre[- ]feasibility/.test(lower)) s += 15;
  var cr = hit.size_cr || 0, mw = hit.mw || 0;
  s += cr >= 5000 ? 30 : cr >= 1000 ? 22 : cr >= 500 ? 15 : cr >= 100 ? 8 : 0;
  s += mw >= 1000 ? 25 : mw >= 500 ? 18 : mw >= 100 ? 8 : 0;
  if (/solar|wind|hydro|pumped storage|\bbess\b|storage|transmission|thermal|nuclear|green hydrogen|ammonia|smart meter|\brdss\b/.test(lower)) s += 8;
  s += pfcNoisePenalty_(lower);
  return gradeOf_('BUSINESS', s);
}

/** WATCH — severity of adverse events / weight of operational progress. */
function importanceWatch_(hit, lower) {
  var s = 0;
  if (hit.subtype === 'NCLT / IBC') s += 65;                          // v8.2 severity tiers
  else if (hit.subtype === 'Fraud / Forensic') s += 65;
  else if (hit.subtype === 'Wilful Default' || hit.subtype === 'Recovery / SARFAESI') s += 60;
  else if (hit.subtype === 'Restructuring / OTS') s += 50;
  if (hit.subtype === 'Credit Rating Change') {
    s += /downgrade|rating (cut|lowered|suspended|withdrawn)|revised to negative|(negative|adverse) (outlook|watch)|placed (on|under) (credit )?watch|junk/.test(lower) ? 50 : 30;
  }
  if (hit.subtype === 'Borrowing by Borrower') s += 35;
  if (/nclt|insolven|bankrupt|defaults?\b|fraud|\bcbi\b|\bed\b raid|probe|investigat/.test(lower)) s += 55;
  if (/downgrade|rating watch|(negative|adverse) (outlook|watch)|outlook revised to (negative|stable)|revised to negative|rating (cut|lowered|suspended|withdrawn)/.test(lower)) s += 45;
  if (/halt(s|ed)?|shutdown|shut down|outage|fire|blast|accident|stall(s|ed)?|strike|curtail/.test(lower)) s += 45;
  if (/dues (mount|delay|pending)|mounting dues|dues\b.{0,30}(crore|mount)|payment delay|delayed payment|unpaid|\blps\b|terminat.{0,20}ppa|invoke.{0,20}guarantee|encash/.test(lower)) s += 45;
  if (/\bcod\b|commission(s|ed|ing)?|synchronis|synchroniz|commercial operation|full load|first (power|unit)/.test(lower)) s += 45;
  if (/financial closure|signs? ppa|ppa signed|signs?\b.{0,35}(power deal|supply agreement|power purchase|cfd)|refinanc|prepay/.test(lower)) s += 40;
  if (/approves?\b[^.]{0,45}(investment|capex|project|expansion)|board (approves?|okays?|clears?|nods?)|investment approval|sanctions?\b[^.]{0,35}(project|capex)|to invest|plans? to invest|announces?\b[^.]{0,45}investment|crore investment/.test(lower)) s += 40;
  if (/wins?\b.{0,40}(project|tender|bid|contract|transmission|order|supply)|secures?\b.{0,45}(project|deal|contract|order)|awarded\b.{0,30}(project|order|contract)|bags\b.{0,30}(order|project|contract)|invites? bids|floats?\b.{0,40}tender/.test(lower)) s += 30;
  else if (/expands?|new project|fund[- ]?rais|refinanc/.test(lower)) s += 20;
  var wmw = hit.mw || pfcMw_(String(hit.signal || ''));
  if (wmw) s += wmw >= 1000 ? 15 : wmw >= 500 ? 10 : 0;
  if (s === 0 && /loan|project|tender|plant|capacity|\bppa\b|smart meter|transmission|solar|wind|thermal/.test(lower)) s += 15;
  var cr = hit.est_cr || 0;
  s += cr >= 10000 ? 25 : cr >= 5000 ? 18 : cr >= 1000 ? 10 : cr >= 250 ? 5 : 0;
  s += pfcNoisePenalty_(lower);
  return gradeOf_('WATCH', s);
}

/** TREASURY — decision events and sharp moves score highest. */
function importanceTreasury_(theme, rateDir, inrDir, lower) {
  var s = 0;
  if (theme === 'Economist / Editorial') {
    // Named economists and mainstream editorials on the Indian economy are wanted,
    // but they are commentary: Medium at best unless they carry a hard number.
    s = 25;
    if (/\brbi\b|repo|inflation|\bgdp\b|fiscal|bond yield|rupee/.test(lower)) s += 8;
    if (/raghuram rajan|gita gopinath|krugman|roubini|imf|world bank|chief economist/.test(lower)) s += 8;
    return gradeOf_('TREASURY', s);
  }
  if (/rbi (cuts|hikes|keeps|holds)|mpc (decision|cuts|hikes|votes|holds)|repo rate (cut|hike|unchanged|held|hold|pause)|rate (held|pause)\b|holds? (rates?|repo)|policy (rate )?decision|maintains? (repo|status quo)/.test(lower)) s += 60;
  if (/(fed|fomc) (rate )?(decision|cuts?|hikes?|holds?)|federal reserve (cuts?|hikes?|holds?)/.test(lower)) s += 50;
  if (/(ecb|bank of japan|\bboj\b|bank of england|\bboe\b).{0,30}(decision|cuts?|hikes?|holds?)/.test(lower)) s += 40;
  if (/\bcrr\b|\bslr\b|cash reserve ratio|statutory liquidity ratio/.test(lower)) s += 50;
  if (/rate cut|cuts? (repo|rates)|dovish|easing cycle|rate pause/.test(lower)) s += 30;
  if (PFC_INDIA_SOVEREIGN_RE.test(lower) && /sovereign|rating|outlook|upgrade|downgrade/.test(lower)) s += 50;
  if (inrDir !== 'NEUTRAL' && /record|all[- ]time|fresh low|sharp|plunge|surge|breach/.test(lower)) s += 45;
  else if (inrDir !== 'NEUTRAL') s += 20;
  if (rateDir !== 'NEUTRAL' && /\bbps\b|basis points|sharp|spike|plunge/.test(lower)) s += 25;
  else if (rateDir !== 'NEUTRAL') s += 20;
  if (/\bcpi\b|\bwpi\b|\bgdp\b|fiscal deficit|current account/.test(lower)) {
    s += /hotter|cooler|beats?|miss(es)?|above|below (estimates?|expectations?)|surpris/.test(lower) ? 28 : 18;
  }
  if (/borrowing calendar|gross borrowing|auction (cut[- ]?off|devolve)/.test(lower)) s += 25;
  s += pfcNoisePenalty_(lower);
  return gradeOf_('TREASURY', s);
}

/** BORROWING — liquidity phase, print size, benchmark value. */
function importanceBorrowing_(hit, lower) {
  var s = 0;
  if (pfcLiquiditySignal_(lower)) s += 55;
  if (hit.instrument === 'Rating action') {
    s += /power finance|\bpfc\b|\brec\b (limited|ltd)/.test(lower) ? 55
       : /\bireda\b|\birfc\b|\bhudco\b|\bnabfid\b|\biifcl\b|\bnbfc\b|infrastructure finance/.test(lower) ? 28
       : 15;
  }
  if (/raises?|raised|issues?|issued|prices?|priced|secures?|secured|signs?|signed|allots?|allotted|launches?|closes?|mobilises?/.test(lower)) s += 15;
  if (/green bond|social bond|sustainability|sustainability[- ]linked|esg bond|transition bond/.test(lower)) s += 10;
  var cr = hit.est_cr || 0;
  s += cr >= 10000 ? 40 : cr >= 5000 ? 32 : cr >= 2000 ? 20 : cr >= 500 ? 10 : 0;
  if (/power finance|\bpfc\b|\brec\b limited|rec ltd/.test(lower)) s += 30;
  if (/\bireda\b|\birfc\b|\bhudco\b|\bnabfid\b|\biifcl\b/.test(lower)) s += 22;
  if (/world bank|asian development bank|\badb\b|\baiib\b|\bndb\b|\bjica\b|\bkfw\b|\beib\b|jbic|green climate fund|export credit/.test(lower) && /india|energy|power|infra/.test(lower)) s += 40;
  if (/gift city|\bifsc\b|maiden|debut|first[- ]ever|inaugural/.test(lower)) s += 18;
  if (/coupon|priced at|\d(\.\d+)?\s*%|cut[- ]?off/.test(lower)) s += 8;
  if (/oversubscrib|strong demand|order book/.test(lower)) s += 10;
  s += pfcNoisePenalty_(lower);
  return gradeOf_('BORROWING', s);
}

function importanceCompetitor_(hit, lower) {
  var s = 0;
  var cr = hit.est_cr || 0;
  s += cr >= 10000 ? 45 : cr >= 5000 ? 35 : cr >= 1000 ? 22 : cr >= 250 ? 10 : 0;
  if (hit.activity === 'Borrowing') {
    s += 25;                                                  // a peer print is always a benchmark
    if (/coupon|priced|cut[- ]?off|yield of|\bbps\b/.test(lower)) s += 15;
    if (/maiden|debut|first[- ]ever|inaugural|green bond|gift city|\bifsc\b|\becb\b|dollar bond/.test(lower)) s += 15;
  } else {
    s += 20;
    if (/sanction|disburs|signs? (loan|agreement|mou)|wins?|bags|approves? (loan|financing)|line of credit/.test(lower)) s += 25;
    if (/\baum\b|loan book|order book|portfolio|target|guidance/.test(lower)) s += 10;
  }
  if (/rating (upgrade|downgrade|affirm)/.test(lower)) s += 15;
  s += pfcNoisePenalty_(lower);
  return gradeOf_('COMPETITOR', s);
}

/* ==========================================================================
 * v8.0 — NEW DETECTORS
 * ========================================================================== */

/** COMPETITOR — REC / IREDA / IRFC / HUDCO / NaBFID / IIFCL etc. */
/* ==========================================================================
 * v8.7 — REGULATORY COMPLIANCE RADAR
 * Regulators, statutes and market infrastructure that bind PFC as (a) a listed
 * company and (b) an NBFC-ND-IFC. Each regulator/theme becomes a sub-filter.
 * ========================================================================== */
var PFC_REGULATORS = [
  // [regulator label, applies-as, matcher]
  ['RBI',            'NBFC-ND-IFC',  /reserve bank of india|\brbi\b/i],
  ['SEBI',           'Listed entity',/\bsebi\b|securities and exchange board/i],
  ['NSE',            'Listed entity',/\bnse\b|national stock exchange/i],
  ['BSE',            'Listed entity',/\bbse\b|bombay stock exchange/i],
  ['MoP',            'CPSE / sponsor',/ministry of power|\bmop\b/i],
  ['MoF / DEA',      'CPSE / listed', /ministry of finance|\bmof\b|department of economic affairs|\bdea\b|dipam/i],
  ['MNRE',           'Power-sector',  /ministry of new and renewable|\bmnre\b/i],
  ['SIDBI',          'Refinance',     /\bsidbi\b/i],
  ['CERC',           'Power-sector',  /central electricity regulatory|\bcerc\b/i],
  ['SERC',           'Power-sector',  /state electricity regulatory|\bserc\b|\bmerc\b|\bkerc\b|\bderc\b|\buperc\b/i],
  ['CEA',            'Power-sector',  /central electricity authority|\bcea\b/i],
  ['Companies Act',  'Listed / NBFC', /companies act|\bmca\b|ministry of corporate affairs|\bnfra\b|secretarial standard/i],
  ['Income Tax',     'Corporate tax', /income[- ]tax act|\bcbdt\b|\btds\b|\btcs\b|advance tax|tax deducted/i],
  ['GST',            'Indirect tax',  /\bgst\b|\bcbic\b|goods and services tax/i],
  ['CERSAI',         'Secured lender',/\bcersai\b|central registry of securit/i],
  ['PFRDA',          'NPS / pension', /\bpfrda\b|pension fund regulatory|national pension/i],
  ['IBBI',           'Creditor',      /\bibbi\b|insolvency and bankruptcy board/i],
  ['IRDAI',          'Group / invest',/\birdai\b|insurance regulatory/i],
  ['CAG / CVC',      'CPSE audit',    /\bcag\b|comptroller and auditor|\bcvc\b|central vigilance/i],
  ['FEMA / ECB',     'Forex borrower',/\bfema\b|foreign exchange management|\becb\b guidelines|external commercial borrowing (framework|guidelines)/i]
];

/** Instrument type of a regulatory item — helps the desk triage. */
function pfcRegInstrument_(lower) {
  if (/circular|notification|master direction|guidelines?|framework/i.test(lower)) return 'Circular / Direction';
  if (/\bact\b|amendment|ordinance|bill\b|rules?\b|regulation/i.test(lower)) return 'Act / Rule';
  if (/consultation paper|discussion paper|draft\b|exposure draft|seeks comments/i.test(lower)) return 'Consultation / Draft';
  if (/penalt|fine\b|show[- ]cause|enforcement|adjudicat|strictures?|bars?\b/i.test(lower)) return 'Enforcement / Penalty';
  if (/deadline|due date|last date|extends?|timeline|compliance calendar|filing/i.test(lower)) return 'Deadline / Filing';
  if (/judgment|ruling|order\b|supreme court|high court|tribunal/i.test(lower)) return 'Ruling / Order';
  return 'Update';
}

var PFC_REG_ACTION_RE = /circular|notification|master direction|guidelines?|framework|\bact\b|amendment|ordinance|\bbill\b|\brules?\b|regulation|consultation paper|draft\b|penalt|fine\b|show[- ]cause|enforcement|deadline|due date|extends?|filing|compliance|disclosure|judgment|ruling|order\b|norms?\b|mandat|notified?|prescrib/i;

/** Detects a regulatory-compliance item relevant to PFC. Requires a regulator
 *  match AND a regulatory-action word, so ordinary market news that merely names
 *  "RBI" (e.g. an RBI rate cut → Treasury) does not land here. */
function pfcRegulatoryHit_(lower, title, text) {
  var reg = null, appliesAs = '';
  for (var i = 0; i < PFC_REGULATORS.length; i++) {
    if (PFC_REGULATORS[i][2].test(lower)) { reg = PFC_REGULATORS[i][0]; appliesAs = PFC_REGULATORS[i][1]; break; }
  }
  if (!reg) return null;
  if (!PFC_REG_ACTION_RE.test(lower)) return null;
  // Pure monetary-policy / FX belongs to Treasury, not compliance.
  if (/repo rate|policy rate|rate (cut|hike|decision|hold)|mpc\b|liquidity|omo\b|g-sec yield|rupee (falls|rises|hits|weakens|strengthens)/i.test(lower) &&
      !/circular|master direction|guidelines?|compliance|disclosure|filing|penalt|norms?|framework|amendment/i.test(lower)) return null;
  // India relevance (foreign regulators out).
  if (!pfcIndiaNexus_(lower) && !/\b(rbi|sebi|nse|bse|cerc|cea|mnre|sidbi|cersai|pfrda|ibbi|irdai|cag|cvc|mca|cbdt|cbic|dipam|nfra)\b/i.test(lower)) return null;

  var theme = pfcRegTheme_(lower, reg);
  return {
    regulator: reg,
    instrument: pfcRegInstrument_(lower),
    appliesAs: appliesAs,
    theme: theme,
    changed: title.slice(0, 150),
    implication: 'Assess applicability to PFC as ' + appliesAs + '; map to the Policy Compendium and obligation tracker.',
    owner: pfcRegOwner_(reg),
    deadline: pfcRegDeadline_(text)
  };
}

function pfcRegTheme_(lower, reg) {
  if (/disclosure|lodr|listing obligation|insider trading|related party|\brpt\b/i.test(lower)) return 'Listing / Disclosure (LODR)';
  if (/\bscale[- ]based\b|\bsbr\b|upper layer|middle layer|npa|provisioning|asset classification|irac/i.test(lower)) return 'Prudential / SBR';
  if (/project finance|infrastructure lending|dcco|stressed asset|resolution framework/i.test(lower)) return 'Project & Stressed Assets';
  if (/\becb\b|external commercial|fema|hedging|overseas/i.test(lower)) return 'ECB / FEMA';
  if (/\bgst\b|income[- ]tax|\btds\b|\btcs\b|cbdt|cbic|transfer pricing/i.test(lower)) return 'Taxation';
  if (/companies act|secretarial|nfra|audit|board (composition|meeting)|independent director/i.test(lower)) return 'Corporate Governance';
  if (/csr|esg|brsr|sustainab|green bond|climate/i.test(lower)) return 'ESG / BRSR';
  if (/penalt|fine|enforcement|show[- ]cause|adjudicat|strictures/i.test(lower)) return 'Enforcement';
  return reg + ' — General';
}

function pfcRegOwner_(reg) {
  if (reg === 'SEBI' || reg === 'NSE' || reg === 'BSE') return 'Company Secretary / Compliance';
  if (reg === 'RBI' || reg === 'IBBI' || reg === 'CERSAI') return 'LPCU / Risk';
  if (reg === 'Income Tax' || reg === 'GST') return 'Taxation / Finance';
  if (reg === 'CERC' || reg === 'SERC' || reg === 'CEA' || reg === 'MNRE' || reg === 'MoP') return 'Regulatory Affairs';
  if (reg === 'Companies Act' || reg === 'CAG / CVC') return 'Secretarial / Audit';
  if (reg === 'PFRDA') return 'HR / Finance';
  return 'Compliance';
}

function pfcRegDeadline_(text) {
  var m = String(text).match(/(?:by|before|deadline|last date|effective(?: from)?|w\.e\.f\.?|with effect from)\s+([A-Za-z0-9 ,\/\-]{4,20}\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  return m ? m[1].trim() : '';
}

function importanceRegulatory_(hit, lower) {
  var s = 45;
  if (/master direction|amendment|\bact\b|regulation|notified|mandat|framework/i.test(lower)) s += 25;
  if (/penalt|fine|enforcement|show[- ]cause|strictures|bars? \w/i.test(lower)) s += 25;
  if (/deadline|last date|due date|effective from|w\.e\.f/i.test(lower)) s += 15;
  if (hit.appliesAs === 'NBFC-ND-IFC' || hit.appliesAs === 'Listed entity' || hit.appliesAs === 'Listed / NBFC') s += 15;
  if (/consultation|draft|discussion paper|seeks comments/i.test(lower)) s -= 15;
  return s >= 65 ? 'High' : s >= 40 ? 'Medium' : 'Low';
}

function pfcCompetitorHit_(lower, title, text) {
  var name = pfcCompetitorName_(text);
  if (!name) return null;
  var borrowing = pfcFundingPrint_(lower, title, text) ||
                  /raises?|raised|bond|\bncd\b|borrow|issuance|\becb\b|commercial paper|fund[- ]?rais|shelf prospectus|coupon/.test(lower);
  var lending = /sanction|disburs|loan (to|for|of)|finance[sd]?|lends?|lending|term loan|credit facility|signs? (mou|agreement)|\bppa\b|tie[- ]?up|funding (to|for)|approves? (loan|financing)|line of credit|scheme|business|order book|\baum\b|portfolio/.test(lower);
  var amount = pfcExtractAmount_(text);
  var activity = borrowing && !lending ? 'Borrowing'
               : lending && !borrowing ? 'Lending / Business'
               : borrowing ? 'Borrowing' : 'Lending / Business';
  if (!borrowing && !lending && !/result|profit|rating|\baum\b|growth|expansion|mou|target/.test(lower)) return null;
  return {
    competitor: name,
    activity: activity,
    details: title.slice(0, 140),
    est_cr: amount.crore,
    pricing: pricingSignal_(text),
    implication: activity === 'Borrowing'
      ? 'Peer print \u2014 direct pricing/tenor benchmark for PFC\'s own issuance.'
      : 'Peer business win \u2014 competitive intelligence on lending pipeline and pricing.',
    action: activity === 'Borrowing'
      ? 'RM desk: compare coupon/tenor with PFC secondary curve before the next print.'
      : 'BD/Projects: check whether PFC bid or was approached; review pricing competitiveness.'
  };
}

/** NCLT / IBC involving an Indian promoter or corporate group. */
function pfcNcltHit_(lower, title, text) {
  if (!PFC_NCLT_RE.test(lower)) return null;
  if (!PFC_PROMOTER_RE.test(lower) && !PFC_WATCHLIST_RE.test(lower) &&
      !PFC_BORROWER_NAMES_RE.test(lower) && !PFC_BORROWER_CODES_RE.test(text)) return null;
  if (!pfcIndiaNexus_(lower)) return null;
  var amount = pfcExtractAmount_(text);
  var m = lower.match(PFC_PROMOTER_RE) || lower.match(PFC_WATCHLIST_RE) || lower.match(PFC_BORROWER_NAMES_RE);
  return {
    borrower: m ? m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : pfcEntity_(title),
    subtype: 'NCLT / IBC',
    cls: pfcBorrowerClass_(text),
    signal: title.slice(0, 140),
    est_cr: amount.crore,
    mw: pfcMw_(text),
    why: 'Insolvency / resolution action involving an Indian promoter group \u2014 direct credit-risk read-across.',
    action: 'LPCU/CRO: check PFC exposure to the group and its SPVs; review security, guarantees and asset classification.'
  };
}

/** Rating downgrade of a private-sector borrower / promoter group. */
function pfcDowngradeHit_(lower, title, text) {
  if (!PFC_DOWNGRADE_RE.test(lower) || !PFC_RATING_ACTION_RE.test(lower)) return null;
  if (!PFC_PROMOTER_RE.test(lower) && !PFC_WATCHLIST_RE.test(lower) &&
      !PFC_BORROWER_NAMES_RE.test(lower) && !PFC_BORROWER_CODES_RE.test(text)) return null;
  if (!pfcIndiaNexus_(lower)) return null;
  var m = lower.match(PFC_PROMOTER_RE) || lower.match(PFC_WATCHLIST_RE) || lower.match(PFC_BORROWER_NAMES_RE);
  return {
    borrower: m ? m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : pfcEntity_(title),
    subtype: 'Rating Downgrade',
    cls: pfcBorrowerClass_(text),
    signal: title.slice(0, 140),
    est_cr: pfcExtractAmount_(text).crore,
    mw: null,
    why: 'Credit rating action on a borrower / promoter group \u2014 covenant and provisioning relevance.',
    action: 'LPCU/CRO: check rating triggers in the loan agreement; reassess internal grade and provisioning.'
  };
}

/** Borrowing done BY a PFC borrower (state or private) \u2014 belongs in Borrower Watch. */
function pfcBorrowerFundingHit_(lower, title, text) {
  var print = pfcFundingPrint_(lower, title, text);
  if (!print) return null;
  var isBorrower = PFC_WATCHLIST_RE.test(lower) || PFC_BORROWER_NAMES_RE.test(lower) ||
                   PFC_BORROWER_CODES_RE.test(text) || PFC_PROMOTER_RE.test(lower);
  if (!isBorrower) return null;
  if (pfcCompetitorName_(text)) return null;         // competitors have their own radar
  var m = lower.match(PFC_PROMOTER_RE) || lower.match(PFC_WATCHLIST_RE) || lower.match(PFC_BORROWER_NAMES_RE);
  return {
    borrower: m ? m[1].replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : pfcEntity_(title),
    subtype: 'Borrowing by Borrower',
    cls: pfcBorrowerClass_(text),
    signal: title.slice(0, 140),
    est_cr: print.est_cr,
    mw: null,
    why: 'An existing borrower is raising money elsewhere \u2014 refinancing / takeout risk to PFC\'s exposure.',
    action: 'LPCU: check whether the proceeds refinance PFC debt; review prepayment and pari-passu terms.'
  };
}

/* ==========================================================================
 * MASTER CLASSIFIER — one entry point per item
 * Returns { radar: 'BUSINESS'|'WATCH'|'BORROWING'|'TREASURY'|'IGNORE',
 *           importance: 'High'|'Medium'|'Low'|'',
 *           bus|watch|borr|tre: hit object or null }
 * ========================================================================== */

function classifyLocal_(item) {
  var title = String(item.title || '').trim();
  var snippet = String(item.snippet || '').trim();
  var tag = String(item.tag || '').trim();
  var text = (title + ' ' + snippet).replace(/[\u2013\u2014-]/g, ' ').replace(/\s+/g, ' ').trim();
  var lower = text.toLowerCase();
  var titleLower = title.toLowerCase();

  /* 0) NOISE GATES */
  if (PFC_STOCKTIP_RE.test(lower) || PFC_STOCKTIP_RE_EXTRA.test(lower)) return pfcIgnore_();
  if (PFC_EQUITY_RESEARCH_RE.test(lower)) return pfcIgnore_();   // v8.3: brokerage/equity-research calls
  if (PFC_INVEST_ADVICE_RE.test(lower)) return pfcIgnore_();     // v9.0: personal-finance listicles
  if (PFC_MF_RE.test(lower)) return pfcIgnore_();                // v9.1: mutual fund / NAV chatter
  if (PFC_SHARE_PRICE_RE.test(lower)) return pfcIgnore_();       // v9.3: share-price / investor-advice chatter
  if (pfcEquityNoise_(lower) && !PFC_HARD_EVENT_RE.test(lower)) return pfcIgnore_();   // v9.7: equity-market noise
  if (PFC_NON_LENDING_PROC_RE.test(lower)) return pfcIgnore_();                        // v9.8: ordinary procurement
  if (PFC_RETAIL_DEPOSIT_RE.test(lower)) return pfcIgnore_();                          // v10.7: retail deposit products
  if (PFC_RETAIL_INVEST_RE.test(lower)) return pfcIgnore_();                           // v10.8: SGB / retail investment products
  if (PFC_RESI_REALTY_RE.test(lower) &&                                                // v11.3: residential real estate
      !/\bpower\b|electricity|\bsolar\b|\bwind\b|transmission|discom|\bdisco?ms?\b|\bmwh?\b|\bgwh?\b|energy|\bpfc\b|power finance|\brec\b (limited|ltd)|data cent(re|er)|\bev\b charging|rooftop/.test(lower)) return pfcIgnore_();
  if (PFC_CRIME_BLOTTER_RE.test(lower) && !/\bnclt\b|insolven|wil+ful default|sarfaesi|\bfraud\b|forensic|\bed\b |enforcement directorate|money launder/.test(lower)) return pfcIgnore_();   // v10.9: crime blotter
  if (PFC_CEREMONY_RE.test(lower)) {                                                   // v11.2: drop ceremonial fluff only
    var _ca = pfcExtractAmount_(text);
    var _cm = lower.match(/(\d[\d,.]*)\s*(gw|mw)\b/);
    var _mw = _cm ? parseFloat(_cm[1].replace(/,/g, '')) * (_cm[2] === 'gw' ? 1000 : 1) : 0;
    var _big = (_ca.crore || 0) >= 100 || _mw >= 100 || /\bpfc\b|power finance|\brec\b (limited|ltd)/.test(lower);
    var _fluff = PFC_CEREMONY_FLUFF_RE.test(lower) || (/\brooftop\b/.test(lower) && !_cm);   // rooftop w/o any MW/GW = event, not project
    if (!_big && _fluff) return pfcIgnore_();
    // otherwise fall through: project inaugurations of any size route normally
  }
  if (PFC_CRIME_NOISE_RE.test(lower)) return pfcIgnore_();                             // v10.9: ordinary crime reporting
  if (pfcNonLatinHeadline_(item.title)) return pfcIgnore_();                           // v10.7: regional-language repost
  if (PFC_AIRLINE_OPS_RE.test(lower) && !PFC_AIRPORT_PROJECT_RE.test(lower)) return pfcIgnore_();   // v9.8: airline ops
  // v9.1 — non-infra industries (paper, textile, FMCG, hotels...) are outside PFC's
  // universe unless the story itself concerns power/energy assets (captive plant etc.)
  if (PFC_NON_INFRA_RE.test(lower) &&
      !/(captive|solar|wind|thermal|\bpower plant\b|renewable|green hydrogen|energy)/i.test(lower) &&
      !PFC_BORROWER_NAMES_RE.test(lower) && !PFC_PROMOTER_RE.test(lower)) return pfcIgnore_();
  if (PFC_STOCKTIP_SOFT_RE.test(lower) && !PFC_SUBSTANCE_RE.test(lower)) return pfcIgnore_();
  if (PFC_EQUITY_CHATTER_RE.test(titleLower)) return pfcIgnore_();
  if (PFC_RETAIL_RE.test(lower)) return pfcIgnore_();
  if (pfcForeignNoise_(lower)) return pfcIgnore_();

  var nexus = pfcIndiaNexus_(lower) || PFC_PROMOTER_RE.test(lower) ||
              (PFC_BORROWER_CODES_RE.test(text) && pfcIndiaNexus_(lower));

  /* 1) USER RULES (Radar Rules tab wins) */
  var rule = applyUserRules_(titleLower, lower);
  if (rule && rule.radar === 'IGNORE') return pfcIgnore_();
  var forced = rule && rule.radar ? rule.radar : '';
  var forcedImp = rule ? rule.importance : '';

  var out = { radar: '', importance: '', bus: null, watch: null, borr: null, tre: null, comp: null, reg: null };

  /* 2) REGULATORY — SEBI / RBI / CERC / Companies Act / Income Tax ... */
  if (!forced || forced === 'REGULATORY') {
    var reg = pfcRegulatoryHit_(lower, title, text);
    if (reg) {
      out.radar = 'REGULATORY';
      out.reg = reg;
      out.importance = forcedImp || importanceRegulatory_(reg, lower);
      return pfcSpecCap_(out, lower, forcedImp);
    }
  }

  /* 3) COMPETITOR — REC / IREDA / IRFC / HUDCO / NaBFID / IIFCL ... */
  if (!forced || forced === 'COMPETITOR') {
    var comp = pfcCompetitorHit_(lower, title, text);
    if (comp) {
      out.radar = 'COMPETITOR';
      out.comp = comp;
      out.importance = forcedImp || importanceCompetitor_(comp, lower);
      // a competitor's own print is also a Borrowing-radar benchmark
      if (comp.activity === 'Borrowing') {
        var cp = pfcFundingPrint_(lower, title, text);
        if (cp) { cp.issuer_class = 'Competitor'; out.borr = cp; }
      }
      return pfcSpecCap_(out, lower, forcedImp);
    }
  }

  /* 3) BORROWER WATCH — NCLT/IBC, downgrades, borrower's own borrowings, activity */
  var w = pfcCreditEventHit_(lower, title, text) ||     // v8.2: IBC / fraud / recovery / OTS / downgrade
          pfcNcltHit_(lower, title, text) ||
          pfcDowngradeHit_(lower, title, text) ||
          pfcBorrowerFundingHit_(lower, title, text) ||
          pfcWatchHit_(lower, title, text);

  /* 4) radar decision */
  var radar = forced;
  if (!radar) {
    if (w) radar = 'WATCH';
    else if (pfcLiquiditySignal_(lower)) radar = 'BORROWING';
    else if (pfcFundingPrint_(lower, title, text) || PFC_AAA_BOND_RE.test(lower)) radar = 'BORROWING';
    else {
      var km = kmMatch_(lower);
      var mkt = pfcMarketTheme_(lower, tag);
      if (km) radar = km.radar;
      // A real infra project outranks a loose macro theme: an item that is both a
      // power/infra project and vaguely "market" belongs in Potential Business.
      else if (pfcBusinessHit_(lower, title, text, tag)) radar = 'BUSINESS';
      else if (mkt) radar = 'TREASURY';
      else radar = 'IGNORE';
    }
  }
  if ((radar === 'BUSINESS' || radar === 'WATCH') && !forced && !nexus) radar = 'IGNORE';
  if (radar === 'IGNORE') return pfcIgnore_();
  out.radar = radar;

  /* 5) build the hit */
  if (radar === 'BORROWING') {
    var hit = pfcLiquiditySignal_(lower)
      ? buildLiquidityBorrowingHit_(lower, title, text)
      : pfcFundingPrint_(lower, title, text);
    if (!hit && PFC_AAA_BOND_RE.test(lower)) {
      var amt = pfcExtractAmount_(text);
      hit = { source: pfcEntity_(title), instrument: 'AAA corporate bond', amount: amt.raw || 'Not stated',
              est_cr: amt.crore, currency: amt.currency || 'INR', tenor: pfcTenor_(text),
              pricing: pricingSignal_(text),
              benefit: 'AAA corporate curve \u2014 direct pricing benchmark for PFC\'s next print.',
              action: 'RM desk: compare coupon/spread with PFC secondary levels before the next issuance.' };
    }
    if (!hit) {
      // v10.7: this was an unconditional catch-all, so anything that reached the
      // borrowing branch became a "Funding lead" - a song title with "Vrrr" in
      // it included. Require a real funding signal before inventing one.
      if (!/\b(raise[sd]?|raising|borrow(s|ed|ing)?|bonds?|\bncds?\b|debenture|loans?|credit line|line of credit|syndicat\w*|refinanc\w*|issuance|issues?|placement|\becb\b|term sheet|fund(ing|s)? (raise|plan|programme|program)|mobilis\w*|mobiliz\w*|tier[- ]?(i|ii|1|2)|commercial paper)\b/.test(lower)) return pfcIgnore_();
      var a2 = pfcExtractAmount_(text);
      hit = { source: pfcEntity_(title), instrument: 'Funding lead', amount: a2.raw || 'Not stated',
              est_cr: a2.crore, currency: a2.currency || 'Not stated', tenor: pfcTenor_(text),
              pricing: pricingSignal_(text), benefit: 'Routed to Borrowing.', action: 'RM desk: assess relevance.' };
    }
    hit.issuer_class = pfcIssuerClass_(text) || (PFC_AAA_BOND_RE.test(lower) ? 'AAA corporate' : '');
    // v8.0: the Borrowing radar carries only PFC, competitors, top-10 banks,
    // large NBFCs, MDBs, RBI/liquidity and AAA corporate-bond pricing.
    if (!forced && !hit.issuer_class && !pfcLiquiditySignal_(lower)) return pfcIgnore_();
    // AAA corporate pricing rarely names India in the headline; admit it unless
    // the story is explicitly foreign (the foreign gate already ran).
    var aaaPass = hit.issuer_class === 'AAA corporate' && !PFC_FOREIGN_GEO_RE.test(lower);
    // v8.5 — a Borrowing item must carry a positive India / PFC-universe anchor.
    // This is the reliable inverse of the foreign-country blocklist: "Burkina
    // Faso diaspora bond" has no anchor, so it is dropped whether or not the
    // country is named in any list.
    var anchored = pfcHasIndiaAnchor_(lower, text);
    var mdbPass = hit.issuer_class === 'MDB / bilateral' && !PFC_FOREIGN_GEO_RE.test(lower) && anchored;
    var aaaOK   = aaaPass && !PFC_FOREIGN_GEO_RE.test(lower);   // AAA benchmark: block only if explicitly foreign
    if (!forced && !anchored && !mdbPass && !aaaOK) return pfcIgnore_();
    out.borr = hit;
    out.importance = forcedImp || importanceBorrowing_(hit, lower);
    if (hit.issuer_class === 'AAA corporate' && out.importance === 'Low') out.importance = 'Medium';

  } else if (radar === 'WATCH') {
    if (!w) {
      var a3 = pfcExtractAmount_(text);
      w = { borrower: pfcEntity_(title), subtype: 'Activity', cls: pfcBorrowerClass_(text),
            signal: title.slice(0, 140), est_cr: a3.crore, mw: pfcMw_(text),
            why: 'Routed to Borrower Watch.', action: 'LPCU: verify whether the entity is a PFC borrower.' };
    }
    out.watch = w;
    out.importance = forcedImp || importanceWatch_(w, lower);

  } else if (radar === 'TREASURY') {
    var theme = pfcMarketTheme_(lower, tag) || 'Macro / Market';
    var rd = pfcRateDir_(lower);
    var idir = pfcInrDir_(lower);
    var tmpl = pfcMarketImpact_(theme, rd, idir);
    out.tre = {
      theme: theme,
      region: /india|rbi|rupee|g[- ]?sec|budget|ministry of finance/.test(lower) ? 'India' : 'Global',
      signal: title.slice(0, 120), rate_dir: rd, inr_dir: idir,
      impact: tmpl.impact, hedging: tmpl.hedging, instrument: tmpl.instrument,
      action: 'Circulate to RM/Treasury desk; log in ALCO monitoring; verify against Bloomberg/RBI release.'
    };
    out.importance = forcedImp || importanceTreasury_(theme, rd, idir, lower);

  } else if (radar === 'COMPETITOR') {
    var c2 = pfcCompetitorHit_(lower, title, text);
    if (!c2) return pfcIgnore_();
    out.comp = c2;
    out.importance = forcedImp || importanceCompetitor_(c2, lower);

  } else {  // BUSINESS
    var bhit = pfcBusinessHit_(lower, title, text, tag);
    if (!bhit) {
      var a4 = pfcExtractAmount_(text);
      bhit = { entity: pfcEntity_(title), sector: pfcSector_(lower, tag), state: pfcStateOf_(text),
               size_cr: a4.crore, exposure_cr: null, mw: pfcMw_(text), stage: 'Rule-routed lead',
               why: 'Routed to Potential Business.', product: 'Term loan / project finance',
               action: 'BD/Projects: verify relevance and financing window.', risks: '' };
    }
    out.bus = bhit;
    out.importance = forcedImp || importanceBusiness_(bhit, lower);
  }

  return pfcSpecCap_(out, lower, forcedImp);
}

/** Speculation cap + Keyword Master floor, applied to every radar. */
function pfcSpecCap_(out, lower, forcedImp) {
  if (out.importance === 'High' && !forcedImp && PFC_SPECULATIVE_RE.test(lower) && !PFC_EVENT_RE.test(lower)) {
    out.importance = 'Medium';
  }
  var nonPeerRating = out.borr && out.borr.instrument === 'Rating action' &&
      !/power finance|\bpfc\b|\brec\b|\bireda\b|\birfc\b|\bhudco\b|\bnabfid\b|\biifcl\b|\bnbfc\b/.test(lower);
  if (out.importance === 'Low' && !forcedImp && !nonPeerRating && kmMatch_(lower) && pfcNoisePenalty_(lower) === 0) {
    out.importance = 'Medium';
  }
  return out;
}

function pfcIgnore_() {
  return { radar: 'IGNORE', importance: '', bus: null, watch: null, borr: null, tre: null, comp: null };
}

/* ============================ AI (optional) =============================== */

var SYSTEM_PROMPT =
'You are a credit-origination, borrower-monitoring, resource-mobilisation and treasury analyst at Power Finance Corporation Ltd (PFC), a Government of India Maharatna NBFC-IFC lending to power and infrastructure sectors and borrowing globally.\n' +
'Classify each news item into exactly one radar with an importance rating:\n' +
'- BUSINESS: a possible LENDING opportunity for PFC (project tenders, PPAs, approvals, financial closure, capex, debt-seeking). Importance High = concrete lending window or >= Rs 1,000 crore / >= 500 MW; Medium = early-stage or smaller; Low = background.\n' +
'- WATCH: news about an EXISTING PFC borrower or borrower group. Importance High = operational progress (commissioning, COD, synchronisation) OR halt/adverse (shutdown, outage, NCLT, default, downgrade); Medium = routine activity; Low = PR.\n' +
'- BORROWING: funding prints, MDB/bilateral lines, and MARKET LIQUIDITY conditions relevant to PFC fund-raising. Importance High = liquidity surplus/deficit signals (VRR/VRRR, OMO, CRR) or prints >= Rs 5,000 crore or new funding windows; Medium = routine peer prints; Low = small/ambiguous.\n' +
'- TREASURY: rates, FX, policy and macro signals. Importance High = rate decisions (especially rate cuts and rate-cut-relevant news), CRR/SLR changes, sharp INR moves, sovereign rating actions; Medium = directional trends; Low = background.\n' +
'- IGNORE: no India nexus or no relevance to PFC.\n' +
'Keep every text field under 25 words. est_cr is the amount in Rs crore (number) or null. Respond with a JSON array ONLY.\n\n' +
'Output schema per item:\n' +
'{"id": <number>, "radar": "BUSINESS"|"WATCH"|"BORROWING"|"TREASURY"|"IGNORE", "importance": "High"|"Medium"|"Low",\n' +
' "bus": {"entity": str, "sector": str, "state": str, "size_cr": number|null, "exposure_cr": number|null, "why": str, "product": str, "action": str, "risks": str} | null,\n' +
' "watch": {"borrower": str, "type": str, "signal": str, "est_cr": number|null, "why": str, "action": str} | null,\n' +
' "borr": {"source": str, "instrument": str, "amount": str, "est_cr": number|null, "currency": str, "tenor": str, "pricing": str, "benefit": str, "action": str} | null,\n' +
' "tre": {"theme": str, "region": str, "signal": str, "rate_dir": str, "inr_dir": str, "impact": str, "hedging": str, "instrument": str, "action": str} | null}';

function apiKey_() {
  var key = PropertiesService.getScriptProperties().getProperty(CFG.PROP_API_KEY);
  if (!key) throw new Error('API key not set. Menu > Set API key, or switch AI_PROVIDER to LOCAL in Settings.');
  return key;
}

function pfcAiProvider_() {
  var p = getSetting_('AI_PROVIDER').toUpperCase();
  return p === 'GEMINI' ? 'GEMINI' : p === 'ANTHROPIC' ? 'ANTHROPIC' : 'LOCAL';
}

function pfcAiModel_() {
  var m = getSetting_('AI_MODEL');
  if (m) return m;
  return pfcAiProvider_() === 'GEMINI' ? 'gemini-2.0-flash' : 'claude-haiku-4-5';
}

function callAnthropic_(userMsg, systemPrompt, maxTokens) {
  var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { 'x-api-key': apiKey_(), 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: pfcAiModel_(),
      max_tokens: maxTokens || 6000,
      system: systemPrompt || SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }]
    })
  });
  var code = resp.getResponseCode();
  var body = resp.getContentText();
  if (code !== 200) throw new Error('Anthropic HTTP ' + code + ': ' + body.slice(0, 300));
  var data = JSON.parse(body);
  return data.content.map(function (c) { return c.text || ''; }).join('');
}

function callGemini_(userMsg, systemPrompt, maxTokens) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + pfcAiModel_() + ':generateContent?key=' + apiKey_();
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt || SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { maxOutputTokens: maxTokens || 6000, responseMimeType: 'application/json' }
    })
  });
  var code = resp.getResponseCode();
  var body = resp.getContentText();
  if (code !== 200) throw new Error('Gemini HTTP ' + code + ': ' + body.slice(0, 300));
  var data = JSON.parse(body);
  return data.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('');
}

/** Batch classify. User rules always run first, even in AI mode. */
function classifyBatch_(batch) {
  var results = new Array(batch.length);
  var toAi = [];

  var provider = pfcAiProvider_();          // once per batch, not once per item
  batch.forEach(function (item, index) {
    if (provider === 'LOCAL') { results[index] = wrapLocal_(item, index); return; }
    // AI mode: rule-forced or rule-ignored items resolve locally (deterministic).
    var title = String(item.title || '').toLowerCase();
    var lower = (title + ' ' + String(item.snippet || '').toLowerCase());
    var rule = applyUserRules_(title, lower);
    if (rule && rule.radar) { results[index] = wrapLocal_(item, index); }
    else toAi.push({ item: item, index: index });
  });

  if (toAi.length) {
    var items = toAi.map(function (e, k) {
      return '[' + k + '] (' + e.item.tag + ') ' + e.item.title + (e.item.snippet ? '\nSnippet: ' + e.item.snippet : '');
    }).join('\n\n');
    var user = 'Classify these ' + toAi.length + ' news items. IDs are in brackets.\n\n' + items;
    var raw = provider === 'GEMINI' ? callGemini_(user, SYSTEM_PROMPT, 6000)
                                            : callAnthropic_(user, SYSTEM_PROMPT, 6000);
    var parsed = parseJson_(raw);
    parsed.forEach(function (p) {
      var e = toAi[p.id];
      if (!e) return;
      // Importance-only user rules still override AI importance.
      var title = String(e.item.title || '').toLowerCase();
      var lower = (title + ' ' + String(e.item.snippet || '').toLowerCase());
      var rule = applyUserRules_(title, lower);
      if (rule && rule.importance) p.importance = rule.importance;
      p.id = e.index;
      results[e.index] = p;
    });
  }
  for (var i = 0; i < results.length; i++) {
    if (!results[i]) results[i] = { id: i, radar: 'IGNORE', importance: '', bus: null, watch: null, borr: null, tre: null };
  }
  return results;
}

function wrapLocal_(item, index) {
  var r = classifyLocal_(item);
  return { id: index, radar: r.radar, importance: r.importance,
           bus: r.bus, watch: r.watch, borr: r.borr, tre: r.tre, comp: r.comp, reg: r.reg };
}

/* ============================ CLASSIFY PENDING ============================ */

function classifyPending_() {
  var t0 = Date.now();
  pfcClearCaches_();

  var sh = sheet_(CFG.SHEETS.RAW);
  var n = sh.getLastRow() - 1;
  var zero = { classified: 0, bus: 0, watch: 0, borr: 0, tre: 0, errors: 0 };
  if (n < 1) return zero;

  /* v7.7 PERFORMANCE FIX
   * Old code read the ENTIRE Raw sheet (n x 11 cells) and rewrote n x 3 status
   * cells on EVERY pass of 500 items. With 10,874 raw rows that is ~150,000
   * cells per pass -> 95 seconds per pass -> 35 minutes for the sheet.
   * Now: read the status column only, find the pending block, and read/write
   * just that block (~2,000 x 11 and 2,000 x 3). ~20x less I/O.            */
  var statusCol = sh.getRange(2, 9, n, 1).getValues();
  var cap = pfcAiProvider_() === 'LOCAL' ? 2000 : getSettingNum_('MAX_CLASSIFY_PER_RUN');
  var rowsToDo = [];
  for (var i = 0; i < n && rowsToDo.length < cap; i++) {
    var s = String(statusCol[i][0] || '');
    if (s === '' || s === CFG.STATUS.NEW || s === CFG.STATUS.ERR) rowsToDo.push(i + 2);
  }
  if (!rowsToDo.length) { log_('INFO', 'CLASSIFY: nothing pending.'); return zero; }

  var first = rowsToDo[0];
  var last = rowsToDo[rowsToDo.length - 1];
  var span = last - first + 1;
  var data = sh.getRange(first, 1, span, CFG.RAW_HEADERS.length).getValues();

  var pending = rowsToDo.map(function (r) {
    var d = data[r - first];
    return { row: r, title: d[4], snippet: d[5], link: d[6], tag: d[7], pub: d[2], fetched: d[1] };
  });

  var busRows = [], watchRows = [], borrRows = [], treRows = [], compRows = [], regRows = [];
  var statusUpdates = [];
  var counts = { classified: 0, bus: 0, watch: 0, borr: 0, tre: 0, comp: 0, reg: 0, errors: 0 };
  var batchSize = getSettingNum_('BATCH_SIZE');

  for (var b = 0; b < pending.length; b += batchSize) {
    var batch = pending.slice(b, b + batchSize);
    var out;
    try { out = classifyBatch_(batch); }
    catch (e) {
      log_('ERROR', 'Batch classify failed: ' + e.message);
      batch.forEach(function (p) { statusUpdates.push([p.row, CFG.STATUS.ERR, '', '']); counts.errors++; });
      continue;
    }
    out.forEach(function (r) {
      var p = batch[r.id];
      if (!p) return;
      // never fabricate 'today': use the published date, else the fetched date
      var dateVal = p.pub instanceof Date ? p.pub
                  : (p.pub ? new Date(p.pub)
                  : (p.fetched instanceof Date ? p.fetched : new Date()));
      var imp = pfcImp_(r.importance) || 'Low';
      try {
        if (r.radar === 'BUSINESS' && r.bus) {
          busRows.push([dateVal, imp, r.bus.entity, r.bus.sector, r.bus.state || '',
                        r.bus.size_cr, r.bus.exposure_cr, r.bus.why, r.bus.product,
                        r.bus.action, r.bus.risks || '', p.link, p.title]);
          counts.bus++;
        } else if (r.radar === 'WATCH' && r.watch) {
          // v9.1 — New Capex at a borrower is simultaneously a lending lead:
          // cross-post into Potential Business so the BD desk sees it too.
          if (/new capex/i.test(String(r.watch.subtype))) {
            busRows.push([dateVal, imp, r.watch.borrower, '', '', r.watch.est_cr, '',
                          'Borrower capex — concurrent lending lead. ' + String(r.watch.why || ''),
                          'Term loan / project finance', 'BD: engage sponsor on funding plan.', '', p.link, p.title]);
            counts.bus++;
          }
          watchRows.push([dateVal, imp, r.watch.borrower, r.watch.subtype, r.watch.cls, r.watch.signal,
                          r.watch.est_cr, r.watch.why, r.watch.action, p.link, p.title]);
          counts.watch++;
        } else if (r.radar === 'BORROWING' && r.borr) {
          borrRows.push([dateVal, imp, r.borr.source, r.borr.issuer_class || '', r.borr.instrument,
                         r.borr.amount, r.borr.est_cr, r.borr.currency, r.borr.tenor,
                         r.borr.pricing || 'Not stated', r.borr.benefit, r.borr.action, p.link, p.title]);
          counts.borr++;
        } else if (r.radar === 'REGULATORY' && r.reg) {
          regRows.push([dateVal, imp, r.reg.regulator, r.reg.instrument, r.reg.appliesAs,
                        r.reg.theme, r.reg.changed, r.reg.implication, r.reg.owner,
                        r.reg.deadline || 'Not stated', p.link, p.title]);
          counts.reg = (counts.reg || 0) + 1;
        } else if (r.radar === 'COMPETITOR' && r.comp) {
          compRows.push([dateVal, imp, r.comp.competitor, r.comp.activity, r.comp.details,
                         r.comp.est_cr, r.comp.pricing, r.comp.implication, r.comp.action, p.link, p.title]);
          counts.comp++;
          if (r.borr) {   // a peer print is also a Borrowing benchmark
            borrRows.push([dateVal, imp, r.comp.competitor, 'Competitor', r.borr.instrument,
                           r.borr.amount, r.borr.est_cr, r.borr.currency, r.borr.tenor,
                           r.borr.pricing || 'Not stated', r.borr.benefit, r.borr.action, p.link, p.title]);
            counts.borr++;
          }
        } else if (r.radar === 'TREASURY' && r.tre) {
          treRows.push([dateVal, imp, r.tre.theme, r.tre.region, r.tre.signal, r.tre.rate_dir,
                        r.tre.inr_dir, r.tre.impact, r.tre.hedging, r.tre.instrument,
                        r.tre.action, p.link, p.title]);
          counts.tre++;
        }
        statusUpdates.push([p.row, CFG.STATUS.DONE, r.radar, r.radar === 'IGNORE' ? '' : imp]);
        counts.classified++;
      } catch (e) {
        statusUpdates.push([p.row, CFG.STATUS.ERR, '', '']);
        counts.errors++;
      }
    });
  }

  if (busRows.length)   appendRows_(CFG.SHEETS.BUS, busRows);
  if (watchRows.length) appendRows_(CFG.SHEETS.WATCH, watchRows);
  if (borrRows.length)  appendRows_(CFG.SHEETS.BORR, borrRows);
  if (treRows.length)   appendRows_(CFG.SHEETS.TRE, treRows);
  if (compRows.length)  appendRows_(CFG.SHEETS.COMP, compRows);
  if (regRows.length)   appendRows_(CFG.SHEETS.REG, regRows);

  // write statuses for the pending BLOCK only (not the whole sheet)
  var block = [];
  for (var k = 0; k < span; k++) block.push([data[k][8], data[k][9], data[k][10]]);
  statusUpdates.forEach(function (u) {
    var idx = u[0] - first;
    if (idx >= 0 && idx < span) block[idx] = [u[1], u[2], u[3]];
  });
  sh.getRange(first, 9, span, 3).setValues(block);

  log_('INFO', 'CLASSIFY: ' + counts.classified + ' routed in ' + (Date.now() - t0) + ' ms (block rows ' + first + '-' + last + ').');
  return counts;
}

function appendRows_(name, rows) {
  var out = sheet_(name);
  out.getRange(out.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

/** DEPRECATED in v7.7 (whole-sheet rewrite was the timeout cause). Kept unused. */
function pfcWriteStatuses_(sh, statusUpdates, totalRows) {
  if (!statusUpdates.length) return;
  var current = sh.getRange(2, 9, totalRows, 3).getValues();  // Status, Radar, Importance
  statusUpdates.forEach(function (u) {
    var idx = u[0] - 2;
    if (idx >= 0 && idx < current.length) { current[idx][0] = u[1]; current[idx][1] = u[2]; current[idx][2] = u[3]; }
  });
  sh.getRange(2, 9, totalRows, 3).setValues(current);
}

/* ============================ SORTING ===================================== */

var PFC_IMP_RANK = { 'High': 0, 'Medium': 1, 'Low': 2, '': 3 };

/** Sort each register: High first, then biggest amount, then newest. */
function sortOutputs_() {
  log_('INFO', 'SORT: starting.');
  [
    { name: CFG.SHEETS.BUS,   amtCol: 5 },   // 0-based: Est Size Cr = col 6
    { name: CFG.SHEETS.WATCH, amtCol: 5 },
    { name: CFG.SHEETS.BORR,  amtCol: 5 },
    { name: CFG.SHEETS.TRE,   amtCol: -1 },
    { name: CFG.SHEETS.COMP,  amtCol: 5 },
    { name: CFG.SHEETS.REG,   amtCol: -1 }
  ].forEach(function (spec) {
    var sh = SpreadsheetApp.getActive().getSheetByName(spec.name);
    if (!sh || sh.getLastRow() < 3) return;
    var rng = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn());
    var vals = rng.getValues();
    vals.sort(function (a, b) {
      var d = (PFC_IMP_RANK[String(a[1])] !== undefined ? PFC_IMP_RANK[String(a[1])] : 3)
            - (PFC_IMP_RANK[String(b[1])] !== undefined ? PFC_IMP_RANK[String(b[1])] : 3);
      if (d) return d;
      if (spec.amtCol >= 0) {
        var av = Number(a[spec.amtCol]) || 0, bv = Number(b[spec.amtCol]) || 0;
        if (bv !== av) return bv - av;
      }
      var ad = a[0] instanceof Date ? a[0].getTime() : 0;
      var bd = b[0] instanceof Date ? b[0].getTime() : 0;
      return bd - ad;
    });
    rng.setValues(vals);
  });
  log_('INFO', 'Registers sorted: High importance first, biggest amounts next, newest last tiebreak.');
}

/** Colour the Importance column on all four registers. */
function applyImportanceFormatting_() {
  [CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE, CFG.SHEETS.COMP, CFG.SHEETS.REG].forEach(function (name) {
    var sh = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sh) return;
    var rules = [];
    var rng = sh.getRange(2, 2, 999, 1);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('High')
      .setBackground('#f4c7c3').setBold(true).setRanges([rng]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Medium')
      .setBackground('#fce8b2').setRanges([rng]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Low')
      .setBackground('#d9ead3').setRanges([rng]).build());
    sh.setConditionalFormatRules(rules);
    try { if (!sh.getFilter()) sh.getRange(1, 1, 1000, sh.getLastColumn()).createFilter(); } catch (e) {}
  });
}

/* ============================ DASHBOARD =================================== */

function buildDashboard_() {
  var sh = sheet_(CFG.SHEETS.DASH);
  sh.clear();
  var R = "'" + CFG.SHEETS.RAW + "'";
  var tabs = [
    ['Potential Business', CFG.SHEETS.BUS],
    ['Borrower Watch',     CFG.SHEETS.WATCH],
    ['Borrowing Radar',    CFG.SHEETS.BORR],
    ['Treasury Radar',     CFG.SHEETS.TRE],
    ['Competitor Radar',   CFG.SHEETS.COMP],
    ['Regulatory Radar',   CFG.SHEETS.REG]
  ];
  sh.getRange('A1').setValue('PFC NEWS RADAR DASHBOARD (PFC-NRD)').setFontWeight('bold').setFontSize(14);
  sh.getRange('A2').setValue('Last refresh:');
  sh.getRange('B2').setValue(nowStr_());
  sh.getRange('A4:E4').setValues([['Radar', 'High', 'Medium', 'Low', 'Total']])
    .setFontWeight('bold').setBackground('#1a3c6e').setFontColor('#ffffff');
  tabs.forEach(function (t, i) {
    var row = 5 + i;
    var S = "'" + t[1] + "'";
    sh.getRange(row, 1).setValue(t[0]);
    sh.getRange(row, 2).setFormula('=COUNTIF(' + S + '!B2:B,"High")');
    sh.getRange(row, 3).setFormula('=COUNTIF(' + S + '!B2:B,"Medium")');
    sh.getRange(row, 4).setFormula('=COUNTIF(' + S + '!B2:B,"Low")');
    sh.getRange(row, 5).setFormula('=COUNTA(' + S + '!A2:A)');
  });
  sh.getRange('A10').setValue('Raw pipeline').setFontWeight('bold');
  sh.getRange('A11').setValue('Total fetched');
  sh.getRange('B11').setFormula('=COUNTA(' + R + '!A2:A)');
  sh.getRange('A12').setValue('Pending (NEW)');
  sh.getRange('B12').setFormula('=COUNTIF(' + R + '!I2:I,"NEW")');
  sh.getRange('A13').setValue('Errors');
  sh.getRange('B13').setFormula('=COUNTIF(' + R + '!I2:I,"ERROR")');
  sh.getRange('A14').setValue('Ignored');
  sh.getRange('B14').setFormula('=COUNTIF(' + R + '!J2:J,"IGNORE")');
  sh.getRange(4, 1, 6, 5).setBorder(true, true, true, true, true, true);
  sh.setColumnWidth(1, 180);
}

/* ============================ DAILY / WEEKLY TABS + EMAILS ================ */

var PFC_SEGMENTS = [
  { title: 'BUSINESS \u2014 LENDING LEADS', sheet: CFG.SHEETS.BUS,   color: '#1a3c6e',
    metaCols: [[3, ''], [4, ''], [5, ''], [6, '\u20B9Cr: ']],  recipKey: 'MAIL_BUSINESS' },
  { title: 'BORROWER \u2014 EXISTING BOOK',    sheet: CFG.SHEETS.WATCH, color: '#7a1fa2',
    metaCols: [[3, ''], [4, ''], [5, ''], [7, '\u20B9Cr: ']],  recipKey: 'MAIL_WATCH' },
  { title: 'BORROWINGS \u2014 FUNDING & LIQUIDITY',  sheet: CFG.SHEETS.BORR,  color: '#0b6e4f',
    metaCols: [[3, ''], [4, ''], [5, ''], [10, '']],           recipKey: 'MAIL_BORROWING' },
  { title: 'TREASURY \u2014 MARKET SIGNALS',         sheet: CFG.SHEETS.TRE,   color: '#8a1f1f',
    metaCols: [[3, ''], [6, 'Rates: '], [7, 'INR: ']],         recipKey: 'MAIL_TREASURY' },
  { title: 'PEERS \u2014 PEER LENDERS',   sheet: CFG.SHEETS.COMP,  color: '#0f5c8c',
    metaCols: [[3, ''], [4, ''], [6, '\u20B9Cr: '], [7, '']],  recipKey: 'MAIL_COMPETITOR' },
  { title: 'REGULATORY',              sheet: CFG.SHEETS.REG,   color: '#6a4a1f',
    metaCols: [[3, ''], [4, ''], [5, ''], [10, '']],           recipKey: 'MAIL_REGULATORY' }
];

function pfcTokens_(s) {
  return String(s || '').toLowerCase()
    .replace(/,/g, '')                       // 20,457 -> 20457 (the number is the strongest fingerprint)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .map(function (w) { return w.replace(/(ments?|ings?|ed|es|s)$/, '').replace(/e$/, ''); })  // approves/approved/approve -> approv
    .filter(function (w) { return w.length >= 3 || /^\d+$/.test(w); });
}

/** Same story if: high token overlap, OR same money amount + same lead entity. */
function pfcIsDup_(a, b) {
  var sim = pfcSim_(a.tokens, b.tokens);
  if (sim >= 0.62) return true;
  if (a.cr && b.cr && a.cr === b.cr && a.cr >= 50) {
    if (a.tokens[0] && a.tokens[0] === b.tokens[0]) return true;   // NTPC + 20457 twice = one story
    if (sim >= 0.4) return true;
  }
  return false;
}

function pfcSim_(a, b) {
  if (!a.length || !b.length) return 0;
  var setB = {};
  b.forEach(function (w) { setB[w] = true; });
  var inter = a.filter(function (w) { return setB[w]; }).length;
  return inter / Math.min(a.length, b.length);
}

/** v7.1 — the CMD's brief shows actionable items only (default High + Medium).
 *  Settings > MIN_IMPORTANCE = High | Medium | Low. Registers keep everything. */
function pfcMinImp_() {
  var m = pfcImp_(getSetting_('MIN_IMPORTANCE'));
  return m || 'Medium';
}

/** v7.1 — dedupe ACROSS radars for tabs/emails so one story never appears twice.
 *  Priority when the same story lands in two radars: Watch > Business >
 *  Borrowing > Treasury (the most specific home wins). */
var PFC_SEG_PRIORITY = [1, 4, 5, 0, 2, 3];   // WATCH>COMPETITOR>REGULATORY>BUSINESS>BORROWING>TREASURY

function collectAllSegments_(sinceMs, cap) {
  var sets = PFC_SEGMENTS.map(function (seg) { return segmentCollect_(seg, sinceMs, cap); });
  var keptItems = [];
  PFC_SEG_PRIORITY.forEach(function (si) {
    sets[si] = sets[si].filter(function (it) {
      var dup = keptItems.some(function (k) { return pfcIsDup_(k, it); });
      if (dup) return false;
      keptItems.push(it);
      return true;
    });
  });
  return sets;
}

/** Collect items from one register within the window: High first, deduped. */
function segmentCollect_(seg, sinceMs, cap) {
  var sh = SpreadsheetApp.getActive().getSheetByName(seg.sheet);
  if (!sh || sh.getLastRow() < 2) return [];
  var lastCol = sh.getLastColumn();
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, lastCol).getValues();
  var items = [];
  var suppressed = 0;
  var minRank = PFC_IMP_RANK[pfcMinImp_()];
  vals.forEach(function (r) {
    var d = r[0] instanceof Date ? r[0].getTime() : 0;
    if (d < sinceMs) return;
    var headline = String(r[lastCol - 1] || '');
    var link = String(r[lastCol - 2] || '');
    var meta = seg.metaCols.map(function (mc) {
      var v = r[mc[0] - 1];
      if (v === '' || v == null || v === 'NEUTRAL' || v === 'Not stated') return '';   // v7.1: no empty clutter
      return mc[1] + v;
    }).filter(Boolean).join(' | ');
    var imp = String(r[1] || 'Low');
    if (PFC_IMP_RANK[imp] > minRank) { suppressed++; return; }                          // v7.1: Low filtered out
    items.push({ date: d, imp: imp, headline: headline, link: link, meta: meta,
                 tokens: pfcTokens_(headline), cr: pfcExtractAmount_(headline).crore });
  });
  items.sort(function (a, b) {
    var d = (PFC_IMP_RANK[a.imp] !== undefined ? PFC_IMP_RANK[a.imp] : 3)
          - (PFC_IMP_RANK[b.imp] !== undefined ? PFC_IMP_RANK[b.imp] : 3);
    return d || (b.date - a.date);
  });
  var kept = [];
  for (var i = 0; i < items.length && kept.length < cap; i++) {
    var dup = kept.some(function (k) { return pfcIsDup_(k, items[i]); });
    if (!dup) kept.push(items[i]);
  }
  kept.suppressed = suppressed;
  return kept;
}

var PFC_SEG_COLORS = { 0: '#1a3c6e', 1: '#7a1fa2', 2: '#0b6e4f', 3: '#8a1f1f' };
var PFC_IMP_BG = { High: '#f4c7c3', Medium: '#fce8b2', Low: '#d9ead3' };

/** v7.2 — email-grade formatting for the radar SHEET tabs, written in BATCH.
 *  v6.8 styled cell-by-cell (~14 API calls per row) and blew Google's 6-minute
 *  execution limit. This builds full 2-D arrays and issues ~15 calls per tab. */
function buildRadarTab_(tabName, hours, label, cap) {
  log_('INFO', 'TAB: building ' + tabName + '.');
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  sh.clear();
  try { sh.getRange(1, 1, sh.getMaxRows(), 4).breakApart(); } catch (e) {}

  var sinceMs = Date.now() - hours * 3600000;
  var sets = collectAllSegments_(sinceMs, cap);
  var COLS = 4;

  var values = [], bgs = [], weights = [], sizes = [], colors = [], wraps = [], aligns = [];
  var merges = [];
  function row(v, bg, fw, fs, fc, wr, al) {
    values.push(v); bgs.push(bg); weights.push(fw); sizes.push(fs);
    colors.push(fc); wraps.push(wr); aligns.push(al);
  }
  function fill(x) { return [x, x, x, x]; }

  row(['PFC NEWS RADAR DASHBOARD (PFC-NRD) \u2014 ' + label + ' RADAR \u2014 ' + nowStr_(), '', '', ''],
      fill('#0e1b2c'), fill('bold'), fill(14), fill('#ffffff'), fill(false), fill('center'));
  merges.push(values.length);

  PFC_SEGMENTS.forEach(function (seg, si) {
    var items = sets[si];
    row(['', '', '', ''], fill('#ffffff'), fill('normal'), fill(10), fill('#1b2430'), fill(false), fill('left'));
    row([seg.title + '  (' + items.length + ' items)', '', '', ''],
        fill(seg.color), fill('bold'), fill(11), fill('#ffffff'), fill(false), fill('left'));
    merges.push(values.length);

    if (!items.length) {
      row(['', '\u2014 no ' + pfcMinImp_().toLowerCase() + '-or-higher items in this window \u2014', '', ''],
          fill('#ffffff'), fill('normal'), fill(10), fill('#999999'), fill(false), fill('left'));
      return;
    }
    items.forEach(function (it, i) {
      var alt = (i % 2) ? '#faf9f5' : '#ffffff';
      var bold = it.imp === 'High' ? 'bold' : 'normal';   // weight only; the grade is never printed
      var link = /^https?:\/\//.test(it.link)
        ? '=HYPERLINK("' + String(it.link).replace(/"/g, '') + '","Open \u2197")' : '';
      row([String(i + 1), it.headline, it.meta, link],
          [alt, alt, alt, alt],
          [bold, bold, 'normal', 'normal'],
          [9, 10, 9, 9],
          ['#1b2430', '#1b2430', '#666666', '#1a3c6e'],
          [false, true, true, false],
          ['center', 'left', 'left', 'center']);
    });
  });

  var n = values.length;
  var rng = sh.getRange(1, 1, n, COLS);
  rng.setValues(values);
  rng.setBackgrounds(bgs);
  rng.setFontWeights(weights);
  rng.setFontSizes(sizes);
  rng.setFontColors(colors);
  rng.setWraps(wraps);
  rng.setHorizontalAlignments(aligns);
  rng.setVerticalAlignment('middle');
  merges.forEach(function (r) { sh.getRange(r, 1, 1, COLS).merge(); });
  sh.setRowHeight(1, 40);
  sh.setColumnWidth(1, 70); sh.setColumnWidth(2, 520);
  sh.setColumnWidth(3, 300); sh.setColumnWidth(4, 80);
  sh.setFrozenRows(1);
  try { sh.setHiddenGridlines(true); } catch (e) {}
}

function buildDailyRadar()  { buildRadarTab_('Daily Radar',  getSettingNum_('PAMPHLET_HOURS') || 24, 'DAILY', 15); }
function buildWeeklyRadar() { buildRadarTab_('Weekly Radar', 168, 'WEEKLY', 30); }

function segmentHtml_(seg, items, dateStr, label) {
  var html = '<div style="font-family:Arial,sans-serif;max-width:720px">' +
    '<div style="background:' + seg.color + ';color:#fff;padding:12px 16px;font-size:16px;font-weight:bold">' +
    escapeHtml_(seg.title) + ' \u2014 ' + label.toUpperCase() + ' \u2014 ' + dateStr + '</div>';
  if (!items.length) {
    html += '<p style="padding:12px 16px">No items in this window.</p></div>';
    return html;
  }
  items.forEach(function (it) {
    html += '<div style="padding:10px 16px;border-bottom:1px solid #eee">' +
      '<a href="' + escapeHtml_(it.link) + '" style="color:#1a3c6e;font-weight:bold;text-decoration:none">' +
      escapeHtml_(it.headline) + '</a>' +
      (it.meta ? '<div style="color:#666;font-size:12px;margin-top:3px">' + escapeHtml_(it.meta) + '</div>' : '') +
      '</div>';
  });
  html += '<p style="color:#999;font-size:11px;padding:8px 16px">' + PFC_VERSION + ' \u2014 auto-generated. Verify before circulation.</p></div>';
  return html;
}

function segmentRecipients_(idx) {
  var v = getSetting_(PFC_SEGMENTS[idx].recipKey) || getSetting_('MAIL_TO');
  return v || Session.getActiveUser().getEmail();
}

/** v6.9 — ONE consolidated email carrying all four radar segments,
 *  styled to match the beautified sheet tabs. */
function combinedRadarHtml_(hours, label) {
  var sinceMs = Date.now() - hours * 3600000;
  var cap = hours >= 600 ? 50 : hours >= 168 ? 30 : 15;
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  var sets = collectAllSegments_(sinceMs, cap);
  var segData = PFC_SEGMENTS.map(function (seg, si) { return { seg: seg, items: sets[si] }; });

  var html = '<div style="font-family:Arial,sans-serif;max-width:760px;margin:auto;border:1px solid #ddd">' +
    '<div style="background:#0e1b2c;color:#fff;padding:18px 20px">' +
      '<div style="font-size:20px;font-weight:bold;letter-spacing:.5px">PFC NEWS RADAR DASHBOARD</div>' +
      '<div style="font-size:12px;color:#9fb3c8;margin-top:2px">' + label.toUpperCase() + ' RADAR \u2014 ' + dateStr + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;background:#f7f5ef"><tr>';
  segData.forEach(function (sd) {
    var hi = sd.items.filter(function (i) { return i.imp === 'High'; }).length;
    html += '<td style="padding:10px;text-align:center;border-right:1px solid #e5e0d5">' +
      '<div style="font-size:10px;font-weight:bold;color:' + sd.seg.color + ';letter-spacing:.5px">' +
      escapeHtml_(sd.seg.title.split(' \u2014 ')[0]) + '</div>' +
      '<div style="font-size:20px;font-weight:bold;color:#1b2430">' + sd.items.length + '</div>' +
      '<div style="font-size:10px;color:#b3261e;font-weight:bold">' + hi + ' High</div></td>';
  });
  html += '</tr></table>';

  segData.forEach(function (sd) {
    html += '<div style="background:' + sd.seg.color + ';color:#fff;padding:9px 16px;font-size:13px;font-weight:bold">' +
      escapeHtml_(sd.seg.title) + ' (' + sd.items.length + ')</div>';
    if (!sd.items.length) {
      html += '<p style="padding:10px 16px;color:#888;font-style:italic;margin:0">No items in this window.</p>';
      return;
    }
    sd.items.forEach(function (it, i) {
      html += '<div style="padding:9px 16px;border-bottom:1px solid #eee;background:' + (i % 2 ? '#faf9f5' : '#ffffff') + '">' +
        '<a href="' + escapeHtml_(it.link) + '" style="color:#1a3c6e;font-weight:bold;text-decoration:none;font-size:13px">' + escapeHtml_(it.headline) + '</a>' +
        (it.meta ? '<div style="color:#777;font-size:11px;margin-top:3px">' + escapeHtml_(it.meta) + '</div>' : '') +
        '</div>';
    });
  });
  html += '<p style="color:#999;font-size:10px;padding:10px 16px;margin:0;background:#f7f5ef">' + PFC_VERSION +
          ' \u2014 auto-generated intelligence. Verify before circulation.</p></div>';
  return html;
}

function sendCombinedRadar_(hours, label) {
  var to = getSetting_('MAIL_TO') || Session.getActiveUser().getEmail();
  if (!to) { log_('WARN', 'Combined radar: no recipient (set MAIL_TO in Settings).'); return; }
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  MailApp.sendEmail({ to: to, subject: 'PFC-NRD \u2014 ' + label + ' Radar \u2014 ' + dateStr,
                      htmlBody: combinedRadarHtml_(hours, label) });
  log_('INFO', 'Combined ' + label + ' radar sent to ' + to + '.');
}

function sendCombinedDaily()  { sendCombinedRadar_(getSettingNum_('PAMPHLET_HOURS') || 24, 'Daily'); }
function sendCombinedWeekly() { sendCombinedRadar_(168, 'Weekly'); }
function sendCombined30Day()  { sendCombinedRadar_(720, '30-Day'); }

function pfcMailMode_() {
  var m = getSetting_('MAIL_MODE').toUpperCase();
  return m === 'SEGMENTS' ? 'SEGMENTS' : 'COMBINED';
}

function sendSegmentRadar_(idx, hoursOverride) {
  var seg = PFC_SEGMENTS[idx];
  var hours = hoursOverride || getSettingNum_('PAMPHLET_HOURS') || 24;
  var label = hours >= 600 ? '30-Day' : hours >= 168 ? 'Weekly' : 'Daily';
  var cap = hours >= 600 ? 50 : hours >= 168 ? 30 : 15;
  var items = segmentCollect_(seg, Date.now() - hours * 3600000, cap);
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  var to = segmentRecipients_(idx);
  if (!to) { log_('WARN', 'No recipient for segment ' + seg.title); return; }
  MailApp.sendEmail({
    to: to,
    subject: 'PFC ' + seg.title.split(' \u2014 ')[0] + ' \u2014 ' + label + ' Radar \u2014 ' + dateStr,
    htmlBody: segmentHtml_(seg, items, dateStr, label)
  });
  log_('INFO', 'Sent ' + seg.title + ' (' + label + ') to ' + to + ' (' + items.length + ' items).');
}

function sendBusinessRadarNow()      { sendSegmentRadar_(0); }
function sendBorrowerWatchNow()      { sendSegmentRadar_(1); }
function sendBorrowingRadarNow()     { sendSegmentRadar_(2); }
function sendTreasuryRadarNow()      { sendSegmentRadar_(3); }
function sendAllWeeklyRadars()       { for (var i = 0; i < 4; i++) sendSegmentRadar_(i, 168); }

function dailyRadarRun() {
  buildDailyRadar();
  buildWeeklyRadar();
  try {
    if (pfcMailMode_() === 'SEGMENTS') { for (var i = 0; i < 4; i++) sendSegmentRadar_(i); }
    else sendCombinedDaily();
  } catch (e) { log_('ERROR', 'Daily send failed: ' + e.message); }
  try { publishDataToGitHub(); } catch (e) { log_('ERROR', 'Publish failed: ' + e.message); }
}

function weeklyRadarRun() {
  buildWeeklyRadar();
  try {
    if (pfcMailMode_() === 'SEGMENTS') sendAllWeeklyRadars();
    else sendCombinedWeekly();
  } catch (e) { log_('ERROR', 'Weekly send failed: ' + e.message); }
}

/* ==========================================================================
 * v6.1 — 30-DAY DEEP FETCH + 30-DAY RADAR TAB + EMAILS
 * --------------------------------------------------------------------------
 * deep30Fetch_() rebuilds EVERY feed (all default keyword scans, all
 * watchlist borrower-name queries, all My Keywords user searches, plus any
 * Settings feeds) with a 30-day Google News window (when:7d -> when:30d)
 * and a 30-day lookback cutoff, then classifies through the same
 * Radar Rules > built-in engine > importance pipeline.
 * deep30RadarRun() = fetch 30d + classify + sort + build tab + send 4 emails.
 * ========================================================================== */

/** Rewrite the Google News window in a feed URL (handles encoded form too). */
function pfcWiden30_(url) {
  return String(url)
    .replace(/when%3A7d/g, 'when%3A30d')
    .replace(/when:7d/g, 'when:30d');
}

/** All feeds — default keyword scans + watchlist names + user keywords +
 *  Settings feeds — widened to a 30-day window, deduped by URL. */
function deep30Feeds_() {
  var feeds = [];
  var seen = {};
  function add(f) {
    var u = pfcWiden30_(f.url);
    if (!seen[u]) { seen[u] = true; feeds.push({ tag: f.tag, url: u }); }
  }
  getFeeds_().forEach(add);        // Settings + user-keyword feeds
  defaultFeeds_().forEach(add);    // full default set incl. all watchlist chunks
  return feeds;
}

/** Fetch past 30 days across all keywords and borrower names. */
function deep30Fetch_() {
  pfcUserKwCache_ = null;
  pfcUserWatchReCache_ = null;
  var feeds = deep30Feeds_();
  toast_('30-day deep fetch: ' + feeds.length + ' feeds\u2026', 30);
  return fetchFeedsCore_(feeds, 90, 60);
}

function build30DayRadar() { buildRadarTab_('30-Day Radar', 720, '30-DAY', 50); }

function sendAll30DayRadars() { for (var i = 0; i < 4; i++) sendSegmentRadar_(i, 720); }

/* --------------------------------------------------------------------------
 * v6.6 — RESUMABLE 30-DAY RUN (fixes 'Exceeded maximum execution time')
 * Google caps each execution at ~6 minutes. deep30RadarRun now works in
 * time-budgeted stages (FETCH -> CLASSIFY -> FINISH), checkpoints progress in
 * Script Properties, and if the budget runs out it schedules itself to
 * continue automatically one minute later. No user action needed: press the
 * menu item ONCE and watch the Log tab; the run completes across 2-4
 * executions (~5-15 minutes total) and then sends the four emails.
 * -------------------------------------------------------------------------- */

var D30_KEY = 'D30_STATE';
var D30_BUDGET_MS = 150000;   // 2.5 min of work per execution; the rest is safety margin

function d30State_() {
  var raw = PropertiesService.getScriptProperties().getProperty(D30_KEY);
  return raw ? JSON.parse(raw) : null;
}
function d30Save_(st) { PropertiesService.getScriptProperties().setProperty(D30_KEY, JSON.stringify(st)); }
function d30Clear_() { PropertiesService.getScriptProperties().deleteProperty(D30_KEY); }

/** Menu entry. Starts fresh (or resumes a stuck run if one exists). */
function deep30RadarRun() {
  var ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName(CFG.SHEETS.RAW) || !ss.getSheetByName(CFG.SHEETS.SET)) runSetup();
  if (!d30State_()) d30Save_({ stage: 'FETCH', feedIndex: 0, added: 0, classified: 0, started: new Date().toISOString() });
  deep30Step_();
}

/** Continuation entry — called by the one-off trigger. */
function deep30Continue() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'deep30Continue') ScriptApp.deleteTrigger(t);
  });
  if (d30State_()) deep30Step_();
}

function deep30Step_() {
  var deadline = Date.now() + D30_BUDGET_MS;
  var st = d30State_();
  if (!st) return;
  pfcClearCaches_();

  try {
    if (st.stage === 'FETCH') {
      var feeds = deep30Feeds_();
      toast_('30-Day run: fetching feeds ' + st.feedIndex + '/' + feeds.length + '\u2026', 15);
      var r = fetchFeedsWindowed_(feeds, 90, 60, st.feedIndex, deadline);
      st.added += r.added;
      if (r.nextIndex >= 0) { st.feedIndex = r.nextIndex; d30Save_(st); return d30Defer_(st); }
      st.stage = 'CLASSIFY'; d30Save_(st);
      log_('INFO', '30-Day run: fetch complete, +' + st.added + ' new raw items. Classifying\u2026');
    }

    if (st.stage === 'CLASSIFY') {
      while (Date.now() < deadline) {
        var c = classifyPending_();
        st.classified += c.classified;
        d30Save_(st);
        if (c.classified === 0) { st.stage = 'FINISH'; d30Save_(st); break; }
      }
      if (st.stage !== 'FINISH') return d30Defer_(st);
      log_('INFO', '30-Day run: classification complete, ' + st.classified + ' items routed.');
    }

    if (st.stage === 'FINISH') {
      var d30tasks = st.tasks || ['SORT', 'D30', 'DASH', 'EMAIL', 'PUBLISH'];
      while (d30tasks.length && Date.now() < deadline) {
        var dt = d30tasks.shift();
        try { runFinishTask_(dt); }
        catch (e) { log_('ERROR', '30-Day task ' + dt + ' failed: ' + e.message); }
        st.tasks = d30tasks; d30Save_(st);
      }
      if (d30tasks.length) return d30Defer_(st);
      d30Clear_();
      toast_('30-Day Radar COMPLETE: +' + st.added + ' fetched, ' + st.classified + ' classified; tab built; 4 emails sent.', 10);
      log_('INFO', '30-Day run COMPLETE: +' + st.added + ' fetched, ' + st.classified + ' classified.');
    }
  } catch (e) {
    log_('ERROR', '30-Day step failed (' + st.stage + '): ' + e.message + ' \u2014 will retry via continuation.');
    d30Defer_(st);
  }
}

function d30Defer_(st) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'deep30Continue') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('deep30Continue').timeBased().after(60 * 1000).create();
  toast_('30-Day run: time budget reached at stage ' + st.stage + ' \u2014 auto-resuming in ~1 minute. Watch the Log tab.', 10);
  log_('INFO', '30-Day run checkpoint: stage=' + st.stage + ', feedIndex=' + (st.feedIndex || 0) + ', added=' + st.added + ', classified=' + st.classified + '. Continuation scheduled.');
}

/** Abort a stuck run and clear its continuation triggers. */
function cancel30DayRun() {
  d30Clear_();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'deep30Continue') ScriptApp.deleteTrigger(t);
  });
  toast_('30-Day run cancelled and checkpoints cleared.');
}

/** Optional schedule: 1st of every month, 9 am. */
function installMonthlyTrigger() {
  removeMonthlyTrigger();
  ScriptApp.newTrigger('deep30RadarRun').timeBased().onMonthDay(1).atHour(9).create();
  toast_('Monthly 30-Day Radar installed (1st, 9 am).');
}

function removeMonthlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'deep30RadarRun') ScriptApp.deleteTrigger(t);
  });
}

/* ==========================================================================
 * v6.2 — JSON WEB API FOR THE GITHUB DASHBOARD (doGet)
 * --------------------------------------------------------------------------
 * Deploy: Deploy > New deployment > Web app > Execute as: Me >
 *         Who has access: Anyone > copy the /exec URL into APPS_SCRIPT_URL
 *         at the top of PFC_Radar_Dashboard.html.
 * GET params: ?days=30 (window, default 30, max 90). Response schema matches
 * the dashboard's embedded snapshot: { generatedAt, sourceNote, items:[
 *   { r, i, d, t, l, s, f, x:{...register extras} } ] }
 * NOTE: 'Anyone' means the JSON is public to whoever has the URL.
 * ========================================================================== */

function doGet(e) {
  var days = Math.min(90, Math.max(1, Number(e && e.parameter && e.parameter.days) || 30));
  var includeRaw = e && e.parameter && e.parameter.raw === '1';
  var limit = Math.min(10000, Math.max(100, Number(e && e.parameter && e.parameter.limit) || 4000));
  var payload = buildApiPayload_(days, includeRaw, limit);
  var json = JSON.stringify(payload);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[A-Za-z_][A-Za-z0-9_]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function buildApiPayload_(days, includeRaw, limit) {
  var since = Date.now() - days * 86400000;
  var items = [];

  function dstr(v) {
    return v instanceof Date
      ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(v || '').slice(0, 10);
  }
  function num(v) { var n = Number(v); return Number.isFinite(n) && n !== 0 ? Math.round(n) : null; }
  function rowsOf(name) {
    var sh = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return [];
    return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
  }
  // v8.9 — media-house lookup: registers store only Link+Headline; the outlet
  // name lives in Raw News col D. Build a link->source map once and join it in,
  // so every dashboard card can show and rank its source.
  var srcByLink = {};
  (function () {
    var sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.RAW);
    if (!sh || sh.getLastRow() < 2) return;
    var vals = sh.getRange(2, 4, sh.getLastRow() - 1, 4).getValues();  // D..G: source,title,snippet,link
    for (var i = 0; i < vals.length; i++) {
      var lk = String(vals[i][3] || '');
      if (lk) srcByLink[lk] = String(vals[i][0] || '');
    }
  })();
  function srcOf(link) { return srcByLink[String(link || '')] || ''; }

  function inWindow(v) {
    var t = v instanceof Date ? v.getTime() : new Date(v).getTime();
    return !Number.isFinite(t) || t >= since;
  }

  function kw3_() {
    var out = [];
    for (var i = 0; i < arguments.length && out.length < 3; i++) {
      var v = String(arguments[i] || '').trim();
      if (!v || v === '-') continue;
      var dup = false;
      for (var j = 0; j < out.length; j++) if (out[j].toLowerCase() === v.toLowerCase()) dup = true;
      if (!dup) out.push(v);
    }
    return out;
  }

  rowsOf(CFG.SHEETS.BUS).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'BUSINESS', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[12] || ''),
      l: String(r[11] || ''), s: srcOf(r[11]), f: '',
      kw: kw3_(r[3], r[4], r[8]),
      x: { sec: String(r[3] || ''), st: String(r[4] || ''), cr: num(r[5]), exp: num(r[6]),
           why: String(r[7] || ''), prod: String(r[8] || '') } });
  });
  rowsOf(CFG.SHEETS.WATCH).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'WATCH', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[10] || ''),
      l: String(r[9] || ''), s: srcOf(r[9]), f: '',
      kw: kw3_(r[2], r[3]),
      x: { bor: String(r[2] || ''), sub: String(r[3] || ''), cls: String(r[4] || ''),
           cr: num(r[6]), why: String(r[7] || '') } });
  });
  rowsOf(CFG.SHEETS.BORR).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'BORROWING', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[13] || ''),
      l: String(r[12] || ''), s: srcOf(r[12]), f: '',
      kw: kw3_(r[2], r[4]),
      x: { src: String(r[2] || ''), icls: String(r[3] || ''), inst: String(r[4] || ''),
           amt: String(r[5] || ''), cr: num(r[6]), ten: String(r[8] || ''),
           cpn: String(r[9] || ''), ben: String(r[10] || '') } });
  });
  rowsOf(CFG.SHEETS.TRE).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'TREASURY', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[12] || ''),
      l: String(r[11] || ''), s: srcOf(r[11]), f: '',
      kw: kw3_(r[2]),
      x: { th: String(r[2] || ''), rt: String(r[5] || ''), inr: String(r[6] || ''),
           imp: String(r[7] || ''), hed: String(r[8] || '') } });
  });
  rowsOf(CFG.SHEETS.COMP).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'COMPETITOR', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[10] || ''),
      l: String(r[9] || ''), s: srcOf(r[9]), f: '',
      kw: kw3_(r[2], r[3]),
      x: { comp: String(r[2] || ''), act: String(r[3] || ''), det: String(r[4] || ''),
           cr: num(r[5]), terms: String(r[6] || ''), why: String(r[7] || '') } });
  });
  rowsOf(CFG.SHEETS.REG).forEach(function (r) {
    if (!inWindow(r[0])) return;
    items.push({ r: 'REGULATORY', i: String(r[1] || 'Low'), d: dstr(r[0]), t: String(r[11] || ''),
      l: String(r[10] || ''), s: srcOf(r[10]), f: '',
      kw: kw3_(r[2], r[5]),
      x: { reg: String(r[2] || ''), inst: String(r[3] || ''), appl: String(r[4] || ''),
           th: String(r[5] || ''), chg: String(r[6] || ''), impl: String(r[7] || ''),
           owner: String(r[8] || ''), due: String(r[9] || '') } });
  });

  // Optional: include still-unrouted Raw News rows (?raw=1) so dashboard totals
  // reconcile with the sheet's full capture, not just the four registers.
  if (includeRaw) {
    rowsOf(CFG.SHEETS.RAW).forEach(function (r) {
      if (!inWindow(r[2] || r[1])) return;
      var radar = String(r[9] || '');
      if (radar && radar !== 'IGNORE') return;   // routed rows already served above
      items.push({ r: radar === 'IGNORE' ? 'IGNORED' : 'RAW', i: String(r[10] || ''),
        d: dstr(r[2] || r[1]), t: String(r[4] || ''), l: String(r[6] || ''),
        s: String(r[3] || ''), f: String(r[7] || '') });
    });
  }

  items.sort(function (a, b) { return b.d.localeCompare(a.d); });
  var truncated = items.length > limit;
  if (truncated) items = items.slice(0, limit);

  return {
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm"),
    sourceNote: PFC_VERSION + ' (' + days + '-day window' + (truncated ? ', truncated to ' + limit : '') + ')',
    total: items.length,
    items: items
  };
}

/* ==========================================================================
 * v7.0 — PUBLISH TO GITHUB (one-refresh-from-HTML architecture)
 * --------------------------------------------------------------------------
 * The sheet PUSHES its classified registers to the GitHub Pages repo as
 * data.json. The dashboard loads that file same-origin on every page open —
 * no CORS, no web-app deployment, works on every phone/browser.
 * Setup (once): Settings > GITHUB_REPO = owner/repo (e.g. jkgpfc/pfc-integrated-radar),
 * menu > Set GitHub token (classic token with 'repo' scope, stored in Script
 * Properties, never in the sheet). Publishing then happens automatically at
 * the end of RUN EVERYTHING, the 30-Day run and the daily schedule.
 * ========================================================================== */

/** One-click setup: asks for the repo and the token, writes both, then publishes. */
function setupGitHubPublishing() {
  var ui = SpreadsheetApp.getUi();
  pfcEnsureSettings_();

  var cur = getSetting_('GITHUB_REPO');
  var r1 = ui.prompt('GitHub publishing \u2014 step 1 of 2',
    'Repository that serves your dashboard, as owner/repo.\nExample: jkgpfc/pfc-integrated-radar' +
    (cur ? '\n\nCurrent: ' + cur : ''), ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var repo = r1.getResponseText().trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  if (repo.indexOf('/') < 0) { ui.alert('That is not owner/repo. Nothing saved.'); return; }
  pfcSetSetting_('GITHUB_REPO', repo);

  var r2 = ui.prompt('GitHub publishing \u2014 step 2 of 2',
    'Paste a GitHub personal access token with "repo" scope.\n' +
    '(github.com > Settings > Developer settings > Personal access tokens > Tokens (classic))\n' +
    'Stored in Script Properties, never written into the sheet.', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var tok = r2.getResponseText().trim();
  if (tok) PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', tok);

  var ok = publishDataToGitHub();
  ui.alert('GitHub publishing',
    ok ? 'Configured and published.\nRepo: ' + repo + '\nReload your dashboard \u2014 it will show LIVE with today\'s data within a minute.'
       : 'Saved, but the publish failed. Open the Log tab: it shows the HTTP code (404 = wrong repo name, 401 = bad token).',
    ui.ButtonSet.OK);
}

/** Write a single value into the Settings tab. */
function pfcSetSetting_(key, value) {
  var sh = sheet_(CFG.SHEETS.SET);
  var n = sh.getLastRow() - 1;
  if (n > 0) {
    var keys = sh.getRange(2, 1, n, 1).getValues();
    for (var i = 0; i < n; i++) {
      if (String(keys[i][0]).trim() === key) { sh.getRange(i + 2, 2).setValue(value); pfcSettingsCache_ = null; return; }
    }
  }
  sh.getRange(sh.getLastRow() + 1, 1, 1, 2).setValues([[key, value]]);
  pfcSettingsCache_ = null;
}

function setGitHubToken() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Set GitHub token',
    'Paste a GitHub personal access token with repo scope.\n(github.com > Settings > Developer settings > Personal access tokens)\nStored in Script Properties, never in the sheet.',
    ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var t = resp.getResponseText().trim();
  if (!t) { toast_('No token entered.'); return; }
  PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', t);
  toast_('GitHub token saved. Set GITHUB_REPO in Settings, then use Publish data to GitHub.');
}

function publishDataToGitHub() {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  var repo = getSetting_('GITHUB_REPO');
  if (!token || !repo || repo.indexOf('/') < 0) {
    var missing = (!repo || repo.indexOf('/') < 0 ? 'GITHUB_REPO (owner/repo) ' : '') + (!token ? 'GitHub token' : '');
    toast_('Publish skipped \u2014 missing: ' + missing + '. Use menu > Set up GitHub publishing.', 10);
    log_('WARN', 'GitHub publish skipped. Missing: ' + missing);
    return false;
  }
  var branch = getSetting_('GITHUB_BRANCH') || 'main';
  var path = getSetting_('GITHUB_DATA_PATH') || 'data.json';
  var payload = buildApiPayload_(90, false, 6000);
  payload.publishedAt = payload.generatedAt;
  var content = Utilities.base64Encode(JSON.stringify(payload), Utilities.Charset.UTF_8);
  var api = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };

  var sha = null;
  try {
    var getResp = UrlFetchApp.fetch(api + '?ref=' + branch, { headers: headers, muteHttpExceptions: true });
    if (getResp.getResponseCode() === 200) sha = JSON.parse(getResp.getContentText()).sha;
  } catch (e) { /* file may not exist yet */ }

  var body = { message: 'PFC Radar data ' + payload.generatedAt + ' (' + payload.total + ' items)',
               content: content, branch: branch };
  if (sha) body.sha = sha;
  var putResp = UrlFetchApp.fetch(api, { method: 'put', contentType: 'application/json',
                                         headers: headers, muteHttpExceptions: true,
                                         payload: JSON.stringify(body) });
  var code = putResp.getResponseCode();
  if (code === 200 || code === 201) {
    log_('INFO', 'Published ' + payload.total + ' items to GitHub: ' + repo + '/' + path + ' (' + branch + ').');
    toast_('Published ' + payload.total + ' items to GitHub. Page updates within ~1 minute.', 8);
    return true;
  }
  log_('ERROR', 'GitHub publish failed HTTP ' + code + ': ' + putResp.getContentText().slice(0, 250));
  toast_('GitHub publish failed (HTTP ' + code + '). See Log tab.', 8);
  return false;
}

function showApiHelp() {
  SpreadsheetApp.getUi().alert('Dashboard live API',
    'Deploy > New deployment > Web app > Execute as: Me > Access: Anyone.\n' +
    'Copy the /exec URL into APPS_SCRIPT_URL at the top of PFC_Radar_Dashboard.html.\n\n' +
    'Caution: Anyone with the URL can read the JSON. Do not enable for confidential registers.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/* ============================ SETUP / REFRESH / MENU ====================== */

/** v8.0 — upgrade an existing workbook in place:
 *   - 'Business Radar'  ->  'Potential Business'
 *   - registers whose column set changed (Watch / Borrowing / Competitor) get
 *     new headers; their rows are cleared because the columns no longer line up
 *     (RUN EVERYTHING reclassifies everything from Raw News anyway). */
function pfcMigrateSheets_() {
  var ss = SpreadsheetApp.getActive();
  var old = ss.getSheetByName('Business Radar');
  if (old && !ss.getSheetByName(CFG.SHEETS.BUS)) {
    old.setName(CFG.SHEETS.BUS);
    log_('INFO', 'MIGRATION: renamed "Business Radar" -> "' + CFG.SHEETS.BUS + '".');
  }
  [[CFG.SHEETS.BUS, CFG.BUS_HEADERS], [CFG.SHEETS.WATCH, CFG.WATCH_HEADERS],
   [CFG.SHEETS.BORR, CFG.BORR_HEADERS], [CFG.SHEETS.TRE, CFG.TRE_HEADERS],
   [CFG.SHEETS.COMP, CFG.COMP_HEADERS],
   [CFG.SHEETS.REG, CFG.REG_HEADERS]].forEach(function (spec) {
    var sh = ss.getSheetByName(spec[0]);
    if (!sh) return;
    var cur = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    var same = cur.length === spec[1].length && cur.every(function (v, i) { return String(v) === String(spec[1][i]); });
    if (same) return;
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getMaxColumns()).clearContent();
    sh.getRange(1, 1, 1, sh.getMaxColumns()).clearContent();
    setHeadersOn_(sh, spec[1]);
    log_('INFO', 'MIGRATION: rebuilt headers on "' + spec[0] + '" (columns changed).');
  });
}

function runSetup() {
  log_('INFO', 'SETUP: starting (' + PFC_VERSION + ').');
  var ss = SpreadsheetApp.getActive();
  [CFG.SHEETS.RAW, CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE,
   CFG.SHEETS.COMP, CFG.SHEETS.REG, CFG.SHEETS.RULES, CFG.SHEETS.KM, CFG.SHEETS.KWU, CFG.SHEETS.DASH,
   CFG.SHEETS.SET, CFG.SHEETS.LOG]
    .forEach(function (n) { sheet_(n); });
  pfcMigrateSheets_();
  pfcEnsureSettings_();
  feedSync_();
  buildDashboard_();
  applyImportanceFormatting_();
  log_('INFO', 'Setup complete (' + PFC_VERSION + ').');
}

/** One-click refresh. Auto-runs setup on a fresh sheet. No dialogs. */
function refreshAll() {
  var ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName(CFG.SHEETS.RAW) || !ss.getSheetByName(CFG.SHEETS.SET)) runSetup();
  sheet_(CFG.SHEETS.RULES);   // self-heal the rules tab if deleted
  feedSync_();
  toast_('Fetching feeds\u2026', 20);
  var added = 0;
  try { added = fetchAllFeeds_(); } catch (e) { log_('ERROR', 'Fetch failed: ' + e.message); }
  toast_('Fetched ' + added + ' new items. Classifying\u2026', 20);
  var c = { classified: 0 };
  try { c = classifyPending_(); } catch (e) { log_('ERROR', 'Classify failed: ' + e.message); }
  try { sortOutputs_(); } catch (e) { log_('ERROR', 'Sort failed: ' + e.message); }
  try {
    buildDashboard_();
    sheet_(CFG.SHEETS.DASH).getRange('B2').setValue(nowStr_());
  } catch (e) { log_('ERROR', 'Dashboard failed: ' + e.message); }
  toast_('Done. +' + added + ' fetched; ' + c.classified + ' classified (Bus ' + (c.bus || 0) +
         ', Watch ' + (c.watch || 0) + ', Borr ' + (c.borr || 0) + ', Tre ' + (c.tre || 0) + ').', 10);
  log_('INFO', 'refreshAll: +' + added + ' fetched, ' + JSON.stringify(c));
}

function classifyOnly() {
  var c = classifyPending_();
  sortOutputs_();
  sheet_(CFG.SHEETS.DASH).getRange('B2').setValue(nowStr_());
  toast_('Classified ' + c.classified + ' (Bus ' + c.bus + ', Watch ' + c.watch +
         ', Borr ' + c.borr + ', Tre ' + c.tre + ', Err ' + c.errors + ').', 10);
}

/** Re-run the classifier over ALL raw rows (e.g. after editing Radar Rules).
 *  Clears the four registers and rebuilds them from Raw News. */
function reclassifyAll() {
  var sh = sheet_(CFG.SHEETS.RAW);
  var n = sh.getLastRow() - 1;
  if (n > 0) {
    var blanks = [];
    for (var i = 0; i < n; i++) blanks.push([CFG.STATUS.NEW, '', '']);
    sh.getRange(2, 9, n, 3).setValues(blanks);
  }
  [CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE, CFG.SHEETS.COMP, CFG.SHEETS.REG].forEach(function (name) {
    var t = SpreadsheetApp.getActive().getSheetByName(name);
    if (t && t.getLastRow() > 1) t.getRange(2, 1, t.getLastRow() - 1, t.getLastColumn()).clearContent();
  });
  var c = classifyPending_();
  sortOutputs_();
  buildDashboard_();
  toast_('Reclassified ' + c.classified + ' items using current Radar Rules.', 10);
}

function setApiKey() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Set AI API key', 'Paste your Anthropic or Gemini API key (stored in Script Properties, never in the sheet):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var key = resp.getResponseText().trim();
  if (!key) { toast_('No key entered.'); return; }
  PropertiesService.getScriptProperties().setProperty(CFG.PROP_API_KEY, key);
  toast_('API key saved. Set AI_PROVIDER to ANTHROPIC or GEMINI in Settings to use it.');
}

function installTrigger() {
  removeTriggers();
  ScriptApp.newTrigger('refreshAll').timeBased().everyHours(6).create();
  toast_('Auto-refresh installed (every 6 hours).');
}

/* ===========================================================================
 * v9.5 - MINUTE TICK (near-real-time auto-fetch)
 * ---------------------------------------------------------------------------
 * A full 182-feed sweep cannot run every minute: Apps Script caps UrlFetchApp
 * calls per day (20k consumer / 100k Workspace) and total trigger runtime
 * (90 min consumer / 6 hr Workspace). 182 feeds x 1440 runs = 262,080 fetches
 * a day - roughly 13x over the consumer cap, and Google News would throttle us.
 *
 * So the tick fetches a ROTATING SLICE (default 6 feeds) each minute and keeps
 * a cursor in Script Properties. The dashboard therefore updates every minute,
 * while the whole feed list is swept about every half hour, at ~8,600 fetches
 * a day - comfortably inside quota. Raise TICK_FEEDS on a Workspace account
 * for a faster sweep; raise TICK_MINUTES to 5 to cut runtime further.
 * ========================================================================= */

var PFC_TICK_CURSOR_KEY  = 'PFC_TICK_CURSOR';
var PFC_LAST_PUBLISH_KEY = 'PFC_LAST_PUBLISH';
var PFC_HEARTBEAT_MIN    = 4;   // republish at least this often while alive
var PFC_TICK_BUDGET_MS  = 45 * 1000;      // finish well inside the 1-minute gap

function pfcTickFeeds_() {
  var n = parseInt(getSetting_('TICK_FEEDS') || '6', 10);
  if (!(n > 0)) n = 6;
  return Math.min(n, 40);
}

/** One light cycle: rotating feed slice -> classify -> rebuild -> publish. */
function radarTick() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) { log_('INFO', 'TICK: previous tick still running, skipped.'); return; }
  var t0 = Date.now();
  try {
    var ss = SpreadsheetApp.getActive();
    if (!ss.getSheetByName(CFG.SHEETS.RAW) || !ss.getSheetByName(CFG.SHEETS.SET)) {
      log_('WARN', 'TICK: sheets not set up yet - run RUN EVERYTHING once first.');
      return;
    }
    var deadline = t0 + PFC_TICK_BUDGET_MS;
    var feeds = defaultFeeds_();
    var props = PropertiesService.getScriptProperties();
    var cur = parseInt(props.getProperty(PFC_TICK_CURSOR_KEY) || '0', 10);
    if (!(cur >= 0) || cur >= feeds.length) cur = 0;
    var take  = pfcTickFeeds_();
    var slice = feeds.slice(cur, cur + take);
    var next  = cur + take; if (next >= feeds.length) next = 0;
    props.setProperty(PFC_TICK_CURSOR_KEY, String(next));

    var added = 0;
    try { added = (fetchFeedsWindowed_(slice, 90, 60, 0, deadline) || {}).added || 0; }
    catch (e) { log_('ERROR', 'TICK fetch: ' + e.message); }

    var c = { classified: 0 };
    if (Date.now() < deadline) {
      try { c = classifyPending_() || c; } catch (e) { log_('ERROR', 'TICK classify: ' + e.message); }
    }

    // Publish when this tick produced something - and also on a heartbeat if
    // nothing has been published for a while. Without the heartbeat the
    // published clock stalls whenever a few quiet minutes pass, which is
    // indistinguishable from the trigger being dead. Capped at one heartbeat
    // publish every PFC_HEARTBEAT_MIN minutes, so commits stay modest.
    var lastPub   = parseInt(props.getProperty(PFC_LAST_PUBLISH_KEY) || '0', 10);
    var heartbeat = (Date.now() - lastPub) > PFC_HEARTBEAT_MIN * 60000;
    if ((added || c.classified || heartbeat) && Date.now() < deadline) {
      try {
        sortOutputs_();
        buildDashboard_();
        sheet_(CFG.SHEETS.DASH).getRange('B2').setValue(nowStr_());
      } catch (e) { log_('ERROR', 'TICK build: ' + e.message); }
      try {
        publishDataToGitHub();
        props.setProperty(PFC_LAST_PUBLISH_KEY, String(Date.now()));
      } catch (e) { log_('ERROR', 'TICK publish: ' + e.message); }
    }

    log_('INFO', 'TICK: feeds ' + cur + '-' + (cur + slice.length - 1) + ' of ' + feeds.length +
                 ', +' + added + ' fetched, ' + (c.classified || 0) + ' classified, ' +
                 (Date.now() - t0) + ' ms.');
  } finally {
    lock.releaseLock();
  }
}

/** ONE-CLICK DIAGNOSIS AND REPAIR.
 *  Run this from the menu (or the editor) when the dashboard says the sheet has
 *  stopped publishing. It reports what is actually installed, reinstalls the
 *  minute trigger cleanly, runs one tick immediately so you can see it work,
 *  and tells you the result in plain words. */
function step9_FixAutoFetch() {
  var out = [];
  var before = ScriptApp.getProjectTriggers();
  out.push('Triggers found before: ' + before.length);
  before.forEach(function (t) {
    out.push('   \u2022 ' + t.getHandlerFunction() + '  (' + t.getEventType() + ')');
  });
  var had = before.filter(function (t) { return t.getHandlerFunction() === 'radarTick'; }).length;
  out.push(had ? 'radarTick trigger WAS present (' + had + ').'
               : 'radarTick trigger was NOT present  \u2190 this is why the clock stalled.');

  // reinstall cleanly
  before.forEach(function (t) { if (t.getHandlerFunction() === 'radarTick') ScriptApp.deleteTrigger(t); });
  try {
    ScriptApp.newTrigger('radarTick').timeBased().everyMinutes(1).create();
    out.push('Installed: radarTick, every 1 minute.');
  } catch (e) {
    out.push('COULD NOT INSTALL: ' + e.message);
    out.push('Most often this means the script is not authorised yet - run RUN EVERYTHING once and accept the permissions prompt, then run this again.');
    var msg0 = out.join('\n');
    try { SpreadsheetApp.getUi().alert('PFC-NRD auto-fetch', msg0, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e2) {}
    return msg0;
  }

  var after = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'radarTick'; });
  out.push('Verified now installed: ' + after.length + ' radarTick trigger(s).');

  // prove it works right now
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty(PFC_LAST_PUBLISH_KEY);      // force this tick to publish
  var t0 = Date.now();
  try {
    radarTick();
    var pub = props.getProperty(PFC_LAST_PUBLISH_KEY);
    out.push('Test tick ran in ' + (Date.now() - t0) + ' ms.');
    out.push(pub ? 'Test tick PUBLISHED successfully - the dashboard clock should now move.'
                 : 'Test tick ran but did not publish. Check GITHUB_REPO and GITHUB_TOKEN in Settings.');
  } catch (e) {
    out.push('Test tick FAILED: ' + e.message);
  }
  out.push('');
  out.push('From here the clock should advance at least every ' + PFC_HEARTBEAT_MIN + ' minutes.');
  out.push('If it does not, open Extensions > Apps Script > Executions and send me the error.');

  var msg = out.join('\n');
  log_('INFO', 'FIX AUTO-FETCH: ' + msg.replace(/\n/g, ' | '));
  try { SpreadsheetApp.getUi().alert('PFC-NRD auto-fetch', msg, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
  return msg;
}

function installMinuteTrigger() {
  removeMinuteTrigger();
  var m = parseInt(getSetting_('TICK_MINUTES') || '1', 10);
  if ([1, 5, 10, 15, 30].indexOf(m) < 0) m = 1;     // Apps Script permits only these
  ScriptApp.newTrigger('radarTick').timeBased().everyMinutes(m).create();
  var feeds = defaultFeeds_().length, take = pfcTickFeeds_();
  toast_('Auto-fetch ON: every ' + m + ' minute' + (m > 1 ? 's' : '') + ', ' + take +
         ' feeds per run (full sweep about every ' + Math.ceil(feeds / take * m) + ' min).', 10);
}

function removeMinuteTrigger() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'radarTick') { ScriptApp.deleteTrigger(t); n++; }
  });
  toast_(n ? 'Auto-fetch stopped.' : 'Auto-fetch was not running.');
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshAll') ScriptApp.deleteTrigger(t);
  });
}

function installDailyMailTrigger() {
  removeDailyMailTrigger();
  ScriptApp.newTrigger('dailyRadarRun').timeBased().atHour(8).everyDays(1).create();
  toast_('Daily radar installed (8 am: tabs + 4 segment emails).');
}

function removeDailyMailTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dailyRadarRun') ScriptApp.deleteTrigger(t);
  });
}

function installWeeklyTrigger() {
  removeWeeklyTrigger();
  ScriptApp.newTrigger('weeklyRadarRun').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
  toast_('Weekly radar installed (Monday 9 am).');
}

function removeWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'weeklyRadarRun') ScriptApp.deleteTrigger(t);
  });
}

function clearData() {
  [CFG.SHEETS.RAW, CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE, CFG.SHEETS.LOG]
    .forEach(function (n) {
      var sh = SpreadsheetApp.getActive().getSheetByName(n);
      if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    });
  toast_('Data cleared. Settings, Radar Rules and My Keywords kept.');
}

function pfcDiagnose() {
  var ss = SpreadsheetApp.getActive();
  log_('INFO', '--- DIAGNOSE (' + PFC_VERSION + ') ---');
  log_('INFO', 'Provider: ' + pfcAiProvider_() + ' | Model: ' + pfcAiModel_());
  log_('INFO', 'Feeds: ' + getFeeds_().length + ' | Radar Rules: ' + readRadarRules_().length + ' | Keyword Master rows: ' + loadKmRows_().length);
  [CFG.SHEETS.RAW, CFG.SHEETS.BUS, CFG.SHEETS.WATCH, CFG.SHEETS.BORR, CFG.SHEETS.TRE,
   CFG.SHEETS.RULES, CFG.SHEETS.SET, CFG.SHEETS.LOG].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    log_('INFO', 'Tab "' + n + '": ' + (sh ? (sh.getLastRow() - 1) + ' rows' : 'MISSING'));
  });
  toast_('Diagnostics written to Log tab.', 8);
}

function pfcShowVersion() { toast_('Running: ' + PFC_VERSION, 10); }

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PFC-NRD')
    .addItem('\u25B6\u25B6 RUN EVERYTHING (fetch 30d + reclassify + all tabs)', 'runEverything')
    .addItem('\u25B6 Quick refresh (new items only)', 'refreshAll')
    .addItem('\u2716 Cancel running job', 'cancelAllRuns')
    .addSeparator()
    .addSubMenu(ui.createMenu('Radar tabs & emails')
      .addItem('30-Day: fetch + tab + send 4 emails (auto-resumes)', 'deep30RadarRun')
      .addItem('Build Daily Radar tab', 'buildDailyRadar')
      .addItem('Build Weekly Radar tab', 'buildWeeklyRadar')
      .addItem('Build 30-Day Radar tab only', 'build30DayRadar')
      .addSeparator()
      .addItem('Send combined DAILY radar (one email, all 4 segments)', 'sendCombinedDaily')
      .addItem('Send combined WEEKLY radar (one email)', 'sendCombinedWeekly')
      .addItem('Send combined 30-DAY radar (one email)', 'sendCombined30Day')
      .addSeparator()
      .addItem('Send Business radar now', 'sendBusinessRadarNow')
      .addItem('Send Borrower Watch now', 'sendBorrowerWatchNow')
      .addItem('Send Borrowing radar now', 'sendBorrowingRadarNow')
      .addItem('Send Treasury radar now', 'sendTreasuryRadarNow')
      .addItem('Send all weekly radars now', 'sendAllWeeklyRadars')
      .addItem('Send all 30-day radars now', 'sendAll30DayRadars'))
    .addSubMenu(ui.createMenu('Schedules')
      .addItem('\u2699 FIX AUTO-FETCH (run this if the clock stalls)', 'step9_FixAutoFetch')
      .addSeparator()
      .addItem('\u26A1 Auto-fetch every minute (near-live)', 'installMinuteTrigger')
      .addItem('\u25A0 Stop minute auto-fetch', 'removeMinuteTrigger')
      .addSeparator()
      .addItem('Install auto-refresh (every 6 hrs)', 'installTrigger')
      .addItem('Install daily radar (8 am: tabs + 4 emails)', 'installDailyMailTrigger')
      .addItem('Install weekly radar (Mon 9 am)', 'installWeeklyTrigger')
      .addItem('Install monthly 30-Day Radar (1st, 9 am)', 'installMonthlyTrigger')
      .addItem('Remove all schedules', 'pfcRemoveAllSchedules'))
    .addSubMenu(ui.createMenu('Manual steps (if a run times out)')
      .addItem('0. Show version (proves the paste worked)', 'step0_Version')
      .addItem('1. Reset all (state + Raw + registers)', 'step1_ResetAll')
      .addItem('2. Fetch next 10 feeds (repeat until DONE)', 'step2_FetchBatch')
      .addItem('3. Classify next batch (repeat until DONE)', 'step3_ClassifyBatch')
      .addItem('4. Sort + build all tabs', 'step4_BuildTabs')
      .addItem('5. Publish to GitHub', 'step5_Publish'))
    .addSubMenu(ui.createMenu('Classification & tools')
      .addItem('Classify pending + retry errors', 'classifyOnly')
      .addItem('Reclassify ALL (after editing rules/keywords)', 'reclassifyAll')
      .addItem('Reseed Keyword Master (restore 31 factory rows)', 'reseedKeywordMaster')
      .addItem('Reseed Radar Rules (restore factory rows)', 'reseedRadarRules')
      .addItem('\u2699 Set up GitHub publishing (repo + token)', 'setupGitHubPublishing')
      .addItem('Publish data to GitHub now', 'publishDataToGitHub')
      .addItem('Set GitHub token only', 'setGitHubToken')
      .addItem('Set API key (optional \u2014 AI mode)', 'setApiKey')
      .addItem('Dashboard live API \u2014 deploy help', 'showApiHelp')
      .addItem('\u2713 Health check (10-sec self-test)', 'pfcHealthCheck')
      .addItem('Diagnose (log check)', 'pfcDiagnose')
      .addItem('Show version', 'pfcShowVersion')
      .addItem('Clear all data (keep settings + rules)', 'clearData'))
    .addToUi();
}

function pfcRemoveAllSchedules() {
  removeTriggers();
  removeDailyMailTrigger();
  removeWeeklyTrigger();
  removeMonthlyTrigger();
  toast_('All schedules removed.');
}
