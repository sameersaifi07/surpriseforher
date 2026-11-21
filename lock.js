// 🔒 LOCK WITH A PIN — encrypts the whole site (text, photos, videos, music) with AES-256.
// Without the PIN nobody can see anything — not even by reading the code.
//
// Usage (needs Node.js — https://nodejs.org):
//   node tools/lock.js 482916                          -> PIN only
//   node tools/lock.js 482916 2026-12-01T00:00:00      -> PIN + countdown until that moment
// Output: the dist/ folder (index.html + bundle.enc). Upload ONLY those two files to your hosting.
// Tip: a 6–8 digit PIN is much stronger than 4 digits.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const siteDir = path.join(__dirname, ".."), outDir = path.join(siteDir, "dist");
const [PIN, UNLOCK = "2000-01-01T00:00:00"] = process.argv.slice(2);
if (!PIN || !/^\d{4,12}$/.test(PIN)){ console.error("Usage: node tools/lock.js <PIN of 4-12 digits> [unlock date like 2026-12-01T00:00:00]"); process.exit(1); }

// 1) The site, with its own simple lock switched off (the lock page handles it)
let app = fs.readFileSync(path.join(siteDir, "index.html"), "utf8");
app = app.replace(/  birthday: "[^"]*",/, '  birthday: "",').replace(/  secretCode: "[^"]*",/, '  secretCode: "",');

// 2) Every photo, video and song in the media folder
const types = { ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".gif":"image/gif", ".svg":"image/svg+xml",
                ".mp4":"video/mp4", ".webm":"video/webm", ".mp3":"audio/mpeg", ".m4a":"audio/mp4", ".wav":"audio/wav", ".ogg":"audio/ogg" };
const files = [];
for (const f of fs.readdirSync(path.join(siteDir, "media"))){
  const t = types[path.extname(f).toLowerCase()]; if (!t) continue;
  files.push({ path: "media/" + f, type: t, data: fs.readFileSync(path.join(siteDir, "media", f)) });
}
const appBuf = Buffer.from(app, "utf8");
let off = 0; const manifest = { app: { offset: 0, length: appBuf.length }, files: [] };
off = appBuf.length;
for (const f of files){ manifest.files.push({ path: f.path, type: f.type, offset: off, length: f.data.length }); off += f.data.length; }
const man = Buffer.from(JSON.stringify(manifest), "utf8");
const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32LE(man.length);
const plain = Buffer.concat([lenBuf, man, appBuf, ...files.map(f => f.data)]);

// 3) Encrypt: PBKDF2-SHA256 (600k rounds) -> AES-256-GCM. Plus a tiny verifier so a wrong PIN is caught instantly.
const ITER = 600000;
const salt = crypto.randomBytes(16);
const key = crypto.pbkdf2Sync(PIN, salt, ITER, 32, "sha256");
const enc = (iv, data) => { const c = crypto.createCipheriv("aes-256-gcm", key, iv); return Buffer.concat([c.update(data), c.final(), c.getAuthTag()]); };
const ivV = crypto.randomBytes(12), ivM = crypto.randomBytes(12);
const vct = enc(ivV, Buffer.from("bday-ok"));
const mct = enc(ivM, plain);
const header = Buffer.concat([Buffer.from("BDY1"), salt, ivV, Buffer.from([vct.length]), vct, ivM]);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "bundle.enc"), Buffer.concat([header, mct]));

