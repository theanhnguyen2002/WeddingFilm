import { readBrand } from '../lib/brandCache';
import { Wordmark } from './Header';

/** Màn hình chờ: hiện logo thương hiệu (nếu đã tải lên), chưa có thì hiện tên bằng chữ. */
export function Loader() {
  const b = readBrand();
  const src = b ? b.logoLightUrl || b.logoUrl : '';
  // Nền tối: nếu chỉ có logo cho nền sáng thì đổi sang màu trắng.
  const tone = b && !b.logoLightUrl && b.logoUrl ? 'brightness-0 invert' : '';
  return (
    <div className="animate-pulse text-snow" role="status" aria-label="Đang tải">
      {src ? (
        <img src={src} alt={b?.brand || ''} className={`mx-auto h-20 w-auto max-w-[16rem] object-contain md:h-28 md:max-w-[22rem] ${tone}`} />
      ) : (
        <Wordmark brand={b?.brand || 'Wedding Film'} className="justify-center [&>span:first-child]:text-5xl md:[&>span:first-child]:text-6xl" />
      )}
    </div>
  );
}
