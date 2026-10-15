# Wedding Film

Một thư mục tổng, ba dự án độc lập:

```
Hima/
  client/   website công khai (React + TypeScript + Tailwind + Vite), cổng dev 5173
  admin/    trang quản trị riêng (React + TypeScript + Tailwind + Vite), cổng dev 5174
  server/   backend Node.js (API, lưu dữ liệu và ảnh), cổng 3001
```

`client` và `admin` không dùng chung mã nguồn, mỗi bên có `package.json`, `vite.config.ts` và `vercel.json` riêng, nên triển khai thành hai website khác nhau (ví dụ `hima.vn` và `admin.hima.vn`). Cả hai gọi cùng một backend qua đường dẫn `/api` và `/uploads`.

## Chạy thử trên máy

```bash
npm install     # cài server, client và admin
npm run dev     # backend :3001, website :5173, admin :5174
```

- Website: http://localhost:5173
- Quản trị: http://localhost:5174 (tài khoản mặc định `admin`, mật khẩu `hima2026`, đổi ngay ở mục Tài khoản của tôi)

Trước khi chạy, chép `.env.example` thành `server/.env` và điền email Gmail, Google Client ID nếu muốn dùng (xem các mục bên dưới). Dự án có thêm thư viện `sonner` (thông báo dạng toast), `npm install` sẽ cài sẵn.

## Đưa lên mạng

Backend lưu ảnh và dữ liệu vào ổ đĩa (`server/data`), nên phải chạy ở nơi giữ được ổ đĩa như VPS, Railway hoặc Fly.io. Vercel không giữ file, không chạy backend này được.

1. **Backend:** chạy `node server/index.js` trên VPS (xem mục bên dưới).
2. **Website:** trên Vercel tạo dự án với Root Directory `client`. Mở `client/vercel.json`, thay `DIA-CHI-BACKEND` bằng tên miền backend.
3. **Admin:** trên Vercel tạo dự án thứ hai với Root Directory `admin`. Sửa `admin/vercel.json` tương tự. Có thể đặt biến `VITE_SITE_URL` là địa chỉ website để nút "Xem website" trỏ đúng.

`vercel.json` chuyển tiếp `/api/*` và `/uploads/*` sang backend, nên hai giao diện vẫn gọi đường dẫn tương đối và không cần cấu hình CORS.

Nếu không dùng Vercel, chạy `npm run build` rồi chép `client/dist` và `admin/dist` lên bất kỳ máy chủ web nào, nhớ chuyển tiếp `/api` và `/uploads` về backend.

## Giao diện website (template)

Website có 5 giao diện khác hẳn nhau về bố cục, màu và kiểu chữ. Nội dung (ảnh, phim, dịch vụ, quy trình, liên hệ) dùng chung nên đổi giao diện không mất gì.

| Giao diện | Phong cách |
| --- | --- |
| Cổ điển điện ảnh | Đỏ rượu vang, ảnh polaroid xếp chồng, con dấu chữ Hỷ |
| Tạp chí Ivory | Nền ngà, chữ serif rất lớn, đường kẻ mảnh, lưới ảnh so le như tạp chí |
| Vườn hoa lãng mạn | Hồng phấn và xanh lá nhạt, khung vòm, hoa lá vẽ tay, chữ viết tay |
| Điện ảnh Noir | Nền đen, vàng ánh kim, chương phim, dải ảnh cuộn ngang, phụ đề |
| Hỷ truyền thống | Đỏ và vàng như thiệp cưới, đèn lồng, chữ Hỷ; có biến thể nền kem hoặc nền đỏ |

Trong admin, mục **Giao diện**: chọn giao diện, chỉnh màu nhấn, kiểu hiển thị, bật tắt chuyển động, bấm **Xem thử** (hiện cả chỉnh sửa chưa lưu) rồi **Áp dụng**.

Quản trị viên phân cho mỗi hội viên một giao diện ở mục **Tài khoản**; hội viên chỉ dùng và làm việc trên giao diện đó.

Thêm giao diện mới: tạo `client/src/templates/<id>/` (xem `client/src/templates/README.md`), đăng ký trong `client/src/templates/index.ts` và khai báo trong `server/templates.js`.