// 4) Public lock page — no names, photos, song or messages in it
const lock = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>A Surprise 💌</title>
<meta name="theme-color" content="#160c20">
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=Caveat:wght@500&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">
<style id="lk-style">
  :root{color-scheme:dark;--night:#160c20;--accent:#e8557a;--gold:#f2c46d;--gold-soft:#f8e1ac;--text:#f6ecf2;--soft:#cbb6c6;--line:rgba(255,255,255,.12);--glass:rgba(255,255,255,.06)}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{font-family:"DM Sans",system-ui,sans-serif;color:var(--text);background:var(--night);
    background-image:radial-gradient(900px 600px at 85% -5%,rgba(232,85,122,.28),transparent 60%),radial-gradient(800px 600px at -10% 40%,#3a2160,transparent 60%)}
  [hidden]{display:none!important}
  #lk{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center;
    padding:24px max(16px,env(safe-area-inset-right,0px)) 24px max(16px,env(safe-area-inset-left,0px))}
  .eb{font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold-soft)}
  #lk h1{font-family:"Fraunces",Georgia,serif;font-weight:300;font-size:clamp(2rem,8vw,3.2rem);line-height:1.1}
  #lk h1 em{color:var(--accent)}
  #lk p{color:var(--soft);max-width:32ch}
  .lockic{font-size:2.6rem;background:none;border:0;cursor:default;filter:drop-shadow(0 0 18px rgba(242,196,109,.45))}
  .cd{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .cd div{min-width:72px;padding:14px 10px;border-radius:16px;background:var(--glass);border:1px solid var(--line)}
  .cd b{display:block;font-family:"Fraunces",serif;font-size:2rem;color:var(--gold);font-variant-numeric:tabular-nums}
  .cd span{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
  #lk form{display:flex;flex-direction:column;align-items:center;gap:12px}
  #lk input{width:min(240px,80vw);padding:14px 18px;border-radius:999px;border:2px solid transparent;text-align:center;font:700 1.4rem "DM Sans",sans-serif;
    letter-spacing:.5em;color:#2b1b24;background:#fbf3e8;outline:none;-webkit-text-security:disc}
  #lk input:focus{border-color:var(--gold)}
  button.go{padding:13px 30px;border-radius:999px;border:0;font:700 1rem "DM Sans",sans-serif;color:#fff;background:var(--accent);cursor:pointer}
  button.go:disabled{opacity:.5}
  .err{color:#ff8fa8;min-height:1.3em;font-size:.92rem}
  .hand{font-family:"Caveat",cursive;font-size:1.5rem;color:var(--gold-soft)}
  .bar{width:min(240px,70vw);height:4px;border-radius:4px;background:var(--line);overflow:hidden}
  .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--accent));transition:width .2s}
  .shake{animation:sh .4s}
  @keyframes sh{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
</style>
</head>
<body>
<div id="lk">
  <button class="lockic" id="lockic" type="button" aria-label="Locked">🔒</button>
  <span class="eb">a surprise is waiting</span>
  <div id="wait">
    <h1>Not yet, <em>love</em> ♡</h1>
    <p style="margin:12px auto 16px">Your surprise unlocks in…</p>
    <div class="cd"><div><b id="d">0</b><span>days</span></div><div><b id="h">00</b><span>hours</span></div><div><b id="m">00</b><span>mins</span></div><div><b id="s">00</b><span>secs</span></div></div>
  </div>
  <form id="pin" hidden autocomplete="off">
    <h1>For your eyes <em>only</em> ♡</h1>
    <p>Enter the secret PIN I sent you 💌</p>
    <input id="pi" inputmode="numeric" maxlength="8" placeholder="••••" aria-label="Secret PIN">
    <div class="err" id="er" role="alert"></div>
    <button class="go" id="go" type="submit">Unlock</button>
  </form>
  <div id="busy" hidden><p class="hand">Unwrapping your surprise… 🎁</p><div class="bar" style="margin-top:12px"><i id="bi"></i></div></div>
</div>
<script>
(() => {
  const UNLOCK = new Date(${JSON.stringify(UNLOCK)});
  const $ = id => document.getElementById(id), pad = n => String(n).padStart(2, "0");
  // Download the encrypted bundle in the background (it is useless without the PIN)
  let got = 0, total = 0;
  const bundleP = fetch("bundle.enc").then(async r => {
    if (!r.ok) throw new Error("bundle");
    total = +r.headers.get("content-length") || 0;
    if (!r.body || !total) return new Uint8Array(await r.arrayBuffer());
    const rd = r.body.getReader(), parts = [];
    for (;;){ const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; $("bi").style.width = Math.min(100, got/total*100) + "%"; }
    const out = new Uint8Array(got); let o = 0; for (const p of parts){ out.set(p, o); o += p.length; } return out;
  });
  bundleP.catch(() => {});
  function showPin(){ $("wait").hidden = true; $("pin").hidden = false; setTimeout(() => $("pi").focus(), 200); }
  if (UNLOCK > new Date()){
    const t = setInterval(tick, 1000); tick();
    function tick(){
      const ms = UNLOCK - new Date();
      if (ms <= 0){ clearInterval(t); showPin(); return; }
      $("d").textContent = Math.floor(ms/864e5); $("h").textContent = pad(Math.floor(ms/36e5)%24);
      $("m").textContent = pad(Math.floor(ms/6e4)%60); $("s").textContent = pad(Math.floor(ms/1e3)%60);
    }
    // Owner shortcut: tap the lock 5 times to enter the PIN early
    let taps = 0; $("lockic").addEventListener("click", () => { if (++taps >= 5) showPin(); });
  } else showPin();

  const sub = window.crypto && crypto.subtle;
  async function unlock(pin){
    const u8 = await bundleP;
    if (String.fromCharCode(...u8.slice(0, 4)) !== "BDY1") throw new Error("bundle");
    let o = 4; const salt = u8.slice(o, o += 16), ivV = u8.slice(o, o += 12), vl = u8[o++], vct = u8.slice(o, o += vl), ivM = u8.slice(o, o += 12);
    const base = await sub.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
    const key = await sub.deriveKey({ name: "PBKDF2", salt, iterations: ${ITER}, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    try { await sub.decrypt({ name: "AES-GCM", iv: ivV }, key, vct); } catch { return false; }
    const plain = new Uint8Array(await sub.decrypt({ name: "AES-GCM", iv: ivM }, key, u8.subarray(o)));
    const ml = plain[0] | plain[1] << 8 | plain[2] << 16 | plain[3] << 24;
    const man = JSON.parse(new TextDecoder().decode(plain.subarray(4, 4 + ml))), base0 = 4 + ml;
    const media = {};
    for (const f of man.files) media[f.path] = URL.createObjectURL(new Blob([plain.subarray(base0 + f.offset, base0 + f.offset + f.length)], { type: f.type }));
    window.__MEDIA__ = media;
    const html = new TextDecoder().decode(plain.subarray(base0 + man.app.offset, base0 + man.app.offset + man.app.length));
    mount(html);
    return true;
  }
  // Put the unlocked site into this page (scripts run in order)
  function mount(html){
    const doc = new DOMParser().parseFromString(html, "text/html");
    document.title = doc.title || document.title;
    $("lk").remove(); const ls = $("lk-style"); if (ls) ls.remove();
    const run = (node, parent) => {
      if (node.tagName === "SCRIPT"){
        const s = document.createElement("script");
        for (const a of node.attributes) s.setAttribute(a.name, a.value);
        s.textContent = node.textContent; parent.appendChild(s);
      } else parent.appendChild(document.importNode(node, true));
    };
    [...doc.head.children].forEach(n => { if (n.tagName === "META" || n.tagName === "TITLE") return; run(n, document.head); });
    for (const a of doc.body.attributes) document.body.setAttribute(a.name, a.value);
    [...doc.body.childNodes].forEach(n => run(n, document.body));
  }
  $("pin").addEventListener("submit", async e => {
    e.preventDefault();
    const pin = $("pi").value.trim(); if (!pin) return;
    if (!sub){ $("er").textContent = "Please open this link in Chrome or Safari."; return; }
    $("go").disabled = true; $("er").textContent = "";
    $("busy").hidden = false;
    try {
      const ok = await unlock(pin);
      if (!ok){ $("busy").hidden = true; $("er").textContent = "Hmm, that's not it. Try again ♡"; $("pi").value = ""; $("pi").classList.remove("shake"); void $("pi").offsetWidth; $("pi").classList.add("shake"); }
    } catch { $("busy").hidden = true; $("er").textContent = "Couldn't load the surprise. Check your internet and try again."; }
    finally { const g = $("go"); if (g) g.disabled = false; }
  });
  $("pi").addEventListener("input", () => { $("pi").value = $("pi").value.replace(/\\D/g, ""); if ($("pi").value.length === ${PIN.length}) $("pin").requestSubmit(); });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(outDir, "index.html"), lock);

console.log(`✅ Locked! Upload the 2 files in dist/ (index.html ${(lock.length/1024).toFixed(0)} KB + bundle.enc ${(fs.statSync(path.join(outDir, "bundle.enc")).size/1048576).toFixed(1)} MB, ${files.length} media files inside).`);
