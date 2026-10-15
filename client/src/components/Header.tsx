import { useState } from 'react';
import { useLockBody, useScrolled } from '../lib/hooks';
import type { Settings } from '../types';
import { useT } from '../lib/texts';

const NAV_DEF = [
  { href: '#gioi-thieu', key: 'nav.about' },
  { href: '#anh', key: 'nav.photos' },
  { href: '#phim', key: 'nav.films' },
  { href: '#goi', key: 'nav.services' },
  { href: '#lien-he', key: 'nav.contact' },
];

/** Danh sách menu với chữ do quản trị viên đặt. */
export function useNav() {
  const t = useT();
  return NAV_DEF.map((n) => ({ href: n.href, label: t(n.key) }));
}

export function Wordmark({ brand, className = '' }: { brand: string; className?: string }) {
  const [first, ...rest] = brand.split(' ');
  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-3xl font-light italic leading-none tracking-tight">{first}</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-80">{rest.join(' ')}</span>
    </span>
  );
}

/** Logo thương hiệu: ảnh nếu đã tải lên, nếu chưa thì chữ. onDark cho biết đang nằm trên nền tối. */
export function Brand({ settings, onDark, className = 'h-11 md:h-14', textClass = '' }: { settings: Settings; onDark: boolean; className?: string; textClass?: string }) {
  const { brand, logoUrl, logoLightUrl } = settings;
  const src = onDark ? logoLightUrl || logoUrl : logoUrl || logoLightUrl;
  if (!src) return <Wordmark brand={brand} className={textClass} />;
  // Chỉ có một logo thì đổi sang đơn sắc để vẫn đọc được trên nền ngược màu.
  const only = !(logoUrl && logoLightUrl);
  const tone = only ? (onDark ? (logoLightUrl ? '' : 'brightness-0 invert') : logoUrl ? '' : 'brightness-0') : '';
  return <img src={src} alt={brand} className={`w-auto max-w-[16rem] md:max-w-[20rem] object-contain object-left ${className} ${tone}`} />;
}

export function Header({ settings }: { settings: Settings }) {
  const brand = settings.brand;
  const t = useT();
  const NAV = useNav();
  const solid = useScrolled(60);
  const [open, setOpen] = useState(false);
  useLockBody(open);
  const dark = open || !solid;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          solid && !open ? 'border-b border-line bg-snow/85 text-ink backdrop-blur-md' : 'border-b border-transparent text-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#top" aria-label={`${brand}, ${t('cta.toTop').toLowerCase()}`} onClick={() => setOpen(false)}>
            <Brand settings={settings} onDark={dark} />
          </a>
          <nav className="hidden items-center gap-9 md:flex" aria-label="Điều hướng chính">
            {NAV.slice(0, 4).map((n) => (
              <a key={n.href} href={n.href} className="text-[13px] tracking-wide opacity-85 transition hover:opacity-100">
                {n.label}
              </a>
            ))}
            <a
              href="#lien-he"
              className={`rounded-full border px-5 py-2 text-[13px] font-medium tracking-wide transition ${
                solid ? 'border-claret bg-claret text-white hover:bg-claret-deep' : 'border-white/70 hover:bg-white hover:text-night'
              }`}
            >
              {t('cta.quote')}
            </a>
          </nav>
          <button
            type="button"
            className="relative z-50 -mr-2 grid h-11 w-11 place-items-center md:hidden"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`absolute h-px w-6 bg-current transition ${open ? 'rotate-45' : '-translate-y-1.5'} ${dark ? '' : ''}`} />
            <span className={`absolute h-px w-6 bg-current transition ${open ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-30 flex flex-col justify-center bg-night px-8 text-snow md:hidden">
          <nav className="flex flex-col gap-5" aria-label="Menu di động">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="font-display text-4xl font-light italic">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
