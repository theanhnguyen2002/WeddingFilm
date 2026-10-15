import type { Pkg, Settings } from '../types';
import { ContactDetails, FacebookCard, SocialPills } from './ContactDetails';
import { InquiryForm } from './InquiryForm';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';
import { Rich, useT } from '../lib/texts';

interface Props {
  settings: Settings;
  packages: Pkg[];
  selectedPackage: string;
}

export function Contact({ settings, packages, selectedPackage }: Props) {
  const t = useT();
  return (
    <section id="lien-he" className="relative isolate overflow-hidden bg-night text-snow">
      <div className="absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-claret/40 blur-[130px]" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-40 -z-10 h-[26rem] w-[26rem] rounded-full bg-rose/10 blur-[120px]" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHead dark eyebrow={t('contact.eyebrow')} title={<Rich text={t('contact.title')} className="text-rose" />} />
          </Reveal>
          <Reveal delay={120}>
            <ContactDetails settings={settings} className="mt-12" />
            <FacebookCard settings={settings} className="mt-10" />
            <SocialPills settings={settings} className="mt-5" />
          </Reveal>
        </div>

        <Reveal delay={150} className="lg:col-span-7">
          <div className="rounded-3xl bg-snow p-7 text-ink shadow-[0_40px_100px_rgba(0,0,0,0.45)] md:p-12">
            <InquiryForm packages={packages} selectedPackage={selectedPackage} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
