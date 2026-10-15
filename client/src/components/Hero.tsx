import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useScrollProgressVar } from '../lib/hooks';
import type { Photo, Settings } from '../types';
import { PhotoImg } from './Photo';
import { useT } from '../lib/texts';

/** Con dấu tròn quay chậm: tên thương hiệu chạy quanh, giữa là chữ Hỷ trên nền đỏ rượu vang. */
function Seal({ settings }: { settings: Settings }) {
  const brand = (settings.brand || 'Wedding Film').trim();
  const unit = `${brand} • `;
  const ring = unit + unit;
  const size = Math.min(10.5, 276 / (ring.length * 0.78));
  return (
    <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white/95 text-claret shadow-2xl md:h-32 md:w-32">
      <svg viewBox="0 0 120 120" className="absolute inset-0 animate-spin-slow" aria-hidden="true">
        <defs>
          <path id="seal-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
        </defs>
        <text className="fill-current font-medium uppercase" style={{ fontSize: size }}>
          <textPath href="#seal-ring" textLength="274" lengthAdjust="spacing">{ring}</textPath>
        </text>
      </svg>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-claret shadow-[inset_0_0_0_2px_rgba(201,165,106,0.9),inset_0_0_0_4px_rgba(123,36,55,1),inset_0_0_0_5px_rgba(201,165,106,0.55)] md:h-16 md:w-16">
        <span className="text-[1.9rem] font-black leading-none text-[#f2d9a6] md:text-[2.2rem]" style={{ fontFamily: '"Noto Serif SC","Noto Serif CJK SC","Songti SC","STSong","SimSun",serif' }} aria-label="Hỷ">囍</span>
      </span>
    </div>
  );
}

export function Hero({ settings, photos, collage = true }: { settings: Settings; photos: Photo[]; collage?: boolean }) {
  const t = useT();
  const root = useRef<HTMLElement>(null);
  useScrollProgressVar(root);

  const slides = useMemo(() => {
    const featured = photos.filter((p) => p.featured);
    return (featured.length ? featured : photos).slice(0, 6);
  }, [photos]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const words = settings.heroTitle.split(' ');
  const tail = words.length > 3 ? 2 : 1;
  const head = words.slice(0, -tail).join(' ');
  const italic = words.slice(-tail).join(' ');

  // Ba khung ảnh nghiêng bên phải, lấy tiếp nối theo ảnh đang chiếu.
  const stack = slides.length ? [0, 1, 2].map((k) => slides[(i + k + 1) % slides.length]) : [];
  const cards = [
    { cls: 'left-0 top-4 w-56 -rotate-6', r: '-6deg', speed: -9, delay: '0s' },
    { cls: 'right-2 top-0 w-60 rotate-[5deg]', r: '5deg', speed: -14, delay: '1.4s' },
    { cls: 'left-14 top-60 w-52 rotate-[-2deg]', r: '-2deg', speed: -5, delay: '2.6s' },
  ];

  return (
    <section id="top" ref={root} className="relative isolate min-h-[100svh] overflow-hidden bg-night text-white" style={{ '--p': 0 } as CSSProperties}>
      <div className="absolute inset-0" style={{ transform: 'translate3d(0, calc(var(--p) * 12vh), 0) scale(1.05)' }}>
        {slides.length === 0 && <div className="absolute inset-0 bg-night-2" />}
        {slides.map((p, idx) => (
          <div
            key={p.id}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${idx === i ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={idx !== i}
          >
            <div className={`absolute inset-0 ${idx === i ? 'animate-kenburns' : ''}`} style={idx === i ? undefined : { transform: 'scale(1.12)' }}>
              <PhotoImg photo={p} tag={false} eager={idx === 0} />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-night/75 via-night/30 to-night/95" />
      <div className="absolute inset-0 bg-linear-to-r from-night/80 via-night/20 to-transparent" />
      <div className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-claret/40 blur-[120px]" aria-hidden="true" />
      <div className="absolute -right-32 top-10 h-[26rem] w-[26rem] rounded-full bg-rose/20 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-end gap-10 px-5 pb-28 pt-32 md:px-8 md:pb-32 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7" style={{ transform: 'translate3d(0, calc(var(--p) * -7vh), 0)', opacity: 'calc(1 - var(--p) * 1.5)' }}>
          <p className="animate-rise mb-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-1.5 pl-2 pr-5 text-[11px] font-medium uppercase tracking-[0.28em] text-rose backdrop-blur-md">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-claret text-[10px] text-white">◆</span>
            {settings.brand}
          </p>
          <h1 className="animate-rise max-w-4xl font-display text-[3rem] font-light leading-[0.98] tracking-tight [animation-delay:120ms] sm:text-6xl md:text-7xl lg:text-[5.4rem]">
            {head}{' '}
            <em className="bg-linear-to-r from-rose via-[#f6d9c2] to-gold bg-clip-text font-light text-transparent">{italic}</em>
          </h1>
          <p className="animate-rise mt-7 max-w-xl text-base leading-relaxed text-white/80 [animation-delay:260ms] md:text-lg">{settings.tagline}</p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3 [animation-delay:400ms] max-sm:pr-16">
            <a href="#phim" className="btn-shine inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium tracking-wide text-night shadow-[0_10px_40px_rgba(235,183,193,0.35)] transition hover:-translate-y-0.5 hover:bg-rose">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              {t('cta.viewFilms')}
            </a>
            <a href="#lien-he" className="rounded-full border border-white/60 bg-white/5 px-8 py-4 text-sm font-medium tracking-wide backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15">
              {t('cta.quote')}
            </a>
          </div>
        </div>

        {/* Cụm ảnh nghiêng, mỗi khung trôi với tốc độ riêng khi cuộn */}
        {collage && stack.length > 0 && (
          <div className="relative hidden h-[34rem] lg:col-span-5 lg:block" aria-hidden="true">
            {stack.map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                className={`absolute ${cards[idx].cls}`}
                style={{ transform: `translate3d(0, calc(var(--p) * ${cards[idx].speed}vh), 0)` }}
              >
                <div
                  className="animate-float rounded-sm bg-white p-2.5 pb-9 shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
                  style={{ '--r': cards[idx].r, animationDelay: cards[idx].delay } as CSSProperties}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-night-2">
                    <PhotoImg photo={p} tag={false} />
                  </div>
                  <p className="absolute inset-x-0 bottom-2.5 truncate px-3 text-center font-display text-[15px] italic text-ink/70">{p.title}</p>
                </div>
              </div>
            ))}
            <div className="absolute -bottom-6 -left-6">
              <Seal settings={settings} />
            </div>
          </div>
        )}
      </div>

      {/* Chấm chuyển ảnh và gợi ý cuộn xuống */}
      <div className="absolute inset-x-0 bottom-0 flex h-20 items-center justify-between px-5 md:px-8">
        {slides.length > 1 ? (
          <span className="flex items-center gap-2" aria-label={`Ảnh ${i + 1} trên ${slides.length}`}>
            {slides.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
                className={`h-[3px] transition-all ${idx === i ? 'w-10 bg-white' : 'w-5 bg-white/35 hover:bg-white/60'}`}
              />
            ))}
          </span>
        ) : (
          <span />
        )}
        <a href="#gioi-thieu" className="mr-16 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/80 hover:text-white md:mr-20" aria-label="Cuộn xuống">
          {t('cta.scroll')} <span className="inline-block h-4 w-px animate-pulse bg-white/70" />
        </a>
      </div>
    </section>
  );
}
