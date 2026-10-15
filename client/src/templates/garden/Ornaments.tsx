import type { CSSProperties } from 'react';

/** Cành lá vẽ tay. Màu lấy theo currentColor, đổi hướng bằng flip. */
export function Sprig({ className = '', flip = false, style }: { className?: string; flip?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 120 220" className={className} style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }} fill="none" aria-hidden="true">
      <path d="M60 215 C 58 160 64 110 54 40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[[56, 175, -1], [60, 150, 1], [57, 122, -1], [58, 96, 1], [55, 70, -1], [54, 48, 1]].map(([x, y, d], i) => (
        <path key={i} d={`M${x} ${y} q ${d * 34} -10 ${d * 40} -38 q ${d * -30} 6 ${d * -40} 38z`} fill="currentColor" opacity={0.28 + (i % 3) * 0.12} />
      ))}
      <circle cx="54" cy="34" r="6" fill="currentColor" opacity=".55" />
      <circle cx="46" cy="24" r="3.5" fill="currentColor" opacity=".35" />
    </svg>
  );
}

/** Bông hoa năm cánh. */
export function Flower({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="24" cy="12" rx="6.5" ry="11" fill="currentColor" opacity=".45" transform={`rotate(${a} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="5" fill="currentColor" />
      <circle cx="24" cy="24" r="2" fill="#fff" opacity=".8" />
    </svg>
  );
}

/** Đường phân cách có hoa ở giữa. */
export function FloralDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-current opacity-30 md:w-28" />
      <Flower className="h-5 w-5" />
      <Flower className="h-8 w-8" />
      <Flower className="h-5 w-5" />
      <span className="h-px w-16 bg-current opacity-30 md:w-28" />
    </div>
  );
}

/** Mép sóng nối hai mục. Đặt vào cuối mục phía trên, tô bằng màu của mục phía dưới. */
export function Wave({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block h-10 w-full md:h-16 ${className}`} style={{ transform: flip ? 'scaleY(-1)' : undefined }} aria-hidden="true">
      <path d="M0 40 C 120 80 240 80 360 48 S 600 0 720 28 S 960 84 1080 52 S 1320 4 1440 36 V80 H0 Z" fill="currentColor" />
    </svg>
  );
}

export function Heart({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 5 6.4 5c2 0 3.7 1.1 5.6 3.2C13.900 6.100 15.600 5 17.600 5 21 5 23.100 8.500 21.600 11.800 19.500 16.400 12 21 12 21z" /></svg>;
}
export function Leaf({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M5 20C3 10 9 3 21 3c0 11-6 17-14 17 3-4 6-7 10-10-5 2-9 6-12 10z" /></svg>;
}
export function Lens({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="3" /><circle cx="12" cy="13" r="3.6" /><path d="M8 7l1.4-2h5.2L16 7" /></svg>;
}
