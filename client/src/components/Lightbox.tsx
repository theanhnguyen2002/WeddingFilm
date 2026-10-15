import { useCallback, useEffect, useRef } from 'react';
import { useLockBody } from '../lib/hooks';
import type { Photo } from '../types';
import { Placeholder } from './Photo';

/** Xem ảnh phóng to: phím mũi tên, Esc và vuốt trên điện thoại. Dùng chung cho mọi giao diện. */
export function Lightbox({ photos, index, onClose, onIndex }: { photos: Photo[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  useLockBody(true);
  const touchX = useRef<number | null>(null);
  const p = photos[index];
  const go = useCallback((d: number) => onIndex((index + d + photos.length) % photos.length), [index, photos.length, onIndex]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [go, onClose]);

  const ratio = p.w / p.h;
  const btn = 'absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-2xl text-white transition hover:bg-white/15';

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-night/95 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh ${p.title}`}
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-xl text-white hover:bg-white/15">
        ×
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" aria-label="Ảnh trước" className={`${btn} left-3 md:left-6`} onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>
          <button type="button" aria-label="Ảnh sau" className={`${btn} right-3 md:right-6`} onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>
        </>
      )}
      <div onClick={(e) => e.stopPropagation()} className="flex max-w-full flex-col items-center">
        {p.src ? (
          <img src={p.src} alt={p.title} className="max-h-[80svh] max-w-[92vw] object-contain" />
        ) : (
          <div className="relative" style={{ width: `min(92vw, calc(80svh * ${ratio}))`, aspectRatio: String(ratio) }}>
            <Placeholder seed={p.seed} />
          </div>
        )}
        <p className="mt-5 text-center text-sm text-white/80">
          <span className="font-display text-lg italic">{p.title}</span>
          <span className="mx-3 text-white/30">|</span>
          <span className="tabular-nums text-white/60">{index + 1} / {photos.length}</span>
        </p>
      </div>
    </div>
  );
}
