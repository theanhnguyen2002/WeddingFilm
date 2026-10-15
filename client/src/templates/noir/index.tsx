import { useEffect, useRef, useState } from 'react';
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
import './style.css';

const pad = (n: number) => String(n).padStart(2, '0');

function Head({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  const solid = useScrolled(40);
  const [open, setOpen] = useState(false);
  useLockBody(open);
  return (
    <header className={`nr-head ${solid || open ? 'is-solid' : ''}`}>
      <div className="nr-head-in">
        <a href="#top" aria-label={`${settings.brand}, ${t('cta.toTop').toLowerCase()}`}><Brand settings={settings} onDark className="h-10 md:h-12" /></a>
        <nav className="nr-nav" aria-label="Điều hướng chính">
          {NAV.map((n, k) => (<a key={n.href} href={n.href}><i>{pad(k + 1)}</i>{n.label}</a>))}
        </nav>
        <button type="button" className="nr-burger" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen((o) => !o)}>{open ? t('nr.close') : t('nr.menu')}</button>
      </div>
      {open && (
        <nav className="nr-drop" aria-label="Menu">
          {NAV.map((n, k) => (<a key={n.href} href={n.href} onClick={() => setOpen(false)}><i>{pad(k + 1)}</i>{n.label}</a>))}
        </nav>
      )}
    </header>
  );
}

function Hero({ content, variant }: { content: Content; variant: string }) {
  const t = useT();
  const { settings, photos, videos } = content;
  const film = videos.find((v) => v.featured) ?? videos[0];
  const cover = (photos.filter((p) => p.featured)[0] ?? photos[0]) as Photo | undefined;
  const [play, setPlay] = useState(false);
  const useVideo = variant !== 'photo' && film;
  const words = (settings.heroTitle || settings.brand).trim().split(/\s+/);
  const tail = words.length > 3 ? 2 : 1;
  return (
    <section id="top" className="nr-hero">
      <div className="nr-hero-bg">
        {useVideo ? (
          <VideoFrame video={film} idx={0} playing={play} onPlay={() => setPlay(true)} playClass="bg-white text-black" />
        ) : cover ? (
          <PhotoImg photo={cover} tag={false} eager />
        ) : null}
      </div>
      <div className="nr-hero-shade" />
      <div className="nr-bar nr-bar-t" aria-hidden="true" />
      <div className="nr-bar nr-bar-b" aria-hidden="true" />
      {!play && (
        <div className="nr-hero-in">
          <p className="nr-kicker"><span />{settings.brand}</p>
          <h1 className="nr-h1">{words.slice(0, -tail).join(' ')} <em>{words.slice(-tail).join(' ')}</em></h1>
          {settings.tagline && <p className="nr-lead">{settings.tagline}</p>}
          <div className="nr-cta">
            <a href="#lien-he" className="nr-btn">{t('cta.consult')}</a>
            <a href="#anh" className="nr-btn nr-btn-ghost">{t('cta.viewPhotos')}</a>
          </div>
        </div>
      )}
    </section>
  );
}

function Chapter({ n, title, sub }: { n: number; title: string; sub?: string }) {
  const t = useT();
  return (
    <Reveal className="nr-chapter">
      <span className="nr-num">{pad(n)}</span>
      <div><p className="nr-label">{t('nr.chapter')} {pad(n)}</p><h2 className="nr-h2"><Rich text={title} /></h2>{sub && <p className="nr-sub">{sub}</p>}</div>
    </Reveal>
  );
}

function About({ settings }: { settings: Settings }) {
  return (
    <section id="gioi-thieu" className="nr-sec nr-about">
      <div className="nr-wrap">
        <Chapter n={1} title={settings.aboutTitle} />
        <div className="nr-about-grid">
          <Reveal><p className="nr-body">{settings.aboutText}</p></Reveal>
          {settings.aboutPoints.length > 0 && (
            <ul className="nr-points">
              {settings.aboutPoints.map((p, k) => (
                <li key={p.title}><Reveal delay={k * 80}><b>{pad(k + 1)}</b><h3>{p.title}</h3><p>{p.text}</p></Reveal></li>
              ))}
            </ul>
          )}
        </div>
        {settings.stats.length > 0 && (
          <ul className="nr-stats">{settings.stats.map((s) => (<li key={s.label}><b>{s.value}</b><span>{s.label}</span></li>))}</ul>
        )}
      </div>
    </section>
  );
}