## Tài khoản và phân quyền

Có 2 vai trò:

| Vai trò | Quyền |
| --- | --- |
| Quản trị viên | Tất cả: quản lý tài khoản, mở/đóng đăng ký, dùng mọi giao diện, sửa mọi nội dung |
| Hội viên | Được phân **đúng một giao diện** và chỉ dùng, làm việc trên giao diện đó. Chưa được phân giao diện thì chỉ xem |

Quy tắc của hội viên:
- Chỉ thấy và chỉnh (màu, kiểu hiển thị) giao diện được phân cho mình, không thấy hay đổi sang giao diện khác.
- Chỉ sửa nội dung website (ảnh, phim, dịch vụ, quy trình, liên hệ...) khi website **đang chạy đúng giao diện của mình**. Nếu đang chạy giao diện khác, hội viên vào mục Giao diện bấm **Áp dụng** để chuyển sang giao diện của mình rồi mới sửa được. Admin đổi lại giao diện thì hội viên lại phải áp dụng lại.
- Xử lý liên hệ khách thì làm được ngay khi đã có giao diện.
- Không vào được mục Tài khoản, không đổi được việc mở/đóng đăng ký.

Website chỉ có một giao diện đang chạy chung. Nếu có nhiều hội viên được phân giao diện khác nhau, người áp dụng sau cùng sẽ quyết định giao diện website lúc đó.

- Đăng nhập bằng tên đăng nhập hoặc email và mật khẩu, hoặc bằng Google (đặt `GOOGLE_CLIENT_ID`).
- Đăng ký tự do mặc định **tắt**. Khi bật (mục Tài khoản), người đăng ký hoặc đăng nhập Google lần đầu là hội viên **Chờ duyệt**, chưa có giao diện, đến khi quản trị viên duyệt và phân giao diện.
- Muốn một người dùng Google đăng nhập được ngay: tạo tài khoản cho họ với đúng email Gmail đó.
- Đổi vai trò, khoá hoặc đặt lại mật khẩu sẽ buộc người đó đăng nhập lại.
- Luôn còn ít nhất một quản trị viên đang hoạt động. Tài khoản cũ vai trò "biên tập viên" hay "chỉ xem" tự chuyển thành hội viên khi khởi động lại (biên tập viên giữ giao diện đầu tiên được cấp, chỉ xem thành hội viên chưa có giao diện).

### Thiết lập đăng nhập Google

1. Vào Google Cloud Console, tạo OAuth Client ID loại Web application.
2. Thêm địa chỉ trang quản trị vào Authorized JavaScript origins (ví dụ `http://localhost:5174` và `https://admin.ten-mien.vn`).
3. Điền `GOOGLE_CLIENT_ID` vào `.env`, khởi động lại backend. Nút Google tự hiện ở màn đăng nhập.

## Sửa toàn bộ chữ trên website

Vào admin, mục **Chữ trên website**. Mọi chữ cố định (menu, nút bấm, tiêu đề từng mục, biểu mẫu khách điền, lời cảm ơn sau khi gửi, nút liên hệ góc phải, chân trang) đều sửa được, gồm hơn 100 mục chia nhóm và có ô tìm kiếm.

- Ô để trống thì dùng chữ mặc định của giao diện đang chọn (hiện mờ trong ô). Nút **Chữ gốc** khôi phục từng mục.
- Chữ giữa hai dấu sao, ví dụ `Những khoảnh khắc *không ai dặn trước*`, được in nghiêng và tô màu nhấn trong tiêu đề.
- `{n}` được thay bằng một con số (ví dụ `{n} ảnh`).
- Quản trị viên chọn giao diện nào để sửa chữ. Hội viên chỉ thấy các mục của giao diện được phân cho mình, và chỉ lưu được khi website đang chạy giao diện đó (giống các nội dung khác).
- Tên thương hiệu mặc định là **Wedding Film**, đổi ở mục *Nội dung website*.
- Chữ lưu trong `settings.texts` của `db.json`; danh mục mã chữ nằm ở `server/texts.js`. Thêm một mục chữ mới chỉ cần thêm một dòng ở đó rồi gọi `t('ma.chu')` trong giao diện.

