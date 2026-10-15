import type { Pkg } from '../types';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

const Check = ({ light }: { light: boolean }) => (
  <svg viewBox="0 0 20 20" className={`mt-0.5 h-4 w-4 shrink-0 ${light ? 'text-rose' : 'text-claret'}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const Camera = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13.5" r="3.2" />
  </svg>
);
const Film = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" />
  </svg>
);

export function Packages({ packages, onPick }: { packages: Pkg[]; onPick: (name: string) => void }) {
  const t = useT();
  if (packages.length === 0) return null;
  return (
    <section id="goi" className="relative isolate mx-auto max-w-7xl px-5 pt-20 pb-8 md:px-8 md:pt-28 md:pb-10">
      <div className="pointer-events-none absolute left-0 -z-10 h-80 w-80 rounded-full bg-blush blur-[100px]" aria-hidden="true" />
      <Reveal>
        <SectionHead
          eyebrow={t('services.eyebrow')}
          title={<Rich text={t('services.title')} className="text-claret" />}
          intro={t('services.intro')}
        />
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {packages.map((p, idx) => (
          <Reveal key={p.id} delay={idx * 110} className="h-full">
            <article
              className={`relative flex h-full flex-col rounded-3xl p-8 transition duration-300 hover:-translate-y-2 md:p-9 ${
                p.highlight
                  ? 'bg-linear-to-br from-claret via-claret to-claret-deep text-white shadow-[0_30px_80px_rgba(123,36,55,0.4)] md:-translate-y-4 md:hover:-translate-y-6'
                  : 'border border-line bg-white hover:shadow-[0_24px_60px_rgba(17,21,26,0.12)]'
              }`}
            >
              {(p.badge || p.highlight) && (
                <span className="absolute -top-3 left-8 rounded-full bg-gold px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-night">{p.badge || t('services.badge')}</span>
              )}
              <div className={`mb-5 flex gap-2 text-[11px] font-medium ${p.highlight ? 'text-white/80' : 'text-claret'}`}>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${p.highlight ? 'border-white/35 bg-white/10' : 'border-claret/25 bg-blush'}`}><Camera /> {t('services.photoTag')}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${p.highlight ? 'border-white/35 bg-white/10' : 'border-claret/25 bg-blush'}`}><Film /> {t('services.filmTag')}</span>
              </div>
              <h3 className="font-display text-4xl font-light italic">{p.name}</h3>
              {p.tagline && <p className={`mt-2 text-sm ${p.highlight ? 'text-white/75' : 'text-mute'}`}>{p.tagline}</p>}
              <ul className="mt-8 flex flex-1 flex-col gap-3.5 border-t border-current/15 pt-8 text-sm leading-relaxed">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check light={p.highlight} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#lien-he"
                onClick={() => onPick(p.name)}
                className={`btn-shine mt-10 block rounded-full border px-6 py-3.5 text-center text-sm font-medium tracking-wide transition ${
                  p.highlight ? 'border-white bg-white text-claret hover:border-rose hover:bg-rose' : 'border-claret text-claret hover:bg-claret hover:text-white'
                }`}
              >
                {t('services.cta')}
              </a>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-mute">
          {t('services.note')}
        </p>
      </Reveal>
    </section>
  );
}
