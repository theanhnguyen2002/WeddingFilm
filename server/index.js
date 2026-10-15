// Máy chủ Node.js không cần thư viện ngoài: API + file ảnh tải lên + phục vụ bản build của website.
import './env.js';
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS, UPLOAD_DIR, clean, db, sanitizeInquiry, sanitizeSettings, save, sorted, uid } from './db.js';
import {
  ROLES, STATUSES, memberTemplate, writeBlockReason, createUser, ensureAdmin, findById, findByLogin, googleClientId, grantableTemplates,
  hashPassword, loginWithGoogle, loginWithPassword, publicUser, setPassword, signToken, usingDefaultPassword,
  verifyGoogleCredential, verifyToken,
} from './auth.js';
import { TEMPLATES } from './templates.js';
import { TEXT_DEFS } from './texts.js';
import { mailConfigured, recipientFor, sendInquiryMail, sendTestMail } from './mailer.js';

ensureAdmin();

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.CLIENT_DIST ? path.resolve(process.env.CLIENT_DIST) : path.resolve(here, '../client/dist');
const PORT = Number(process.env.PORT) || 3001;
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const MAX_UPLOAD = 15 * 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
};

/* ---------- Tiện ích ---------- */
const send = (res, status, body, headers = {}) => {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
};

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn.');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}
async function readJson(req, limit = 1024 * 1024) {
  const buf = await readBody(req, limit);
  if (buf.length === 0) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw new HttpError(400, 'Dữ liệu không đúng định dạng.');
  }
}

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.every((t) => now - t > 3600_000)) hits.delete(k);
}, 600_000).unref();

const clientIp = (req) =>
  (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';

function requireUser(req) {
  const h = req.headers.authorization || '';
  const u = h.startsWith('Bearer ') ? verifyToken(h.slice(7)) : null;
  if (!u) throw new HttpError(401, 'Bạn cần đăng nhập.');
  return u;
}
const needWrite = (u) => {
  const why = writeBlockReason(u);
  if (why) throw new HttpError(403, why);
};
// Việc không gắn với giao diện (xử lý liên hệ khách): hội viên đã có giao diện là làm được, dù website đang chạy giao diện nào.
const needMember = (u) => {
  if (u.role !== 'admin' && !memberTemplate(u)) throw new HttpError(403, writeBlockReason(u));
};
const needAdmin = (u) => {
  if (u.role !== 'admin') throw new HttpError(403, 'Chỉ quản trị viên mới làm được việc này.');
};

const publicContent = () => ({
  settings: db.settings,
  photos: sorted(db.photos),
  videos: sorted(db.videos),
  packages: sorted(db.packages),
  process: sorted(db.process),
  testimonials: sorted(db.testimonials),
  templates: TEMPLATES,
  textDefs: TEXT_DEFS,
});

function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return '.jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return '.webp';
  if (buf.subarray(0, 3).toString() === 'GIF') return '.gif';
  if (buf.subarray(4, 8).toString() === 'ftyp' && /avif|avis/.test(buf.subarray(8, 16).toString())) return '.avif';
  return null;
}

async function removeUploadIfUnused(src) {
  if (!src || !src.startsWith('/uploads/')) return;
  if (db.photos.some((p) => p.src === src)) return;
  await fsp.unlink(path.join(UPLOAD_DIR, path.basename(src))).catch(() => {});
}