## Email báo khi khách gửi thông tin

Sau khi điền `SMTP_USER`, `SMTP_PASS` và khởi động lại backend, vào admin, mục **Tổng quan**, bấm **Gửi email thử**. Nếu lỗi, lý do hiện ngay; lý do của từng khách cũng hiện ở mục **Liên hệ khách**. Gmail chỉ nhận **Mật khẩu ứng dụng** (16 ký tự, cần bật xác minh 2 bước), không nhận mật khẩu đăng nhập thường.

Khi khách gửi biểu mẫu, thông tin được lưu trước, rồi backend gửi email tới **email ở mục Liên hệ & mạng xã hội** (hoặc `NOTIFY_EMAIL` nếu đặt). Gửi lỗi không làm mất thông tin khách; trạng thái gửi hiện ở mục Liên hệ khách.

1. Bật xác minh 2 bước cho tài khoản Gmail dùng để gửi.
2. Tạo Mật khẩu ứng dụng tại https://myaccount.google.com/apppasswords.
3. Điền `SMTP_USER` (địa chỉ Gmail) và `SMTP_PASS` (mật khẩu ứng dụng) vào `.env`, khởi động lại backend.

Tổng quan trong admin cảnh báo nếu chưa cấu hình.

## Trang chủ có gì

- Nội dung: giới thiệu, thư viện ảnh lọc theo nhóm (Lễ ăn hỏi, Đại lễ, Tiệc đón khách, **sửa được trong admin**), phim YouTube, dịch vụ ba lễ (không hiện giá), **quy trình làm việc (sửa được trong admin)**, lời cảm ơn khách (tự ẩn khi chưa có)
- Biểu mẫu nhận tư vấn có ô bẫy bot, giới hạn số lần gửi và thông báo toast
- **Nút Gọi, Zalo, Messenger luôn cố định ở góc phải dưới màn hình**
- Tự tắt hiệu ứng nếu người dùng bật "giảm chuyển động"

## Trang quản trị (thư mục `admin`)

| Mục | Làm được gì |
| --- | --- |
| Tổng quan | Số liệu nhanh, liên hệ mới, cảnh báo mật khẩu mặc định và email chưa cấu hình |
| Liên hệ khách | Xem thông tin khách, trạng thái email báo, đổi trạng thái, sao chép số, xóa |
| Ảnh | Tải nhiều ảnh (tự thu nhỏ), **quản lý nhóm ảnh** (thêm, đổi tên, sắp xếp), sửa, nổi bật, sắp xếp, xóa |
| Video | Dán link YouTube, xem trước ảnh bìa |
| Dịch vụ | Sửa ba lễ chính |
| Quy trình | Thêm, sửa, sắp xếp các bước làm việc |
| Cảm nhận khách | Thêm lời cảm ơn thật của khách |
| Giao diện | Chọn và tuỳ chỉnh giao diện website (theo quyền) |
| Liên hệ & mạng xã hội | Số điện thoại, Zalo, Messenger, Facebook, email nhận thông báo, địa chỉ |
| Nội dung website | Logo, câu chào, giới thiệu, con số nổi bật, **địa chỉ website** (cho nút "Xem website") |
| Tài khoản | (quản trị viên) duyệt, đổi vai trò, phân giao diện cho hội viên, đặt lại mật khẩu, mở/đóng đăng ký |
| Tài khoản của tôi | Tên hiển thị, đổi mật khẩu |

Nút **Xem website** mở website khách theo địa chỉ ở mục Nội dung website (hoặc biến `VITE_SITE_URL`); khi chạy dev tự mở cổng 5173.

## Việc cần làm sau khi nhận dự án

