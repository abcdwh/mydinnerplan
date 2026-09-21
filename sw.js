/* 저녁 식탁 서비스 워커
   우리 사이트 파일은 "네트워크 먼저": 인터넷이 되면 늘 최신 파일을 받고, 받은 것을 캐시에 새로 넣어 둔다.
   인터넷이 안 되거나 너무 느릴 때만 캐시에 있던 파일로 연다.
   그래서 배포할 때마다 아래 V 값을 올리지 않아도 새 버전이 반영된다.
   (V는 캐시 구조를 바꿀 때만 올리면 된다) */
const V = "dinner-v11";
const FILES = ["./", "index.html", "styles.css", "themes.js", "drive.js", "data.js", "packs.js", "app.js",
  "privacy.html", "terms.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
const SLOW_MS = 4000;   // 이보다 느리면 일단 캐시로 연다 (뒤에서 받은 최신본은 캐시에 넣어 둔다)

self.addEventListener("install", (e) => {
  // cache: "reload" — 브라우저의 HTTP 캐시를 거치지 않고 서버에서 새로 받는다
  e.waitUntil(caches.open(V)
    .then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
    .catch(() => {})
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function fromNetwork(req) {
  // 페이지 요청(navigate)은 Request를 그대로 복제할 수 없어서 주소로 다시 요청한다
  return fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then((res) => {
    if (res && res.ok && res.type === "basic") {
      const copy = res.clone();
      caches.open(V).then((c) => c.put(req.url.split("?")[0], copy)).catch(() => {});
    }
    return res;
  });
}
function fromCache(req) {
  return caches.match(req.url.split("?")[0], { ignoreSearch: true }).then((hit) =>
    hit || (req.mode === "navigate" ? caches.match("index.html") : undefined));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(new Promise((resolve) => {
      let done = false;
      const finish = (res) => { if (!done && res) { done = true; resolve(res); } };
      const net = fromNetwork(req);
      net.then(finish).catch(() =>
        fromCache(req).then((hit) => { if (hit) finish(hit); else if (!done) { done = true; resolve(Response.error()); } }));
      setTimeout(() => { if (!done) fromCache(req).then(finish); }, SLOW_MS);
    }));
    return;
  }

  // 구글 글꼴처럼 바뀔 일이 거의 없는 외부 파일은 캐시 먼저
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(V).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    })));
  }
  // 그 밖의 외부 요청(구글 로그인·드라이브 등)은 손대지 않는다
});
