/* ══ 테마 ══
   색은 전부 styles.css의 :root 변수로 들어간다.
   여기서 변수 값만 바꿔치면 앱 전체 색이 한 번에 바뀐다.

   각 테마가 정하는 값
     p    주색 (헤더 그라데이션의 기준, 탭바 선택색, 버튼 테두리)
     a    강조색 (채운 버튼, 선택된 칩)
     dp   가장 진한 색 (토스트 배경)
     up   히어로 카드 그라데이션 끝
     lt   옅은 배경 칩
     sf   더 옅은 배경
     mu   중간 톤
     gd   별점 금색      gdl 그 옅은 버전
     cv   화면 바탕      cr 살짝 어두운 바탕      cl 거의 흰 바탕
     ink  본문 글씨      sft 흐린 글씨      ln 선
     rd   경고·삭제색
     oa   강조색 위에 올라갈 글씨색 (밝은 강조색이면 진한 색을 쓴다)
     hb/hf/hfs/hl  오늘의 메뉴 카드 — 옅은 바탕, 진한 글씨, 흐린 글씨, 금색 테두리
     h    [헤더배경1, 헤더배경2, 헤더글씨, 헤더글씨(흐림)]
     rgb  주색의 R,G,B — 그림자와 옅은 물결에 쓴다
*/

const THEMES = [
  {
    id: "green", name: "기본 초록", mood: "차분",
    p: "#1b5e3b", a: "#2e7d5a", dp: "#1a3a2e", up: "#3a6b56",
    lt: "#dceee6", sf: "#e8f5ee", mu: "#5a9a7c",
    gd: "#c49a3c", gdl: "#dfc49d",
    cv: "#f4f2ed", cr: "#edebe6", cl: "#f9f9f7",
    ink: "rgba(0,0,0,0.87)", sft: "rgba(0,0,0,0.52)", ln: "#d6dbde", rd: "#c82014",
    oa: "#ffffff",
    hb: "#E7F2EB", hf: "#14321F", hfs: "#4B6557", hl: "#C49A3C",
    h: ["#1b5e3b", "#2e7d5a", "#ffffff", "rgba(255,255,255,0.75)"],
    rgb: "46,125,90",
  },
  {
    id: "dawn", name: "새벽 티", mood: "차분",
    p: "#2F5D63", a: "#4C848B", dp: "#1E2E30", up: "#63979E",
    lt: "#DCE9EA", sf: "#EBF3F4", mu: "#79A6AC",
    gd: "#C7A45B", gdl: "#E2CFA6",
    cv: "#F2F4F4", cr: "#EBEEEE", cl: "#F9FBFB",
    ink: "rgba(0,0,0,0.85)", sft: "rgba(0,0,0,0.50)", ln: "#DBE2E3", rd: "#C0504A",
    oa: "#ffffff",
    hb: "#E5EEEF", hf: "#1B2E30", hfs: "#4E6467", hl: "#C7A45B",
    h: ["#2F5D63", "#4C848B", "#ffffff", "rgba(255,255,255,0.78)"],
    rgb: "76,132,139",
  },
  {
    id: "cherry", name: "체리 소다", mood: "또렷",
    p: "#E23A5E", a: "#FF637E", dp: "#5C1024", up: "#FF8098",
    lt: "#FFE1E7", sf: "#FFF0F3", mu: "#F0A9B9",
    gd: "#E8A200", gdl: "#F5D68A",
    cv: "#FFF9F9", cr: "#F7EFF0", cl: "#FFFCFC",
    ink: "#3A1A22", sft: "#8A6B72", ln: "#F0DDE1", rd: "#C2410C",
    oa: "#4A0A1B",
    hb: "#FFE6EB", hf: "#4A1224", hfs: "#8A5563", hl: "#DFA43A",
    h: ["#E23A5E", "#FF637E", "#ffffff", "rgba(255,255,255,0.85)"],
    rgb: "226,58,94",
  },
  {
    id: "mintlemon", name: "민트 온 레몬", mood: "발랄",
    p: "#0B5F4C", a: "#FFCB40", dp: "#08362C", up: "#4FD1C0",
    lt: "#FEF08A", sf: "#FFF9D6", mu: "#7FD5AD",
    gd: "#E09B00", gdl: "#F5D98F",
    cv: "#F7FCFA", cr: "#EEF5F1", cl: "#FCFEFD",
    ink: "#16332C", sft: "#6D8A82", ln: "#DDEAE3", rd: "#D6453B",
    oa: "#0B4F3E",
    hb: "#FFF7C9", hf: "#0B4F3E", hfs: "#4A6B5E", hl: "#C08A1E",
    h: ["#7FD5AD", "#96DFBC", "#0B4F3E", "rgba(11,79,62,0.72)"],
    rgb: "11,95,76",
  },
];

