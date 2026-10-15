import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Content, User } from './types';
import { Btn, errMsg, input, type Notify } from './ui';

/** Chữ mặc định của một mã theo giao diện. */
const defaultOf = (d: Content['textDefs'][number], tpl: string) => d.by[tpl] ?? d.def;

/**
 * Sửa toàn bộ chữ cố định trên website (menu, nút, tiêu đề mục, biểu mẫu, chân trang...).
 * Chữ nào để trống sẽ dùng chữ mặc định của giao diện. Mỗi tài khoản chỉ thấy các mục thuộc giao diện của mình.
 */
export function Texts({ me, notify, onSaved }: { me: User; notify: Notify; onSaved: (c: Content['settings']) => void }) {
  const [content, setContent] = useState<Content | null>(null);
  const [tpl, setTpl] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const own = me.role === 'member' ? me.templates[0] || '' : '';

  useEffect(() => {
    api.content().then((c) => {
      setContent(c);
      setTpl(own || c.settings.template);
      setVals(c.settings.texts || {});
    }).catch((e) => notify(errMsg(e), 'err'));
  }, [notify, own]);

  const list = useMemo(() => (content?.textDefs ?? []).filter((d) => d.only.includes(tpl)), [content, tpl]);
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out: [string, typeof list][] = [];
    for (const d of list) {
      const hay = `${d.label} ${vals[d.key] ?? ''} ${defaultOf(d, tpl)}`.toLowerCase();
      if (needle && !hay.includes(needle)) continue;
      const g = out.find((x) => x[0] === d.group);
      if (g) g[1].push(d); else out.push([d.group, [d]]);
    }
    return out;
  }, [list, q, vals, tpl]);

  if (!content || !tpl) return <p className="text-sm text-mute">Đang tải...</p>;

  const saved = content.settings.texts || {};
  const edited = list.filter((d) => (vals[d.key] ?? '') !== (saved[d.key] ?? '')).length;
  const customCount = list.filter((d) => (vals[d.key] ?? '').trim()).length;
  const tplName = content.templates.find((x) => x.id === tpl)?.name || tpl;

  async function save() {
    setBusy(true);
    try {
      // Lấy bản mới nhất để không ghi đè các thay đổi khác của website.
      const fresh = await api.content();
      const texts = { ...(fresh.settings.texts || {}) };
      for (const d of list) {
        const v = (vals[d.key] ?? '').trim() ? vals[d.key] : '';
        if (v) texts[d.key] = v; else delete texts[d.key];
      }
      const next = await api.admin.saveSettings({ ...fresh.settings, texts });
      setContent({ ...fresh, settings: next });
      setVals(next.texts || {});
      onSaved(next);
      notify('Đã lưu chữ trên website');
    } catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-2 text-sm text-mute">
        <p>
          Sửa toàn bộ chữ cố định trên website: menu, nút bấm, tiêu đề từng mục, biểu mẫu khách điền và chân trang.
          Ô nào để trống sẽ dùng chữ mặc định (hiện mờ trong ô). Tên thương hiệu đổi ở mục <em>Nội dung website</em>.
        </p>
        <p>
          Trong tiêu đề, đặt chữ giữa hai dấu sao, ví dụ <code className="bg-paper px-1">Những khoảnh khắc *không ai dặn trước*</code>, để in nghiêng và tô màu nhấn.
          Chỗ có <code className="bg-paper px-1">{'{n}'}</code> sẽ được thay bằng một con số.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 border border-line bg-white p-4">
        {me.role === 'admin' ? (
          <label className="text-xs font-medium">
            Giao diện đang sửa chữ
            <select className={`${input} mt-1 block`} value={tpl} onChange={(e) => setTpl(e.target.value)}>
              {content.templates.map((t) => (<option key={t.id} value={t.id}>{t.name}{t.id === content.settings.template ? ' (đang dùng)' : ''}</option>))}
            </select>
          </label>
        ) : (
          <p className="text-sm">Giao diện của bạn: <strong>{tplName}</strong></p>
        )}
        <label className="min-w-[14rem] flex-1 text-xs font-medium">
          Tìm mục chữ
          <input className={`${input} mt-1`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ví dụ: báo giá, địa chỉ, gửi" />
        </label>
        <p className="text-xs text-mute">{customCount} mục đã sửa, {list.length} mục tất cả</p>
      </div>

      {groups.length === 0 && <p className="text-sm text-mute">Không có mục nào khớp.</p>}
      {groups.map(([group, items]) => (
        <section key={group} className="space-y-4">
          <h3 className="border-b border-line pb-2 font-display text-xl italic">{group}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((d) => {
              const def = defaultOf(d, tpl);
              const v = vals[d.key] ?? '';
              const common = {
                id: `tx-${d.key}`, className: input, value: v, placeholder: def || '(để trống)',
                onChange: (e: { target: { value: string } }) => setVals((o) => ({ ...o, [d.key]: e.target.value })),
              };
              return (
                <div key={d.key} className={d.long ? 'md:col-span-2' : ''}>
                  <label htmlFor={`tx-${d.key}`} className="mb-1 flex items-center justify-between text-xs font-medium">
                    <span>{d.label}</span>
                    {v && <button type="button" className="text-claret underline" onClick={() => setVals((o) => { const n = { ...o }; delete n[d.key]; return n; })}>Chữ gốc</button>}
                  </label>
                  {d.long ? <textarea rows={2} maxLength={600} {...common} /> : <input maxLength={600} {...common} />}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-snow/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Btn onClick={save} disabled={busy || edited === 0}>{busy ? 'Đang lưu...' : 'Lưu chữ'}</Btn>
        <span className="text-xs text-mute">{edited ? `${edited} mục chưa lưu` : 'Chưa có thay đổi'}</span>
      </div>
    </div>
  );
}
