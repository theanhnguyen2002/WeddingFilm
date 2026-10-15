// Danh mục chữ trên website. Mỗi mục có một mã (key) và chữ mặc định, có thể khác nhau theo giao diện.
// Quản trị viên và hội viên sửa chữ trong trang quản trị; chữ đã sửa lưu ở settings.texts và dùng cho mọi giao diện có mã đó.
// Cú pháp: *chữ* được in nghiêng và tô màu nhấn ở các tiêu đề. {n} được thay bằng một con số.

const ALL = ['classic', 'editorial', 'garden', 'noir', 'hy'];

/** t(group, key, label, def, opts): def là chữ mặc định chung, opts.by là chữ riêng theo giao diện, opts.only giới hạn giao diện dùng mục này. */
const list = [];
const add = (group, key, label, def, opts = {}) => list.push({ group, key, label, def, by: opts.by || {}, only: opts.only || ALL, long: Boolean(opts.long) });

/* ---- Menu và nút ---- */
const G1 = 'Menu và nút bấm';
add(G1, 'nav.about', 'Menu: Giới thiệu', 'Giới thiệu');
add(G1, 'nav.photos', 'Menu: Ảnh', 'Ảnh');
add(G1, 'nav.films', 'Menu: Phim', 'Phim');
add(G1, 'nav.services', 'Menu: Dịch vụ', 'Dịch vụ');
add(G1, 'nav.process', 'Menu: Quy trình', 'Quy trình', { only: ['garden'] });
add(G1, 'nav.contact', 'Menu: Liên hệ', 'Liên hệ');
add(G1, 'cta.quote', 'Nút: Nhận báo giá', 'Nhận báo giá', { only: ['classic', 'editorial'] });
add(G1, 'cta.consult', 'Nút: Nhận tư vấn', 'Nhận tư vấn', { only: ['editorial', 'garden', 'noir', 'hy'] });
add(G1, 'cta.viewPhotos', 'Nút: Xem ảnh cưới', 'Xem ảnh cưới', { only: ['garden', 'noir', 'hy'] });
add(G1, 'cta.viewFilms', 'Nút: Xem phim', 'Xem phim', { only: ['classic'] });
add(G1, 'cta.scroll', 'Gợi ý cuộn trang', 'Cuộn', { only: ['classic'] });
add(G1, 'cta.morePhotos', 'Nút: Xem thêm ảnh', 'Xem thêm ảnh', { only: ['classic', 'garden', 'hy'] });
add(G1, 'cta.channel', 'Nút: Xem kênh YouTube', 'Xem thêm trên kênh YouTube', { by: { garden: 'Xem thêm trên YouTube', noir: 'Kênh YouTube', hy: 'Xem thêm trên YouTube' } });
add(G1, 'cta.toTop', 'Nút: Về đầu trang', 'Về đầu trang');
add(G1, 'nr.menu', 'Nút mở menu (điện thoại)', 'Menu', { only: ['noir'] });
add(G1, 'nr.close', 'Nút đóng menu (điện thoại)', 'Đóng', { only: ['noir'] });

/* ---- Giới thiệu ---- */
const G2 = 'Giới thiệu';
add(G2, 'about.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Về chúng mình', { only: ['classic', 'editorial', 'hy'], by: { editorial: 'Giới thiệu', hy: 'Trăm năm hạnh phúc' } });
add(G2, 'about.stamp', 'Chữ dọc cạnh ảnh', 'Kể chuyện thật', { only: ['classic'] });

/* ---- Ảnh ---- */
const G3 = 'Thư viện ảnh';
add(G3, 'gallery.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Ảnh phóng sự', { only: ['classic', 'garden', 'hy'], by: { garden: 'Khoảnh khắc yêu thương', hy: 'Khoảnh khắc đáng nhớ' } });
add(G3, 'gallery.title', 'Tiêu đề', 'Những khoảnh khắc *không ai dặn trước*', { by: { editorial: 'Những khung hình *được giữ lại*', garden: 'Album ngày cưới', noir: 'Cuốn phim ảnh', hy: 'Album ngày vui' } });
add(G3, 'gallery.sub', 'Dòng mô tả dưới tiêu đề', 'Kéo ngang để xem từng khung hình.', { only: ['noir'] });
add(G3, 'gallery.empty', 'Khi nhóm ảnh chưa có ảnh', 'Chưa có ảnh trong nhóm này.', { only: ['classic'] });
add(G3, 'ed.gallery.label', 'Nhãn mục', 'Thư viện ảnh', { only: ['editorial'] });
add(G3, 'ed.photoCount', 'Số ảnh ({n})', '{n} ảnh', { only: ['editorial'] });

