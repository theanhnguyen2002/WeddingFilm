import type { Testimonial } from '../types';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

/** Chỉ hiện khi bạn đã thêm lời cảm ơn thật của khách trong trang quản trị. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const t = useT();
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <Reveal>
        <SectionHead eyebrow={t('quotes.eyebrow')} title={<Rich text={t('quotes.title')} className="text-claret" />} />
      </Reveal>
      <div className="hide-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {items.map((q, idx) => (
          <Reveal key={q.id} delay={idx * 100} className="w-[82%] shrink-0 snap-start md:w-auto">
            <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-8 shadow-sm">
              <span className="font-display text-6xl leading-none text-gold" aria-hidden="true">“</span>
              <blockquote className="font-display text-2xl font-light italic leading-snug">{q.text}</blockquote>
              <figcaption className="mt-8 text-sm">
                <span className="font-medium">{q.names}</span>
                {q.place && <span className="text-mute"> · {q.place}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
