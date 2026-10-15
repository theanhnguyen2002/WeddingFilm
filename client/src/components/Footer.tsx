import type { Settings } from '../types';
import { Brand, useNav } from './Header';
import { useT } from '../lib/texts';

export function Footer({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  const tel = settings.phone.replace(/[^\d+]/g, '');
  const zalo = settings.zalo ? `https://zalo.me/${settings.zalo.replace(/^\+/, '')}` : '';
  const links: [string, string][] = [
    ['Facebook', settings.facebookUrl], ['Instagram', settings.instagramUrl],
    ['TikTok', settings.tiktokUrl], ['YouTube', settings.youtubeChannelUrl],
  ];
  return (
    <footer className="relative overflow-hidden bg-night px-5 pb-28 pt-20 text-snow md:px-8 md:pb-12">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-claret/25 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Brand settings={settings} onDark className="h-16 md:h-20" textClass="[&>span:first-child]:text-6xl md:[&>span:first-child]:text-7xl" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-snow/60">
            {t('footer.about')}
          </p>
          {settings.facebookUrl && (
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="btn-shine mt-7 inline-flex items-center gap-3 rounded-full bg-[#1877f2] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_32px_rgba(24,119,242,0.35)] transition hover:-translate-y-0.5 hover:bg-[#1468d6]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.7 1.8-1.7h1.5V4.2S15.5 4 14.3 4C11.8 4 10.2 5.5 10.2 8.2v2.6H7.5V14h2.7v8z" /></svg>
              {t('footer.follow')}
            </a>
          )}
        </div>

        <nav aria-label="Chân trang" className="md:col-span-3">
          <p className="mb-5 text-[11px] uppercase tracking-[0.26em] text-gold">{t('footer.explore')}</p>
          <ul className="space-y-3 text-sm text-snow/75">
            {NAV.map((n) => (
              <li key={n.href}><a href={n.href} className="transition hover:text-rose">{n.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="mb-5 text-[11px] uppercase tracking-[0.26em] text-gold">{t('footer.contact')}</p>
          <ul className="space-y-3 text-sm text-snow/75">
            {settings.phone && <li><a href={`tel:${tel}`} className="text-lg text-white transition hover:text-rose">{settings.phone}</a></li>}
            {zalo && <li><a href={zalo} target="_blank" rel="noopener noreferrer" className="transition hover:text-rose">Zalo: {settings.zalo}</a></li>}
            {settings.email && <li><a href={`mailto:${settings.email}`} className="transition hover:text-rose">{settings.email}</a></li>}
            {settings.address && <li>{settings.address}</li>}
            {settings.hours && <li className="text-snow/55">{settings.hours}</li>}
          </ul>
          {links.some(([, u]) => u && !u.includes('facebook')) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {links.filter(([n, u]) => u && n !== 'Facebook').map(([n, u]) => (
                <a key={n} href={u} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs transition hover:border-rose hover:text-rose">{n}</a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-6 text-xs text-snow/40 md:flex-row md:justify-between md:pr-20">
        <p>© {new Date().getFullYear()} {settings.brand}. {t('footer.rights')}</p>
        <a href="#" className="transition hover:text-rose">{t('cta.toTop')} ↑</a>
      </div>
    </footer>
  );
}
