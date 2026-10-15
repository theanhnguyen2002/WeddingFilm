import { useState } from 'react';
import { api, type Summary } from './api';
import type { MailInfo } from './types';
import { formatDateTime } from './format';
import type { Tab } from './AdminApp';
import { Btn, errMsg, type Notify } from './ui';

export function Dashboard({ summary, defaultPassword, mail, go, isAdmin, notify }: { summary: Summary | null; defaultPassword: boolean; mail: MailInfo | null; go: (t: Tab) => void; isAdmin: boolean; notify: Notify }) {
  const [testing, setTesting] = useState(false);
  async function test() {
    setTesting(true);
    try {
      const r = await api.admin.testMail();
      if (r.status === 'sent') notify(`Đã gửi email thử tới ${r.to}. Kiểm tra hộp thư (cả mục Spam).`);
      else notify(r.error || 'Không gửi được email thử.', 'err');
    } catch (e) { notify(errMsg(e), 'err'); } finally { setTesting(false); }
  }
  const cards: [string, number | string, Tab][] = summary
    ? [
        ['Liên hệ mới', summary.newInquiries, 'inquiries'],
        ['Tổng liên hệ', summary.inquiries, 'inquiries'],
        ['Ảnh', summary.photos, 'photos'],
        ['Video', summary.videos, 'videos'],
        ['Gói dịch vụ', summary.packages, 'packages'],
        ['Cảm nhận khách', summary.testimonials, 'testimonials'],
      ]
    : [];

  return (
    <div className="space-y-8">
      {defaultPassword && (
        <div className="flex flex-col gap-3 border border-claret/40 bg-claret/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm"><strong>Bạn đang dùng mật khẩu mặc định.</strong> Hãy đổi trước khi đưa website lên mạng.</p>
          <Btn onClick={() => go('account')}>Đổi mật khẩu</Btn>
        </div>
      )}

      {mail && (
        <div className={`border p-5 text-sm ${mail.configured && mail.to ? 'border-line bg-white text-mute' : 'border-claret/40 bg-claret/5'}`}>
          {mail.configured && mail.to
            ? <>Email báo khách mới sẽ gửi tới <strong className="text-ink">{mail.to}</strong> (email ở mục Liên hệ & mạng xã hội). {isAdmin && <button type="button" disabled={testing} className="ml-1 underline" onClick={test}>{testing ? 'Đang gửi...' : 'Gửi email thử'}</button>}</>
            : !mail.configured
              ? <><strong>Chưa bật email báo khách mới.</strong> Cần điền SMTP_USER và SMTP_PASS (mật khẩu ứng dụng Gmail) trong file .env của máy chủ. Xem README.</>
              : <><strong>Chưa có email nhận thông báo.</strong> Hãy nhập email thật ở mục <button type="button" className="underline" onClick={() => go('contact')}>Liên hệ & mạng xã hội</button>.</>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(([label, n, tab]) => (
          <button key={label} type="button" onClick={() => go(tab)} className="border border-line bg-white p-5 text-left transition hover:border-ink">
            <span className="block font-display text-4xl font-light tabular-nums">{n}</span>
            <span className="mt-1 block text-xs text-mute">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-5">
        <p className="text-sm text-mute">Đổi số điện thoại, Zalo, Messenger, Facebook hiển thị trên website.</p>
        <Btn variant="ghost" onClick={() => go('contact')}>Sửa thông tin liên hệ</Btn>
      </div>

      <section>
        <h2 className="mb-3 font-display text-2xl font-light italic">Liên hệ gần đây</h2>
        {summary && summary.latest.length === 0 && <p className="text-sm text-mute">Chưa có khách nào gửi thông tin qua biểu mẫu.</p>}
        <ul className="divide-y divide-line border border-line bg-white">
          {summary?.latest.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <span><strong>{i.name}</strong> <span className="text-mute">· {i.phone}</span></span>
              <span className="text-xs text-mute">{formatDateTime(i.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-line bg-white p-6 text-sm leading-relaxed text-mute">
        <h2 className="mb-2 font-display text-2xl font-light italic text-ink">Bắt đầu nhanh</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Vào <strong>Liên hệ & mạng xã hội</strong> nhập số điện thoại, Zalo, email, địa chỉ và các đường dẫn mạng xã hội.</li>
          <li>Vào <strong>Ảnh</strong> tải ảnh thật lên, tích "Nổi bật" cho những ảnh muốn hiện ở đầu trang.</li>
          <li>Vào <strong>Video</strong> dán link YouTube của các phim.</li>
          <li>Vào <strong>Gói dịch vụ</strong> sửa tên, giá và quyền lợi theo bảng giá của bạn.</li>
        </ol>
      </section>
    </div>
  );
}
