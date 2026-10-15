import { useEffect, useState } from 'react';
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
import { FloralDivider, Flower, Heart, Leaf, Lens, Sprig, Wave } from './Ornaments';
import './style.css';

type Shape = 'arch' | 'oval';

function Head({ settings, hasProcess }: { settings: Settings; hasProcess: boolean }) {
  const t = useT();
  const NAV = useNav();
  const solid = useScrolled(30);
  const [open, setOpen] = useState(false);
  useLockBody(open);
  const left = [NAV[0], NAV[1]];
  const right = [NAV[2], NAV[3]];
  return (
    <header className={`gd-head ${solid || open ? 'is-solid' : ''}`}>
      <div className="gd-head-in">
        <nav className="gd-nav gd-nav-l" aria-label="Điều hướng chính">
          {left.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
        </nav>
        <a href="#top" className="gd-brand" aria-label={`${settings.brand}, ${t('cta.toTop').toLowerCase()}`}>
          <Brand settings={settings} onDark={false} className="h-11 md:h-14" />
        </a>
        <nav className="gd-nav gd-nav-r" aria-label="Điều hướng phụ">
          {right.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
          {hasProcess && <a href="#quy-trinh">{t('nav.process')}</a>}
          <a href="#lien-he" className="gd-pill">{t('nav.contact')}</a>
        </nav>
        <button type="button" className="gd-burger" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <nav className="gd-drop" aria-label="Menu">
          {NAV.map((n) => (<a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>))}
        </nav>
      )}
    </header>
  );
}

function Hero({ settings, photos, shape }: { settings: Settings; photos: Photo[]; shape: Shape }) {
  const t = useT();
  const pool = (photos.filter((p) => p.featured).length ? photos.filter((p) => p.featured) : photos).slice(0, 5);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (pool.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % pool.length), 5200);
    return () => window.clearInterval(t);
  }, [pool.length]);
  const words = (settings.heroTitle || settings.brand).trim().split(/\s+/);
  const tail = words.length > 3 ? 2 : 1;
  const side = (k: number) => pool[(i + k) % Math.max(pool.length, 1)];
  return (
    <section id="top" className="gd-hero">
      <Sprig className="gd-hero-sprig gd-hero-sprig-l" />
      <Sprig className="gd-hero-sprig gd-hero-sprig-r" flip />
      <div className="gd-hero-in">
        <p className="gd-script gd-hero-kicker">{settings.brand}</p>
        <div className="gd-frames">
          {pool.length > 1 && <div className="gd-circle gd-circle-l"><PhotoImg photo={side(1)} tag={false} /></div>}
          <div className={`gd-main ${shape === 'oval' ? 'is-oval' : ''}`}>
            {pool.length === 0 && <div className="gd-ph-empty"><Flower className="h-20 w-20" /></div>}
            {pool.map((p, k) => (
              <div key={p.id} className={`gd-slide ${k === i ? 'is-on' : ''}`} aria-hidden={k !== i}>
                <PhotoImg photo={p} tag={false} eager={k === 0} />
              </div>
            ))}
          </div>
          {pool.length > 2 && <div className="gd-circle gd-circle-r"><PhotoImg photo={side(2)} tag={false} /></div>}
        </div>
        <h1 className="gd-h1">
          {words.slice(0, -tail).join(' ')} <span className="gd-script gd-accent-word">{words.slice(-tail).join(' ')}</span>
        </h1>
        {settings.tagline && <p className="gd-lead">{settings.tagline}</p>}
        <div className="gd-cta-row">
          <a href="#lien-he" className="gd-btn">{t('cta.consult')}</a>
          <a href="#anh" className="gd-btn gd-btn-ghost">{t('cta.viewPhotos')}</a>
        </div>
      </div>
    </section>
  );
}