/* ---- Phim ---- */
const G4 = 'Phim';
add(G4, 'films.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Phim phóng sự', { only: ['classic', 'garden', 'hy'], by: { garden: 'Những thước phim', hy: 'Phim cưới' } });
add(G4, 'films.title', 'Tiêu đề', 'Xem lại ngày cưới *như đang ở đó*', { by: { garden: 'Xem lại ngày cưới như đang ở đó', noir: 'Phòng chiếu', hy: 'Ngày vui được kể lại' } });
add(G4, 'films.intro', 'Dòng mô tả dưới tiêu đề', 'Mỗi phim được dựng từ chính những gì đã xảy ra trong ngày, giữ cả tiếng nói và tiếng cười.', { only: ['classic', 'noir'], long: true, by: { noir: 'Những thước phim cưới đã được kể lại.' } });
add(G4, 'films.sample', 'Nhãn video mẫu', 'Video mẫu');
add(G4, 'ed.films.label', 'Nhãn mục', 'Phim phóng sự', { only: ['editorial'] });
add(G4, 'ed.filmCount', 'Số phim ({n})', '{n} phim', { only: ['editorial'] });
add(G4, 'ed.filmIndex', 'Tiêu đề danh sách phim', 'Mục lục phim', { only: ['editorial'] });

/* ---- Dịch vụ ---- */
const G5 = 'Dịch vụ';
add(G5, 'services.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Dịch vụ', { only: ['classic', 'editorial', 'garden', 'hy'], by: { garden: 'Dịch vụ của chúng mình' } });
add(G5, 'services.title', 'Tiêu đề', 'Chụp và quay trọn vẹn *cả ba lễ*', { by: { editorial: 'Từng buổi lễ, *một chương riêng*', garden: 'Đồng hành cùng ba buổi lễ', noir: 'Ba buổi lễ, ba cuốn phim', hy: 'Ba buổi lễ trọn vẹn' } });
add(G5, 'services.intro', 'Dòng mô tả dưới tiêu đề', 'Một đám cưới thường gồm ba lễ chính. Chúng mình nhận chụp ảnh và quay phim cho từng lễ hoặc trọn bộ, dù bạn tổ chức trong một hay hai ngày.', { only: ['classic'], long: true });
add(G5, 'services.badge', 'Nhãn mặc định của gói nổi bật', 'Nổi bật', { only: ['classic', 'garden', 'noir', 'hy'] });
add(G5, 'services.photoTag', 'Nhãn: chụp ảnh', 'Chụp ảnh', { only: ['classic'] });
add(G5, 'services.filmTag', 'Nhãn: quay phim', 'Quay phim', { only: ['classic'] });
add(G5, 'services.cta', 'Nút trong mỗi gói', 'Nhận tư vấn và báo giá', { only: ['classic'] });
add(G5, 'services.note', 'Ghi chú dưới các gói', 'Báo giá theo lịch trình, quy mô và địa điểm của bạn. Với nơi tổ chức ở xa, phí di chuyển tính theo số km và được báo rõ khi tư vấn.', { only: ['classic'], long: true });
add(G5, 'ed.services.aside', 'Chữ phụ bên phải mục', 'Mục lục', { only: ['editorial'] });

/* ---- Quy trình ---- */
const G6 = 'Quy trình';
add(G6, 'process.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Quy trình', { only: ['classic', 'editorial', 'garden', 'hy'], by: { garden: 'Hành trình cùng nhau', hy: 'Các bước thực hiện' } });
add(G6, 'process.title', 'Tiêu đề', 'Từ lời chào đầu tiên *đến cuốn phim cuối cùng*', { by: { editorial: 'Từ lời chào đầu tiên *đến cuốn album*', garden: 'Từ lời chào đến cuốn phim cuối cùng', noir: 'Quy trình sản xuất', hy: 'Từ lời hẹn đến cuốn phim' } });
add(G6, 'ed.stepCount', 'Số bước ({n})', '{n} bước', { only: ['editorial'] });

/* ---- Cảm nhận ---- */
const G7 = 'Cảm nhận của khách';
add(G7, 'quotes.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Lời của các cặp đôi', { only: ['classic', 'garden', 'hy'], by: { garden: 'Lời yêu thương', hy: 'Lời chúc phúc' } });
add(G7, 'quotes.title', 'Tiêu đề', 'Họ nói gì *sau ngày cưới*', { only: ['classic', 'garden', 'noir', 'hy'], by: { garden: 'Các cặp đôi nói về chúng mình', noir: 'Lời khen từ khán giả', hy: 'Các cặp đôi nói về chúng mình' } });
add(G7, 'ed.quotes.label', 'Nhãn mục', 'Thư gửi', { only: ['editorial'] });
add(G7, 'ed.quotes.aside', 'Chữ phụ bên phải mục', 'Từ các cặp đôi', { only: ['editorial'] });

