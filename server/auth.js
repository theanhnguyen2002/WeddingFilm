// Tài khoản, vai trò và đăng nhập (mật khẩu hoặc Google). Token ký HMAC, không cần thư viện ngoài.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import { DATA_DIR, db, save, uid } from './db.js';
import { TEMPLATE_IDS } from './templates.js';

const DEFAULT_PASSWORD = 'hima2026';
const LEGACY_FILE = path.join(DATA_DIR, 'admin.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');
const TOKEN_TTL_MS = 7 * 24 * 3600 * 1000;

export const ROLES = ['admin', 'member'];
export const STATUSES = ['active', 'pending', 'disabled'];

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function secret() {
  if (process.env.TOKEN_SECRET) return process.env.TOKEN_SECRET;
  try {
    return fs.readFileSync(SECRET_FILE, 'utf8').trim();
  } catch {
    const s = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, s, { mode: 0o600 });
    return s;
  }
}
const SECRET = secret();

/* ---------- Mật khẩu ---------- */
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(pw, salt, 32).toString('hex')}`;
}
function checkHash(pw, stored) {
  if (!stored || typeof pw !== 'string' || pw.length === 0 || pw.length > 200) return false;
  const [salt, hex] = stored.split(':');
  const test = crypto.scryptSync(pw, salt, 32);
  return crypto.timingSafeEqual(test, Buffer.from(hex, 'hex'));
}

/* ---------- Người dùng ---------- */
const lower = (s) => String(s || '').trim().toLowerCase();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function publicUser(u) {
  return {
    id: u.id, username: u.username, email: u.email, name: u.name, picture: u.picture || '',
    role: u.role, status: u.status, templates: u.templates || [],
    hasPassword: Boolean(u.passHash), google: Boolean(u.googleId),
    createdAt: u.createdAt, lastLoginAt: u.lastLoginAt || 0,
  };
}

export const findById = (id) => db.users.find((u) => u.id === id);
export const findByLogin = (login) => {
  const l = lower(login);
  return l ? db.users.find((u) => u.username === l || (u.email && u.email === l)) : undefined;
};

// Hội viên chỉ được phân đúng một giao diện, admin không cần danh sách này.
export function grantableTemplates(list) {
  return [...new Set((Array.isArray(list) ? list : []).filter((t) => TEMPLATE_IDS.includes(t)))].slice(0, 1);
}

/** Tạo tài khoản quản trị đầu tiên khi chưa có ai, dùng mật khẩu cũ nếu máy chủ đã từng đặt. */
export function ensureAdmin() {
  normalizeRoles();
  if (db.users.some((u) => u.role === 'admin')) {
    const envMail = lower(process.env.ADMIN_EMAIL);
    const first = db.users.find((u) => u.role === 'admin' && !u.email);
    if (envMail && EMAIL.test(envMail) && first && !findByLogin(envMail)) { first.email = envMail; save(); }
    return;
  }
  let passHash = '';
  let defaultPassword = false;
  try {
    passHash = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8')).hash || '';
  } catch { /* chưa có file cũ */ }
  if (!passHash) {
    passHash = hashPassword(process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD);
    defaultPassword = !process.env.ADMIN_PASSWORD;
  }
  const envMail = lower(process.env.ADMIN_EMAIL);
  db.users.push({
    id: uid(), username: 'admin', email: EMAIL.test(envMail) ? envMail : '', name: 'Quản trị viên', picture: '',
    role: 'admin', status: 'active', templates: [...TEMPLATE_IDS], passHash, googleId: '', defaultPassword,
    tokenVersion: 1, createdAt: Date.now(), lastLoginAt: 0,
  });
  save();
}

export function createUser({ username, email, name, password, role = 'member', status = 'pending', templates = [], googleId = '', picture = '' }) {
  const em = lower(email);
  const un = lower(username) || em;
  if (!un) throw new Error('Cần email hoặc tên đăng nhập.');
  if (em && !EMAIL.test(em)) throw new Error('Email chưa đúng định dạng.');
  if (!/^[\w.@+-]{3,60}$/.test(un)) throw new Error('Tên đăng nhập chỉ gồm chữ, số và các dấu . _ - @ (từ 3 ký tự).');
  if (findByLogin(un) || (em && findByLogin(em))) throw new Error('Email hoặc tên đăng nhập này đã có tài khoản.');
  if (password !== undefined && password !== null && password !== '' && String(password).length < 8) throw new Error('Mật khẩu cần ít nhất 8 ký tự.');
  const u = {
    id: uid(), username: un, email: em, name: String(name || '').trim().slice(0, 80) || un, picture,
    role: ROLES.includes(role) ? role : 'member', status: STATUSES.includes(status) ? status : 'pending',
    templates: grantableTemplates(templates), passHash: password ? hashPassword(String(password)) : '',
    googleId, defaultPassword: false, tokenVersion: 1, createdAt: Date.now(), lastLoginAt: 0,
  };
  db.users.push(u);
  save();
  return u;
}

export const usingDefaultPassword = (u) => Boolean(u?.defaultPassword);

export function setPassword(u, next) {
  u.passHash = hashPassword(next);
  u.defaultPassword = false;
  u.tokenVersion = (u.tokenVersion || 1) + 1;
  save();
}

export function loginWithPassword(login, pw) {
  const u = findByLogin(login);
  // Luôn băm một lần để thời gian phản hồi không lộ tài khoản có tồn tại hay không.
  const ok = u ? checkHash(pw, u.passHash) : (checkHash(String(pw || ''), `${'0'.repeat(32)}:${'0'.repeat(64)}`), false);
  if (!u || !ok) return { error: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' };
  return statusGate(u);
}

function statusGate(u) {
  if (u.status === 'pending') return { error: 'Tài khoản đang chờ quản trị viên duyệt. Bạn sẽ đăng nhập được sau khi được duyệt.' };
  if (u.status === 'disabled') return { error: 'Tài khoản này đã bị khoá. Vui lòng liên hệ quản trị viên.' };
  u.lastLoginAt = Date.now();
  save();
  return { user: u };
}

/* ---------- Google ---------- */
export const googleClientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.get(u, { timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; if (data.length > 20000) req.destroy(); });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch { reject(new Error('Phản hồi không hợp lệ.')); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('Quá thời gian chờ Google.')));
    req.on('error', reject);
  });
}

/** Kiểm tra mã đăng nhập Google (ID token) do nút "Đăng nhập bằng Google" trả về. */
export async function verifyGoogleCredential(credential) {
  const clientId = googleClientId();
  if (!clientId) throw new Error('Máy chủ chưa bật đăng nhập Google (thiếu GOOGLE_CLIENT_ID).');
  if (typeof credential !== 'string' || credential.length < 20 || credential.length > 4000) throw new Error('Mã đăng nhập Google không hợp lệ.');
  const base = process.env.GOOGLE_TOKENINFO_URL || 'https://oauth2.googleapis.com/tokeninfo';
  let r;
  try {
    r = await getJson(`${base}?id_token=${encodeURIComponent(credential)}`);
  } catch {
    throw new Error('Không kết nối được tới Google để xác minh. Vui lòng thử lại.');
  }
  const t = r.body || {};
  const issOk = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  if (r.status !== 200 || t.aud !== clientId || !issOk || !(Number(t.exp) * 1000 > Date.now())) throw new Error('Không xác minh được tài khoản Google này.');
  if (String(t.email_verified) !== 'true' || !EMAIL.test(lower(t.email))) throw new Error('Email Google này chưa được xác minh.');
  return { sub: String(t.sub), email: lower(t.email), name: String(t.name || '').slice(0, 80), picture: /^https:\/\//.test(t.picture || '') ? t.picture : '' };
}

export function loginWithGoogle(g, { allowRegister }) {
  let u = db.users.find((x) => x.googleId && x.googleId === g.sub) || findByLogin(g.email);
  if (u) {
    if (!u.googleId) u.googleId = g.sub;
    if (g.picture) u.picture = g.picture;
    if (!u.email) u.email = g.email;
    if (!u.name || u.name === u.username) u.name = g.name || u.name;
    save();
    return statusGate(u);
  }
  if (!allowRegister) return { error: 'Email Google này chưa được cấp quyền. Hãy nhờ quản trị viên tạo tài khoản cho bạn.' };
  u = createUser({ email: g.email, name: g.name, role: 'member', status: 'pending', googleId: g.sub, picture: g.picture });
  return { error: 'Đã gửi yêu cầu đăng ký. Tài khoản đang chờ quản trị viên duyệt.', created: true };
}

/* ---------- Token ---------- */
export function signToken(u) {
  const payload = b64(JSON.stringify({ uid: u.id, v: u.tokenVersion || 1, exp: Date.now() + TOKEN_TTL_MS }));
  const sig = b64(crypto.createHmac('sha256', SECRET).update(payload).digest());
  return `${payload}.${sig}`;
}

/** Trả về người dùng đang hoạt động, hoặc null nếu token sai, hết hạn hoặc tài khoản đã bị khoá. */
export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const good = b64(crypto.createHmac('sha256', SECRET).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const u = findById(data.uid);
    if (!u || u.status !== 'active' || data.exp <= Date.now() || data.v !== (u.tokenVersion || 1)) return null;
    return u;
  } catch {
    return null;
  }
}

/* ---------- Phân quyền ---------- */
// admin: toàn quyền, quản lý tài khoản.
// member (hội viên): được phân đúng một giao diện, chỉ dùng và làm việc trên giao diện đó.
//   Chưa được phân giao diện thì chỉ xem. Được sửa nội dung khi website đang chạy đúng giao diện của mình.
export const memberTemplate = (u) => (u?.role === 'member' ? (u.templates || [])[0] || '' : '');
export const can = (u, action) => {
  if (!u) return false;
  if (u.role === 'admin') return true;
  if (action === 'read') return true;
  if (action === 'write') return Boolean(memberTemplate(u)) && db.settings.template === memberTemplate(u);
  return false; // 'users' và các việc riêng của admin
};
export const canUseTemplate = (u, id) => u.role === 'admin' || (u.role === 'member' && memberTemplate(u) === id);
/** Lý do không ghi được, để báo cho đúng người. Trả về chuỗi rỗng nếu được ghi. */
export function writeBlockReason(u) {
  if (can(u, 'write')) return '';
  const own = memberTemplate(u);
  if (!own) return 'Tài khoản của bạn chưa được phân giao diện nên chỉ xem được. Hãy nhờ quản trị viên phân giao diện cho bạn.';
  return 'Website đang chạy giao diện khác với giao diện của bạn. Vào mục Giao diện, bấm Áp dụng giao diện của bạn trước rồi hãy chỉnh sửa.';
}

/** Đổi tài khoản cũ (editor, viewer) sang hội viên. Viewer cũ không có giao diện nên vẫn chỉ xem. */
export function normalizeRoles() {
  let changed = false;
  for (const u of db.users) {
    if (!ROLES.includes(u.role)) { u.role = 'member'; changed = true; }
    if (u.role === 'member' && (u.templates || []).length > 1) { u.templates = u.templates.slice(0, 1); changed = true; }
  }
  if (changed) save();
}