1. Điền `.env` (mật khẩu quản trị, Gmail, Google nếu dùng) rồi đăng nhập, **đổi mật khẩu mặc định**.
2. Vào **Liên hệ & mạng xã hội**, nhập số điện thoại, Zalo, email thật và địa chỉ. Ở ô Link Messenger, nhập dạng `https://m.me/ten-trang`.
3. Vào **Nội dung website**, nhập địa chỉ website thật.
4. Vào **Ảnh**, tải ảnh thật lên rồi xóa các thẻ "Ảnh mẫu"; chỉnh nhóm ảnh nếu muốn.
5. Vào **Video**, **Dịch vụ**, **Quy trình**, chỉnh theo cách bạn làm việc.
6. Vào **Giao diện** chọn giao diện bạn thích.

Dự án không tự điền số liệu hay đánh giá khách. Phần con số nổi bật và cảm nhận khách để trống cho đến khi bạn nhập nội dung thật.

## Biến môi trường của backend (không bắt buộc)

| Biến | Ý nghĩa | Mặc định |
| --- | --- | --- |
| `PORT` | Cổng máy chủ | `3001` |
| `ADMIN_PASSWORD`, `ADMIN_EMAIL` | Mật khẩu và email của tài khoản quản trị đầu tiên (tên đăng nhập `admin`) | `hima2026` |
| `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`, `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT` | Email báo khách mới (Gmail, mật khẩu ứng dụng) | tắt |
| `GOOGLE_CLIENT_ID` | Bật đăng nhập Google | tắt |
| `TOKEN_SECRET` | Khóa ký phiên đăng nhập | tự sinh và lưu trong `server/data/secret.key` |
| `DATA_DIR` | Thư mục lưu dữ liệu và ảnh tải lên | `server/data` |
| `TRUST_PROXY` | Đặt `1` khi chạy sau nginx để lấy đúng IP khách | tắt |

## Chạy backend trên VPS

1. Cài Node.js 18.17 trở lên (khuyên dùng Node 22), chép mã nguồn lên, chạy `npm install`.
2. Chạy bằng pm2: `pm2 start server/index.js --name hima-api`, với file `server/.env` (xem `.env.example`) và `TRUST_PROXY=1`.
3. Đặt nginx phía trước và bật HTTPS bằng certbot:

```nginx
server {
  server_name api.ten-mien-cua-ban.vn;
  client_max_body_size 20m;
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

4. **Sao lưu:** chép thư mục `server/data` (chứa `db.json`, ảnh trong `uploads/` và mật khẩu đã đổi).

## Cấu trúc

```
server/
  index.js        API, phục vụ ảnh tải lên
  db.js           dữ liệu mẫu, kiểm tra dữ liệu nhập, đọc ghi db.json
  auth.js         tài khoản, vai trò, mật khẩu (scrypt), Google, phiên đăng nhập ký HMAC
  mailer.js       gửi email SMTP (Gmail)
  templates.js    danh sách giao diện và tuỳ chỉnh cho phép
  env.js          đọc file .env
client/src/
  pages/Home.tsx  ghép các phần của trang chủ
  components/     Hero, About, Gallery, Films, Packages, Contact, FloatingChat...
  templates/      5 giao diện (classic, editorial, garden, noir, hy), mỗi giao diện một thư mục
  index.css       bảng màu, chữ và hiệu ứng (Tailwind 4 @theme)
admin/src/
  AdminApp.tsx    khung và các tab quản trị
  Templates, Accounts, PhotosAdmin, CollectionEditor, SettingsAdmin, Inquiries, Dashboard, Login...
```

## Giới hạn cần biết

- Dữ liệu lưu trong file JSON, phù hợp website giới thiệu có vài trăm ảnh. Nếu sau này cần nhiều quản trị viên hoặc lượng dữ liệu lớn, nên chuyển sang SQLite hoặc PostgreSQL.
- Ảnh được thu nhỏ ở trình duyệt trước khi tải lên. Máy chủ chưa tạo nhiều kích cỡ ảnh riêng cho từng màn hình.
- Email báo dùng SMTP tự viết gọn cho Gmail; nếu cần nhà cung cấp khác, hãy kiểm tra `SMTP_HOST`/`SMTP_PORT`.
- Chưa chạy thử với dịch vụ Google và Gmail thật trong môi trường dựng dự án; hãy thử một lần sau khi điền `.env`.