/* ---- Liên hệ ---- */
const G8 = 'Liên hệ';
add(G8, 'contact.eyebrow', 'Chữ nhỏ trên tiêu đề', 'Liên hệ', { only: ['classic', 'editorial', 'garden', 'hy'], by: { garden: 'Gửi thư cho chúng mình', hy: 'Thiệp mời' } });
add(G8, 'contact.title', 'Tiêu đề', 'Kể cho chúng mình nghe về *ngày cưới của bạn*', { by: { garden: 'Kể về ngày cưới của bạn', noir: 'Đặt lịch quay', hy: 'Gửi lời hẹn cho chúng mình' } });
add(G8, 'contact.sub', 'Dòng mô tả dưới tiêu đề', 'Gửi thông tin, chúng mình liên hệ lại trong ngày.', { only: ['noir'] });
add(G8, 'details.phone', 'Nhãn: Điện thoại', 'Điện thoại');
add(G8, 'details.zalo', 'Nhãn: Zalo', 'Zalo');
add(G8, 'details.email', 'Nhãn: Email', 'Email');
add(G8, 'details.address', 'Nhãn: Địa chỉ', 'Địa chỉ');
add(G8, 'details.directions', 'Liên kết: Chỉ đường', 'Chỉ đường');
add(G8, 'details.hours', 'Nhãn: Giờ làm việc', 'Giờ làm việc');
add(G8, 'fb.label', 'Thẻ Facebook: nhãn nhỏ', 'Fanpage Facebook');
add(G8, 'fb.hint', 'Thẻ Facebook: lời mời', 'Xem ảnh, phim và bấm Theo dõi');
add(G8, 'ed.follow', 'Nhãn trên thẻ Facebook', 'Theo dõi chúng mình', { only: ['editorial'] });
add(G8, 'ed.formLabel', 'Nhãn trên biểu mẫu', 'Biểu mẫu nhận báo giá', { only: ['editorial'] });
add(G8, 'ed.contact.aside', 'Chữ phụ bên phải mục', 'Thư toà soạn', { only: ['editorial'] });

/* ---- Biểu mẫu ---- */
const G9 = 'Biểu mẫu khách điền';
add(G9, 'form.name', 'Ô tên: nhãn', 'Tên của bạn');
add(G9, 'form.namePh', 'Ô tên: gợi ý', 'Tên cô dâu hoặc chú rể');
add(G9, 'form.phone', 'Ô điện thoại: nhãn', 'Số điện thoại');
add(G9, 'form.duration', 'Số ngày cưới: nhãn', 'Đám cưới của bạn kéo dài');
add(G9, 'form.days', 'Số ngày: chữ ({n} là 1 hoặc 2)', '{n} ngày');
add(G9, 'form.hint2', 'Gợi ý khi chọn 2 ngày', 'Thường là ngày lễ nhà gái và ngày lễ nhà trai, hoặc lễ và tiệc.', { long: true });
add(G9, 'form.hint1', 'Gợi ý khi chọn 1 ngày', 'Chọn 1 ngày nếu lễ và tiệc diễn ra cùng ngày.', { long: true });
add(G9, 'form.date1', 'Ngày thứ nhất (khi 2 ngày)', 'Ngày thứ nhất');
add(G9, 'form.dateSingle', 'Ngày cưới (khi 1 ngày)', 'Ngày cưới dự kiến');
add(G9, 'form.date2', 'Ngày thứ hai', 'Ngày thứ hai');
add(G9, 'form.venue', 'Địa điểm: nhãn', 'Địa điểm');
add(G9, 'form.venuePh', 'Địa điểm: gợi ý', 'Thành phố hoặc nhà hàng (nếu hai ngày khác nơi, ghi cả hai)');
add(G9, 'form.package', 'Chọn lễ: nhãn', 'Bạn cần chụp, quay lễ nào');
add(G9, 'form.packageNone', 'Chọn lễ: lựa chọn đầu', 'Chưa chọn, cần tư vấn');
add(G9, 'form.packageAll', 'Chọn lễ: cả ba lễ', 'Cả ba lễ');
add(G9, 'form.message', 'Lời nhắn: nhãn', 'Lời nhắn');
add(G9, 'form.messagePh', 'Lời nhắn: gợi ý', 'Bạn muốn ghi lại điều gì nhất trong ngày cưới?');
add(G9, 'form.send', 'Nút gửi', 'Gửi thông tin');
add(G9, 'form.sending', 'Nút gửi khi đang gửi', 'Đang gửi...');
add(G9, 'form.thanksTitle', 'Sau khi gửi: tiêu đề', 'Cảm ơn bạn');
add(G9, 'form.thanksText', 'Sau khi gửi: lời nhắn', 'Chúng mình đã nhận thông tin và sẽ liên hệ lại với bạn sớm qua số điện thoại bạn để lại.', { long: true });
add(G9, 'form.toastOk', 'Thông báo gửi thành công', 'Đã gửi thông tin. Chúng mình sẽ liên hệ với bạn sớm nhé.', { long: true });
add(G9, 'form.error', 'Thông báo khi gửi lỗi', 'Có lỗi xảy ra, vui lòng thử lại.');