function Gallery({ settings, photos }: { settings: Settings; photos: Photo[] }) {
  const t = useT();
  const [cat, setCat] = useState(ALL_CATEGORY);
  const [open, setOpen] = useState<number | null>(null);
  const strip = useRef<HTMLUListElement>(null);
  const cats = galleryCategories(settings.photoCategories, photos);
  const list = filterPhotos(photos, cats.includes(cat) ? cat : ALL_CATEGORY);
  useEffect(() => { strip.current?.scrollTo({ left: 0 }); }, [cat]);
  const by = (d: number) => strip.current?.scrollBy({ left: d * Math.min(640, window.innerWidth * 0.8), behavior: 'smooth' });
  return (
    <section id="anh" className="nr-sec nr-gallery">
      <div className="nr-wrap">
        <Chapter n={2} title={t('gallery.title')} sub={t('gallery.sub')} />
        <div className="nr-tools">
          {cats.length > 2 && (
            <div className="nr-chips" role="group" aria-label="Lọc ảnh theo nhóm">
              {cats.map((c) => (<button key={c} type="button" aria-pressed={c === cat} className={c === cat ? 'is-on' : ''} onClick={() => setCat(c)}>{c}</button>))}
            </div>
          )}
          <div className="nr-arrows"><button type="button" onClick={() => by(-1)} aria-label="Ảnh trước">←</button><button type="button" onClick={() => by(1)} aria-label="Ảnh sau">→</button></div>
        </div>
      </div>
      <ul ref={strip} className="nr-strip" tabIndex={0} aria-label="Dải ảnh cuộn ngang">
        {list.map((p, k) => (
          <li key={p.id}>
            <button type="button" onClick={() => setOpen(k)} aria-label={`Xem ảnh ${p.title}`}>
              <span className="nr-frame"><PhotoImg photo={p} tag={false} /></span>
              <span className="nr-meta"><i>{pad(k + 1)}</i><b>{p.title}</b><em>{p.category}</em></span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && list[open] && <Lightbox photos={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
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
    <section id="phim" className="nr-sec nr-films">
      <div className="nr-wrap">
        <Chapter n={3} title={t('films.title')} sub={t('films.intro')} />
        <div className="nr-theatre">
          <div className="nr-screen">
            <VideoFrame video={active} idx={videos.indexOf(active)} playing={playing} onPlay={() => setPlaying(true)} playClass="bg-white text-black">
              <span className="nr-subtitle">{active.title}{active.place ? ` · ${active.place}` : ''}</span>
            </VideoFrame>
          </div>
          {videos.length > 1 && (
            <ul className="nr-reel">
              {videos.map((v, k) => (
                <li key={v.id}>
                  <button type="button" aria-current={v.id === active.id} onClick={() => { setId(v.id); setPlaying(Boolean(v.youtubeId)); }}>
                    <span className="nr-thumb"><VideoThumb video={v} idx={k} /></span>
                    <span><i>{pad(k + 1)}</i><b>{v.title}</b>{v.place && <em>{v.place}</em>}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {settings.youtubeChannelUrl && <a href={settings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="nr-btn nr-btn-ghost mt-10">{t('cta.channel')}</a>}
      </div>
    </section>
  );
}

function Services({ packages, onPick }: { packages: Content['packages']; onPick: (n: string) => void }) {
  const t = useT();
  return (
    <section id="goi" className="nr-sec nr-services">
      <div className="nr-wrap">
        <Chapter n={4} title={t('services.title')} />
        <ul className="nr-posters">
          {packages.map((p, k) => (
            <li key={p.id} className={p.highlight ? 'is-hl' : ''}>
              <Reveal delay={k * 100} className="nr-poster">
                <span className="nr-poster-no">{pad(k + 1)}</span>
                {p.highlight && <span className="nr-badge">{p.badge || t('services.badge')}</span>}
                <h3>{p.name}</h3>
                {p.tagline && <p className="nr-poster-tag">{p.tagline}</p>}
                <ul>{p.features.map((f) => (<li key={f}>{f}</li>))}</ul>
                <a href="#lien-he" className="nr-btn nr-btn-ghost" onClick={() => onPick(p.name)}>{t('cta.consult')}</a>
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
    <section id="quy-trinh" className="nr-sec nr-process">
      <div className="nr-wrap">
        <Chapter n={5} title={t('process.title')} />
        <ol className="nr-reel-steps">
          {steps.map((s, k) => (
            <li key={s.id}><Reveal delay={k * 70}><span>{pad(k + 1)}</span><h3>{s.title}</h3><p>{s.text}</p></Reveal></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonials({ items }: { items: Content['testimonials'] }) {
  const t = useT();
  return (
    <section id="cam-nhan" className="nr-sec nr-quotes">
      <div className="nr-wrap">
        <Chapter n={6} title={t('quotes.title')} />
        <ul className="nr-subs">
          {items.map((q, k) => (
            <li key={q.id}><Reveal delay={(k % 3) * 80}><p>“{q.text}”</p><footer><b>{q.names}</b>{q.place && <span>{q.place}</span>}</footer></Reveal></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact({ settings, packages, pkg }: { settings: Settings; packages: Content['packages']; pkg: string }) {
  const t = useT();
  return (
    <section id="lien-he" className="nr-sec nr-contact">
      <div className="nr-wrap">
        <Chapter n={7} title={t('contact.title')} sub={t('contact.sub')} />
        <div className="nr-contact-grid">
          <Reveal>
            <FacebookCard settings={settings} />
            <ContactDetails settings={settings} tone="dark" className="mt-8" />
            <SocialPills settings={settings} tone="dark" className="mt-6" />
          </Reveal>
          <Reveal delay={120}><div className="nr-form"><InquiryForm packages={packages} selectedPackage={pkg} /></div></Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  return (
    <footer className="nr-foot">
      <div className="nr-credits">
        <p className="nr-label">{t('nr.credit')}</p>
        <Brand settings={settings} onDark className="h-14 md:h-20" />
        <nav aria-label="Chân trang">{NAV.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}</nav>
        <p className="nr-foot-contact">
          {settings.phone && <a href={telLink(settings)}>{settings.phone}</a>}
          {settings.zalo && <a href={zaloLink(settings)} target="_blank" rel="noopener noreferrer">Zalo {settings.zalo}</a>}
          {settings.address && <span>{settings.address}</span>}
        </p>
        <p className="nr-label">© {new Date().getFullYear()} {settings.brand} · {t('nr.end')}</p>
      </div>
    </footer>
  );
}

/** Giao diện "Điện ảnh": nền đen, chữ vàng, chương phim, dải ảnh cuộn ngang. */
export default function Noir({ content, options, pkg, onPick }: TemplateProps) {
  const { settings, photos, videos, packages, process, testimonials } = content;
  return (
    <div className="nr-root">
      <Head settings={settings} />
      <main>
        <Hero content={content} variant={String(options.variant)} />
        <About settings={settings} />
        {photos.length > 0 && <Gallery settings={settings} photos={photos} />}
        {videos.length > 0 && <Films content={content} />}
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
