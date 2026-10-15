import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from './api';
import type { Settings } from './types';
import { Btn, Field, errMsg, input, prepareImage, type Notify } from './ui';

function Repeater({ label, hint, value, keys, max, onChange }: {
  label: string; hint?: string; value: Record<string, string>[]; keys: [string, string][]; max: number;
  onChange: (v: Record<string, string>[]) => void;
}) {
  const update = (i: number, k: string, v: string) => onChange(value.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium">{label}</legend>
      {hint && <p className="text-xs text-mute">{hint}</p>}
      {value.map((row, i) => (
        <div key={i} className="grid gap-2 border border-line p-3 sm:grid-cols-[1fr_2fr_auto]">
          {keys.map(([k, ph]) => (
            <input key={k} aria-label={ph} placeholder={ph} className={input} value={row[k] ?? ''} onChange={(e) => update(i, k, e.target.value)} />
          ))}
          <Btn variant="danger" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>Xóa</Btn>
        </div>
      ))}
      {value.length < max && <Btn variant="ghost" onClick={() => onChange([...value, Object.fromEntries(keys.map(([k]) => [k, '']))])}>Thêm dòng</Btn>}
    </fieldset>
  );
}

function LogoField({ label, hint, value, dark, notify, onChange }: {
  label: string; hint: string; value: string; dark: boolean; notify: Notify; onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await prepareImage(file, 600, true);
      const { url } = await api.admin.upload(blob);
      onChange(url);
      notify('Đã tải logo lên. Bấm "Lưu thay đổi" để áp dụng.');
    } catch (err) { notify(errMsg(err), 'err'); } finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-mute">{hint}</p>
      </div>
      <div className={`grid h-36 place-items-center overflow-hidden border border-line p-5 ${dark ? 'bg-night' : 'bg-white'}`}>
        {value ? <img src={value} alt={label} className="max-h-24 w-auto max-w-full object-contain" /> : <span className={`text-xs ${dark ? 'text-snow/50' : 'text-mute'}`}>Chưa có logo</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id={dark ? 'logo-dark' : 'logo-light'} onChange={(e) => pick(e.target.files?.[0])} />
        <Btn variant="ghost" disabled={busy} onClick={() => ref.current?.click()}>{busy ? 'Đang tải...' : value ? 'Đổi logo' : 'Tải logo lên'}</Btn>
        {value && <Btn variant="danger" onClick={() => onChange('')}>Xóa logo</Btn>}
      </div>
    </div>
  );
}

