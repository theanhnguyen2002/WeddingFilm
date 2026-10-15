import type { ReactNode } from 'react';
import { youtubeThumb } from '../lib/youtube';
import type { Video } from '../types';
import { useT } from '../lib/texts';

const MOOD = ['#2b3346', '#3a2a35', '#27393a', '#3a3426'];

/** Ảnh bìa của video: ảnh YouTube nếu đã có link, chưa có thì nền gradient "Video mẫu". */
export function VideoThumb({ video, idx = 0, className = '' }: { video: Video; idx?: number; className?: string }) {
  const t = useT();
  return video.youtubeId ? (
    <img src={youtubeThumb(video.youtubeId)} alt={video.title} loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`grain absolute inset-0 ${className}`} style={{ background: `linear-gradient(135deg, ${MOOD[idx % MOOD.length]}, #0d1116)` }}>
      <span className="absolute left-3 top-3 rounded-xs bg-black/35 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/80">{t('films.sample')}</span>
    </div>
  );
}

/**
 * Khung 16:9 của một video: bấm vào mới tải trình phát YouTube. Giao diện đặt thêm chữ, viền... qua `children`
 * (hiện đè lên ảnh bìa khi chưa phát) và đổi hình nút phát qua `playClass`. Cần đặt trong phần tử có chiều rộng.
 */
export function VideoFrame({ video, idx = 0, playing, onPlay, children, playClass = 'bg-claret text-white' }: {
  video: Video; idx?: number; playing: boolean; onPlay: () => void; children?: ReactNode; playClass?: string;
}) {
  return (
    <div className="relative aspect-video overflow-hidden bg-night-2">
      {playing && video.youtubeId ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="group absolute inset-0 block w-full text-left"
          onClick={() => video.youtubeId && onPlay()}
          aria-label={video.youtubeId ? `Phát phim ${video.title}` : video.title}
          disabled={!video.youtubeId}
        >
          <VideoThumb video={video} idx={idx} className="transition-transform duration-[900ms] group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20" />
          {video.youtubeId && (
            <span className={`absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-2xl transition group-hover:scale-110 md:h-24 md:w-24 ${playClass}`}>
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
          )}
          {children}
        </button>
      )}
    </div>
  );
}
