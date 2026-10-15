import { useEffect } from 'react';
import type { Settings } from './types';

type Brand = Pick<Settings, 'brand' | 'logoUrl' | 'logoLightUrl'>;

/** Logo thương hiệu trong trang quản trị: ảnh nếu đã tải lên, chưa có thì hiện chữ. */
export function AdminBrand({ settings, onDark, textClass = 'text-3xl', imgClass = 'h-12' }: {
  settings: Brand | null; onDark: boolean; textClass?: string; imgClass?: string;
}) {
  const name = settings?.brand || 'Wedding Film';
  const src = settings ? (onDark ? settings.logoLightUrl || settings.logoUrl : settings.logoUrl || settings.logoLightUrl) : '';
  if (src && settings) {
    const only = !(settings.logoUrl && settings.logoLightUrl);
    const tone = only ? (onDark ? (settings.logoLightUrl ? '' : 'brightness-0 invert') : settings.logoUrl ? '' : 'brightness-0') : '';
    return <img src={src} alt={name} className={`w-auto max-w-[12.5rem] object-contain object-left ${imgClass} ${tone}`} />;
  }
  return <span className={`block font-display font-light italic leading-none ${textClass}`}>{name.split(' ')[0]}</span>;
}

/** Đặt biểu tượng tab trình duyệt theo logo, và tiêu đề tab theo tên thương hiệu. */
export function useBrandHead(settings: Brand | null) {
  useEffect(() => {
    if (!settings) return;
    document.title = `Quản trị | ${settings.brand}`;
    const href = settings.logoUrl || settings.logoLightUrl;
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [settings]);
}
