import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Content, Settings, TemplateMeta, TemplateOptions, User } from './types';
import { Btn, Field, errMsg, input, type Notify } from './ui';

export const canUse = (u: User, id: string) => u.role === 'admin' || (u.role === 'member' && u.templates[0] === id);

/** Địa chỉ website khách: ưu tiên cấu hình trong admin, rồi biến môi trường, cuối cùng đoán theo cổng dev. */
export function siteBase(settings: Pick<Settings, 'siteUrl'> | null): string {
  const env = (import.meta.env?.VITE_SITE_URL as string | undefined) || '';
  const set = (settings?.siteUrl || env).trim().replace(/\/+$/, '');
  if (set) return /^https?:\/\//i.test(set) ? set : `https://${set}`;
  const { protocol, hostname, port } = window.location;
  // Khi chạy dev, admin ở cổng 5174 còn website ở 5173.
  if (port === '5174') return `${protocol}//${hostname}:5173`;
  return window.location.origin.replace(/\/admin\/?$/, '');
}

function OptionField({ def, value, disabled, onChange }: {
  def: TemplateMeta['options'][number]; value: string | boolean; disabled: boolean; onChange: (v: string | boolean) => void;
}) {
  if (def.type === 'toggle') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" disabled={disabled} className="h-4 w-4 accent-[var(--color-claret)]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {def.label}
      </label>
    );
  }
  if (def.type === 'color') {
    return (
      <Field label={def.label}>
        <span className="flex items-center gap-3">
          <input type="color" disabled={disabled} className="h-10 w-14 cursor-pointer border border-line bg-white p-1" value={String(value)} onChange={(e) => onChange(e.target.value)} />
          <code className="text-xs text-mute">{String(value)}</code>
          {value !== def.default && !disabled && <button type="button" className="text-xs text-claret underline" onClick={() => onChange(def.default)}>Màu gốc</button>}
        </span>
      </Field>
    );
  }
  return (
    <Field label={def.label}>
      <select disabled={disabled} className={input} value={String(value)} onChange={(e) => onChange(e.target.value)}>
        {def.choices?.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
      </select>
    </Field>
  );
}

