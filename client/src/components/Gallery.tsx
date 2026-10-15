import { useMemo, useState } from 'react';
import { galleryCategories } from '../lib/gallery';
import type { Photo } from '../types';
import { Lightbox } from './Lightbox';
import { PhotoImg } from './Photo';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

const PAGE = 12;

export function Gallery({ photos, categories }: { photos: Photo[]; categories: string[] }) {
  const t = useT();
  const cats = useMemo(() => galleryCategories(categories, photos), [categories, photos]);
  const [cat, setCat] = useState('Tất cả');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const list = useMemo(() => (cat === 'Tất cả' ? photos : photos.filter((p) => p.category === cat)), [photos, cat]);
  const visible = list.slice(0, shown);

  return (
    <section id="anh" className="bg-linear-to-b from-paper via-blush/50 to-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHead
            eyebrow={t('gallery.eyebrow')}
            title={<Rich text={t('gallery.title')} className="text-claret" />}
            right={
              cats.length < 3 ? undefined : <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc ảnh theo nhóm">
                {cats.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={c === cat}
                    onClick={() => { setCat(c); setShown(PAGE); }}
                    className={`rounded-full border px-5 py-2 text-[13px] transition ${c === cat ? 'border-claret bg-claret text-white shadow-[0_8px_24px_rgba(123,36,55,0.3)]' : 'border-line bg-white text-mute hover:border-claret hover:text-claret'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          />
        </Reveal>

        <div className="mt-14 columns-2 gap-3 md:columns-3 lg:columns-4">
          {visible.map((p, idx) => (
            <Reveal key={p.id} delay={(idx % 4) * 70}>
              <button
                type="button"
                onClick={() => setOpen(idx)}
                aria-label={`Xem ảnh ${p.title}`}
                className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-line transition duration-500 hover:z-10 hover:shadow-[0_24px_60px_rgba(17,21,26,0.28)]"
                style={{ aspectRatio: `${p.w} / ${p.h}` }}
              >
                <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
                  <PhotoImg photo={p} />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-claret-deep/85 via-black/10 to-transparent p-4 text-left text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="font-display text-lg italic leading-tight">{p.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/70">{p.category}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {list.length === 0 && <p className="mt-14 text-center text-mute">{t('gallery.empty')}</p>}

        {list.length > shown && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-shine rounded-full border border-claret px-9 py-3.5 text-sm font-medium tracking-wide text-claret transition hover:bg-claret hover:text-white">
              {t('cta.morePhotos')}
            </button>
          </div>
        )}
      </div>

      {open !== null && visible[open] && <Lightbox photos={visible} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </section>
  );
}
