import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { TemplateProps } from './types';

type Tpl = LazyExoticComponent<ComponentType<TemplateProps>>;

/** Mã giao diện (trùng với server/templates.js) và nơi vẽ giao diện đó. Mỗi giao diện tải riêng khi được chọn. */
export const TEMPLATES: Record<string, Tpl> = {
  classic: lazy(() => import('./classic')),
  editorial: lazy(() => import('./editorial')),
  garden: lazy(() => import('./garden')),
  noir: lazy(() => import('./noir')),
  hy: lazy(() => import('./hy')),
};
