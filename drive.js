/* ══ 구글 드라이브 동기화 ══

   서버 없이 기기끼리 데이터를 맞춘다.
   각 사용자는 자기 구글 드라이브의 "앱 데이터 폴더"에 저장한다.
   이 폴더는 드라이브 파일 목록에 보이지 않고, 이 앱이 만든 파일 외에는
   드라이브의 어떤 것도 읽지 못한다. 그래서 구글 심사가 필요 없는 등급이다.

   ── 쓰기 전에 한 번 해야 하는 일 ──
   1. console.cloud.google.com 에서 프로젝트 만들기
   2. API 및 서비스 > 라이브러리 > Google Drive API 사용 설정
   3. OAuth 동의 화면 > External > 앱 이름·이메일·개인정보처리방침 주소 입력
      범위(scope)에 drive.appdata 추가 → 저장 후 "게시"
   4. 사용자 인증 정보 > OAuth 클라이언트 ID > 웹 애플리케이션
      승인된 자바스크립트 원본에 배포 주소와 http://localhost 를 넣는다
   5. 발급된 클라이언트 ID를 아래 CLIENT_ID 에 붙여넣는다

   클라이언트 ID는 비밀이 아니다. 공개 저장소에 올라가도 된다.
   승인된 원본에 등록된 도메인에서만 동작하기 때문이다.
*/

const DRIVE_CLIENT_ID = "592787399643-2j2henjbfik3vgpahrifkjam82a42gne.apps.googleusercontent.com";   // ← 여기에 붙여넣으세요 (예: "1234-abcd.apps.googleusercontent.com")

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DRIVE_FILE = "dinner-table-state.json";
const DRIVE_FILEID_KEY = "dinner-drive-fileid";

const D = {
  token: null,        // 액세스 토큰 (1시간짜리, 메모리에만 둔다)
  client: null,       // GIS 토큰 클라이언트
  fileId: null,
  busy: false,
  status: "",         // 화면에 보여줄 한 줄
  err: "",
};

const driveConfigured = () => !!DRIVE_CLIENT_ID;
const driveLinked = () => !!(S.settings && S.settings.drive);
const driveOn = () => driveConfigured() && driveLinked();

/* ── 토큰 ── */

function driveClient() {
  if (D.client) return D.client;
  if (!window.google || !google.accounts || !google.accounts.oauth2) return null;
  D.client = google.accounts.oauth2.initTokenClient({
    client_id: DRIVE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: () => {},          // 요청할 때마다 갈아끼운다
  });
  return D.client;
}

/* interactive=false 면 이미 허용한 사용자에게만 조용히 토큰을 받아온다.
   앱을 열 때마다 구글 창이 뜨면 성가시므로 부팅 때는 조용한 쪽을 쓴다. */
function driveToken(interactive) {
  return new Promise((resolve, reject) => {
    const c = driveClient();
    if (!c) return reject(new Error("구글 로그인 스크립트를 불러오지 못했어요"));
    c.callback = (res) => {
      if (res && res.access_token) { D.token = res.access_token; resolve(res.access_token); }
      else reject(new Error(res && res.error ? res.error : "권한을 받지 못했어요"));
    };
    try { c.requestAccessToken({ prompt: interactive ? "consent" : "" }); }
    catch (e) { reject(e); }
  });
}

/* 토큰이 만료되면 401이 온다. 한 번은 조용히 다시 받아 재시도한다. */
async function driveFetch(url, opts, retried) {
  if (!D.token) await driveToken(false);
  const o = Object.assign({}, opts);
  o.headers = Object.assign({}, o.headers, { Authorization: "Bearer " + D.token });
  const r = await fetch(url, o);
  if (r.status === 401 && !retried) { D.token = null; return driveFetch(url, opts, true); }
  if (!r.ok) throw new Error("드라이브 응답 " + r.status);
  return r;
}

/* ── 파일 ── */

async function driveFileId() {
  if (D.fileId) return D.fileId;
  const cached = localStorage.getItem(DRIVE_FILEID_KEY);
  if (cached) { D.fileId = cached; return cached; }
  const r = await driveFetch("https://www.googleapis.com/drive/v3/files"
    + "?spaces=appDataFolder&pageSize=10&fields=files(id,name,modifiedTime)"
    + "&q=" + encodeURIComponent("name='" + DRIVE_FILE + "'"), { method: "GET" });
  const j = await r.json();
  if (j.files && j.files.length) {
    D.fileId = j.files[0].id;
    localStorage.setItem(DRIVE_FILEID_KEY, D.fileId);
    return D.fileId;
  }
  return null;
}

async function driveRead() {
  const id = await driveFileId();
  if (!id) return null;
  const r = await driveFetch("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media", { method: "GET" });
  return await r.json();
}