function About({ settings }: { settings: Settings }) {
  const icons = [Heart, Leaf, Lens];
  return (
    <section id="gioi-thieu" className="gd-sec gd-about">
      <div className="gd-wrap gd-center">
        <Reveal>
          <FloralDivider className="gd-sage" />
          <h2 className="gd-h2 mx-auto mt-6 max-w-3xl">{settings.aboutTitle}</h2>
          <p className="gd-body mx-auto mt-6 max-w-2xl">{settings.aboutText}</p>
        </Reveal>
        {settings.aboutPoints.length > 0 && (
          <ul className="gd-points">
            {settings.aboutPoints.map((p, k) => {
              const Icon = icons[k % icons.length];
              return (
                <li key={p.title}>
                  <Reveal delay={k * 90} className="gd-card gd-card-sm">
                    <span className="gd-icon"><Icon className="h-6 w-6" /></span>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
        {settings.stats.length > 0 && (
          <ul className="gd-stats">
            {settings.stats.map((s) => (
              <li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Gallery({ settings, photos, shape }: { settings: Settings; photos: Photo[]; shape: Shape }) {
  const t = useT();
  const [cat, setCat] = useState(ALL_CATEGORY);
  const [shown, setShown] = useState(9);
  const [open, setOpen] = useState<number | null>(null);
  const cats = galleryCategories(settings.photoCategories, photos);
  const list = filterPhotos(photos, cats.includes(cat) ? cat : ALL_CATEGORY);
  const vis = list.slice(0, shown);
  return (
    <section id="anh" className="gd-sec gd-gallery">
      <div className="gd-wrap gd-center">
        <Reveal>
          <p className="gd-script gd-eyebrow">{t('gallery.eyebrow')}</p>
          <h2 className="gd-h2"><Rich text={t('gallery.title')} /></h2>
          {cats.length > 2 && (
            <div className="gd-chips" role="group" aria-label="Lọc ảnh theo nhóm">
              {cats.map((c) => (
                <button key={c} type="button" aria-pressed={c === cat} className={c === cat ? 'is-on' : ''} onClick={() => { setCat(c); setShown(9); }}>{c}</button>
              ))}
            </div>
          )}
        </Reveal>
        <div className={`gd-grid ${shape === 'oval' ? 'is-oval' : 'is-arch'}`}>
          {vis.map((p, k) => (
            <Reveal key={p.id} delay={(k % 3) * 80} className="gd-cell">
              <button type="button" className="gd-ph" onClick={() => setOpen(k)} aria-label={`Xem ảnh ${p.title}`}>
                <PhotoImg photo={p} tag={false} />
                <span className="gd-cap"><Flower className="h-5 w-5" /><b>{p.title}</b><i>{p.category}</i></span>
              </button>
            </Reveal>
          ))}
        </div>
        {list.length > shown && <button type="button" className="gd-btn gd-btn-ghost mt-12" onClick={() => setShown((n) => n + 9)}>{t('cta.morePhotos')}</button>}
      </div>
      {open !== null && vis[open] && <Lightbox photos={vis} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </section>
  );
}

function Films({ content, shape }: { content: Content; shape: Shape }) {
  const t = useT();
  const { videos, settings } = content;
  const first = videos.find((v) => v.featured) ?? videos[0];
  const [id, setId] = useState(first.id);
  const [playing, setPlaying] = useState(false);
  const active = videos.find((v) => v.id === id) ?? first;
  return (
    <section id="phim" className="gd-sec gd-films">
      <div className="gd-wrap gd-center">
        <Reveal>
          <p className="gd-script gd-eyebrow">{t('films.eyebrow')}</p>
          <h2 className="gd-h2"><Rich text={t('films.title')} /></h2>
        </Reveal>
        <div className={`gd-screen ${shape === 'oval' ? 'is-oval' : ''}`}>
          <VideoFrame video={active} idx={videos.indexOf(active)} playing={playing} onPlay={() => setPlaying(true)} playClass="bg-claret text-white">
            <span className="absolute inset-x-0 bottom-0 p-5 text-left text-white md:p-8">
              <span className="gd-script block text-3xl md:text-4xl">{active.title}</span>
              <span className="mt-1 block text-sm text-white/85">{active.place}</span>
            </span>
          </VideoFrame>
        </div>
        {videos.length > 1 && (
          <ul className="gd-rounds">
            {videos.map((v, k) => (
              <li key={v.id}>
                <button type="button" aria-current={v.id === active.id} onClick={() => { setId(v.id); setPlaying(Boolean(v.youtubeId)); }}>
                  <span className="gd-round"><VideoThumb video={v} idx={k} /></span>
                  <b>{v.title}</b>
                </button>
              </li>
            ))}
          </ul>
        )}
        {settings.youtubeChannelUrl && <a href={settings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="gd-btn gd-btn-ghost mt-10">{t('cta.channel')}</a>}
      </div>
    </section>
  );
}

function Services({ packages, onPick }: { packages: Content['packages']; onPick: (n: string) => void }) {
  const t = useT();
  return (
    <section id="goi" className="gd-sec gd-services">
      <div className="gd-wrap gd-center">
        <Reveal>
          <p className="gd-script gd-eyebrow">{t('services.eyebrow')}</p>
          <h2 className="gd-h2"><Rich text={t('services.title')} /></h2>
        </Reveal>
        <ul className="gd-cards">
          {packages.map((p, k) => (
            <li key={p.id} className={p.highlight ? 'is-hl' : ''}>
              <Reveal delay={k * 100} className="gd-card gd-pk">
                {p.highlight && <span className="gd-ribbon">{p.badge || t('services.badge')}</span>}
                <Flower className="gd-pk-flower" />
                <h3 className="gd-script">{p.name}</h3>
                {p.tagline && <p className="gd-pk-tag">{p.tagline}</p>}
                <ul className="gd-leafs">{p.features.map((f) => (<li key={f}><Leaf className="h-3.5 w-3.5" />{f}</li>))}</ul>
                <a href="#lien-he" className="gd-btn" onClick={() => onPick(p.name)}>{t('cta.consult')}</a>
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
    <section id="quy-trinh" className="gd-sec gd-process">
      <div className="gd-wrap gd-center">
        <Reveal>
          <p className="gd-script gd-eyebrow">{t('process.eyebrow')}</p>
          <h2 className="gd-h2"><Rich text={t('process.title')} /></h2>
        </Reveal>
        <ol className="gd-path" style={{ ['--n' as string]: steps.length }}>
          {steps.map((s, k) => (
            <li key={s.id}>
              <Reveal delay={k * 80}>
                <span className="gd-marker"><Flower className="gd-marker-f" /><b>{k + 1}</b></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonials({ items }: { items: Content['testimonials'] }) {
  const t = useT();
  return (
    <section id="cam-nhan" className="gd-sec gd-quotes">
      <div className="gd-wrap gd-center">
        <Reveal><p className="gd-script gd-eyebrow">{t('quotes.eyebrow')}</p><h2 className="gd-h2"><Rich text={t('quotes.title')} /></h2></Reveal>
        <ul className="gd-q-grid">
          {items.map((q, k) => (
            <li key={q.id}>
              <Reveal delay={(k % 3) * 80} className="gd-card gd-q">
                <span className="gd-script gd-qmark" aria-hidden="true">“</span>
                <p>{q.text}</p>
                <footer><b>{q.names}</b>{q.place && <span>{q.place}</span>}</footer>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact({ settings, packages, pkg }: { settings: Settings; packages: Content['packages']; pkg: string }) {
  const t = useT();
  return (
    <section id="lien-he" className="gd-sec gd-contact">
      <div className="gd-wrap">
        <div className="gd-center">
          <Reveal><p className="gd-script gd-eyebrow">{t('contact.eyebrow')}</p><h2 className="gd-h2"><Rich text={t('contact.title')} /></h2></Reveal>
        </div>
        <div className="gd-contact-grid">
          <Reveal className="gd-contact-l">
            <FacebookCard settings={settings} />
            <ContactDetails settings={settings} tone="light" className="mt-8" />
            <SocialPills settings={settings} tone="light" className="mt-6" />
          </Reveal>
          <Reveal delay={120}>
            <div className="gd-letter">
              <div className="gd-flap" aria-hidden="true"><Heart className="h-7 w-7" /></div>
              <InquiryForm packages={packages} selectedPackage={pkg} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  return (
    <footer className="gd-foot">
      <Wave className="gd-foot-wave" />
      <div className="gd-foot-in">
        <Sprig className="gd-foot-sprig" />
        <Brand settings={settings} onDark={false} className="h-14 md:h-20" />
        <p className="gd-script gd-foot-line">{t('footer.line')}</p>
        <nav aria-label="Chân trang" className="gd-foot-nav">{NAV.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}</nav>
        <p className="gd-foot-contact">
          {settings.phone && <a href={telLink(settings)}>{settings.phone}</a>}
          {settings.zalo && <a href={zaloLink(settings)} target="_blank" rel="noopener noreferrer">Zalo {settings.zalo}</a>}
          {settings.address && <span>{settings.address}</span>}
        </p>
        <p className="gd-foot-copy">© {new Date().getFullYear()} {settings.brand}</p>
      </div>
    </footer>
  );
}

/** Giao diện "Vườn hoa lãng mạn": hồng phấn, khung vòm, hoa lá vẽ tay. */
export default function Garden({ content, options, pkg, onPick }: TemplateProps) {
  const { settings, photos, videos, packages, process, testimonials } = content;
  const shape: Shape = options.variant === 'oval' ? 'oval' : 'arch';
  return (
    <div className="gd-root">
      <Head settings={settings} hasProcess={process.length > 0} />
      <main>
        <Hero settings={settings} photos={photos} shape={shape} />
        <About settings={settings} />
        {photos.length > 0 && <Gallery settings={settings} photos={photos} shape={shape} />}
        {videos.length > 0 && <Films content={content} shape={shape} />}
        {packages.length > 0 && <Services packages={packages} onPick={onPick} />}
        {process.length > 0 && <Process steps={process} />}
        {testimonials.length > 0 && <Testimonials items={testimonials} />}
        <Contact settings={settings} packages={packages} pkg={pkg} />
      </main>
      <Footer settings={settings} />
      <FloatingChat settings={settings} />
    </div>
  );
}
