import { useState, type ReactNode } from 'react';
import { ContactDetails, FacebookCard, SocialPills, telLink, zaloLink } from '../../components/ContactDetails';
import { FloatingChat } from '../../components/FloatingChat';
import { Brand, useNav } from '../../components/Header';
import { InquiryForm } from '../../components/InquiryForm';
import { Lightbox } from '../../components/Lightbox';
import { PhotoImg } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { VideoFrame, VideoThumb } from '../../components/VideoFrame';
import { ALL_CATEGORY, filterPhotos, galleryCategories } from '../../lib/gallery';
import { useLockBody, useScrolled } from '../../lib/hooks';
import { Rich, useT } from '../../lib/texts';
import type { Content, Photo, Settings } from '../../types';
import type { TemplateProps } from '../types';
import { Cloud, Corner, Hy, HyRule, Lantern } from './Ornaments';
import './style.css';

function Frame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`hy-frame ${className}`}>
      <Corner className="hy-corner hy-c-tl" /><Corner className="hy-corner hy-c-tr" />
      <Corner className="hy-corner hy-c-bl" /><Corner className="hy-corner hy-c-br" />
      {children}
    </div>
  );
}

function Title({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="hy-title">
      <p className="hy-eyebrow">{eyebrow}</p>
      <h2 className="hy-h2"><Rich text={title} /></h2>
      <HyRule />
    </Reveal>
  );
}

function Head({ settings, dark }: { settings: Settings; dark: boolean }) {
  const t = useT();
  const NAV = useNav();
  const solid = useScrolled(30);
  const [open, setOpen] = useState(false);
  useLockBody(open);
  return (
    <header className={`hy-head ${solid || open ? 'is-solid' : ''}`}>
      <div className="hy-head-in">
        <a href="#top" aria-label={`${settings.brand}, ${t('cta.toTop').toLowerCase()}`}><Brand settings={settings} onDark={dark} className="h-10 md:h-12" /></a>
        <nav className="hy-nav" aria-label="Điều hướng chính">
          {NAV.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
        </nav>
        <button type="button" className="hy-burger" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen((o) => !o)}>{open ? '✕' : '☰'}</button>
      </div>
      {open && (<nav className="hy-drop" aria-label="Menu">{NAV.map((n) => (<a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>))}</nav>)}
    </header>
  );
}

function Hero({ settings, photos }: { settings: Settings; photos: Photo[] }) {
  const t = useT();
  const cover = photos.find((p) => p.featured) ?? photos[0];
  const words = (settings.heroTitle || settings.brand).trim().split(/\s+/);
  const tail = words.length > 3 ? 2 : 1;
  return (
    <section id="top" className="hy-hero">
      <Lantern className="hy-lantern hy-lantern-l" />
      <Lantern className="hy-lantern hy-lantern-r" />
      <Cloud className="hy-cloud hy-cloud-l" /><Cloud className="hy-cloud hy-cloud-r" />
      <div className="hy-hero-in">
        <Hy className="hy-big" />
        <p className="hy-eyebrow hy-eyebrow-light">{settings.brand}</p>
        <h1 className="hy-h1">{words.slice(0, -tail).join(' ')} <em>{words.slice(-tail).join(' ')}</em></h1>
        {settings.tagline && <p className="hy-lead">{settings.tagline}</p>}
        {cover && (<div className="hy-hero-photo"><Frame><div className="hy-photo-in"><PhotoImg photo={cover} tag={false} eager /></div></Frame></div>)}
        <div className="hy-cta">
          <a href="#lien-he" className="hy-btn">{t('cta.consult')}</a>
          <a href="#anh" className="hy-btn hy-btn-ghost">{t('cta.viewPhotos')}</a>
        </div>
      </div>
    </section>
  );
}

function About({ settings }: { settings: Settings }) {
  const t = useT();
  return (
    <section id="gioi-thieu" className="hy-sec hy-about">
      <div className="hy-wrap">
        <Title eyebrow={t('about.eyebrow')} title={settings.aboutTitle} />
        <Reveal><p className="hy-body">{settings.aboutText}</p></Reveal>
        {settings.aboutPoints.length > 0 && (
          <ul className="hy-points">
            {settings.aboutPoints.map((p, k) => (
              <li key={p.title}><Reveal delay={k * 90} className="hy-seal-card"><Hy className="hy-mini" /><h3>{p.title}</h3><p>{p.text}</p></Reveal></li>
            ))}
          </ul>
        )}
        {settings.stats.length > 0 && (<ul className="hy-stats">{settings.stats.map((s) => (<li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>))}</ul>)}
      </div>
    </section>
  );
}