const DEFAULT_THEME = "green";

function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/* 변수를 <html>에 직접 얹는다. :root보다 우선하므로 styles.css는 그대로 둬도 된다. */
/* id 문자열도 되고, buildTheme()이 만든 테마 객체도 그대로 받는다 */
function applyTheme(idOrTheme) {
  const t = (idOrTheme && typeof idOrTheme === "object") ? idOrTheme : themeById(idOrTheme);
  const s = document.documentElement.style;
  const v = {
    "--starbucks": t.p, "--green": t.p, "--accent": t.a, "--house": t.dp, "--uplift": t.up,
    "--green-light": t.lt, "--green-soft": t.sf, "--green-muted": t.mu,
    "--green-wash": "rgba(" + t.rgb + ",0.06)",
    "--gold": t.gd, "--yolk": t.gd, "--gold-light": t.gdl,
    "--canvas": t.cv, "--bg": t.cv, "--ceramic": t.cr, "--cool": t.cl,
    "--ink": t.ink, "--soft": t.sft, "--line": t.ln,
    "--red": t.rd, "--kimchi": t.rd, "--red-tint": hexTint(t.rd, 0.08),
    "--head-1": t.h[0], "--head-2": t.h[1], "--head-fg": t.h[2], "--head-fg-soft": t.h[3],
    "--on-accent": t.oa,
    "--hero-bg": t.hb, "--hero-fg": t.hf, "--hero-fg-soft": t.hfs,
    "--hero-line": t.hl, "--hero-glow": hexTint(t.hl, 0.12),
    "--hero-shadow": "0 2px 10px rgba(" + t.rgb + ",0.10), 0 1px 3px rgba(0,0,0,0.05)",
  };
  Object.keys(v).forEach((k) => s.setProperty(k, v[k]));

  // 폰 상태표시줄 색도 헤더에 맞춘다
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t.h[0]);
}

