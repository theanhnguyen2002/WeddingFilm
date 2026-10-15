import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { youtubeId, youtubeThumb } from './lib/youtube';
import type { Collection } from './types';
import { Btn, Field, errMsg, input, type Notify } from './ui';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'lines' | 'checkbox' | 'youtube'; // bỏ trống nghĩa là ô văn bản một dòng
  placeholder?: string;
  hint?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = { id: string; [k: string]: any };
type Draft = Record<string, string | boolean>;

const toDraft = (row: Row | null, fields: FieldDef[], blank: Record<string, unknown>): Draft => {
  const src = row ?? blank;
  const d: Draft = {};
  for (const f of fields) {
    const v = src[f.key];
    if (f.type === 'checkbox') d[f.key] = Boolean(v);
    else if (f.type === 'lines') d[f.key] = Array.isArray(v) ? v.join('\n') : '';
    else if (f.type === 'youtube') d[f.key] = typeof v === 'string' && v ? `https://youtu.be/${v}` : '';
    else d[f.key] = typeof v === 'string' ? v : '';
  }
  return d;
};

function RowEditor({ row, fields, blank, summary, isNew, first, last, notify, onSave, onDelete, onMove, onCancel }: {
  row: Row | null; fields: FieldDef[]; blank: Record<string, unknown>; summary: (r: Row) => string;
  isNew?: boolean; first?: boolean; last?: boolean; notify: Notify;
  onSave: (payload: Record<string, unknown>) => Promise<void>; onDelete?: () => void; onMove?: (d: number) => void; onCancel?: () => void;
}) {
  const [open, setOpen] = useState(Boolean(isNew));
  const [draft, setDraft] = useState<Draft>(() => toDraft(row, fields, blank));
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string | boolean) => setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = draft[f.key];
      if (f.type === 'lines') payload[f.key] = String(v).split('\n').map((s) => s.trim()).filter(Boolean);
      else if (f.type === 'youtube') {
        if (String(v).trim() && !youtubeId(String(v))) { notify('Link YouTube chưa đúng. Bạn dán link trang xem video nhé.', 'err'); return; }
        payload[f.key] = String(v).trim();
      } else payload[f.key] = v;
    }
    setBusy(true);
    try { await onSave(payload); if (!isNew) notify('Đã lưu'); } catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  }

  const title = isNew ? 'Mục mới' : summary(row as Row) || 'Chưa đặt tên';

  return (
    <li className="border border-line bg-white">
      {!isNew && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-mute">{open ? 'Thu gọn' : 'Sửa'}</span>
        </button>
      )}
      {open && (
        <div className={`space-y-4 px-5 pb-5 ${isNew ? 'pt-5' : 'border-t border-line pt-5'}`}>
          {fields.map((f) => {
            const v = draft[f.key];
            if (f.type === 'checkbox') {
              return (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} className="h-4 w-4 accent-[var(--color-claret)]" />
                  {f.label}
                </label>
              );
            }
            const id = f.type === 'youtube' ? youtubeId(String(v)) : '';
            return (
              <Field key={f.key} label={f.label} hint={f.hint}>
                {f.type === 'textarea' || f.type === 'lines' ? (
                  <textarea rows={f.type === 'lines' ? 5 : 3} className={input} value={String(v)} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
                ) : (
                  <input className={input} value={String(v)} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.type === 'youtube' && id && <img src={youtubeThumb(id)} alt="Ảnh xem trước video" className="mt-3 aspect-video w-48 object-cover" />}
              </Field>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Btn onClick={save} disabled={busy}>{isNew ? 'Thêm' : 'Lưu'}</Btn>
            {isNew && <Btn variant="ghost" onClick={onCancel}>Hủy</Btn>}
            {!isNew && onMove && (
              <>
                <Btn variant="ghost" disabled={first} onClick={() => onMove(-1)} aria-label="Đưa lên trước">↑</Btn>
                <Btn variant="ghost" disabled={last} onClick={() => onMove(1)} aria-label="Đưa xuống sau">↓</Btn>
              </>
            )}
            {!isNew && onDelete && <Btn variant="danger" onClick={onDelete}>Xóa</Btn>}
          </div>
        </div>
      )}
    </li>
  );
}

export function CollectionEditor({ col, intro, addLabel, fields, blank, summary, emptyText, notify }: {
  col: Collection; intro: string; addLabel: string; fields: FieldDef[]; blank: Record<string, unknown>;
  summary: (r: Row) => string; emptyText: string; notify: Notify;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    api.content().then((c) => setRows(c[col] as unknown as Row[])).catch((e) => notify(errMsg(e), 'err'));
  }, [col, notify]);
  useEffect(load, [load]);

  async function move(i: number, d: number) {
    if (!rows) return;
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    try { await api.admin.reorder(col, next.map((r) => r.id)); } catch (e) { notify(errMsg(e), 'err'); load(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-mute">{intro}</p>
        {!adding && <Btn onClick={() => setAdding(true)}>{addLabel}</Btn>}
      </div>

      <ul className="space-y-3">
        {adding && (
          <RowEditor row={null} isNew fields={fields} blank={blank} summary={summary} notify={notify} onCancel={() => setAdding(false)}
            onSave={async (payload) => { await api.admin.create(col, payload); setAdding(false); notify('Đã thêm'); load(); }} />
        )}
        {rows?.map((r, i) => (
          <RowEditor key={r.id + JSON.stringify(r)} row={r} fields={fields} blank={blank} summary={summary} notify={notify}
            first={i === 0} last={i === rows.length - 1} onMove={(d) => move(i, d)}
            onSave={async (payload) => { const next = await api.admin.update<Row>(col, r.id, payload); setRows((arr) => arr?.map((x) => (x.id === r.id ? next : x)) ?? null); }}
            onDelete={async () => {
              if (!window.confirm(`Xóa "${summary(r) || 'mục này'}"?`)) return;
              try { await api.admin.remove(col, r.id); setRows((arr) => arr?.filter((x) => x.id !== r.id) ?? null); notify('Đã xóa'); } catch (e) { notify(errMsg(e), 'err'); }
            }} />
        ))}
      </ul>
      {rows && rows.length === 0 && !adding && <p className="border border-dashed border-line p-10 text-center text-sm text-mute">{emptyText}</p>}
    </div>
  );
}
