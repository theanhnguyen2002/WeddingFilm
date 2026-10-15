import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  dark?: boolean;
  right?: ReactNode;
}

export function SectionHead({ eyebrow, title, intro, dark = false, right }: Props) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p
          className={`mb-6 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.26em] ${
            dark ? 'border-white/20 bg-white/5 text-rose' : 'border-claret/20 bg-claret/5 text-claret'
          }`}
        >
          <span className="text-[8px] text-gold" aria-hidden="true">◆</span>
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">{title}</h2>
        {intro && <p className={`mt-5 max-w-xl text-base leading-relaxed ${dark ? 'text-snow/70' : 'text-mute'}`}>{intro}</p>}
      </div>
      {right}
    </div>
  );
}