/* #RRGGBB → rgba(r,g,b,a) */
function hexTint(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "rgba(200,32,20," + a + ")";
  const n = parseInt(m[1], 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

/* ══════════════════════════════════
   내 색으로 테마 만들기

   테마 하나에 들어가는 값은 스물 몇 개지만, 사람이 정할 것은 넷뿐이다.
     head    헤더 배경 — 앱의 얼굴이 되는 색
     accent  강조색 — 채운 버튼, 선택된 칩
     hero    오늘의 메뉴 카드 바탕
     line    그 카드의 테두리 (금색 자리)
   나머지는 이 넷의 색상(H)·채도(S)를 물려받아 밝기(L)만 바꿔 만든다.
   글씨색은 배경과의 대비를 실제로 재서, 기준을 넘을 때까지 어둡게(혹은 밝게) 민다.
   ══════════════════════════════════ */

function _rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  const n = m ? parseInt(m[1], 16) : 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _hex(r, g, b) {
  const f = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + f(r) + f(g) + f(b);
}
function _hsl(hex) {
  let [r, g, b] = _rgb(hex).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h: h, s: s * 100, l: l * 100 };
}
function hsl(h, s, l) {
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
          : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return _hex((t[0] + m) * 255, (t[1] + m) * 255, (t[2] + m) * 255);
}
/* WCAG 상대 휘도 */
function lumOf(hex) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const [r, g, b] = _rgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const x = lumOf(a), y = lumOf(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* bg 위에서 target 대비를 넘길 때까지 밝기를 밀어본다.
   어두워지는 쪽을 먼저 본다 — 앱 전체가 밝은 화면이라 진한 글씨가 더 어울린다.
   거기서 못 찾으면 밝아지는 쪽, 그것도 안 되면 대비가 가장 큰 색을 준다. */
function readableOn(bg, h, s, target) {
  let best = null, bestR = 0;
  const scan = (from, to, step) => {
    for (let l = from; step > 0 ? l <= to : l >= to; l += step) {
      const c = hsl(h, s, l), r = contrast(bg, c);
      if (r >= target) return c;
      if (r > bestR) { bestR = r; best = c; }
    }
    return null;
  };
  return scan(48, 4, -2) || scan(52, 98, 2) ||
    (contrast(bg, "#131313") > bestR ? "#131313"
      : contrast(bg, "#ffffff") > bestR ? "#ffffff" : best);
}

const CUSTOM_DEFAULT = { head: "#7FD5AD", accent: "#FFCB40", hero: "#FFF7C9", line: "#C08A1E" };

function buildTheme(spec) {
  const sp = Object.assign({}, CUSTOM_DEFAULT, spec || {});
  const head = sp.head, acc = sp.accent, hero = sp.hero, line = sp.line;
  const A = _hsl(acc), H = _hsl(head), L = _hsl(line);

  /* 진한 색을 뽑을 기준 색상.
     노란 계열(색상 28~72)은 어둡게 누르면 갈색이 된다.
     강조색이 노랑이면 헤더 색상 쪽에서 진한 색을 가져온다. */
  const muddy = (x) => x >= 28 && x <= 72;
  let dh = A.h, ds = clamp(A.s, 45, 90);
  if (muddy(A.h) && !muddy(H.h)) { dh = H.h; ds = clamp(H.s + 15, 45, 90); }

  // 헤더 글씨 — 흰색이 통하면 흰색, 아니면 기준 색상을 진하게
  const headFg = contrast(head, "#ffffff") >= 4.0
    ? "#ffffff" : readableOn(head, dh, ds, 4.5);
  const headFgSoft = headFg === "#ffffff"
    ? "rgba(255,255,255,0.78)" : hexTint(headFg, 0.72);

  // 주색 — 흰 글씨를 얹는 자리(탭 선택, 오늘 날짜 동그라미)에 쓰므로 충분히 진해야 한다
  const p = readableOn("#ffffff", dh, clamp(ds, 35, 85), 4.6);
  // 강조색 위 글씨 — 흰색이 안 되면 기준 색상을 아주 진하게
  const oa = contrast(acc, "#ffffff") >= 4.5
    ? "#ffffff" : readableOn(acc, dh, clamp(ds + 10, 30, 90), 4.6);

  const warm = A.h >= 320 || A.h <= 22;      // 강조색이 붉은 계열이면 경고색을 주황 쪽으로 비킨다

  return {
    id: "custom", name: sp.name || "내 테마", mood: "직접 고름",
    p: p, a: acc, dp: hsl(dh, clamp(ds, 25, 65), 14), up: readableOn("#ffffff", dh, clamp(ds, 30, 70), 4.0),
    lt: hsl(A.h, clamp(A.s, 35, 92), 90), sf: hsl(A.h, clamp(A.s, 30, 92), 95.5), mu: hsl(A.h, clamp(A.s, 30, 70), 62),
    gd: readableOn("#ffffff", L.h, clamp(L.s, 30, 85), 2.8), gdl: hsl(L.h, clamp(L.s, 30, 80), 78),
    cv: hsl(H.h, clamp(H.s, 0, 30), 97.5), cr: hsl(H.h, clamp(H.s, 0, 25), 95), cl: hsl(H.h, clamp(H.s, 0, 20), 99),
    ink: hsl(H.h, clamp(H.s, 0, 25), 15), sft: hsl(H.h, clamp(H.s, 0, 14), 46), ln: hsl(H.h, clamp(H.s, 0, 18), 88),
    rd: warm ? "#C2410C" : "#C82014",
    oa: oa,
    hb: hero,
    hf: readableOn(hero, dh, clamp(ds, 40, 90), 7),
    hfs: readableOn(hero, dh, clamp(ds, 18, 42), 4.8),
    hl: line,
    h: [head, hsl(H.h, H.s, clamp(H.l + 6, 0, 97)), headFg, headFgSoft],
    rgb: _rgb(p).join(","),
  };
}

/* 「딸기 라떼」 — 직접 만든 테마를 프리셋으로 굳힌 것.
   네 색만 주고 나머지는 buildTheme이 뽑는다. */
THEMES.push(Object.assign(
  buildTheme({ head: "#F2ABA0", accent: "#F78359", hero: "#FFFDF5", line: "#FF937D" }),
  { id: "strawlatte", name: "딸기 라떼", mood: "포근" }
));