async function driveWrite(payload) {
  const id = await driveFileId();
  const meta = id ? { name: DRIVE_FILE } : { name: DRIVE_FILE, parents: ["appDataFolder"] };
  const b = "dinnerboundary" + Date.now();
  const body =
    "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(meta) +
    "\r\n--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(payload) +
    "\r\n--" + b + "--";
  const r = await driveFetch(
    "https://www.googleapis.com/upload/drive/v3/files" + (id ? "/" + id : "") + "?uploadType=multipart&fields=id",
    { method: id ? "PATCH" : "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body });
  const j = await r.json();
  if (j.id) { D.fileId = j.id; localStorage.setItem(DRIVE_FILEID_KEY, j.id); }
  return j.id;
}

/* ── 올리고 내리기 ──
   충돌 처리는 단순하게 간다: updatedAt이 더 최근인 쪽이 이긴다.
   혼자서 기기를 번갈아 쓰는 상황에서는 이걸로 충분하다.
   두 기기를 동시에 만지면 나중에 저장한 쪽만 남으니 그러지 않는 편이 좋다. */

async function drivePush(manual) {
  if (!driveOn() || D.busy) return;
  D.busy = true; D.err = "";
  try {
    await driveWrite({ app: "dinner-table", updatedAt: S.updatedAt || Date.now(), state: S });
    D.status = "방금 올림";
    if (manual) toast("드라이브에 올렸어요");
  } catch (e) {
    D.err = e.message;
    if (manual) toast("올리지 못했어요 · " + e.message);
  }
  D.busy = false;
  if (manual) render();
}

async function drivePull(manual) {
  if (!driveOn() || D.busy) return false;
  D.busy = true; D.err = "";
  let changed = false;
  try {
    const got = await driveRead();
    if (!got || !got.state) {
      D.status = manual ? "드라이브에 아직 없음" : D.status;
      if (manual) toast("드라이브에 저장된 것이 없어요");
    } else if ((got.updatedAt || 0) > (S.updatedAt || 0)) {
      const keepTheme = S.settings.theme, keepCustom = S.settings.custom;
      S = normalize(got.state);
      S.updatedAt = got.updatedAt;
      // 테마는 기기마다 다르게 쓰고 싶을 수 있어 이 기기 것을 남긴다
      S.settings.theme = keepTheme; S.settings.custom = keepCustom;
      localStorage.setItem(KEY, JSON.stringify(S));
      D.status = "드라이브 것으로 맞춤";
      changed = true;
      if (manual) toast("드라이브에서 가져왔어요");
    } else {
      D.status = "최신 상태";
      if (manual) toast("이미 최신이에요");
    }
  } catch (e) {
    D.err = e.message;
    if (manual) toast("가져오지 못했어요 · " + e.message);
  }
  D.busy = false;
  if (manual || changed) render();
  return changed;
}

/* 저장할 때마다 곧바로 올리면 요청이 너무 잦다. 잠깐 모았다가 한 번에 올린다. */
let pushT = null;
function drivePushLater() {
  if (!driveOn()) return;
  clearTimeout(pushT);
  pushT = setTimeout(() => drivePush(false), 2500);
}

/* ── 연결 / 해제 ── */

async function driveConnect() {
  if (!driveConfigured()) return toast("아직 구글 연동이 설정되지 않았어요");
  try {
    await driveToken(true);
    S.settings.drive = true;
    localStorage.setItem(KEY, JSON.stringify(S));
    const pulled = await drivePull(false);
    if (!pulled) await drivePush(false);   // 드라이브가 비었으면 지금 것을 올린다
    D.status = pulled ? "드라이브 것으로 맞춤" : "방금 올림";
    toast("드라이브에 연결했어요");
  } catch (e) {
    toast("연결하지 못했어요 · " + e.message);
  }
  render();
}

function driveDisconnect() {
  if (D.token && window.google && google.accounts && google.accounts.oauth2) {
    try { google.accounts.oauth2.revoke(D.token, () => {}); } catch (e) {}
  }
  D.token = null; D.fileId = null; D.status = ""; D.err = "";
  localStorage.removeItem(DRIVE_FILEID_KEY);
  S.settings.drive = false;
  localStorage.setItem(KEY, JSON.stringify(S));
  toast("연결을 끊었어요. 이 기기의 데이터는 그대로 있습니다");
  render();
}

/* 앱을 열 때 — 이미 연결해 둔 기기에서만 조용히 맞춘다 */
function driveBoot() {
  if (!driveOn()) return;
  const go = () => drivePull(false).catch(() => {});
  if (window.google && google.accounts) go();
  else window.addEventListener("load", () => setTimeout(go, 600), { once: true });
}
