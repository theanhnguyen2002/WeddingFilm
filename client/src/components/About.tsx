import { useEffect, useRef, useState } from 'react';
import type { Photo, Settings } from '../types';
import { PhotoImg } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { useT } from '../lib/texts';

/** Số đếm chạy từ 0 tới giá trị khi cuộn tới. Giá trị không bắt đầu bằng số thì hiện nguyên. */
function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d[\d.,]*)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !m || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = Number(m[1].replace(/[.,]/g, ''));
    if (!Number.isFinite(target)) return;
    setText(`0${m[2]}`);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1400);
        const eased = 1 - Math.pow(1 - k, 3);
        setText(k < 1 ? `${Math.round(target * eased).toLocaleString('vi-VN')}${m[2]}` : value);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{text}</span>;
}

export function About({ settings, photos }: { settings: Settings; photos: Photo[] }) {
  const t = useT();
  const portrait = photos.find((p) => p.h > p.w) ?? photos[0];
  const second = photos.find((p) => p.w >= p.h && p !== portrait);

  return (
    <section id="gioi-thieu" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="relative mx-auto max-w-md lg:mx-0">
              <span className="absolute -left-4 -top-4 h-full w-full rounded-t-[999px] border border-gold/70" aria-hidden="true" />
              {portrait && (
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] shadow-[0_30px_80px_rgba(17,21,26,0.25)]">
                  <PhotoImg photo={portrait} />
                </div>
              )}
              {second && (
                <div className="absolute -bottom-10 -right-4 hidden aspect-[3/2] w-2/3 overflow-hidden rounded-2xl border-8 border-snow shadow-2xl sm:block md:-right-10">
                  <PhotoImg photo={second} tag={false} />
                </div>
              )}
              <span className="absolute -left-3 bottom-16 grid h-20 w-20 place-items-center rounded-full bg-claret text-center font-display text-sm italic leading-tight text-white shadow-xl" aria-hidden="true">
                {t('about.stamp').split(' ').map((w: string, i: number) => (<span key={i}>{i > 0 && <br />}{w}</span>))}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <Reveal>
            <SectionHead eyebrow={t('about.eyebrow')} title={settings.aboutTitle} />
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-9 max-w-2xl text-lg leading-relaxed text-mute">{settings.aboutText}</p>
          </Reveal>

          {settings.aboutPoints.length > 0 && (
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {settings.aboutPoints.map((pt, idx) => (
                <Reveal key={pt.title} delay={idx * 110} className="h-full">
                  <div className="h-full rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-claret/30 hover:shadow-[0_18px_50px_rgba(123,36,55,0.12)]">
                    <span className="text-xs text-gold" aria-hidden="true">◆</span>
                    <h3 className="mt-3 font-display text-2xl font-normal italic leading-snug text-claret">{pt.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mute">{pt.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {settings.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {settings.stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-night p-6 text-snow">
                  <dd className="bg-linear-to-r from-rose to-gold bg-clip-text font-display text-5xl font-light tabular-nums text-transparent">
                    <CountUp value={s.value} />
                  </dd>
                  <dt className="mt-2 text-[11px] uppercase tracking-[0.22em] text-snow/60">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
