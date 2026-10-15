import type { Photo } from '../types';

// Mỗi "tâm trạng" là ba màu: trời sáng, chân trời, đồi tối.
const MOODS = [
  ['#f3d6d1', '#c98f93', '#5b3342'],
  ['#cfd9e6', '#7f93b3', '#27344d'],
  ['#f0dcb8', '#c59a5b', '#4a3520'],
  ['#dfe5df', '#9bb09f', '#2e4234'],
  ['#e5d6e8', '#a98bb3', '#3b2a4a'],
  ['#d9e4e8', '#86a9b5', '#1f3a47'],
  ['#efd3c2', '#d08a62', '#4f2a1f'],
  ['#cfd3da', '#78808f', '#1d222c'],
];

/** Ảnh mẫu vẽ bằng gradient, dùng khi chưa tải ảnh thật lên. */
export function Placeholder({ seed, tag = true }: { seed: number; tag?: boolean }) {
  const m = MOODS[seed % MOODS.length];
  const sx = 18 + ((seed * 23) % 60);
  const sy = 24 + ((seed * 11) % 22);
  return (
    <div
      className="grain absolute inset-0 overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${m[0]} 0%, ${m[1]} 64%, ${m[2]} 100%)` }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={sx} cy={sy} r="16" fill="#fff" opacity=".12" />
        <circle cx={sx} cy={sy} r="9" fill="#fff" opacity=".55" />
        <path d={`M0 ${70 + (seed % 5)} Q 24 ${58 + (seed % 7)} 52 70 T 100 ${66 + (seed % 6)} V100 H0Z`} fill={m[2]} opacity=".5" />
        <path d={`M0 86 Q 30 ${74 + (seed % 5)} 62 85 T 100 ${80 + (seed % 4)} V100 H0Z`} fill={m[2]} opacity=".85" />
      </svg>
      {tag && (
        <span className="absolute left-2 top-2 rounded-xs bg-black/35 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/85">
          Ảnh mẫu
        </span>
      )}
    </div>
  );
}

interface Props {
  photo: Pick<Photo, 'src' | 'title' | 'seed'>;
  className?: string;
  tag?: boolean;
  eager?: boolean;
}

export function PhotoImg({ photo, className = '', tag = true, eager = false }: Props) {
  if (photo.src) {
    return (
      <img
        src={photo.src}
        alt={photo.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );
  }
  return <Placeholder seed={photo.seed} tag={tag} />;
}
