/** Lấy mã video YouTube (11 ký tự) từ link bất kỳ: watch, youtu.be, embed, shorts, live. Trả về '' nếu không đúng. */
export function youtubeId(input: string): string {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id = '';
    if (host === 'youtu.be') id = u.pathname.split('/')[1] ?? '';
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      id = u.searchParams.get('v') ?? '';
      if (!id) id = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1] ?? '';
    }
    return /^[\w-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
