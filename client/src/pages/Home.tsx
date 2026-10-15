import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import { Loader } from '../components/Loader';
import { saveBrand } from '../lib/brandCache';
import { TextsProvider } from '../lib/texts';
import { TEMPLATES } from '../templates';
import type { TemplateProps } from '../templates/types';
import type { Content, TemplateOptions } from '../types';

/** Gộp tuỳ chỉnh đã lưu với mặc định của giao diện. */
function resolveOptions(content: Content, id: string): TemplateOptions {
  const meta = content.templates.find((t) => t.id === id);
  const saved = content.settings.templateOptions?.[id] ?? {};
  const out: TemplateOptions = {};
  for (const o of meta?.options ?? []) out[o.key] = saved[o.key] ?? o.default;
  return out;
}

export default function Home() {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');
  const [pkg, setPkg] = useState('');

  const load = useCallback(() => {
    setError('');
    api.content().then((c) => { saveBrand(c.settings); setContent(c); }).catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  // ?template=ma-giao-dien cho phép xem thử một giao diện trước khi áp dụng (quản trị viên dùng nút "Xem thử").
  const templateId = useMemo(() => {
    if (!content) return 'classic';
    const forced = new URLSearchParams(window.location.search).get('template');
    if (forced && TEMPLATES[forced]) return forced;
    return TEMPLATES[content.settings.template] ? content.settings.template : 'classic';
  }, [content]);
  const options = useMemo(() => {
    if (!content) return {};
    const base = resolveOptions(content, templateId);
    // Khi xem thử (?template=...&po={json}), tuỳ chỉnh chưa lưu trong quản trị được áp tạm thời để nhìn trước.
    const q = new URLSearchParams(window.location.search);
    const po = q.get('template') && q.get('po');
    if (po) {
      try {
        const o = JSON.parse(po) as Record<string, unknown>;
        for (const k of Object.keys(base)) {
          const v = o[k];
          if (typeof v !== typeof base[k]) continue;
          if (k === 'accent' && !/^#[0-9a-f]{6}$/i.test(String(v))) continue;
          base[k] = v as string | boolean;
        }
      } catch { /* bỏ qua tuỳ chỉnh xem thử sai định dạng */ }
    }
    return base;
  }, [content, templateId]);

  // Giao diện, màu nhấn và chế độ chuyển động được gắn lên <html> để CSS của từng giao diện áp dụng cho cả trang.
  const accent = typeof options.accent === 'string' ? options.accent : '';
  const motion = options.motion !== false;
  useEffect(() => {
    if (!content) return;
    const el = document.documentElement;
    el.dataset.template = templateId;
    el.dataset.motion = motion ? 'on' : 'off';
    if (accent) el.style.setProperty('--accent', accent);
    return () => {
      delete el.dataset.template;
      delete el.dataset.motion;
      el.style.removeProperty('--accent');
    };
  }, [content, templateId, accent, motion]);

  // Biểu tượng tab trình duyệt lấy theo logo thương hiệu nếu đã tải lên.
  const icon = content ? content.settings.logoUrl || content.settings.logoLightUrl : '';
  useEffect(() => {
    if (!icon) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = icon;
  }, [icon]);

  const shell = (child: ReactNode) => (
    <div className="grid min-h-[100svh] place-items-center bg-night px-6 text-center text-snow">{child}</div>
  );

  if (!content) {
    return shell(
      error ? (
        <div>
          <p className="font-display text-3xl italic">Chưa tải được trang</p>
          <p className="mt-3 text-sm text-snow/60">{error}</p>
          <button type="button" onClick={load} className="mt-8 rounded-full border border-white/40 px-6 py-3 text-sm hover:bg-white/10">Thử lại</button>
        </div>
      ) : (
        <Loader />
      ),
    );
  }

  const Template = TEMPLATES[templateId];
  const props: TemplateProps = { content, options, pkg, onPick: setPkg };
  return (
    <TextsProvider texts={content.settings.texts ?? {}} defs={content.textDefs ?? []} template={templateId}>
      <Suspense fallback={shell(<Loader />)}>
        <Template {...props} />
      </Suspense>
    </TextsProvider>
  );
}
