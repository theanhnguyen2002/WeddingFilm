import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ContactDetails, FacebookCard, SocialPills, telLink, zaloLink } from '../../components/ContactDetails';
import { FloatingChat } from '../../components/FloatingChat';
import { Brand, useNav } from '../../components/Header';
import { InquiryForm } from '../../components/InquiryForm';
import { Lightbox } from '../../components/Lightbox';
import { PhotoImg } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { VideoFrame } from '../../components/VideoFrame';
import { ALL_CATEGORY, filterPhotos, galleryCategories } from '../../lib/gallery';
import { useLockBody, useScrolled } from '../../lib/hooks';
import { Rich, useT } from '../../lib/texts';
import type { Photo, Settings, Video } from '../../types';
import type { TemplateProps } from '../types';
import './style.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Đầu mục có số thứ tự: "01 — Giới thiệu" nằm trên một đường kẻ mảnh. */
function SecHead({ n, label, aside }: { n: string; label: string; aside?: ReactNode }) {
  return (
    <div className="ed-sechead">
      <span><b>{n}</b> <i aria-hidden="true">—</i> {label}</span>
      {aside && <span className="ed-sechead-aside">{aside}</span>}
    </div>
  );
}

/* ---------------------------------------------------------------- Đầu trang */

function Masthead({ settings, showQuote }: { settings: Settings; showQuote: boolean }) {
  const t = useT();
  const NAV = useNav();
  const slim = useScrolled(360);
  const [open, setOpen] = useState(false);
  useLockBody(open && slim);
  const links = NAV.slice(0, 4);
  useEffect(() => {
    if (!slim) setOpen(false);
  }, [slim]);

  return (
    <>
      <header className="ed-mast">
        <div className="ed-mast-top">
          <span>{settings.address || t('ed.mast')}</span>
          <span className="ed-mast-top-r">{settings.hours || ''}</span>
        </div>
        <a href="#top" className="ed-mast-brand" aria-label={`${settings.brand}, ${t('cta.toTop').toLowerCase()}`}>
          <Brand settings={settings} onDark={false} className="h-14 md:h-20" />
        </a>
        <nav className="ed-mast-nav" aria-label="Điều hướng chính">
          {links.map((n) => (<a key={n.href} href={n.href}>{n.label}</a>))}
          {showQuote && <a href="#lien-he" className="ed-cta">{t('cta.quote')}</a>}
        </nav>
      </header>

      <div className={`ed-slim ${slim ? 'is-on' : ''}`} aria-hidden={!slim}>
        <div className="ed-slim-in">
          <a href="#top" className="ed-slim-brand" tabIndex={slim ? 0 : -1} aria-label={t('cta.toTop')}>
            <Brand settings={settings} onDark={false} className="h-7" />
          </a>
          <nav className="ed-slim-nav" aria-label="Điều hướng nhanh">
            {links.map((n) => (<a key={n.href} href={n.href} tabIndex={slim ? 0 : -1}>{n.label}</a>))}
          </nav>
          <div className="ed-slim-r">
            <a href="#lien-he" className="ed-cta" tabIndex={slim ? 0 : -1}>{t('cta.quote')}</a>
            <button type="button" className="ed-burger" aria-expanded={open} aria-label="Mở menu" tabIndex={slim ? 0 : -1} onClick={() => setOpen((o) => !o)}>
              <span /><span />
            </button>
          </div>
        </div>
        {open && slim && (
          <nav className="ed-slim-drop" aria-label="Menu">
            {NAV.map((n) => (<a key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</a>))}
          </nav>
        )}
      </div>
    </>
  );
}

/* --------------------------------------------------------------------- Bìa */

function TitleText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const cut = words.length > 3 ? words.length - 2 : words.length;
  return (
    <>
      {words.slice(0, cut).join(' ')}
      {cut < words.length && <> <em>{words.slice(cut).join(' ')}</em></>}
    </>
  );
}