export function SettingsAdmin({ notify, onChange, onSaved, part }: { notify: Notify; onChange: () => void; onSaved: (s: Settings) => void; part: 'contact' | 'content' }) {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.content().then((c) => setS(c.settings)).catch((e) => notify(errMsg(e), 'err'));
  }, [notify]);
  if (!s) return <p className="text-sm text-mute">Đang tải...</p>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((cur) => (cur ? { ...cur, [k]: v } : cur));
  const text = (k: keyof Settings, label: string, hint?: string, ph?: string) => (
    <Field label={label} hint={hint}>
      <input className={input} placeholder={ph} value={String(s[k])} onChange={(e) => set(k, e.target.value as never)} />
    </Field>
  );

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    try { const saved = await api.admin.saveSettings(s); setS(saved); onSaved(saved); onChange(); notify('Đã lưu cài đặt'); } catch (err) { notify(errMsg(err), 'err'); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={save} className="space-y-10">
        {part === 'content' && (
          <>
        <section className="space-y-5 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Thương hiệu</h2>
          {text('brand', 'Tên thương hiệu', 'Dùng làm chữ thay logo khi chưa tải logo lên, và cho tiêu đề trang.')}
          <div className="grid gap-6 sm:grid-cols-2">
            <LogoField label="Logo" hint="Logo màu đậm, hiện trên nền sáng. Ảnh PNG nền trong suốt là đẹp nhất." value={s.logoUrl} dark={false} notify={notify} onChange={(u) => set('logoUrl', u)} />
            <LogoField label="Logo cho nền tối (không bắt buộc)" hint="Bản màu sáng hoặc trắng, hiện trên ảnh đầu trang và chân trang. Bỏ trống thì tự đổi logo trên sang màu trắng." value={s.logoLightUrl} dark notify={notify} onChange={(u) => set('logoLightUrl', u)} />
          </div>
        </section>

        <section className="space-y-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Địa chỉ website</h2>
          {text('siteUrl', 'Địa chỉ website khách xem', 'Link "Xem website" trong trang quản trị sẽ mở địa chỉ này. Ví dụ https://hima.vn. Để trống thì tự đoán theo máy đang chạy.', 'https://ten-mien-cua-ban.vn')}
        </section>

        <section className="space-y-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Đầu trang</h2>
          {text('heroTitle', 'Câu chào lớn ở đầu trang')}
          <Field label="Mô tả ngắn dưới câu chào"><textarea rows={3} className={input} value={s.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
        </section>

        <section className="space-y-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Giới thiệu</h2>
          {text('aboutTitle', 'Tiêu đề')}
          <Field label="Nội dung"><textarea rows={5} className={input} value={s.aboutText} onChange={(e) => set('aboutText', e.target.value)} /></Field>
          <Repeater label="Ba điều bạn muốn nhấn mạnh" max={4} keys={[['title', 'Tiêu đề ngắn'], ['text', 'Mô tả']]}
            value={s.aboutPoints as unknown as Record<string, string>[]} onChange={(v) => set('aboutPoints', v as unknown as Settings['aboutPoints'])} />
          <Repeater label="Con số nổi bật" hint="Chỉ nhập số liệu thật, ví dụ 120+ và cặp đôi đã đồng hành. Để trống thì không hiện." max={4} keys={[['value', 'Con số, ví dụ 120+'], ['label', 'Nhãn']]}
            value={s.stats as unknown as Record<string, string>[]} onChange={(v) => set('stats', v as unknown as Settings['stats'])} />
        </section>


          </>
        )}

        {part === 'contact' && (
          <>
        <section className="space-y-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Liên hệ</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {text('phone', 'Số điện thoại hiển thị', undefined, '0912 345 678')}
            {text('zalo', 'Số Zalo', 'Nút Zalo ở góc phải dưới sẽ mở chat tới số này.', '0912345678')}
            {text('email', 'Email nhận thông báo', 'Khi khách gửi thông tin, email báo sẽ gửi tới địa chỉ này. Cũng hiện trên website.')}
            {text('hours', 'Giờ làm việc')}
          </div>
          {text('address', 'Địa chỉ')}
          {text('mapUrl', 'Link chỉ đường (Google Maps)', undefined, 'https://maps.app.goo.gl/...')}
        </section>

        <section className="space-y-4 border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Mạng xã hội</h2>
          {text('facebookUrl', 'Trang Facebook', undefined, 'https://www.facebook.com/...')}
          {text('messengerUrl', 'Link Messenger', 'Dạng https://m.me/ten-trang. Để trống thì nút Messenger mở trang Facebook ở trên.', 'https://m.me/...')}
          <div className="grid gap-4 sm:grid-cols-2">
            {text('instagramUrl', 'Instagram')}
            {text('tiktokUrl', 'TikTok')}
          </div>
          {text('youtubeChannelUrl', 'Kênh YouTube')}
        </section>

        <div className="border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-light italic">Xem trước nút liên hệ</h2>
          <p className="mt-1 text-xs text-mute">Ba nút này luôn nằm ở góc phải dưới màn hình website. Nút nào chưa có thông tin sẽ tự ẩn.</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {[
              ['Gọi điện', s.phone ? `tel:${s.phone.replace(/\s/g, '')}` : '', 'bg-claret'],
              ['Zalo', s.zalo ? `zalo.me/${s.zalo.replace(/^\+/, '')}` : '', 'bg-[#0068ff]'],
              ['Messenger', s.messengerUrl || s.facebookUrl, 'bg-linear-to-br from-[#00b2ff] to-[#a334fa]'],
            ].map(([name, link, cls]) => (
              <div key={name} className="flex min-w-0 items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white ${link ? cls : 'bg-line'}`}>{name.slice(0, 1)}</span>
                <span className="min-w-0">
                  <span className="block font-medium">{name}</span>
                  <span className="block max-w-[16rem] truncate text-xs text-mute">{link || 'Chưa nhập, nút sẽ ẩn'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

          </>
        )}

        <div className="sticky bottom-4 z-10"><Btn type="submit" disabled={busy} className="px-8 py-3 shadow-lg">{busy ? 'Đang lưu...' : 'Lưu thay đổi'}</Btn></div>
      </form>

    </div>
  );
}
