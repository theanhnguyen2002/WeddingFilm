import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Inquiry, InquiryStatus } from './types';
import { formatDateTime, formatDay } from './format';
import { Btn, errMsg, type Notify } from './ui';

const STATUS: Record<InquiryStatus, string> = { new: 'Mới', contacted: 'Đã liên hệ', booked: 'Đã chốt lịch', skipped: 'Bỏ qua' };
const COLOR: Record<InquiryStatus, string> = {
  new: 'bg-claret text-white', contacted: 'bg-night text-white', booked: 'bg-emerald-700 text-white', skipped: 'bg-line text-mute',
};

export function Inquiries({ notify, onChange }: { notify: Notify; onChange: () => void }) {
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');

  const load = useCallback(() => {
    api.admin.inquiries().then(setItems).catch((e) => notify(errMsg(e), 'err'));
  }, [notify]);
  useEffect(load, [load]);

  async function setStatus(i: Inquiry, status: InquiryStatus) {
    try {
      await api.admin.setInquiryStatus(i.id, status);
      setItems((arr) => arr?.map((x) => (x.id === i.id ? { ...x, status } : x)) ?? null);
      onChange();
    } catch (e) { notify(errMsg(e), 'err'); }
  }
  async function remove(i: Inquiry) {
    if (!window.confirm(`Xóa liên hệ của ${i.name}?`)) return;
    try {
      await api.admin.deleteInquiry(i.id);
      setItems((arr) => arr?.filter((x) => x.id !== i.id) ?? null);
      onChange();
      notify('Đã xóa');
    } catch (e) { notify(errMsg(e), 'err'); }
  }
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); notify('Đã sao chép số điện thoại'); }
    catch { notify('Không sao chép được, bạn bôi đen số để chép nhé', 'err'); }
  }

  const shown = items?.filter((i) => filter === 'all' || i.status === filter) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
        {(['all', 'new', 'contacted', 'booked', 'skipped'] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs transition ${filter === s ? 'border-ink bg-ink text-white' : 'border-line bg-white text-mute hover:border-ink'}`}>
            {s === 'all' ? 'Tất cả' : STATUS[s]}
          </button>
        ))}
      </div>

      {items && shown.length === 0 && <p className="border border-dashed border-line p-10 text-center text-sm text-mute">Chưa có liên hệ nào ở mục này.</p>}

      <ul className="space-y-3">
        {shown.map((i) => (
          <li key={i.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-medium">{i.name}</p>
                <p className="mt-0.5 text-xs text-mute">{formatDateTime(i.createdAt)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${COLOR[i.status]}`}>{STATUS[i.status]}</span>
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="inline text-mute">Điện thoại: </dt><dd className="inline"><a className="text-claret underline underline-offset-2" href={`tel:${i.phone.replace(/\s/g, '')}`}>{i.phone}</a></dd></div>
              {i.date && (
                <div>
                  <dt className="inline text-mute">{i.date2 ? 'Cưới 2 ngày: ' : 'Ngày cưới: '}</dt>
                  <dd className="inline">{formatDay(i.date)}{i.date2 ? ` và ${formatDay(i.date2)}` : ''}</dd>
                </div>
              )}
              {i.venue && <div><dt className="inline text-mute">Địa điểm: </dt><dd className="inline">{i.venue}</dd></div>}
              {i.packageName && <div><dt className="inline text-mute">Gói: </dt><dd className="inline">{i.packageName}</dd></div>}
            </dl>
            {i.mail && i.mail.status !== 'sent' && (
              <p className="mt-3 text-xs text-mute">
                Email báo: {i.mail.status === 'failed' ? `chưa gửi được (${i.mail.error || 'lỗi không rõ'})` : i.mail.status === 'skipped' ? 'chưa gửi vì chưa cấu hình email' : 'đang gửi...'}
              </p>
            )}
            {i.mail?.status === 'sent' && <p className="mt-3 text-xs text-mute">Đã gửi email báo cho bạn.</p>}
            {i.message && <p className="mt-4 whitespace-pre-wrap border-l-2 border-line pl-4 text-sm text-mute">{i.message}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <select aria-label="Đổi trạng thái" value={i.status} onChange={(e) => setStatus(i, e.target.value as InquiryStatus)}
                className="rounded-md border border-line bg-white px-3 py-2 text-sm">
                {(Object.keys(STATUS) as InquiryStatus[]).map((s) => (<option key={s} value={s}>{STATUS[s]}</option>))}
              </select>
              <Btn variant="ghost" onClick={() => copy(i.phone)}>Sao chép số</Btn>
              <Btn variant="danger" onClick={() => remove(i)}>Xóa</Btn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