/* ---- Nút liên hệ nhanh ---- */
const G10 = 'Nút liên hệ góc phải dưới';
add(G10, 'chat.call', 'Nút gọi điện', 'Gọi điện');
add(G10, 'chat.zalo', 'Nút Zalo', 'Nhắn Zalo');
add(G10, 'chat.messenger', 'Nút Messenger', 'Nhắn Messenger');

/* ---- Chân trang ---- */
const G11 = 'Chân trang';
add(G11, 'footer.about', 'Giới thiệu ngắn', 'Phóng sự cưới bằng ảnh và phim. Chụp và quay trọn vẹn từ lễ ăn hỏi, đại lễ đến tiệc đón khách.', { only: ['classic'], long: true });
add(G11, 'footer.follow', 'Nút theo dõi Facebook', 'Theo dõi trên Facebook', { only: ['classic'] });
add(G11, 'footer.explore', 'Tiêu đề cột menu', 'Khám phá', { only: ['classic'] });
add(G11, 'footer.contact', 'Tiêu đề cột liên hệ', 'Liên hệ', { only: ['classic'] });
add(G11, 'footer.rights', 'Bản quyền (sau tên và năm)', 'Giữ mọi quyền.', { only: ['classic'] });
add(G11, 'footer.line', 'Câu ở chân trang', 'Yêu thương được giữ lại', { only: ['garden', 'hy'], by: { hy: 'Trăm năm hạnh phúc' } });
add(G11, 'nr.credit', 'Dòng trên logo chân trang', 'Đạo diễn hình ảnh', { only: ['noir'] });
add(G11, 'nr.end', 'Dòng cuối trang', 'Hết phim', { only: ['noir'] });
add(G11, 'ed.footer.toc', 'Tiêu đề cột menu', 'Mục lục', { only: ['editorial'] });
add(G11, 'ed.footer.contact', 'Tiêu đề cột liên hệ', 'Liên hệ', { only: ['editorial'] });
add(G11, 'ed.footer.follow', 'Tiêu đề cột mạng xã hội', 'Theo dõi', { only: ['editorial'] });
add(G11, 'ed.footer.last', 'Tiêu đề ô cuối', 'Lời cuối', { only: ['editorial'] });

/* ---- Riêng giao diện Tạp chí ---- */
const G12 = 'Riêng giao diện Tạp chí';
add(G12, 'ed.mast', 'Dòng trên cùng khi chưa có địa chỉ', 'Phóng sự cưới', { only: ['editorial'] });
add(G12, 'ed.inIssue', 'Danh sách từ khoá trên trang bìa', 'Trong số này', { only: ['editorial'] });
add(G12, 'ed.vertical', 'Chữ dọc trên trang bìa', 'Phóng sự ảnh và phim cưới', { only: ['editorial'] });

/* ---- Riêng giao diện Điện ảnh ---- */
add('Riêng giao diện Điện ảnh', 'nr.chapter', 'Chữ "Chương" trước số mục', 'Chương', { only: ['noir'] });

export const TEXT_DEFS = list;

/** Chữ mặc định của một mã theo giao diện. */
export const defaultText = (def, template) => def.by[template] ?? def.def;

const KEYS = new Set(list.map((d) => d.key));

/** Chỉ giữ mã có trong danh mục, giá trị là chuỗi tối đa 600 ký tự. Chuỗi rỗng nghĩa là dùng lại chữ mặc định. */
export function sanitizeTexts(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const [k, v] of Object.entries(input)) {
    if (!KEYS.has(k) || typeof v !== 'string') continue;
    const s = v.replace(/\r/g, '').slice(0, 600);
    if (s.trim()) out[k] = s;
  }
  return out;
}
