# Giao diện (template) của website

Mỗi giao diện là một thư mục `templates/<mã>/` gồm:

- `index.tsx`: `export default function X(props: TemplateProps)`, tự vẽ toàn bộ trang (đầu trang, các mục, chân trang).
- `style.css`: CSS riêng. Mọi selector phải bắt đầu bằng `html[data-template='<mã>']` để không ảnh hưởng giao diện khác.

Đăng ký ở `templates/index.ts`, thông tin mô tả và tuỳ chỉnh ở `server/templates.js`.
Khi một giao diện được chọn, `Home.tsx` gắn lên `<html>`: `data-template`, `data-motion` (on/off) và biến CSS `--accent` (màu nhấn quản trị viên chọn).

## Dữ liệu (props.content)

`settings` (brand, logoUrl, logoLightUrl, heroTitle, tagline, keywords[], aboutTitle, aboutText, aboutPoints[{title,text}], stats[{value,label}],
phone, zalo, email, address, hours, facebookUrl, messengerUrl, instagramUrl, tiktokUrl, youtubeChannelUrl, mapUrl, photoCategories[]),
`photos` (title, category, src, w, h, seed, featured; src rỗng thì dùng PhotoImg để vẽ ảnh mẫu), `videos` (title, place, youtubeId, featured),
`packages` (name, badge, tagline, features[], highlight: ba lễ ăn hỏi, đại lễ, tiệc đón khách), `process` (title, text), `testimonials` (names, place, text).
Mục không có dữ liệu (quy trình, cảm nhận khách, thống kê, video, ảnh) phải tự ẩn, không để khung trống.

## Các mục bắt buộc (id để menu cuộn tới)

`#gioi-thieu`, `#anh` (có lọc theo nhóm, mở Lightbox), `#phim`, `#goi` (dịch vụ, nút chọn gọi `onPick(p.name)` rồi cuộn tới `#lien-he`),
`#quy-trinh`, `#cam-nhan` (nếu có), `#lien-he` (thông tin liên hệ, thẻ Facebook nổi bật, biểu mẫu), chân trang, và `<FloatingChat />`
(nút Gọi, Zalo, Messenger cố định góc phải dưới, luôn có trong mọi giao diện).

## Thành phần dùng chung (đã có, dùng lại, đừng viết lại)

- `components/Header.tsx`: `Brand({ settings, onDark, className, textClass })` hiện logo đã tải lên hoặc tên bằng chữ; `Wordmark`; `NAV`.
- `components/Photo.tsx`: `PhotoImg({ photo, tag?, eager?, className? })` (đặt trong phần tử `relative` có kích thước).
- `components/Lightbox.tsx`: `Lightbox({ photos, index, onClose, onIndex })`.
- `components/VideoFrame.tsx`: `VideoFrame`, `VideoThumb` (khung 16:9 bấm để phát YouTube).
- `components/InquiryForm.tsx`: biểu mẫu nhận thông tin khách (có toast). Bọc nó trong một thẻ riêng và chỉnh dáng ô nhập bằng CSS trong style.css.
- `components/ContactDetails.tsx`: `ContactDetails({ settings, tone })`, `FacebookCard`, `SocialPills`, `telLink`, `zaloLink`.
- `components/FloatingChat.tsx`, `components/Reveal.tsx` (hiện dần khi cuộn), `components/ScrollProgress.tsx`, `components/SectionHead.tsx`.
- `lib/gallery.ts`: `galleryCategories(settings.photoCategories, photos)`, `filterPhotos(photos, cat)`, `ALL_CATEGORY`.
- `lib/hooks.ts`: `useScrolled`, `useScrollProgressVar`, `useLockBody`.

Các thành phần dùng chung đọc màu từ biến `--color-snow, paper, ink, mute, line, claret, claret-deep, rose, night, night-2, gold, blush`
và font `--font-display`, `--font-sans`. Hãy đặt lại các biến này trong `style.css` của giao diện (dưới `html[data-template='<mã>']`)
thì FloatingChat, Lightbox, InquiryForm... tự đổi theo. Màu nhấn chính nên nối: `--color-claret: var(--accent, <mặc định>)`.
Font đã nạp sẵn: Be Vietnam Pro, Newsreader, Playfair Display, Cormorant Garamond, Dancing Script, Oswald, Lora (và Noto Serif SC cho chữ 囍).
Chỉ dùng font hỗ trợ tiếng Việt cho chữ có dấu.

## Quy tắc nội dung và thiết kế

- Tiếng Việt, không hiện giá tiền ở bất cứ đâu, không bịa lời khách, con số hay giải thưởng.
- Không dùng thanh REC/timecode, không dùng dải chữ chạy hai hàng, không dùng header hình viên thuốc nổi giữa trang.
- Mỗi giao diện phải khác hẳn các giao diện khác về bố cục, hình dáng khung ảnh, kiểu chữ và nhịp điệu, không chỉ khác màu.
- Điện thoại 390px không tràn ngang. Chữ đủ tương phản. Nút và liên kết có `focus-visible`.
- `options.motion === false` đã được tắt animation/transition toàn cục bằng CSS, không cần xử lý thêm. Tôn trọng `prefers-reduced-motion`.
- Tuỳ chỉnh: `options.accent` (màu #rrggbb, đã nối vào `--accent`), `options.variant` (xem `server/templates.js`, phải làm đủ cả hai lựa chọn).
