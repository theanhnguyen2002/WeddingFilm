import type { CSSProperties } from 'react';

export const HY_FONT = '"Noto Serif SC","Noto Serif CJK SC","Songti SC","STSong","SimSun",serif';

/** Chữ Hỷ (囍) trong khung tròn. */
export function Hy({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span className={className} style={{ fontFamily: HY_FONT, ...style }} aria-label="Hỷ">囍</span>;
}

/** Đèn lồng treo. */
export function Lantern({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 150" className={className} style={style} aria-hidden="true">
      <line x1="30" y1="0" x2="30" y2="26" stroke="#c9a56a" strokeWidth="2" />
      <rect x="20" y="24" width="20" height="7" rx="2" fill="#c9a56a" />
      <ellipse cx="30" cy="64" rx="26" ry="34" fill="#b3202e" />
      <ellipse cx="30" cy="64" rx="14" ry="34" fill="none" stroke="#e7c27d" strokeWidth="1.2" opacity=".7" />
      <ellipse cx="30" cy="64" rx="26" ry="34" fill="none" stroke="#e7c27d" strokeWidth="1.2" opacity=".8" />
      <rect x="20" y="96" width="20" height="7" rx="2" fill="#c9a56a" />
      <line x1="30" y1="103" x2="30" y2="146" stroke="#c9a56a" strokeWidth="2" />
      <path d="M24 124 L30 146 L36 124 Z" fill="#e7c27d" opacity=".85" />
      <text x="30" y="75" textAnchor="middle" fontSize="26" fill="#f3d79b" fontFamily={HY_FONT}>福</text>
    </svg>
  );
}

/** Góc hoa văn kiểu thiệp cưới. Đặt ở bốn góc khung. */
export function Corner({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2 62V14C2 7 7 2 14 2h48" />
      <path d="M10 62V20c0-6 4-10 10-10h42" opacity=".6" />
      <path d="M18 18c8 0 14 6 14 14-8 0-14-6-14-14z" fill="currentColor" opacity=".35" />
      <circle cx="9" cy="9" r="3" fill="currentColor" />
    </svg>
  );
}

/** Đường kẻ có chữ Hỷ giữa. */
export function HyRule({ className = '' }: { className?: string }) {
  return (
    <div className={`hy-rule ${className}`} aria-hidden="true">
      <span /><Hy className="hy-rule-glyph" /><span />
    </div>
  );
}

/** Mây cát tường đơn giản. */
export function Cloud({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M4 30c0-8 10-8 10-2 0-10 14-12 16-2 2-12 20-12 20 0 4-8 16-6 16 2 6-4 14 0 12 6H4z" />
    </svg>
  );
}
