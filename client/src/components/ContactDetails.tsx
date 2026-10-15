import type { Settings } from '../types';
import { useT } from '../lib/texts';

type Tone = 'dark' | 'light';

const FB = (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.7 1.8-1.7h1.5V4.2S15.5 4 14.3 4C11.8 4 10.2 5.5 10.2 8.2v2.6H7.5V14h2.7v8z" /></svg>
);

export const zaloLink = (s: Settings) => (s.zalo ? `https://zalo.me/${s.zalo.replace(/^\+/, '')}` : '');
export const telLink = (s: Settings) => (s.phone ? `tel:${s.phone.replace(/\s/g, '')}` : '');

/** Điện thoại, Zalo, email, địa chỉ, giờ làm việc. tone="dark" cho nền tối, "light" cho nền sáng. */
export function ContactDetails({ settings, tone = 'dark', className = '' }: { settings: Settings; tone?: Tone; className?: string }) {
  const t = useT();
  const dt = tone === 'dark' ? 'text-snow/50' : 'text-mute';
  const hover = tone === 'dark' ? 'hover:text-rose' : 'hover:text-claret';
  const accent = tone === 'dark' ? 'text-rose' : 'text-claret';
  return (
    <dl className={`space-y-6 text-[15px] ${className}`}>
      {settings.phone && (
        <div>
          <dt className={`text-[11px] uppercase tracking-[0.22em] ${dt}`}>{t('details.phone')}</dt>
          <dd className="mt-1 font-display text-3xl font-light"><a href={telLink(settings)} className={hover}>{settings.phone}</a></dd>
        </div>
      )}
      {settings.zalo && (
        <div>
          <dt className={`text-[11px] uppercase tracking-[0.22em] ${dt}`}>{t('details.zalo')}</dt>
          <dd className="mt-1"><a href={zaloLink(settings)} target="_blank" rel="noopener noreferrer" className={hover}>{settings.zalo}</a></dd>
        </div>
      )}
      {settings.email && (
        <div>
          <dt className={`text-[11px] uppercase tracking-[0.22em] ${dt}`}>{t('details.email')}</dt>
          <dd className="mt-1"><a href={`mailto:${settings.email}`} className={hover}>{settings.email}</a></dd>
        </div>
      )}
      {settings.address && (
        <div>
          <dt className={`text-[11px] uppercase tracking-[0.22em] ${dt}`}>{t('details.address')}</dt>
          <dd className="mt-1">
            {settings.address}
            {settings.mapUrl && (<> <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className={`ml-2 underline underline-offset-4 ${accent}`}>{t('details.directions')}</a></>)}
          </dd>
        </div>
      )}
      {settings.hours && (
        <div>
          <dt className={`text-[11px] uppercase tracking-[0.22em] ${dt}`}>{t('details.hours')}</dt>
          <dd className="mt-1">{settings.hours}</dd>
        </div>
      )}
    </dl>
  );
}

/** Thẻ lớn mời khách vào fanpage Facebook, nổi bật để khách biết nơi theo dõi. */
export function FacebookCard({ settings, className = '' }: { settings: Settings; className?: string }) {
  const t = useT();
  if (!settings.facebookUrl) return null;
  return (
    <a
      href={settings.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-shine group flex max-w-sm items-center gap-4 rounded-2xl bg-white p-4 pr-5 text-ink shadow-[0_18px_50px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(24,119,242,0.35)] ${className}`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1877f2] text-white">{FB}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-mute">{t('fb.label')}</span>
        <span className="block truncate font-display text-xl leading-tight">{settings.brand}</span>
        <span className="block text-xs text-claret">{t('fb.hint')}</span>
      </span>
      <span className="text-xl text-claret transition group-hover:translate-x-1" aria-hidden="true">→</span>
    </a>
  );
}

/** Instagram, TikTok, YouTube (Facebook đã có thẻ riêng). */
export function SocialPills({ settings, tone = 'dark', className = '' }: { settings: Settings; tone?: Tone; className?: string }) {
  const items = [['Instagram', settings.instagramUrl], ['TikTok', settings.tiktokUrl], ['YouTube', settings.youtubeChannelUrl]].filter(([, u]) => u);
  if (items.length === 0) return null;
  const cls = tone === 'dark' ? 'border-white/25 hover:border-rose hover:text-rose' : 'border-ink/20 hover:border-claret hover:text-claret';
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map(([name, href]) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={`rounded-full border px-4 py-2 text-[13px] transition ${cls}`}>{name}</a>
      ))}
    </div>
  );
}
