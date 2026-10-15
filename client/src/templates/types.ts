import type { Content, TemplateOptions } from '../types';

/** Mọi giao diện nhận đúng các thuộc tính này và tự vẽ toàn bộ trang (đầu trang, các mục, chân trang). */
export interface TemplateProps {
  content: Content;
  /** Tuỳ chỉnh của giao diện này đã gộp với mặc định: accent (màu #rrggbb), variant (mã lựa chọn), motion (bật/tắt). */
  options: TemplateOptions;
  /** Lễ khách vừa bấm "Nhận tư vấn" ở mục Dịch vụ, truyền cho InquiryForm. */
  pkg: string;
  /** Gọi khi khách bấm nút chọn lễ ở mục Dịch vụ (cùng lúc cuộn tới #lien-he). */
  onPick: (name: string) => void;
}