export function Templates({ me, notify, onSaved }: { me: User; notify: Notify; onSaved: (s: Settings) => void }) {
  const [content, setContent] = useState<Content | null>(null);
  const [active, setActive] = useState('');
  const [picked, setPicked] = useState('');
  const [opts, setOpts] = useState<Record<string, TemplateOptions>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.content().then((c) => {
      setContent(c);
      setActive(c.settings.template);
      setPicked(me.role === 'member' && me.templates[0] ? me.templates[0] : c.settings.template);
      setOpts(c.settings.templateOptions || {});
    }).catch((e) => notify(errMsg(e), 'err'));
  }, [notify, me]);

  const meta = useMemo(() => content?.templates.find((t) => t.id === picked), [content, picked]);
  if (!content || !meta) return <p className="text-sm text-mute">Đang tải...</p>;

  const allowed = canUse(me, picked);
  const own = me.role === 'member' ? me.templates[0] || '' : '';
  const ownName = content.templates.find((x) => x.id === own)?.name || '';
  const value = (k: string, d: string | boolean) => opts[picked]?.[k] ?? d;
  const setOpt = (k: string, v: string | boolean) => setOpts((o) => ({ ...o, [picked]: { ...(o[picked] || {}), [k]: v } }));
  const current: TemplateOptions = Object.fromEntries(meta.options.map((o) => [o.key, value(o.key, o.default)]));
  const previewUrl = `${siteBase(content.settings)}/?template=${picked}&po=${encodeURIComponent(JSON.stringify(current))}`;
  const dirty = picked !== active || JSON.stringify(opts[picked] || {}) !== JSON.stringify(content.settings.templateOptions?.[picked] || {});

  async function apply() {
    if (!content) return;
    setBusy(true);
    try {
      const saved = await api.admin.saveSettings({ ...content.settings, template: picked, templateOptions: { ...content.settings.templateOptions, [picked]: current } });
      setContent({ ...content, settings: saved });
      setActive(saved.template);
      setOpts(saved.templateOptions || {});
      onSaved(saved);
      notify(`Website đang dùng giao diện "${meta?.name}"`);
    } catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-mute">
        Chọn giao diện cho website. Nội dung (ảnh, phim, dịch vụ, quy trình) giữ nguyên, chỉ bố cục và phong cách đổi.
        {me.role === 'admin' ? ' Ở mục Tài khoản, bạn phân cho mỗi hội viên một giao diện. Hội viên chỉ dùng và làm việc trên giao diện đó.' : ''}
      </p>

      <div className="border border-line bg-white p-4 text-sm">
        <p>Website đang dùng giao diện <strong>{content.templates.find((x) => x.id === active)?.name}</strong>.</p>
        {me.role === 'member' && (
          <p className="mt-1.5 text-mute">
            {!own
              ? 'Bạn chưa được phân giao diện nên chỉ xem được. Hãy nhờ quản trị viên phân giao diện cho bạn.'
              : active === own
                ? <>Đây là giao diện được phân cho bạn. Bạn chỉnh được màu, kiểu hiển thị và toàn bộ nội dung website trên giao diện này.</>
                : <>Giao diện được phân cho bạn là <strong className="text-ink">{ownName}</strong>. Bấm <em>Áp dụng</em> bên dưới để website chạy giao diện của bạn, sau đó bạn mới sửa được nội dung.</>}
          </p>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {content.templates.filter((t) => me.role === 'admin' || canUse(me, t.id)).map((t) => {
          const ok = canUse(me, t.id);
          const sel = t.id === picked;
          return (
            <li key={t.id}>
              <button type="button" onClick={() => setPicked(t.id)} aria-pressed={sel}
                className={`flex h-full w-full flex-col border bg-white text-left transition ${sel ? 'border-claret ring-2 ring-claret/20' : 'border-line hover:border-ink'}`}>
                <span className="flex h-24">
                  {t.swatches.map((c, i) => (<i key={c + i} className="flex-1" style={{ background: c }} />))}
                </span>
                <span className="flex flex-1 flex-col gap-1.5 p-4">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="font-display text-xl font-normal">{t.name}</strong>
                    {t.id === active && <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] text-white">Đang dùng</span>}
                    {me.role === 'member' && ok && <span className="rounded-full bg-claret/10 px-2.5 py-0.5 text-[10px] text-claret">Được phân cho bạn</span>}
                  </span>
                  <span className="text-xs font-medium text-claret">{t.tagline}</span>
                  <span className="text-xs leading-relaxed text-mute">{t.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="space-y-5 border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-light italic">Tuỳ chỉnh "{meta.name}"</h2>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-line px-4 py-2 text-sm hover:border-ink">Xem thử trên website ↗</a>
        </div>
        {!allowed && <p className="border-l-2 border-claret bg-claret/5 p-3 text-sm">Bạn xem thử được nhưng chưa có quyền áp dụng hoặc chỉnh giao diện này. Hãy nhờ quản trị viên cấp quyền.</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          {meta.options.map((o) => (
            <OptionField key={o.key} def={o} value={value(o.key, o.default)} disabled={!allowed} onChange={(v) => setOpt(o.key, v)} />
          ))}
        </div>
        <p className="text-xs text-mute">Nút "Xem thử" hiện cả các tuỳ chỉnh chưa lưu, website thật chỉ đổi sau khi bạn bấm Áp dụng.</p>
        <Btn disabled={busy || !allowed || !dirty} onClick={apply}>{picked === active ? 'Lưu tuỳ chỉnh' : 'Áp dụng giao diện này'}</Btn>
      </section>
    </div>
  );
}
