import { About } from '../../components/About';
import { Contact } from '../../components/Contact';
import { Films } from '../../components/Films';
import { FloatingChat } from '../../components/FloatingChat';
import { Footer } from '../../components/Footer';
import { Gallery } from '../../components/Gallery';
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { Packages } from '../../components/Packages';
import { Process } from '../../components/Process';
import { ScrollProgress } from '../../components/ScrollProgress';
import { Testimonials } from '../../components/Testimonials';
import type { TemplateProps } from '../types';
import './style.css';

/** Giao diện "Cổ điển điện ảnh": chính là bố cục gốc của website. */
export default function Classic({ content, options, pkg, onPick }: TemplateProps) {
  const { settings, photos, videos, packages, process, testimonials } = content;
  return (
    <>
      <ScrollProgress />
      <Header settings={settings} />
      <main>
        <Hero settings={settings} photos={photos} collage={options.variant !== 'full'} />
        <About settings={settings} photos={photos} />
        <Gallery photos={photos} categories={settings.photoCategories} />
        <Films videos={videos} settings={settings} />
        <Packages packages={packages} onPick={onPick} />
        <Process steps={process} />
        <Testimonials items={testimonials} />
        <Contact settings={settings} packages={packages} selectedPackage={pkg} />
      </main>
      <Footer settings={settings} />
      <FloatingChat settings={settings} />
    </>
  );
}
