import { useState } from 'react';
import { youtubeThumb } from '../lib/youtube';
import type { Settings, Video } from '../types';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

const MOOD = ['#2b3346', '#3a2a35', '#27393a', '#3a3426'];

function Thumb({ v, idx, className = '' }: { v: Video; idx: number; className?: string }) {
  const t = useT();
  return v.youtubeId ? (
    <img src={youtubeThumb(v.youtubeId)} alt={v.title} loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`grain absolute inset-0 ${className}`} style={{ background: `linear-gradient(135deg, ${MOOD[idx % MOOD.length]}, #0d1116)` }}>
      <span className="absolute left-3 top-3 rounded-xs bg-black/35 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/80">{t('films.sample')}</span>
    </div>
  );
}

export function Films({ videos, settings }: { videos: Video[]; settings: Settings }) {
  const t = useT();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  if (videos.length === 0) return null;

  const first = videos.find((v) => v.featured) ?? videos[0];
  const active = videos.find((v) => v.id === (activeId ?? first.id)) ?? first;
  const activeIdx = videos.indexOf(active);

  return (
    <section id="phim" className="relative isolate overflow-hidden bg-night py-20 text-snow md:py-28">
      <div className="absolute -left-40 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-claret/30 blur-[130px]" aria-hidden="true" />
      <div className="absolute -right-40 bottom-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-rose/10 blur-[120px]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHead
            dark
            eyebrow={t('films.eyebrow')}
            title={<Rich text={t('films.title')} className="text-rose" />}
            intro={t('films.intro')}
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-8">
            <div className="overflow-hidden rounded-2xl bg-[#1d242d] shadow-[0_0_120px_rgba(123,36,55,0.4)] ring-1 ring-white/10">
              <div className="sprockets h-4" aria-hidden="true" />
              <div className="relative aspect-video overflow-hidden bg-night-2">
              {playing && active.youtubeId ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="group absolute inset-0 block w-full text-left"
                  onClick={() => active.youtubeId && setPlaying(true)}
                  aria-label={active.youtubeId ? `Phát phim ${active.title}` : active.title}
                  disabled={!active.youtubeId}
                >
                  <Thumb v={active} idx={activeIdx} className="transition-transform duration-[900ms] group-hover:scale-[1.03]" />
                  <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20" />
                  {active.youtubeId && (
                    <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-claret text-white shadow-2xl transition group-hover:scale-110 md:h-24 md:w-24">
                      <span className="absolute inset-0 animate-ping rounded-full bg-claret/60" aria-hidden="true" />
                      <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                    <span className="block font-display text-2xl font-light italic md:text-4xl">{active.title}</span>
                    <span className="mt-2 block text-sm text-white/70">{active.place}</span>
                  </span>
                </button>
              )}
              </div>
              <div className="sprockets h-4" aria-hidden="true" />
            </div>
          </Reveal>

          <Reveal delay={120} className="min-w-0 lg:col-span-4">
            <ul className="flex flex-col gap-3">
              {videos.map((v, idx) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => { setActiveId(v.id); setPlaying(Boolean(v.youtubeId)); }}
                    aria-current={v.id === active.id}
                    className={`group flex w-full gap-4 rounded-xl border p-2.5 text-left transition ${v.id === active.id ? 'border-rose/60 bg-white/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <span className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-night-2 sm:w-40">
                      <Thumb v={v} idx={idx} />
                    </span>
                    <span className="flex min-w-0 flex-col justify-center">
                      <span className="font-display text-lg font-light italic leading-snug">{v.title}</span>
                      <span className="mt-1 truncate text-xs text-white/55">{v.place}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {settings.youtubeChannelUrl && (
              <a href={settings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-rose hover:text-white">
                {t('cta.channel')} <span aria-hidden="true">→</span>
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
