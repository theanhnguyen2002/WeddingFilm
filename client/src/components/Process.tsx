import type { ProcessStep } from '../types';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

export function Process({ steps }: { steps: ProcessStep[] }) {
  const t = useT();
  if (steps.length === 0) return null;
  const cols = steps.length >= 5 ? 'lg:grid-cols-5' : steps.length === 4 ? 'lg:grid-cols-4' : steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  return (
    <section id="quy-trinh" className="bg-linear-to-b from-paper to-snow pt-14 pb-20 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHead eyebrow={t('process.eyebrow')} title={<Rich text={t('process.title')} className="text-claret" />} />
        </Reveal>
        <ol className={`relative mt-16 grid gap-10 lg:gap-6 ${cols}`}>
          <span className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-line max-lg:block lg:left-0 lg:top-[19px] lg:h-px lg:w-full" aria-hidden="true" />
          {steps.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 90}>
              <li className="relative flex gap-5 lg:block">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-claret to-claret-deep font-display text-lg italic text-white shadow-[0_8px_24px_rgba(123,36,55,0.35)]">
                  {idx + 1}
                </span>
                <div className="lg:mt-6">
                  <h3 className="font-display text-xl font-normal leading-snug">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{s.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