function Cover({ settings, photos }: { settings: Settings; photos: Photo[] }) {
  const t = useT();
  const cover = photos.find((p) => p.featured && p.h >= p.w) ?? photos[0];
  const title = settings.heroTitle || settings.brand;
  const len = title.length;
  const fs = len <= 30 ? 11 : len <= 50 ? 9.4 : len <= 80 ? 7.6 : 6;
  const style = { '--fs': `${fs}cqw`, '--fs-m': `${Math.min(16, fs * 1.6)}cqw` } as CSSProperties;
  const lines = settings.keywords.filter(Boolean).slice(0, 6);

  return (
    <section id="top" className="ed-cover" aria-label="Trang bìa">
      <div className="ed-wrap">
        <div className="ed-stage" style={style}>
          <div className="ed-cover-grid">
            <div className="ed-cover-photo" aria-hidden={cover ? undefined : true}>
              {cover ? (
                <>
                  <PhotoImg photo={cover} eager tag={false} />
                  <div className="ed-title-ghost" aria-hidden="true">
                    <div className="ed-title-wrap"><div className="ed-h1">{<TitleText text={title} />}</div></div>
                  </div>
                </>
              ) : (
                <div className="ed-cover-empty"><span>{settings.brand.charAt(0)}</span></div>
              )}
            </div>
            <div className="ed-title-wrap">
              <h1 className="ed-h1"><TitleText text={title} /></h1>
            </div>
            {settings.tagline && <p className="ed-tagline">{settings.tagline}</p>}
            {lines.length > 0 && (
              <aside className="ed-lines" aria-label="Trong số này">
                <p className="ed-label">{t('ed.inIssue')}</p>
                <ul>
                  {lines.map((k, i) => (
                    <li key={k}><span>{pad(i + 1)}</span>{k}</li>
                  ))}
                </ul>
              </aside>
            )}
            <p className="ed-vertical" aria-hidden="true">{settings.brand} &nbsp;/&nbsp; {t('ed.vertical')}</p>
            {cover && <p className="ed-cover-cap">{cover.title}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Giới thiệu */

function About({ settings, photos, n }: { settings: Settings; photos: Photo[]; n: string }) {
  const t = useT();
  const pts = settings.aboutPoints;
  const quote = pts[0];
  const side = photos.find((p) => p.featured && p.h < p.w) ?? photos[1] ?? photos[0];
  const paras = settings.aboutText.split(/\n+/).filter(Boolean);
  return (
    <section id="gioi-thieu" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('about.eyebrow')} aside={settings.brand} />
        <div className="ed-about">
          <Reveal className="ed-about-title">
            <h2 className="ed-h2">{settings.aboutTitle}</h2>
          </Reveal>
          {side && (
            <Reveal className="ed-about-fig" delay={80}>
              <figure>
                <div className="ed-ph"><PhotoImg photo={side} tag={false} /></div>
                <figcaption>{side.title}<span>{side.category}</span></figcaption>
              </figure>
            </Reveal>
          )}
          <div className="ed-about-body">
            <div className="ed-cols ed-drop">
              {paras.map((para, i) => (<p key={i}>{para}</p>))}
            </div>
            {quote && (
              <blockquote className="ed-pull">
                <p>{quote.title}.</p>
                {quote.text && <footer>{quote.text}</footer>}
              </blockquote>
            )}
          </div>
          {pts.length > 1 && (
            <ol className="ed-points">
              {pts.slice(1).map((p, i) => (
                <li key={p.title}>
                  <span className="ed-label">{pad(i + 2)}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        {settings.stats.length > 0 && (
          <dl className="ed-stats">
            {settings.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Thư viện ảnh */

function Gallery({ settings, photos, variant, n }: { settings: Settings; photos: Photo[]; variant: string; n: string }) {
  const t = useT();
  const [cat, setCat] = useState(ALL_CATEGORY);
  const [open, setOpen] = useState<number | null>(null);
  const cats = galleryCategories(settings.photoCategories, photos);
  const list = filterPhotos(photos, cats.includes(cat) ? cat : ALL_CATEGORY);

  const trigger = (p: Photo, i: number, children: ReactNode) => (
    <button type="button" className="ed-ph ed-ph-btn" onClick={() => setOpen(i)} aria-label={`Xem ảnh ${p.title}`}>
      {children}
    </button>
  );

  return (
    <section id="anh" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('ed.gallery.label')} aside={t('ed.photoCount', { n: list.length })} />
        <div className="ed-sec-intro">
          <h2 className="ed-h2"><Rich text={t('gallery.title')} /></h2>
          {cats.length > 2 && (
            <div className="ed-tabs" role="tablist" aria-label="Lọc ảnh theo nhóm">
              {cats.map((c) => (
                <button key={c} type="button" role="tab" aria-selected={c === cat} className={c === cat ? 'is-on' : ''} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {variant === 'strip' ? (
          <div className="ed-strip">
            {list.map((p, i) => {
              const wide = p.w > p.h * 1.1;
              return (
                <figure key={p.id} className={`ed-strip-item ${i % 2 ? 'is-r' : ''} ${wide ? 'is-wide' : ''}`}>
                  <div className="ed-strip-ph" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                    {trigger(p, i, <PhotoImg photo={p} tag={false} eager={i < 2} />)}
                  </div>
                  <figcaption>
                    <span className="ed-bignum" aria-hidden="true">{pad(i + 1)}</span>
                    <span className="ed-label">{p.category}</span>
                    <strong>{p.title}</strong>
                    <small>{pad(i + 1)} / {pad(list.length)}</small>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ) : (
          <div className="ed-mason">
            {list.map((p, i) => (
              <figure key={p.id}>
                {trigger(p, i, <PhotoImg photo={p} tag={false} />)}
                <figcaption>
                  <span className="ed-label">No. {pad(i + 1)}</span>
                  <strong>{p.title}</strong>
                  <em>{p.category}</em>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      {open !== null && list[open] && <Lightbox photos={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </section>
  );
}

/* ------------------------------------------------------------------ Phim */

function Films({ settings, videos, n }: { settings: Settings; videos: Video[]; n: string }) {
  const t = useT();
  const first = videos.find((v) => v.featured) ?? videos[0];
  const [id, setId] = useState(first.id);
  const [playing, setPlaying] = useState(false);
  const active = videos.find((v) => v.id === id) ?? first;
  const idx = videos.indexOf(active);

  return (
    <section id="phim" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('ed.films.label')} aside={t('ed.filmCount', { n: pad(videos.length) })} />
        <div className="ed-sec-intro">
          <h2 className="ed-h2"><Rich text={t('films.title')} /></h2>
        </div>
        <div className="ed-films">
          <div className="ed-films-main">
            <div className="ed-films-frame">
              <VideoFrame video={active} idx={idx} playing={playing} onPlay={() => setPlaying(true)} playClass="bg-ink text-snow" />
            </div>
            <div className="ed-films-bar">
              <span className="ed-bignum-sm">{pad(idx + 1)}</span>
              <strong>{active.title}</strong>
              <span>{active.place}</span>
            </div>
          </div>
          <div className="ed-films-index">
            <p className="ed-label">{t('ed.filmIndex')}</p>
            <ol>
              {videos.map((v, i) => (
                <li key={v.id}>
                  <button type="button" aria-current={v.id === active.id} onClick={() => { setId(v.id); setPlaying(Boolean(v.youtubeId)); }}>
                    <span className="ed-idx">{pad(i + 1)}</span>
                    <span className="ed-idx-t"><b>{v.title}</b><small>{v.place}</small></span>
                    <span aria-hidden="true">{v.id === active.id ? '●' : '→'}</span>
                  </button>
                </li>
              ))}
            </ol>
            {settings.youtubeChannelUrl && (
              <a href={settings.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="ed-link">{t('cta.channel')} →</a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Dịch vụ */

function Services({ packages, onPick, n }: { packages: TemplateProps['content']['packages']; onPick: (name: string) => void; n: string }) {
  const t = useT();
  return (
    <section id="goi" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('services.eyebrow')} aside={t('ed.services.aside')} />
        <div className="ed-sec-intro">
          <h2 className="ed-h2"><Rich text={t('services.title')} /></h2>
        </div>
        <ol className="ed-toc">
          {packages.map((p, i) => (
            <li key={p.id} className={p.highlight ? 'is-hl' : ''}>
              <Reveal className="ed-toc-row">
                <span className="ed-toc-n">{pad(i + 1)}</span>
                <div className="ed-toc-name">
                  <h3>{p.name}</h3>
                  {(p.badge || p.highlight) && p.badge && <span className="ed-badge">{p.badge}</span>}
                  {p.tagline && <p>{p.tagline}</p>}
                </div>
                <div className="ed-toc-body">
                  <ul>{p.features.slice(0, 5).map((f) => (<li key={f}>{f}</li>))}</ul>
                  <a href="#lien-he" className="ed-link" onClick={() => onPick(p.name)}>{t('cta.consult')} →</a>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Quy trình */

function Process({ steps, n }: { steps: TemplateProps['content']['process']; n: string }) {
  const t = useT();
  return (
    <section id="quy-trinh" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('process.eyebrow')} aside={t('ed.stepCount', { n: pad(steps.length) })} />
        <div className="ed-sec-intro">
          <h2 className="ed-h2"><Rich text={t('process.title')} /></h2>
        </div>
        <ol className="ed-steps">
          {steps.map((s, i) => (
            <li key={s.id}>
              <Reveal className="ed-step">
                <span className="ed-outline" aria-hidden="true">{pad(i + 1)}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Cảm nhận */

function Testimonials({ items, n }: { items: TemplateProps['content']['testimonials']; n: string }) {
  const t = useT();
  return (
    <section id="cam-nhan" className="ed-sec">
      <div className="ed-wrap">
        <SecHead n={n} label={t('ed.quotes.label')} aside={t('ed.quotes.aside')} />
        <div className="ed-quotes">
          {items.map((q, i) => (
            <Reveal key={q.id} delay={(i % 2) * 90}>
              <blockquote className="ed-quote">
                <p>{q.text}</p>
                <footer><strong>{q.names}</strong>{q.place && <span>{q.place}</span>}</footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Liên hệ */

function Contact({ settings, packages, pkg, n }: { settings: Settings; packages: TemplateProps['content']['packages']; pkg: string; n: string }) {
  const t = useT();
  return (
    <section id="lien-he" className="ed-contact">
      <div className="ed-wrap">
        <SecHead n={n} label={t('contact.eyebrow')} aside={t('ed.contact.aside')} />
        <div className="ed-contact-grid">
          <div className="ed-contact-l">
            <Reveal>
              <h2 className="ed-h2"><Rich text={t('contact.title')} /></h2>
            </Reveal>
            {settings.facebookUrl && (
              <div className="ed-fb">
                <p className="ed-label">{t('ed.follow')}</p>
                <FacebookCard settings={settings} />
              </div>
            )}
            <ContactDetails settings={settings} tone="light" className="ed-details" />
            <SocialPills settings={settings} tone="light" className="ed-social" />
          </div>
          <div className="ed-form">
            <p className="ed-label">{t('ed.formLabel')}</p>
            <InquiryForm packages={packages} selectedPackage={pkg} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Chân trang */

function Footer({ settings }: { settings: Settings }) {
  const t = useT();
  const NAV = useNav();
  const hasLogo = Boolean(settings.logoUrl || settings.logoLightUrl);
  const long = settings.brand.length > 12;
  const socials = [['Facebook', settings.facebookUrl], ['Instagram', settings.instagramUrl], ['TikTok', settings.tiktokUrl], ['YouTube', settings.youtubeChannelUrl]].filter(([, u]) => u);
  return (
    <footer className="ed-foot">
      <div className="ed-wrap">
        <div className={`ed-foot-mark ${long ? 'is-long' : ''}`} aria-label={settings.brand}>
          {hasLogo ? <Brand settings={settings} onDark className="h-20 md:h-36" /> : settings.brand}
        </div>
        <div className="ed-foot-cols">
          <div>
            <p className="ed-label">{t('ed.footer.toc')}</p>
            <ul>{NAV.map((n) => (<li key={n.href}><a href={n.href}>{n.label}</a></li>))}</ul>
          </div>
          <div>
            <p className="ed-label">{t('ed.footer.contact')}</p>
            <ul>
              {settings.phone && <li><a href={telLink(settings)}>{settings.phone}</a></li>}
              {settings.zalo && <li><a href={zaloLink(settings)} target="_blank" rel="noopener noreferrer">Zalo {settings.zalo}</a></li>}
              {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
              {settings.address && <li>{settings.address}</li>}
            </ul>
          </div>
          {socials.length > 0 && (
            <div>
              <p className="ed-label">{t('ed.footer.follow')}</p>
              <ul>{socials.map(([name, href]) => (<li key={name}><a href={href} target="_blank" rel="noopener noreferrer">{name}</a></li>))}</ul>
            </div>
          )}
          <div className="ed-foot-note">
            <p className="ed-label">{t('ed.footer.last')}</p>
            <p>{settings.tagline}</p>
          </div>
        </div>
        <div className="ed-foot-base">
          <span>© {new Date().getFullYear()} {settings.brand}</span>
          <a href="#top">{t('cta.toTop')} ↑</a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------- Trang */

/** Giao diện "Tạp chí Ivory": trang bìa tạp chí cưới, nền ngà, chữ serif rất lớn. */
export default function Editorial({ content, options, pkg, onPick }: TemplateProps) {
  const { settings, photos, videos, packages, process, testimonials } = content;
  const variant = options.variant === 'strip' ? 'strip' : 'masonry';

  const order = ['gioi-thieu'];
  if (photos.length) order.push('anh');
  if (videos.length) order.push('phim');
  if (packages.length) order.push('goi');
  if (process.length) order.push('quy-trinh');
  if (testimonials.length) order.push('cam-nhan');
  order.push('lien-he');
  const n = (id: string) => pad(order.indexOf(id) + 1);

  return (
    <div className="ed-root">
      <Masthead settings={settings} showQuote />
      <main>
        <Cover settings={settings} photos={photos} />
        <About settings={settings} photos={photos} n={n('gioi-thieu')} />
        {photos.length > 0 && <Gallery settings={settings} photos={photos} variant={variant} n={n('anh')} />}
        {videos.length > 0 && <Films settings={settings} videos={videos} n={n('phim')} />}
        {packages.length > 0 && <Services packages={packages} onPick={onPick} n={n('goi')} />}
        {process.length > 0 && <Process steps={process} n={n('quy-trinh')} />}
        {testimonials.length > 0 && <Testimonials items={testimonials} n={n('cam-nhan')} />}
        <Contact settings={settings} packages={packages} pkg={pkg} n={n('lien-he')} />
      </main>
      <Footer settings={settings} />
      <FloatingChat settings={settings} />
    </div>
  );
}