/* ---------- API ---------- */
async function handleApi(req, res, url) {
  const m = req.method;
  const p = url.pathname;
  let r;

  if (m === 'GET' && p === '/api/health') return send(res, 200, { ok: true });
  if (m === 'GET' && p === '/api/content') return send(res, 200, publicContent(), { 'Cache-Control': 'no-cache' });

  if (m === 'POST' && p === '/api/inquiries') {
    if (limited('inq:' + clientIp(req), 6, 3600_000)) throw new HttpError(429, 'Bạn gửi hơi nhiều lần, vui lòng thử lại sau ít phút.');
    const body = await readJson(req, 20_000);
    if (body.website) return send(res, 201, { ok: true }); // ô bẫy bot: giả vờ thành công
    const { value, error } = sanitizeInquiry(body);
    if (error) throw new HttpError(400, error);
    const inquiry = { id: uid(), createdAt: Date.now(), status: 'new', mail: { status: 'pending' }, ...value };
    db.inquiries.unshift(inquiry);
    db.inquiries = db.inquiries.slice(0, 2000);
    save();
    // Gửi email ở nền: khách không phải chờ, lỗi email cũng không làm mất thông tin khách đã gửi.
    sendInquiryMail(inquiry, db.settings).then((r) => {
      inquiry.mail = { ...r, at: Date.now() };
      save();
      if (r.status === 'failed') console.warn('Không gửi được email báo khách mới:', r.error);
    });
    return send(res, 201, { ok: true });
  }

  if (m === 'GET' && p === '/api/auth/config') {
    return send(res, 200, { googleClientId: googleClientId(), allowRegister: Boolean(db.settings.allowRegister) });
  }

  if (m === 'POST' && p === '/api/auth/login') {
    if (limited('login:' + clientIp(req), 10, 600_000)) throw new HttpError(429, 'Thử sai nhiều lần, vui lòng đợi 10 phút.');
    const body = await readJson(req, 5_000);
    const r = loginWithPassword(body.login || body.username || 'admin', body.password);
    if (r.error) throw new HttpError(401, r.error);
    return send(res, 200, { token: signToken(r.user), user: publicUser(r.user) });
  }

  if (m === 'POST' && p === '/api/auth/register') {
    if (limited('reg:' + clientIp(req), 5, 3600_000)) throw new HttpError(429, 'Bạn đăng ký hơi nhiều lần, vui lòng thử lại sau.');
    if (!db.settings.allowRegister) throw new HttpError(403, 'Website hiện chưa mở đăng ký tài khoản mới.');
    const body = await readJson(req, 5_000);
    if (body.website) return send(res, 201, { ok: true });
    if (typeof body.password !== 'string' || body.password.length < 8) throw new HttpError(400, 'Mật khẩu cần ít nhất 8 ký tự.');
    if (!body.email) throw new HttpError(400, 'Bạn nhập giúp mình email nhé.');
    try {
      createUser({ email: body.email, name: body.name, password: body.password, role: 'member', status: 'pending' });
    } catch (e) {
      throw new HttpError(400, e.message);
    }
    return send(res, 201, { ok: true, message: 'Đã gửi đăng ký. Tài khoản sẽ dùng được sau khi quản trị viên duyệt.' });
  }

  if (m === 'POST' && p === '/api/auth/google') {
    if (limited('google:' + clientIp(req), 20, 600_000)) throw new HttpError(429, 'Thử quá nhiều lần, vui lòng đợi ít phút.');
    const body = await readJson(req, 6_000);
    let g;
    try {
      g = await verifyGoogleCredential(body.credential);
    } catch (e) {
      throw new HttpError(401, e.message);
    }
    const r = loginWithGoogle(g, { allowRegister: Boolean(db.settings.allowRegister) });
    if (r.error) throw new HttpError(r.created ? 202 : 403, r.error);
    return send(res, 200, { token: signToken(r.user), user: publicUser(r.user) });
  }

  /* ----- Từ đây cần đăng nhập ----- */
  if (!p.startsWith('/api/admin/')) throw new HttpError(404, 'Không tìm thấy.');
  const me = requireUser(req);

  if (m === 'GET' && p === '/api/admin/me') {
    return send(res, 200, {
      user: publicUser(me), defaultPassword: usingDefaultPassword(me),
      mail: { configured: mailConfigured(), to: recipientFor(db.settings) },
    });
  }

  if (m === 'POST' && p === '/api/admin/mail/test') {
    needAdmin(me);
    return send(res, 200, await sendTestMail(db.settings));
  }

  if (m === 'POST' && p === '/api/admin/password') {
    const body = await readJson(req, 5_000);
    if (me.passHash && loginWithPassword(me.username, body.current).error) throw new HttpError(400, 'Mật khẩu hiện tại chưa đúng.');
    if (typeof body.next !== 'string' || body.next.length < 8) throw new HttpError(400, 'Mật khẩu mới cần ít nhất 8 ký tự.');
    setPassword(me, body.next);
    return send(res, 200, { token: signToken(me) });
  }

  if (m === 'PUT' && p === '/api/admin/profile') {
    const body = await readJson(req, 5_000);
    const name = String(body.name || '').trim().slice(0, 80);
    if (!name) throw new HttpError(400, 'Bạn nhập giúp mình tên hiển thị nhé.');
    me.name = name;
    save();
    return send(res, 200, publicUser(me));
  }

  /* ----- Quản lý tài khoản (chỉ quản trị viên) ----- */
  if (p === '/api/admin/users' || p.startsWith('/api/admin/users/')) {
    needAdmin(me);
    if (m === 'GET' && p === '/api/admin/users') return send(res, 200, db.users.map(publicUser));
    if (m === 'POST' && p === '/api/admin/users') {
      const body = await readJson(req, 5_000);
      try {
        const u = createUser({
          username: body.username, email: body.email, name: body.name, password: body.password,
          role: body.role, status: body.status === 'pending' ? 'pending' : 'active', templates: body.templates,
        });
        return send(res, 201, publicUser(u));
      } catch (e) {
        throw new HttpError(400, e.message);
      }
    }
    const um = p.match(/^\/api\/admin\/users\/(\w+)$/);
    const target = um && findById(um[1]);
    if (!target) throw new HttpError(404, 'Không tìm thấy tài khoản này.');
    const admins = () => db.users.filter((x) => x.role === 'admin' && x.status === 'active');
    if (m === 'PUT') {
      const body = await readJson(req, 5_000);
      const nextRole = body.role === undefined ? target.role : body.role;
      const nextStatus = body.status === undefined ? target.status : body.status;
      if (!ROLES.includes(nextRole) || !STATUSES.includes(nextStatus)) throw new HttpError(400, 'Vai trò hoặc trạng thái không hợp lệ.');
      const losesAdmin = target.role === 'admin' && target.status === 'active' && (nextRole !== 'admin' || nextStatus !== 'active');
      if (losesAdmin && admins().length <= 1) throw new HttpError(400, 'Phải còn ít nhất một quản trị viên đang hoạt động.');
      if (target.id === me.id && losesAdmin) throw new HttpError(400, 'Bạn không thể tự hạ quyền hoặc khoá chính mình.');
      if (body.email !== undefined) {
        const em = String(body.email).trim().toLowerCase();
        const other = em && findByLogin(em);
        if (other && other.id !== target.id) throw new HttpError(400, 'Email này đã thuộc về tài khoản khác.');
        if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) throw new HttpError(400, 'Email chưa đúng định dạng.');
        target.email = em;
      }
      if (body.name !== undefined) target.name = String(body.name).trim().slice(0, 80) || target.name;
      if (body.password) {
        if (String(body.password).length < 8) throw new HttpError(400, 'Mật khẩu mới cần ít nhất 8 ký tự.');
        target.passHash = hashPassword(String(body.password));
        target.defaultPassword = false;
      }
      target.role = nextRole;
      target.status = nextStatus;
      if (body.templates !== undefined) target.templates = grantableTemplates(body.templates);
      target.tokenVersion = (target.tokenVersion || 1) + 1; // đăng nhập lại để áp dụng quyền mới
      save();
      return send(res, 200, publicUser(target));
    }
    if (m === 'DELETE') {
      if (target.id === me.id) throw new HttpError(400, 'Bạn không thể xoá chính mình.');
      if (target.role === 'admin' && target.status === 'active' && admins().length <= 1) throw new HttpError(400, 'Phải còn ít nhất một quản trị viên.');
      db.users = db.users.filter((x) => x !== target);
      save();
      return send(res, 200, { ok: true });
    }
  }

  if (m === 'GET' && p === '/api/admin/summary') {
    return send(res, 200, {
      photos: db.photos.length, videos: db.videos.length, packages: db.packages.length, testimonials: db.testimonials.length,
      inquiries: db.inquiries.length, newInquiries: db.inquiries.filter((i) => i.status === 'new').length,
      latest: db.inquiries.slice(0, 5),
    });
  }

  if (m === 'GET' && p === '/api/admin/inquiries') return send(res, 200, db.inquiries);

  if ((r = p.match(/^\/api\/admin\/inquiries\/(\w+)$/))) {
    if (m !== 'GET') needMember(me);
    const item = db.inquiries.find((i) => i.id === r[1]);
    if (!item) throw new HttpError(404, 'Không tìm thấy liên hệ này.');
    if (m === 'PATCH') {
      needMember(me);
      const body = await readJson(req, 5_000);
      if (!['new', 'contacted', 'booked', 'skipped'].includes(body.status)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
      item.status = body.status;
      save();
      return send(res, 200, item);
    }
    if (m === 'DELETE') {
      needMember(me);
      db.inquiries = db.inquiries.filter((i) => i !== item);
      save();
      return send(res, 200, { ok: true });
    }
  }

  if (m === 'PUT' && p === '/api/admin/settings') {
    const incoming = await readJson(req);
    if (me.role !== 'admin') {
      // Hội viên chỉ làm việc trên giao diện được phân cho mình.
      const own = memberTemplate(me);
      if (!own) throw new HttpError(403, writeBlockReason(me));
      if (db.settings.template !== own) {
        // Website đang chạy giao diện khác: việc duy nhất được làm là chuyển sang giao diện của mình.
        if (incoming.template !== own) throw new HttpError(403, writeBlockReason(me));
        const sw = sanitizeSettings({ ...db.settings, template: own, templateOptions: { ...db.settings.templateOptions, [own]: (incoming.templateOptions || {})[own] ?? db.settings.templateOptions[own] } });
        db.settings = { ...db.settings, template: sw.template, templateOptions: { ...db.settings.templateOptions, [own]: sw.templateOptions[own] } };
        save();
        return send(res, 200, db.settings);
      }
    }
    const next = sanitizeSettings({ ...db.settings, ...incoming });
    if (me.role !== 'admin') {
      next.allowRegister = db.settings.allowRegister; // chỉ quản trị viên mở hoặc đóng đăng ký
      const own = memberTemplate(me);
      for (const t of TEMPLATES) {
        if (t.id !== own) next.templateOptions[t.id] = db.settings.templateOptions[t.id];
      }
      if (next.template !== own) throw new HttpError(403, 'Bạn chỉ dùng được giao diện được phân cho mình.');
    }
    db.settings = next;
    save();
    return send(res, 200, db.settings);
  }

  if (m === 'POST' && p === '/api/admin/upload') {
    needWrite(me);
    const type = String(req.headers['content-type'] || '').split(';')[0];
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(type)) throw new HttpError(415, 'Chỉ nhận ảnh JPG, PNG, WebP, GIF hoặc AVIF.');
    const buf = await readBody(req, MAX_UPLOAD);
    const ext = sniffImage(buf);
    if (!ext) throw new HttpError(415, 'File này không phải ảnh hợp lệ.');
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    await fsp.writeFile(path.join(UPLOAD_DIR, name), buf);
    return send(res, 201, { url: `/uploads/${name}`, bytes: buf.length });
  }

  if ((r = p.match(/^\/api\/admin\/(\w+)(?:\/(\w+))?$/)) && COLLECTIONS.includes(r[1])) {
    const col = r[1];
    const arr = db[col];
    const id = r[2];
    if (m !== 'GET') needWrite(me);

    if (m === 'POST' && id === 'reorder') {
      const { ids } = await readJson(req, 50_000);
      if (!Array.isArray(ids)) throw new HttpError(400, 'Danh sách thứ tự không hợp lệ.');
      ids.forEach((x, i) => {
        const it = arr.find((a) => a.id === x);
        if (it) it.order = i + 1;
      });
      save();
      return send(res, 200, sorted(arr));
    }
    if (m === 'POST' && !id) {
      if (arr.length >= 500) throw new HttpError(400, 'Đã đạt số lượng tối đa.');
      const orders = arr.map((a) => a.order || 0);
      // Ảnh mới nằm đầu danh sách, các mục khác nằm cuối.
      const order = col === 'photos' ? Math.min(1, ...orders) - 1 : Math.max(0, ...orders) + 1;
      const item = { id: uid(), order, ...clean(col, await readJson(req)) };
      arr.push(item);
      save();
      return send(res, 201, item);
    }
    if (id) {
      const item = arr.find((a) => a.id === id);
      if (!item) throw new HttpError(404, 'Không tìm thấy mục này.');
      if (m === 'PUT') {
        const before = item.src;
        Object.assign(item, clean(col, { ...item, ...(await readJson(req)) }));
        save();
        if (col === 'photos' && before !== item.src) await removeUploadIfUnused(before);
        return send(res, 200, item);
      }
      if (m === 'DELETE') {
        db[col] = arr.filter((a) => a !== item);
        save();
        if (col === 'photos') await removeUploadIfUnused(item.src);
        return send(res, 200, { ok: true });
      }
    }
  }

  throw new HttpError(404, 'Không tìm thấy.');
}

