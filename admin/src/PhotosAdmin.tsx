import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { PhotoImg } from './components/Photo';
import type { Photo, Settings } from './types';
import { Btn, Field, errMsg, input, prepareImage, type Notify } from './ui';

function PhotoCard({ photo, cats, first, last, onSave, onDelete, onMove }: {
  photo: Photo; cats: string[]; first: boolean; last: boolean;
  onSave: (p: Photo, patch: Partial<Photo>) => Promise<void>; onDelete: (p: Photo) => void; onMove: (d: number) => void;
}) {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState(photo.category);
  const dirty = title !== photo.title || category !== photo.category;

  return (
    <li className="flex flex-col border border-line bg-white">
      <div className="relative aspect-[4/3] bg-line">
        <PhotoImg photo={photo} />
        {photo.featured && <span className="absolute right-2 top-2 rounded-full bg-claret px-2.5 py-1 text-[10px] text-white">Nổi bật</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Field label="Tên ảnh"><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Nhóm">
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
            {(cats.includes(category) ? cats : [...cats, category]).map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={photo.featured} onChange={(e) => onSave(photo, { featured: e.target.checked })} className="h-4 w-4 accent-[var(--color-claret)]" />
          Nổi bật (hiện ở đầu trang)
        </label>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Btn disabled={!dirty} onClick={() => onSave(photo, { title, category })}>Lưu</Btn>
          <Btn variant="ghost" disabled={first} onClick={() => onMove(-1)} aria-label="Đưa lên trước">↑</Btn>
          <Btn variant="ghost" disabled={last} onClick={() => onMove(1)} aria-label="Đưa xuống sau">↓</Btn>
          <Btn variant="danger" onClick={() => onDelete(photo)}>Xóa</Btn>
        </div>
      </div>
    </li>
  );
}

function CategoryManager({ cats, counts, onSave }: { cats: string[]; counts: Record<string, number>; onSave: (next: string[], renames?: [string, string][]) => Promise<void> }) {
  const [draft, setDraft] = useState(cats);
  const [fresh, setFresh] = useState('');
  useEffect(() => setDraft(cats), [cats]);
  const clean = draft.map((c) => c.trim());
  const dup = new Set(clean).size !== clean.length || clean.some((c) => !c);
  const renames = cats.map((c, i) => [c, clean[i]] as [string, string]).filter(([a, b], i) => i < clean.length && a !== b && b);
  const dirty = JSON.stringify(cats) !== JSON.stringify(clean);
  return (
    <section className="space-y-4 border border-line bg-white p-6">
      <div>
        <h2 className="font-display text-2xl font-light italic">Nhóm ảnh</h2>
        <p className="mt-1 text-sm text-mute">Các nhóm này là nút lọc ảnh trên website (ví dụ Lễ ăn hỏi, Đại lễ, Tiệc đón khách). Đổi tên nhóm sẽ đổi luôn cho các ảnh đang thuộc nhóm đó. Website chỉ hiện nút lọc khi có từ 3 nhóm trở lên.</p>
      </div>
      <ul className="space-y-2">
        {draft.map((c, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <input aria-label="Tên nhóm" className={`${input} max-w-xs`} value={c} onChange={(e) => setDraft((d) => d.map((x, k) => (k === i ? e.target.value : x)))} />
            <span className="text-xs text-mute">{counts[cats[i]] ?? 0} ảnh</span>
            <Btn variant="ghost" disabled={i === 0} aria-label="Lên" onClick={() => setDraft((d) => { const n = [...d]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}>↑</Btn>
            <Btn variant="ghost" disabled={i === draft.length - 1} aria-label="Xuống" onClick={() => setDraft((d) => { const n = [...d]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })}>↓</Btn>
            <Btn variant="danger" onClick={() => setDraft((d) => d.filter((_, k) => k !== i))}>Xóa</Btn>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <input aria-label="Nhóm mới" className={`${input} max-w-xs`} placeholder="Tên nhóm mới" value={fresh} onChange={(e) => setFresh(e.target.value)} />
        <Btn variant="ghost" disabled={!fresh.trim()} onClick={() => { setDraft((d) => [...d, fresh.trim()]); setFresh(''); }}>Thêm nhóm</Btn>
      </div>
      {dup && <p className="text-xs text-claret">Tên nhóm không được để trống hoặc trùng nhau.</p>}
      <Btn disabled={!dirty || dup} onClick={() => onSave(clean, renames)}>Lưu nhóm ảnh</Btn>
      <p className="text-xs text-mute">Xóa một nhóm không xóa ảnh. Ảnh vẫn giữ tên nhóm cũ và vẫn lọc được trên website.</p>
    </section>
  );
}

export function PhotosAdmin({ notify }: { notify: Notify }) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api.content().then((c) => { setPhotos(c.photos); setSettings(c.settings); setCategory((cur) => cur || c.settings.photoCategories[0] || ''); }).catch((e) => notify(errMsg(e), 'err'));
  }, [notify]);
  useEffect(load, [load]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).reverse(); // ảnh mới luôn lên đầu, nên tải từ cuối để giữ đúng thứ tự đã chọn
    let ok = 0;
    for (let n = 0; n < list.length; n++) {
      const f = list[n];
      setBusy(`Đang tải ảnh ${n + 1}/${list.length}...`);
      try {
        const { blob, w, h } = await prepareImage(f);
        const { url } = await api.admin.upload(blob);
        await api.admin.create<Photo>('photos', { title: f.name.replace(/\.[^.]+$/, ''), category, src: url, w, h });
        ok++;
      } catch (e) {
        notify(`${f.name}: ${errMsg(e)}`, 'err');
      }
    }
    setBusy('');
    if (fileRef.current) fileRef.current.value = '';
    if (ok) notify(`Đã thêm ${ok} ảnh`);
    load();
  }

  async function save(p: Photo, patch: Partial<Photo>) {
    try {
      const next = await api.admin.update<Photo>('photos', p.id, patch);
      setPhotos((arr) => arr?.map((x) => (x.id === p.id ? next : x)) ?? null);
      notify('Đã lưu');
    } catch (e) { notify(errMsg(e), 'err'); }
  }
  async function remove(p: Photo) {
    if (!window.confirm(`Xóa ảnh "${p.title || 'không tên'}"?`)) return;
    try {
      await api.admin.remove('photos', p.id);
      setPhotos((arr) => arr?.filter((x) => x.id !== p.id) ?? null);
      notify('Đã xóa');
    } catch (e) { notify(errMsg(e), 'err'); }
  }
  async function move(i: number, d: number) {
    if (!photos) return;
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    setPhotos(next);
    try { await api.admin.reorder('photos', next.map((x) => x.id)); } catch (e) { notify(errMsg(e), 'err'); load(); }
  }

  const managed = settings?.photoCategories ?? [];
  const categories = [...managed, ...Array.from(new Set((photos ?? []).map((p) => p.category))).filter((c) => !managed.includes(c))];

  async function saveCats(next: string[], renames: [string, string][] = []) {
    if (!settings) return;
    try {
      for (const [from, to] of renames) {
        for (const ph of (photos ?? []).filter((x) => x.category === from)) await api.admin.update<Photo>('photos', ph.id, { category: to });
      }
      const saved = await api.admin.saveSettings({ ...settings, photoCategories: next });
      setSettings(saved);
      if (renames.some(([f]) => f === category)) setCategory(renames.find(([f]) => f === category)?.[1] ?? '');
      notify('Đã lưu nhóm ảnh');
      load();
    } catch (e) { notify(errMsg(e), 'err'); load(); }
  }
  const hasSamples = photos?.some((p) => !p.src);

  return (
    <div className="space-y-8">
      <CategoryManager cats={managed} counts={Object.fromEntries(categories.map((c) => [c, (photos ?? []).filter((x) => x.category === c).length]))} onSave={saveCats} />
      <section className="border border-dashed border-ink/40 bg-white p-6">
        <h2 className="font-display text-2xl font-light italic">Tải ảnh lên</h2>
        <p className="mt-1 text-sm text-mute">Chọn nhiều ảnh cùng lúc. Ảnh lớn được thu nhỏ tự động (cạnh dài tối đa 2400px) để trang tải nhanh.</p>
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <Field label="Nhóm cho ảnh sắp tải" className="w-64">
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </Field>
          <input ref={fileRef} id="photo-files" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
          <Btn disabled={Boolean(busy)} onClick={() => fileRef.current?.click()}>{busy || 'Chọn ảnh từ máy'}</Btn>
        </div>
      </section>

      {hasSamples && <p className="border-l-2 border-claret bg-claret/5 p-4 text-sm">Các thẻ có nhãn "Ảnh mẫu" là ảnh giữ chỗ. Khi đã tải ảnh thật, bạn bấm Xóa để bỏ chúng.</p>}

      {photos && photos.length === 0 && <p className="text-center text-sm text-mute">Chưa có ảnh nào.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos?.map((p, i) => (
          <PhotoCard key={p.id + p.title + p.category} photo={p} cats={categories} first={i === 0} last={i === photos.length - 1}
            onSave={save} onDelete={remove} onMove={(d) => move(i, d)} />
        ))}
      </ul>
    </div>
  );
}
