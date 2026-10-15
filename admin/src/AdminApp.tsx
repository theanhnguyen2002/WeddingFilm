import { useCallback, useEffect, useState } from 'react';
import { api, token, type Summary } from './api';
import { AdminBrand, useBrandHead } from './Brand';
import type { MailInfo, Settings, TemplateMeta, User } from './types';
import { Accounts, Avatar, MyAccount, ROLE_LABEL } from './Accounts';
import { Texts } from './Texts';
import { Templates, siteBase } from './Templates';
import { CollectionEditor } from './CollectionEditor';
import { Dashboard } from './Dashboard';
import { Inquiries } from './Inquiries';
import { Login } from './Login';
import { PhotosAdmin } from './PhotosAdmin';
import { SettingsAdmin } from './SettingsAdmin';
import { Btn, useToast } from './ui';

/** Đổi chuỗi này mỗi lần phát hành để biết trình duyệt đang chạy bản admin nào. */
const BUILD = 'admin 2026.10.10 · chữ tuỳ chỉnh';

export type Tab = 'dashboard' | 'inquiries' | 'photos' | 'videos' | 'packages' | 'testimonials' | 'process' | 'templates' | 'texts' | 'contact' | 'settings' | 'account' | 'users';

const TABS: [Tab, string, string][] = [
  ['dashboard', 'Tổng quan', 'Tình hình website của bạn'],
  ['inquiries', 'Liên hệ khách', 'Khách gửi thông tin từ biểu mẫu'],
  ['photos', 'Ảnh', 'Thư viện ảnh trên trang chủ'],
  ['videos', 'Video', 'Phim YouTube trưng bày'],
  ['packages', 'Dịch vụ', 'Ba lễ chính bạn nhận chụp và quay'],
  ['process', 'Quy trình', 'Các bước làm việc hiển thị trên website'],
  ['testimonials', 'Cảm nhận khách', 'Lời cảm ơn của các cặp đôi'],
  ['templates', 'Giao diện', 'Chọn và tuỳ chỉnh giao diện website'],
  ['texts', 'Chữ trên website', 'Sửa menu, nút, tiêu đề mục, biểu mẫu và chân trang'],
  ['contact', 'Liên hệ & mạng xã hội', 'Số điện thoại, Zalo, Messenger, Facebook, email, địa chỉ'],
  ['settings', 'Nội dung website', 'Câu chào, giới thiệu, con số nổi bật, địa chỉ website'],
  ['users', 'Tài khoản', 'Duyệt, phân quyền và cấp giao diện cho từng người'],
  ['account', 'Tài khoản của tôi', 'Tên hiển thị và mật khẩu'],
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(Boolean(token.get()));
  const [tab, setTab] = useState<Tab>('dashboard');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [defaultPw, setDefaultPw] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const [mail, setMail] = useState<MailInfo | null>(null);
  const [tpls, setTpls] = useState<TemplateMeta[]>([]);
  const [brand, setBrand] = useState<Settings | null>(null);
  const { notify, node } = useToast();
  const [pendingUsers, setPendingUsers] = useState(0);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    const out = () => setAuthed(false);
    window.addEventListener('hima-logout', out);
    return () => {
      meta.remove();
      window.removeEventListener('hima-logout', out);
    };
  }, []);

  useEffect(() => {
    if (authed && me?.role === 'admin') api.admin.users().then((u) => setPendingUsers(u.filter((x) => x.status === 'pending').length)).catch(() => {});
  }, [authed, me, tab]);

  useBrandHead(brand);
  useEffect(() => {
    api.content().then((c) => { setBrand(c.settings); setTpls(c.templates); }).catch(() => {});
  }, []);

  const refresh = useCallback(() => {
    api.admin.summary().then(setSummary).catch(() => {});
  }, []);

  const loadMe = useCallback(() => {
    api.admin.me().then((r) => { setMe(r.user); setDefaultPw(r.defaultPassword); setMail(r.mail); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!authed) return;
    refresh();
    loadMe();
  }, [authed, refresh, loadMe]);

  if (!authed) return <Login brand={brand} onDone={() => setAuthed(true)} />;
  if (!me) return <div className="grid min-h-screen place-items-center bg-night text-sm text-snow/70">Đang tải...</div>;

  const isAdmin = me.role === 'admin';
  const own = me.role === 'member' ? me.templates[0] || '' : '';
  const ownName = tpls.find((x) => x.id === own)?.name || '';
  const notice = me.role !== 'member' ? ''
    : !own ? 'Tài khoản hội viên của bạn chưa được phân giao diện nên chỉ xem được. Hãy nhờ quản trị viên phân giao diện cho bạn.'
    : brand && brand.template !== own ? `Website đang chạy giao diện khác. Bạn chỉ làm việc trên giao diện "${ownName}": vào mục Giao diện, bấm Áp dụng trước rồi mới chỉnh sửa được.`
    : '';
  const tabs = TABS.filter(([id]) => id !== 'users' || isAdmin);
  const current = (tabs.find((x) => x[0] === tab) ?? tabs[0]) as [Tab, string, string];
  const logout = () => { token.clear(); setMe(null); setAuthed(false); };

  return (
    <div className="min-h-screen bg-snow md:flex">
      <aside className="bg-night text-snow md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-8">
          <div>
            <AdminBrand settings={brand} onDark imgClass="h-12 md:h-16" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-snow/50">Quản trị</p>
          </div>
          <a href={siteBase(brand) + (own ? `/?template=${own}` : '')} target="_blank" rel="noopener noreferrer" className="text-xs text-rose hover:text-white md:mt-6 md:block">Xem website ↗</a>
        </div>
        <nav className="hide-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0" aria-label="Quản trị">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} aria-current={current[0] === id ? 'page' : undefined}
              className={`flex shrink-0 items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${current[0] === id ? 'bg-white/10 text-white' : 'text-snow/65 hover:bg-white/5 hover:text-white'}`}>
              {label}
              {id === 'users' && pendingUsers > 0 && <span className="rounded-full bg-claret px-2 py-0.5 text-[10px] text-white">{pendingUsers}</span>}
              {id === 'inquiries' && summary && summary.newInquiries > 0 && (
                <span className="rounded-full bg-claret px-2 py-0.5 text-[10px] text-white">{summary.newInquiries}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden px-5 py-6 md:absolute md:bottom-0 md:block md:w-60">
          <div className="mb-4 flex items-center gap-3">
            <Avatar user={me} />
            <span className="min-w-0"><span className="block truncate text-sm text-white">{me.name}</span><span className="block text-[11px] text-snow/50">{ROLE_LABEL[me.role]}</span></span>
          </div>
          <button type="button" onClick={logout} className="text-xs text-snow/55 hover:text-white">Đăng xuất</button>
          <p className="mt-3 text-[10px] text-snow/30">{BUILD}</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-light">{current[1]}</h1>
            <p className="mt-1 text-sm text-mute">{current[2]}</p>
          </div>
          <Btn variant="ghost" className="md:hidden" onClick={logout}>Đăng xuất</Btn>
        </header>
        <div>
          {notice && <p className="mb-6 border-l-2 border-claret bg-claret/5 p-3 text-sm">{notice}</p>}
          {current[0] === 'dashboard' && <Dashboard summary={summary} defaultPassword={defaultPw} mail={mail} go={setTab} isAdmin={isAdmin} notify={notify} />}
          {current[0] === 'inquiries' && <Inquiries notify={notify} onChange={refresh} />}
          {current[0] === 'photos' && <PhotosAdmin notify={notify} />}
          {current[0] === 'videos' && (
            <CollectionEditor col="videos" notify={notify} addLabel="Thêm video"
              intro="Dán link video YouTube. Video đánh dấu Nổi bật sẽ hiện to nhất, các video còn lại nằm bên cạnh."
              emptyText="Chưa có video nào. Bấm Thêm video để dán link YouTube."
              blank={{ title: '', place: '', youtubeId: '', featured: false }} summary={(r) => r.title}
              fields={[
                { key: 'title', label: 'Tên phim', placeholder: 'Phóng sự cưới An và Bình' },
                { key: 'place', label: 'Địa điểm hoặc mô tả ngắn', placeholder: 'Đà Lạt, 2026' },
                { key: 'youtubeId', label: 'Link YouTube', type: 'youtube', placeholder: 'https://www.youtube.com/watch?v=...', hint: 'Chấp nhận link youtube.com, youtu.be và shorts.' },
                { key: 'featured', label: 'Nổi bật (hiện to ở đầu mục Phim)', type: 'checkbox' },
              ]} />
          )}
          {current[0] === 'packages' && (
            <CollectionEditor col="packages" notify={notify} addLabel="Thêm hạng mục"
              intro="Các lễ hiển thị trên website, mỗi lễ là một thẻ. Lễ đánh dấu Nổi bật có nền đỏ rượu vang. Website không hiện giá."
              emptyText="Chưa có hạng mục nào." blank={{ name: '', badge: '', tagline: '', features: [], highlight: false }} summary={(r) => r.name}
              fields={[
                { key: 'name', label: 'Tên lễ', placeholder: 'Lễ ăn hỏi' },
                { key: 'tagline', label: 'Mô tả ngắn', placeholder: 'Buổi lễ đầu tiên của hai gia đình' },
                { key: 'badge', label: 'Nhãn nhỏ phía trên (không bắt buộc)', placeholder: 'Ngày chính' },
                { key: 'features', label: 'Chúng mình chụp và quay những gì', type: 'lines', hint: 'Mỗi dòng một ý.' },
                { key: 'highlight', label: 'Nổi bật', type: 'checkbox' },
              ]} />
          )}
          {current[0] === 'process' && (
            <CollectionEditor col="process" notify={notify} addLabel="Thêm bước"
              intro="Các bước làm việc từ lúc khách liên hệ đến khi nhận phim. Dùng dấu ↑ ↓ để đổi thứ tự. Mục này tự ẩn khỏi website nếu không còn bước nào."
              emptyText="Chưa có bước nào, mục Quy trình đang ẩn trên website." blank={{ title: '', text: '' }} summary={(r) => r.title}
              fields={[
                { key: 'title', label: 'Tên bước', placeholder: 'Tư vấn và chốt lịch' },
                { key: 'text', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Hai bạn kể về ngày cưới, chúng mình báo lịch và quyền lợi.' },
              ]} />
          )}
          {current[0] === 'templates' && <Templates me={me} notify={notify} onSaved={setBrand} />}
          {current[0] === 'texts' && <Texts me={me} notify={notify} onSaved={setBrand} />}
          {current[0] === 'users' && isAdmin && <Accounts me={me} templates={tpls} notify={notify} />}
          {current[0] === 'account' && <MyAccount me={me} defaultPassword={defaultPw} onUser={setMe} onPasswordChanged={loadMe} notify={notify} />}
          {current[0] === 'testimonials' && (
            <CollectionEditor col="testimonials" notify={notify} addLabel="Thêm lời cảm ơn"
              intro="Chỉ thêm lời cảm ơn thật của khách, và nên xin phép họ trước. Mục này tự ẩn khỏi trang chủ khi chưa có nội dung."
              emptyText="Chưa có lời cảm ơn nào, mục này đang ẩn trên trang chủ." blank={{ names: '', place: '', text: '' }} summary={(r) => r.names}
              fields={[
                { key: 'names', label: 'Tên cặp đôi', placeholder: 'An và Bình' },
                { key: 'place', label: 'Địa điểm hoặc năm cưới' },
                { key: 'text', label: 'Lời cảm ơn', type: 'textarea' },
              ]} />
          )}
          {current[0] === 'contact' && <SettingsAdmin part="contact" notify={notify} onChange={refresh} onSaved={setBrand} />}
          {current[0] === 'settings' && <SettingsAdmin part="content" notify={notify} onChange={refresh} onSaved={setBrand} />}
        </div>
        </div>
      </main>
      {node}
    </div>
  );
}