function Gallery({ settings, photos }: { settings: Settings; photos: Photo[] }) {
  const t = useT();
  const [cat, setCat] = useState(ALL_CATEGORY);
  const [shown, setShown] = useState(8);
  const [open, setOpen] = useState<number | null>(null);
  const cats = galleryCategories(settings.photoCategories, photos);
  const list = filterPhotos(photos, cats.includes(cat) ? cat : ALL_CATEGORY);
  const vis = list.slice(0, shown);
  return (
    <section id="anh" className="hy-sec hy-gallery">
      <div className="hy-wrap">
        <Title eyebrow={t('gallery.eyebrow')} title={t('gallery.title')} />
        {cats.length > 2 && (
          <div className="hy-chips" role="group" aria-label="Lọc ảnh theo nhóm">
            {cats.map((c) => (<button key={c} type="button" aria-pressed={c === cat} className={c === cat ? 'is-on' : ''} onClick={() => { setCat(c); setShown(8); }}>{c}</button>))}
          </div>
        )}
        <div className="hy-grid">
          {vis.map((p, k) => (
            <Reveal key={p.id} delay={(k % 4) * 70}>
              <button type="button" className="hy-ph" onClick={() => setOpen(k)} aria-label={`Xem ảnh ${p.title}`}>
                <span className="hy-ph-in"><PhotoImg photo={p} tag={false} /></span>
                <span className="hy-ph-cap">{p.title}</span>
              </button>
            </Reveal>
          ))}
        </div>
        {list.length > shown && <div className="hy-more"><button type="button" className="hy-btn hy-btn-ghost" onClick={() => setShown((n) => n + 8)}>{t('cta.morePhotos')}</button></div>}
      </div>
      {open !== null && vis[open] && <Lightbox photos={vis} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </section>
  );
}

function Films({ content }: { content: Content }) {
  const t = useT();
  const { videos, settings } = content;
  const first = videos.find((v) => v.featured) ?? videos[0];
  const [id, setId] = useState(first.id);
  const [playing, setPlaying] = useState(false);
  const active = videos.find((v) => v.id === id) ?? first;
  return (
    <section id="phim" className="hy-sec hy-films">
      <div className="hy-wrap">
        <Title eyebrow={t('films.eyebrow')} title={t('films.title')} />
        <Frame className="hy-screen-frame">
          <div className="hy-screen">
            <VideoFrame video={active} idx={videos.indexOf(active)} playing={playing} onPlay={() => setPlaying(true)} playClass="bg-claret text-white">
              <span className="hy-vcap">{active.title}{active.place ? ` · ${active.place}` : ''}</span>
            </VideoFrame>
          </div>
        </Frame>
        {videos.length > 1 && (
          <ul className="hy-vlist">
            {videos.map((v, k) => (
              <li key={v.id}><button type="button" aria-current={v.id === active.id} onClick={() => { setId(v.id); setPlaying(Boolean(v.youtubeId)); }}><span className="hy-vthumb"><VideoThumb video={v} idx={k} /></span><b>{v.title}</b></button></li>
            ))}
          </ul>
        )}
        {settings.youtubeChannelUrl && <div className="hy-more"><a href={settings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="hy-btn hy-btn-ghost">{t('cta.channel')}</a></div>}
      </div>
    </section>
  );
}

function Services({ packages, onPick }: { packages: Content['packages']; onPick: (n: string) => void }) {
  const t = useT();
  return (
    <section id="goi" className="hy-sec hy-services">
      <div className="hy-wrap">
        <Title eyebrow={t('services.eyebrow')} title={t('services.title')} />
        <ul className="hy-cards">
          {packages.map((p, k) => (
            <li key={p.id} className={p.highlight ? 'is-hl' : ''}>
              <Reveal delay={k * 100}>
                <Frame className="hy-card">
                  {p.highlight && <span className="hy-badge">{p.badge || t('services.badge')}</span>}
                  <Hy className="hy-card-hy" />
                  <h3>{p.name}</h3>
                  {p.tagline && <p className="hy-card-tag">{p.tagline}</p>}
                  <ul>{p.features.map((f) => (<li key={f}>{f}</li>))}</ul>
                  <a href="#lien-he" className="hy-btn" onClick={() => onPick(p.name)}>{t('cta.consult')}</a>
                </Frame>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process({ steps }: { steps: Content['process'] }) {
  const t = useT();
  return (
    <section id="quy-trinh" className="hy-sec hy-process">
      <div className="hy-wrap">
        <Title eyebrow={t('process.eyebrow')} title={t('process.title')} />
        <ol className="hy-steps">
          {steps.map((s, k) => (
            <li key={s.id}><Reveal delay={k * 70}><span className="hy-no">{['一', '二', '三', '四', '五', '六', '七', '八'][k] ?? k + 1}</span><h3>{s.title}</h3><p>{s.text}</p></Reveal></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonials({ items }: { items: Content['testimonials'] }) {
  const t = useT();
  return (
    <section id="cam-nhan" className="hy-sec hy-quotes">
      <div className="hy-wrap">
        <Title eyebrow={t('quotes.eyebrow')} title={t('quotes.title')} />
        <ul className="hy-q-grid">
          {items.map((q, k) => (
            <li key={q.id}><Reveal delay={(k % 3) * 80}><Frame className="hy-q"><p>“{q.text}”</p><footer><b>{q.names}</b>{q.place && <span>{q.place}</span>}</footer></Frame></Reveal></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact({ settings, packages, pkg, dark }: { settings: Settings; packages: Content['packages']; pkg: string; dark: boolean }) {
  const t = useT();
  return (
    <section id="lien-he" className="hy-sec hy-contact">
      <div className="hy-wrap">
        <Title eyebrow={t('contact.eyebrow')} title={t('contact.title')} />
        <div className="hy-contact-grid">
          <Reveal>
            <FacebookCard settings={settings} />
            <ContactDetails settings={settings} tone={dark ? 'dark' : 'light'} className="mt-8" />
            <SocialPills settings={settings} tone={dark ? 'dark' : 'light'} className="mt-6" />
          </Reveal>
          <Reveal delay={120}><Frame className="hy-form"><InquiryForm packages={packages} selectedPackage={pkg} /></Frame></Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  return (
    <footer className="hy-foot">
      <HyRule />
      <Brand settings={settings} onDark className="h-14 md:h-20" />
      <p className="hy-foot-line">{t('footer.line')}</p>
      <nav aria-label="Chân trang">{NAV.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}</nav>
      <p className="hy-foot-contact">
        {settings.phone && <a href={telLink(settings)}>{settings.phone}</a>}
        {settings.zalo && <a href={zaloLink(settings)} target="_blank" rel="noopener noreferrer">Zalo {settings.zalo}</a>}
        {settings.address && <span>{settings.address}</span>}
      </p>
      <p className="hy-foot-copy">© {new Date().getFullYear()} {settings.brand}</p>
    </footer>
  );
}

/** Giao diện "Hỷ truyền thống": đỏ và vàng, khung thiệp cưới, đèn lồng, chữ Hỷ. */
export default function HyTemplate({ content, options, pkg, onPick }: TemplateProps) {
  const { settings, photos, videos, packages, process, testimonials } = content;
  const dark = options.variant === 'red';
  return (
    <div className={`hy-root ${dark ? 'is-red' : 'is-gold'}`}>
      <Head settings={settings} dark={dark} />
      <main>
        <Hero settings={settings} photos={photos} />
        <About settings={settings} />
        {photos.length > 0 && <Gallery settings={settings} photos={photos} />}
        {videos.length > 0 && <Films content={content} />}
        {packages.length > 0 && <Services packages={packages} onPick={onPick} />}
        {process.length > 0 && <Process steps={process} />}
        {testimonials.length > 0 && <Testimonials items={testimonials} />}
        <Contact settings={settings} packages={packages} pkg={pkg} dark={dark} />
      </main>
      <Footer settings={settings} />
      <FloatingChat settings={settings} />
    </div>
  );
}