/* ---------- File tĩnh ---------- */
async function serveFile(res, file, cache) {
  const data = await fsp.readFile(file);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': data.length,
    'Cache-Control': cache,
  });
  res.end(data);
}

async function handleStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Phương thức không được hỗ trợ.');
  const p = decodeURIComponent(url.pathname);

  if (p.startsWith('/uploads/')) {
    const name = path.basename(p);
    if (!/^[\w.-]+$/.test(name)) throw new HttpError(404, 'Không tìm thấy.');
    return serveFile(res, path.join(UPLOAD_DIR, name), 'public, max-age=31536000, immutable').catch(() => send(res, 404, 'Không tìm thấy.'));
  }

  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    return send(res, 200, 'Chưa có bản build giao diện. Chạy "npm run build" rồi tải lại trang, hoặc dùng "npm run dev" khi phát triển.');
  }
  const file = path.normalize(path.join(DIST, p));
  if (file.startsWith(DIST + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    const hashed = p.startsWith('/assets/');
    return serveFile(res, file, hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }
  if (path.extname(p)) throw new HttpError(404, 'Không tìm thấy.');
  return serveFile(res, path.join(DIST, 'index.html'), 'no-cache'); // trang con như /admin
}

/* ---------- Máy chủ ---------- */
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else await handleStatic(req, res, url);
  } catch (e) {
    if (res.headersSent) return res.end();
    if (e instanceof HttpError) return send(res, e.status, { error: e.message });
    console.error(e);
    send(res, 500, { error: 'Máy chủ gặp lỗi, vui lòng thử lại.' });
  }
});

server.listen(PORT, () => {
  console.log(`Wedding Film chạy tại http://localhost:${PORT}`);
  console.log(`Trang quản trị: http://localhost:${PORT}/admin`);
  if (db.users.some((u) => u.role === 'admin' && usingDefaultPassword(u))) {
    console.warn('\n⚠  Tài khoản "admin" đang dùng mật khẩu mặc định "hima2026". Hãy đổi trong trang quản trị hoặc đặt biến ADMIN_PASSWORD.\n');
  }
  console.log(`Email báo khách mới: ${mailConfigured() ? 'đã cấu hình SMTP' : 'chưa cấu hình (đặt SMTP_USER và SMTP_PASS)'} | Đăng nhập Google: ${googleClientId() ? 'bật' : 'tắt'}`);
});
