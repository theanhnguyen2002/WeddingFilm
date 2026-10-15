import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { api } from '../api';
import type { Pkg } from '../types';
import { useT } from '../lib/texts';

const field =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-hidden transition placeholder:text-mute/60 focus:border-claret focus:ring-4 focus:ring-claret/10';
const label = 'mb-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-mute';

interface Props {
  packages: Pkg[];
  selectedPackage: string;
  /** Lớp CSS thêm cho nút gửi, để từng giao diện đổi hình dáng nút. */
  buttonClass?: string;
}

/**
 * Biểu mẫu nhận thông tin khách (1 hoặc 2 ngày cưới). Dùng chung cho mọi giao diện, màu sắc lấy theo các biến
 * --color-* của giao diện đang chọn. Thông báo thành công hoặc lỗi hiện bằng toast.
 */
export function InquiryForm({ packages, selectedPackage, buttonClass = '' }: Props) {
  const t = useT();
  const [days, setDays] = useState<1 | 2>(2);
  const [form, setForm] = useState({ name: '', phone: '', date: '', date2: '', venue: '', packageName: '', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPackage) setForm((f) => ({ ...f, packageName: selectedPackage }));
  }, [selectedPackage]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      await api.sendInquiry({ ...form, date2: days === 2 ? form.date2 : '' });
      setState('done');
      toast.success(t('form.toastOk'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('form.error');
      setError(msg);
      toast.error(msg);
      setState('idle');
    }
  }

  return (
    <>
  {state === 'done' ? (
    <div className="py-14 text-center" role="status">
      <p className="font-display text-4xl font-light italic text-claret">{t('form.thanksTitle')}</p>
      <p className="mx-auto mt-5 max-w-sm text-mute">{t('form.thanksText')}</p>
    </div>
  ) : (
    <form onSubmit={submit} noValidate className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <div>
        <label htmlFor="c-name" className={label}>{t('form.name')}</label>
        <input id="c-name" className={field} value={form.name} onChange={set('name')} autoComplete="name" placeholder={t('form.namePh')} required />
      </div>
      <div>
        <label htmlFor="c-phone" className={label}>{t('form.phone')}</label>
        <input id="c-phone" className={field} value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" required />
      </div>
      <fieldset className="sm:col-span-2">
        <legend className={label}>{t('form.duration')}</legend>
        <div className="mt-2 inline-flex rounded-full border border-line bg-white p-1" role="radiogroup" aria-label="Số ngày tổ chức">
          {([2, 1] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={days === n}
              onClick={() => setDays(n)}
              className={`rounded-full px-5 py-2 text-sm transition ${days === n ? 'bg-claret text-white shadow' : 'text-mute hover:text-ink'}`}
            >
              {t('form.days', { n })}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-mute">{days === 2 ? t('form.hint2') : t('form.hint1')}</p>
      </fieldset>
      <div>
        <label htmlFor="c-date" className={label}>{days === 2 ? t('form.date1') : t('form.dateSingle')}</label>
        <input id="c-date" type="date" className={field} value={form.date} onChange={set('date')} />
      </div>
      {days === 2 && (
        <div>
          <label htmlFor="c-date2" className={label}>{t('form.date2')}</label>
          <input id="c-date2" type="date" min={form.date || undefined} className={field} value={form.date2} onChange={set('date2')} />
        </div>
      )}
      <div className={days === 2 ? 'sm:col-span-2' : ''}>
        <label htmlFor="c-venue" className={label}>{t('form.venue')}</label>
        <input id="c-venue" className={field} value={form.venue} onChange={set('venue')} placeholder={t('form.venuePh')} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-pkg" className={label}>{t('form.package')}</label>
        <select id="c-pkg" className={field} value={form.packageName} onChange={set('packageName')}>
          <option value="">{t('form.packageNone')}</option>
          {packages.map((p) => (<option key={p.id} value={p.name}>{p.name}</option>))}
          {packages.length > 1 && <option value={t('form.packageAll')}>{t('form.packageAll')}</option>}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-msg" className={label}>{t('form.message')}</label>
        <textarea id="c-msg" rows={4} className={field} value={form.message} onChange={set('message')} placeholder={t('form.messagePh')} />
      </div>
      {/* Ô bẫy bot: người thật không nhìn thấy và không điền */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
      </div>
      {error && <p className="text-sm text-claret sm:col-span-2" role="alert">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === 'sending'} className={`btn-shine w-full rounded-full bg-claret px-10 py-4 text-sm font-medium tracking-wide text-white shadow-[0_12px_36px_rgba(123,36,55,0.4)] transition hover:-translate-y-0.5 hover:bg-claret-deep disabled:opacity-60 sm:w-auto ${buttonClass}`}>
          {state === 'sending' ? t('form.sending') : t('form.send')}
        </button>
      </div>
    </form>
  )}

    </>
  );
}
