// Gửi email báo có khách liên hệ, qua SMTP (mặc định Gmail). Không cần thư viện ngoài.
// Gmail: bật xác minh 2 bước rồi tạo "Mật khẩu ứng dụng" (App password) để dùng làm SMTP_PASS.
import net from 'node:net';
import tls from 'node:tls';

const cfg = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== '0', // 465 dùng TLS ngay từ đầu. Đặt 0 chỉ để thử với máy chủ nội bộ.
  user: process.env.SMTP_USER || '',
  pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  // MAIL_FROM có thể viết "Tên <email>" hoặc chỉ email. Chỉ phần email dùng cho phong bì thư.
  from: (((process.env.MAIL_FROM || '').match(/<([^>]+)>/)?.[1] || process.env.MAIL_FROM || '').trim()) || process.env.SMTP_USER || '',
});

export const mailConfigured = () => {
  const c = cfg();
  return Boolean(c.user && c.pass);
};

const PLACEHOLDER = /@example\.com$/i;
export const recipientFor = (settings) => {
  const to = (process.env.NOTIFY_EMAIL || settings?.email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) && !PLACEHOLDER.test(to) ? to : '';
};

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const wrap = (s) => s.replace(/(.{76})/g, '$1\r\n');
const header = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const clean = (s) => String(s || '').replace(/[\r\n]+/g, ' ').trim();

function smtp(c, from, to, raw) {
  return new Promise((resolve, reject) => {
    const sock = c.secure ? tls.connect({ host: c.host, port: c.port, servername: c.host }) : net.connect({ host: c.host, port: c.port });
    sock.setTimeout(20_000, () => done(new Error('Quá thời gian chờ máy chủ email.')));
    let buf = '';
    let waiter = null;
    let finished = false;
    function done(err) {
      if (finished) return;
      finished = true;
      sock.destroy();
      err ? reject(err) : resolve();
    }
    sock.on('error', done);
    sock.on('close', () => done(new Error('Máy chủ email đóng kết nối sớm.')));
    sock.on('data', (d) => {
      buf += d.toString('utf8');
      const lines = buf.split('\r\n');
      // Phản hồi hoàn chỉnh khi dòng cuối có dạng "250 ..." (dấu cách sau mã).
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i]) && waiter) {
          const code = Number(lines[i].slice(0, 3));
          const text = lines.slice(0, i + 1).join('\n');
          buf = lines.slice(i + 1).join('\r\n');
          const w = waiter;
          waiter = null;
          w({ code, text });
          return;
        }
      }
    });
    const reply = () => new Promise((r) => { waiter = r; });
    const cmd = async (line, ok) => {
      sock.write(line + '\r\n');
      const r = await reply();
      if (!ok.includes(r.code)) throw new Error(`Máy chủ email từ chối (${r.code}): ${r.text.slice(0, 120)}`);
      return r;
    };
    (async () => {
      const hello = await reply();
      if (hello.code !== 220) throw new Error(`Máy chủ email chưa sẵn sàng (${hello.code}).`);
      await cmd('EHLO hima.local', [250]);
      await cmd('AUTH LOGIN', [334]);
      await cmd(b64(c.user), [334]);
      await cmd(b64(c.pass), [235]);
      await cmd(`MAIL FROM:<${from}>`, [250]);
      await cmd(`RCPT TO:<${to}>`, [250, 251]);
      await cmd('DATA', [354]);
      await cmd(raw.replace(/^\./gm, '..') + '\r\n.', [250]);
      await cmd('QUIT', [221]).catch(() => {});
      done();
    })().catch(done);
  });
}

function inquiryText(q, settings) {
  const days = q.date2 ? `${q.date} và ${q.date2} (2 ngày)` : q.date || '(chưa nhập)';
  return [
    `Có khách vừa gửi thông tin trên website ${settings.brand}.`,
    '',
    `Họ tên: ${q.name}`,
    `Số điện thoại: ${q.phone}`,
    `Ngày cưới: ${days}`,
    `Địa điểm: ${q.venue || '(chưa nhập)'}`,
    `Lễ cần chụp, quay: ${q.packageName || '(chưa chọn)'}`,
    '',
    'Lời nhắn:',
    q.message || '(không có)',
    '',
    `Gọi ngay: ${q.phone}`,
    `Xem và quản lý trong trang quản trị, mục "Liên hệ khách".`,
  ].join('\r\n');
}

/** Trả về { status: 'sent' | 'skipped' | 'failed', error? }. Không bao giờ ném lỗi ra ngoài. */
export async function sendInquiryMail(q, settings) {
  const c = cfg();
  const to = recipientFor(settings);
  if (!mailConfigured()) return { status: 'skipped', error: 'Chưa cấu hình SMTP_USER và SMTP_PASS trên máy chủ.' };
  if (!to) return { status: 'skipped', error: 'Chưa có email nhận thông báo trong mục Liên hệ của trang quản trị.' };
  try {
    const subject = `Khách mới: ${clean(q.name)} (${clean(q.phone)})`;
    const raw = [
      `From: ${header(clean(settings.brand))} <${c.from}>`,
      `To: <${to}>`,
      `Subject: ${header(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap(b64(inquiryText(q, settings))),
    ].join('\r\n');
    await smtp(c, c.from, to, raw);
    return { status: 'sent' };
  } catch (e) {
    return { status: 'failed', error: String(e.message || e).slice(0, 200) };
  }
}

/** Gửi một email thử để quản trị viên biết cấu hình đã chạy chưa. Trả về { status, to, error? }. */
export async function sendTestMail(settings) {
  const c = cfg();
  const to = recipientFor(settings);
  if (!mailConfigured()) return { status: 'skipped', to, error: 'Chưa cấu hình SMTP_USER và SMTP_PASS trên máy chủ.' };
  if (!to) return { status: 'skipped', to, error: 'Chưa có email nhận thông báo trong mục Liên hệ của trang quản trị.' };
  try {
    const raw = [
      `From: ${header(clean(settings.brand))} <${c.from}>`,
      `To: <${to}>`,
      `Subject: ${header('Email thử từ website ' + clean(settings.brand))}`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap(b64('Email thử thành công. Từ giờ khi có khách gửi thông tin trên website, bạn sẽ nhận email báo như thế này.')),
    ].join('\r\n');
    await smtp(c, c.from, to, raw);
    return { status: 'sent', to };
  } catch (e) {
    return { status: 'failed', to, error: String(e.message || e).slice(0, 200) };
  }
}
