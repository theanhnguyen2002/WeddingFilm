export interface AboutPoint { title: string; text: string }
export interface Stat { value: string; label: string }

export interface Settings {
  brand: string;
  /** Logo dùng trên nền sáng (hoặc logo duy nhất). */
  logoUrl: string;
  /** Logo dùng trên nền tối, có thể để trống. */
  logoLightUrl: string;
  heroTitle: string;
  tagline: string;
  keywords: string[];
  aboutTitle: string;
  aboutText: string;
  aboutPoints: AboutPoint[];
  stats: Stat[];
  phone: string;
  zalo: string;
  email: string;
  address: string;
  hours: string;
  facebookUrl: string;
  messengerUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeChannelUrl: string;
  mapUrl: string;
  siteUrl: string;
  /** Các nhóm ảnh (nút lọc ở thư viện ảnh), do quản trị viên đặt. */
  photoCategories: string[];
  /** Mã giao diện đang dùng, ví dụ 'classic'. */
  template: string;
  /** Tuỳ chỉnh đã lưu cho từng giao diện: { [mã giao diện]: { accent, variant, motion } }. */
  templateOptions: Record<string, TemplateOptions>;
  /** Chữ đã sửa trong quản trị: { [mã chữ]: nội dung }. */
  texts: Record<string, string>;
  allowRegister: boolean;
}

export type TemplateOptions = Record<string, string | boolean>;

export interface TemplateOptionDef {
  key: string; label: string; type: 'color' | 'select' | 'toggle'; default: string | boolean;
  choices?: { value: string; label: string }[];
}
export interface TemplateMeta {
  id: string; name: string; tagline: string; description: string; swatches: string[]; options: TemplateOptionDef[];
}
export interface ProcessStep { id: string; order: number; title: string; text: string }

export interface Photo {
  id: string; order: number; title: string; category: string;
  src: string; w: number; h: number; seed: number; featured: boolean;
}
export interface Video {
  id: string; order: number; title: string; place: string; youtubeId: string; featured: boolean;
}
export interface Pkg {
  id: string; order: number; name: string; badge: string; tagline: string; features: string[]; highlight: boolean;
}
export interface Testimonial {
  id: string; order: number; names: string; place: string; text: string;
}

export interface TextDef { group: string; key: string; label: string; def: string; by: Record<string, string>; only: string[]; long: boolean }

export interface Content {
  textDefs: TextDef[];
  settings: Settings;
  photos: Photo[];
  videos: Video[];
  packages: Pkg[];
  process: ProcessStep[];
  testimonials: Testimonial[];
  templates: TemplateMeta[];
}

export type InquiryStatus = 'new' | 'contacted' | 'booked' | 'skipped';
export interface InquiryInput {
  name: string; phone: string; date: string; date2?: string; venue: string; packageName: string; message: string; website?: string;
}
export interface Inquiry extends InquiryInput {
  id: string; createdAt: number; status: InquiryStatus;
}

export type Collection = 'photos' | 'videos' | 'packages' | 'process' | 'testimonials';
