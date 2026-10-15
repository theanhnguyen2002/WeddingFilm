import { createContext, Fragment, useCallback, useContext, type ReactNode } from 'react';
import type { TextDef } from '../types';

interface Ctx { texts: Record<string, string>; defs: TextDef[]; template: string }
const TextsCtx = createContext<Ctx>({ texts: {}, defs: [], template: 'classic' });

export function TextsProvider({ texts, defs, template, children }: Ctx & { children: ReactNode }) {
  return <TextsCtx.Provider value={{ texts, defs, template }}>{children}</TextsCtx.Provider>;
}

/** Lấy chữ theo mã: chữ quản trị viên đã sửa, nếu chưa thì chữ mặc định của giao diện đang dùng. {n} được thay bằng vars.n. */
export function useT() {
  const { texts, defs, template } = useContext(TextsCtx);
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const d = defs.find((x) => x.key === key);
      let s = texts[key] ?? (d ? d.by[template] ?? d.def : '');
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [texts, defs, template],
  );
}

/** Hiển thị chữ có đánh dấu *nhấn mạnh*: phần nằm giữa hai dấu sao được in nghiêng và tô màu qua className. */
export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <em key={i} className={className}>{p}</em> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}
