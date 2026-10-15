import type { ReactNode } from 'react';
import type { Settings } from '../types';
import { useT } from '../lib/texts';

function Item({ href, label, className, children, pulse = false }: { href: string; label: string; className: string; children: ReactNode; pulse?: boolean }) {
  return (
    <a
      href={href}
      target={href.startsWith('tel:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex items-center justify-end"
    >
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-night px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
        {label}
      </span>
      {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-40 ${className}`} aria-hidden="true" />}
      <span className={`relative grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 md:h-14 md:w-14 ${className}`}>
        {children}
      </span>
    </a>
  );
}

/** Nút liên hệ luôn cố định ở góc phải dưới màn hình. */
export function FloatingChat({ settings }: { settings: Settings }) {
  const t = useT();
  const messenger = settings.messengerUrl || settings.facebookUrl;
  const zalo = settings.zalo ? `https://zalo.me/${settings.zalo.replace(/^\+/, '')}` : '';
  const tel = settings.phone ? `tel:${settings.phone.replace(/\s/g, '')}` : '';
  if (!messenger && !zalo && !tel) return null;

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col gap-2.5 md:gap-3 md:bottom-6 md:right-6" role="group" aria-label="Liên hệ nhanh">
      {tel && (
        <Item href={tel} label={t('chat.call')} className="bg-claret" pulse>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
        </Item>
      )}
      {zalo && (
        <Item href={zalo} label={t('chat.zalo')} className="bg-[#0068ff]">
          <span className="text-[13px] font-bold tracking-tight">Zalo</span>
        </Item>
      )}
      {messenger && (
        <Item href={messenger} label={t('chat.messenger')} className="bg-linear-to-br from-[#00b2ff] to-[#a334fa]">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.42 3.14 7.16.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.98-.87a.8.8 0 0 1 .53-.04c.9.25 1.85.38 2.91.38 5.64 0 10-4.13 10-9.69S17.64 2 12 2zm6 7.46-2.94 4.67a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.19-.69-.64l2.94-4.67a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.19.69.64z" />
          </svg>
        </Item>
      )}
    </div>
  );
}
