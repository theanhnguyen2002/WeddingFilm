// Danh sách giao diện (template) của website. Phần vẽ giao diện nằm ở client/src/templates/<id>.
// Máy chủ giữ thông tin mô tả và các tuỳ chỉnh được phép, để trang quản trị và website cùng dùng một nguồn.

const motion = { key: 'motion', label: 'Hiệu ứng chuyển động', type: 'toggle', default: true };
const accent = (def) => ({ key: 'accent', label: 'Màu nhấn chính', type: 'color', default: def });

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Cổ điển điện ảnh',
    tagline: 'Đỏ rượu vang, ảnh polaroid xếp chồng',
    description: 'Đầu trang toàn màn hình với ảnh chuyển dần, ảnh polaroid nổi và con dấu chữ Hỷ. Nền xám lạnh, chữ serif thanh mảnh.',
    swatches: ['#0d1116', '#7b2437', '#ebb7c1', '#c9a56a'],
    options: [
      accent('#7b2437'),
      { key: 'variant', label: 'Kiểu đầu trang', type: 'select', default: 'collage',
        choices: [{ value: 'collage', label: 'Ảnh polaroid xếp chồng' }, { value: 'full', label: 'Ảnh toàn màn hình' }] },
      motion,
    ],
  },
  {
    id: 'editorial',
    name: 'Tạp chí Ivory',
    tagline: 'Trang bìa tạp chí, nền ngà, chữ lớn',
    description: 'Phong cách tạp chí thời trang cưới: nền ngà, chữ serif rất lớn, đường kẻ mảnh, bố cục lệch và đánh số mục.',
    swatches: ['#f5f0e6', '#1b1b1b', '#a3472f', '#d9cfba'],
    options: [
      accent('#a3472f'),
      { key: 'variant', label: 'Kiểu thư viện ảnh', type: 'select', default: 'masonry',
        choices: [{ value: 'masonry', label: 'Lưới so le như tạp chí' }, { value: 'strip', label: 'Từng ảnh lớn nối tiếp' }] },
      motion,
    ],
  },
  {
    id: 'garden',
    name: 'Vườn hoa lãng mạn',
    tagline: 'Hồng phấn, xanh lá nhạt, khung vòm',
    description: 'Dịu dàng và bay bổng: nền hồng phấn, hoa lá vẽ tay, ảnh trong khung vòm, chữ viết tay và bố cục căn giữa.',
    swatches: ['#fbf1ee', '#c97b84', '#8da58a', '#f2d7d5'],
    options: [
      accent('#c97b84'),
      { key: 'variant', label: 'Hình khung ảnh', type: 'select', default: 'arch',
        choices: [{ value: 'arch', label: 'Khung vòm' }, { value: 'oval', label: 'Khung oval' }] },
      motion,
    ],
  },
  {
    id: 'noir',
    name: 'Điện ảnh Noir',
    tagline: 'Nền đen, vàng ánh kim, khung phim rộng',
    description: 'Dành cho thương hiệu thiên về phim: nền đen tuyền, viền khung phim rộng, chữ in hoa gọn, phim nổi bật ngay đầu trang.',
    swatches: ['#08080a', '#d4af37', '#f3ead3', '#3a3a40'],
    options: [
      accent('#d4af37'),
      { key: 'variant', label: 'Đầu trang', type: 'select', default: 'video',
        choices: [{ value: 'video', label: 'Phim nổi bật' }, { value: 'photo', label: 'Ảnh nổi bật' }] },
      motion,
    ],
  },
  {
    id: 'hy',
    name: 'Hỷ truyền thống',
    tagline: 'Đỏ và vàng, như tấm thiệp cưới Việt',
    description: 'Màu đỏ son và vàng đồng, hoạ tiết chữ Hỷ, viền hoa văn và bố cục trang trọng như một tấm thiệp cưới truyền thống.',
    swatches: ['#8e1b1b', '#e8c36a', '#fff6e3', '#5c0f0f'],
    options: [
      accent('#8e1b1b'),
      { key: 'variant', label: 'Phong cách nền', type: 'select', default: 'gold',
        choices: [{ value: 'gold', label: 'Nền kem, viền vàng' }, { value: 'red', label: 'Nền đỏ đậm' }] },
      motion,
    ],
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
export const DEFAULT_TEMPLATE = 'classic';

const HEX = /^#[0-9a-f]{6}$/i;

/** Giữ lại đúng các tuỳ chỉnh mà từng giao diện khai báo, giá trị sai thì dùng mặc định. */
export function sanitizeTemplateOptions(input) {
  const src = input && typeof input === 'object' ? input : {};
  const out = {};
  for (const t of TEMPLATES) {
    const given = src[t.id] && typeof src[t.id] === 'object' ? src[t.id] : {};
    const o = {};
    for (const opt of t.options) {
      const v = given[opt.key];
      if (opt.type === 'color') o[opt.key] = typeof v === 'string' && HEX.test(v) ? v.toLowerCase() : opt.default;
      else if (opt.type === 'toggle') o[opt.key] = typeof v === 'boolean' ? v : v === 'true' ? true : v === 'false' ? false : opt.default;
      else o[opt.key] = opt.choices.some((c) => c.value === v) ? v : opt.default;
    }
    out[t.id] = o;
  }
  return out;
}
