// Lưu dữ liệu vào một file JSON. Đủ dùng cho website giới thiệu thương hiệu (vài trăm ảnh, vài chục video).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import './env.js';
import { sanitizeTexts } from './texts.js';
import { DEFAULT_TEMPLATE, TEMPLATE_IDS, sanitizeTemplateOptions } from './templates.js';
import { MongoClient } from 'mongodb';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

/* ---------- Làm sạch dữ liệu nhập vào ---------- */
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bool = (v) => v === true || v === 'true';
const int = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};
const list = (v, maxItems = 12, max = 200) =>
  Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, maxItems) : [];
const url = (v) => {
  const s = str(v, 500);
  return s === '' || /^https?:\/\//i.test(s) ? s : '';
};
const imgSrc = (v) => {
  const s = str(v, 500);
  return s === '' || /^\/uploads\/[\w.-]+$/.test(s) || /^https:\/\//i.test(s) ? s : '';
};

export function youtubeId(v) {
  const s = str(v, 300);
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id = '';
    if (host === 'youtu.be') id = u.pathname.split('/')[1] || '';
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      id = u.searchParams.get('v') || '';
      if (!id) {
        const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
        id = m ? m[1] : '';
      }
    }
    return /^[\w-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

export const DEFAULT_CATEGORIES = ['Lễ ăn hỏi', 'Đại lễ', 'Tiệc đón khách'];

const SCHEMAS = {
  photos: (b) => ({
    title: str(b.title, 120),
    category: str(b.category, 60) || DEFAULT_CATEGORIES[1],
    src: imgSrc(b.src),
    w: int(b.w, 1, 20000, 1200),
    h: int(b.h, 1, 20000, 800),
    seed: int(b.seed, 0, 1000, 0),
    featured: bool(b.featured),
  }),
  videos: (b) => ({
    title: str(b.title, 140),
    place: str(b.place, 140),
    youtubeId: youtubeId(b.youtubeId),
    featured: bool(b.featured),
  }),
  packages: (b) => ({
    name: str(b.name, 80),
    badge: str(b.badge, 40),
    tagline: str(b.tagline, 160),
    features: list(b.features, 12, 160),
    highlight: bool(b.highlight),
  }),
  process: (b) => ({
    title: str(b.title, 80),
    text: str(b.text, 300),
  }),
  testimonials: (b) => ({
    names: str(b.names, 100),
    place: str(b.place, 100),
    text: str(b.text, 800),
  }),
};
export const COLLECTIONS = Object.keys(SCHEMAS);

export function sanitizeSettings(b) {
  const pairs = (v, a, c, max) =>
    Array.isArray(v)
      ? v.map((x) => ({ [a]: str(x?.[a], 80), [c]: str(x?.[c], 300) })).filter((x) => x[a] || x[c]).slice(0, max)
      : [];
  return {
    brand: str(b.brand, 80) || 'Wedding Film',
    logoUrl: imgSrc(b.logoUrl),
    logoLightUrl: imgSrc(b.logoLightUrl),
    heroTitle: str(b.heroTitle, 140),
    tagline: str(b.tagline, 400),
    keywords: list(b.keywords, 10, 40),
    aboutTitle: str(b.aboutTitle, 160),
    aboutText: str(b.aboutText, 1500),
    aboutPoints: pairs(b.aboutPoints, 'title', 'text', 4),
    stats: pairs(b.stats, 'value', 'label', 4),
    phone: str(b.phone, 30),
    zalo: str(b.zalo, 30).replace(/[^\d+]/g, ''),
    email: str(b.email, 120),
    address: str(b.address, 200),
    hours: str(b.hours, 100),
    facebookUrl: url(b.facebookUrl),
    messengerUrl: url(b.messengerUrl),
    instagramUrl: url(b.instagramUrl),
    tiktokUrl: url(b.tiktokUrl),
    youtubeChannelUrl: url(b.youtubeChannelUrl),
    mapUrl: url(b.mapUrl),
    siteUrl: url(b.siteUrl),
    photoCategories: b.photoCategories === undefined ? [...DEFAULT_CATEGORIES] : [...new Set(list(b.photoCategories, 12, 40))],
    template: TEMPLATE_IDS.includes(b.template) ? b.template : DEFAULT_TEMPLATE,
    templateOptions: sanitizeTemplateOptions(b.templateOptions),
    texts: sanitizeTexts(b.texts),
    allowRegister: bool(b.allowRegister),
  };
}

export function sanitizeInquiry(b) {
  const phone = str(b.phone, 25);
  const out = {
    name: str(b.name, 100),
    phone,
    date: str(b.date, 30),
    date2: str(b.date2, 30),
    venue: str(b.venue, 200),
    packageName: str(b.packageName, 100),
    message: str(b.message, 2000),
  };
  if (!out.name) return { error: 'Bạn nhập giúp mình tên nhé.' };
  if (!/^[\d\s+().-]{8,25}$/.test(phone)) return { error: 'Số điện thoại chưa đúng, bạn kiểm tra lại giúp mình.' };
  return { value: out };
}

export const clean = (col, body) => SCHEMAS[col](body || {});

/* ---------- Thông tin thật và ba lễ chính của Wedding Film ---------- */
const CEREMONIES = [
  { name: 'Lễ ăn hỏi', badge: '', highlight: false, tagline: 'Buổi lễ đầu tiên của hai gia đình',
    features: [
      'Chụp ảnh và quay phim từ lúc chuẩn bị đến khi kết thúc buổi lễ',
      'Lễ vật, trang trí, nụ cười và ánh mắt của hai họ',
      'Giữ cả lời trao gửi của hai bên gia đình',
      'Ảnh chỉnh màu và video highlight của buổi lễ',
    ] },
  { name: 'Đại lễ', badge: 'Ngày chính', highlight: true, tagline: 'Ngày cưới chính thức của hai bạn',
    features: [
      'Ekip có mặt sớm để bắt trọn khâu trang điểm và chuẩn bị',
      'Đón dâu, lễ gia tiên và những nghi lễ quan trọng nhất',
      'Nhiều góc máy cho khoảnh khắc không thể làm lại',
      'Không giới hạn số ảnh chụp, bàn giao file gốc và file chỉnh màu',
      'Video highlight chất lượng 4K của ngày chính',
    ] },
  { name: 'Tiệc đón khách', badge: '', highlight: false, tagline: 'Khi hai họ và bạn bè cùng chung vui',
    features: [
      'Đón khách, chào bàn và những khoảnh khắc vui nhất của bữa tiệc',
      'Cảm xúc của ba mẹ và những người thân',
      'Lời phát biểu, lời chúc và tiếng cười được giữ cả hình lẫn tiếng',
      'Ảnh chỉnh màu và video highlight của buổi tiệc',
    ] },
];

export const DEFAULT_PROCESS = [
  { title: 'Trò chuyện', text: 'Bạn kể về ngày cưới, chúng mình lắng nghe và gợi ý gói phù hợp.' },
  { title: 'Chốt lịch', text: 'Xác nhận ngày, địa điểm và lịch trình sơ bộ của ngày cưới.' },
  { title: 'Gặp trước ngày cưới', text: 'Trao đổi nhanh về những người và khoảnh khắc bạn muốn giữ lại nhất.' },
  { title: 'Ngày cưới', text: 'Ekip có mặt từ sớm, quan sát và ghi lại, bạn cứ sống trọn ngày của mình.' },
  { title: 'Hậu kỳ và bàn giao', text: 'Chỉnh màu, dựng phim và gửi sản phẩm hoàn chỉnh cho bạn.' },
];

const REAL_SETTINGS = {
  phone: '0923 239 468',
  zalo: '0923239468',
  address: 'Sóc Sơn, Hà Nội',
};

/* ---------- Dữ liệu mẫu ---------- */
function seed() {
  const shapes = [[800, 1000], [1200, 800], [800, 1000], [1000, 1000], [1200, 800], [800, 1000]];
  const names = [
    ['Lễ vật hai họ', 'Lễ ăn hỏi'], ['Lễ gia tiên', 'Lễ ăn hỏi'], ['Chiếc váy', 'Đại lễ'],
    ['Trao nhẫn', 'Đại lễ'], ['Ba và con gái', 'Đại lễ'], ['Đón dâu', 'Đại lễ'],
    ['Chào bàn', 'Tiệc đón khách'], ['Bữa tiệc', 'Tiệc đón khách'], ['Phút lặng', 'Đại lễ'],
    ['Hai họ chung vui', 'Lễ ăn hỏi'], ['Những người bạn', 'Tiệc đón khách'], ['Nụ cười cuối ngày', 'Tiệc đón khách'],
  ];
  const now = Date.now();
  return {
    settings: sanitizeSettings({
      brand: 'Wedding Film',
      heroTitle: 'Những khoảnh khắc thật nhất của ngày cưới',
      tagline:
        'Phóng sự cưới bằng ảnh và phim. Chúng mình đi cùng bạn từ sáng sớm đến khi tiệc tàn, rồi kể lại ngày hôm đó đúng như nó đã diễn ra.',
      keywords: ['Phóng sự cưới', 'Wedding film', 'Pre-wedding', 'Highlight film', 'Teaser', 'Album ảnh'],
      aboutTitle: 'Chúng mình không dựng cảnh. Chúng mình giữ lại cảnh thật.',
      aboutText:
        'Phóng sự cưới là cách kể chuyện bằng những gì thật sự xảy ra: cái ôm vội trước giờ lễ, giọt nước mắt của ba mẹ, tiếng cười ở bàn tiệc. Wedding Film đi theo ngày cưới của bạn bằng máy ảnh và máy quay, ít can thiệp nhất có thể, để về sau bạn xem lại và nhớ đúng cảm giác của ngày hôm đó.',
      aboutPoints: [
        { title: 'Quan sát thay vì sắp đặt', text: 'Ekip đứng lặng ở góc phòng, bắt khoảnh khắc khi nó đến, không bắt bạn diễn.' },
        { title: 'Kể theo ngày cưới', text: 'Ảnh và phim đi theo trình tự thật của ngày cưới, từ lúc chuẩn bị đến khi tiệc tàn.' },
        { title: 'Giữ cả âm thanh', text: 'Lời hứa, tiếng cười và tiếng nhạc nền được giữ lại cùng hình ảnh.' },
      ],
      stats: [],
      ...REAL_SETTINGS,
      email: 'hello@example.com',
      hours: 'Mỗi ngày, 8:00 - 21:00',
      facebookUrl: 'https://www.facebook.com/share/1DSq76B2eH/',
    }),
    photos: names.map(([title, category], i) => ({
      id: uid(), order: i + 1, title, category, src: '', seed: i,
      w: shapes[i % shapes.length][0], h: shapes[i % shapes.length][1], featured: i < 5,
    })),
    videos: [
      { id: uid(), order: 1, title: 'Phim phóng sự cưới (video mẫu)', place: 'Dán link YouTube trong trang quản trị', youtubeId: '', featured: true },
      { id: uid(), order: 2, title: 'Highlight film (video mẫu)', place: 'Dán link YouTube trong trang quản trị', youtubeId: '', featured: false },
      { id: uid(), order: 3, title: 'Teaser (video mẫu)', place: 'Dán link YouTube trong trang quản trị', youtubeId: '', featured: false },
    ],
    packages: CEREMONIES.map((p, i) => ({ id: uid(), order: i + 1, ...p })),
    process: DEFAULT_PROCESS.map((p, i) => ({ id: uid(), order: i + 1, ...p })),
    testimonials: [],
    inquiries: [],
    users: [],
    createdAt: now,
  };
}

/* ---------- Đọc, ghi & Đồng bộ MongoDB Atlas ---------- */
let mongoCol = null;

if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI);
  client.connect()
    .then(() => {
      mongoCol = client.db('himadb').collection('app_data');
      console.log('Đã kết nối MongoDB Atlas thành công!');

      // Kéo dữ liệu từ Cloud về bộ nhớ khi server khởi động
      return mongoCol.findOne({ _id: 'main_db' });
    })
    .then((doc) => {
      if (doc?.data) {
        Object.assign(db, doc.data);
        // Ghi lại vào file db.json cục bộ để cache tạm
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        } catch (_) {}
      } else {
        // Lần đầu chạy chưa có dữ liệu trên Cloud, đẩy dữ liệu hiện tại lên
        mongoCol.insertOne({ _id: 'main_db', data: db }).catch(console.error);
      }
    })
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));
}
function load() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    const fresh = seed();
    write(fresh);
    return fresh;
  }
}
function write(data) {
  // 1. Vẫn ghi ra file db.json cục bộ để dùng tạm
  try {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Lỗi ghi file local:', err);
  }

  // 2. Đồng bộ vĩnh viễn lên MongoDB Atlas
  if (mongoCol) {
    mongoCol.updateOne(
      { _id: 'main_db' },
      { $set: { data: data } },
      { upsert: true }
    ).catch((err) => console.error('Lỗi lưu MongoDB Atlas:', err));
  }
}

/** Dữ liệu cũ vẫn còn giá trị mẫu thì thay bằng thông tin thật. Giá trị bạn đã tự sửa thì giữ nguyên. */
function migrate(d) {
  let changed = false;
  const s = d.settings || {};
  const sample = (v, ...xs) => v === undefined || v === '' || xs.includes(v);
  if (sample(s.phone, '0900 000 000')) { s.phone = REAL_SETTINGS.phone; changed = true; }
  if (sample(s.zalo, '0900000000')) { s.zalo = REAL_SETTINGS.zalo; changed = true; }
  if (sample(s.address, 'Địa chỉ studio của bạn')) { s.address = REAL_SETTINGS.address; changed = true; }
  // Gói còn là bản mẫu hoặc bảng giá cũ thì đổi sang ba lễ chính. Gói bạn đã tự sửa tên thì giữ nguyên.
  const OLD_NAMES = new Set([
    'Phóng sự ảnh', 'Ảnh và phim', 'Trọn gói',
    'Gói Chụp Cơ Bản: 2 Ngày', 'Thêm Thợ Phụ: 1 Ngày lễ', 'Thêm Thợ Phụ: 2 Ngày', 'Gói Quay Lễ 1 Ngày', 'Combo Quay Cả 2 Ngày',
  ]);
  const stale = Array.isArray(d.packages) && d.packages.length > 0 && d.packages.every((p) => OLD_NAMES.has(p.name));
  if (stale) {
    d.packages = CEREMONIES.map((p, i) => ({ id: uid(), order: i + 1, ...p }));
    changed = true;
  }
  if (!Array.isArray(d.process)) {
    d.process = DEFAULT_PROCESS.map((p, i) => ({ id: uid(), order: i + 1, ...p }));
    changed = true;
  }
  if (!Array.isArray(d.users)) { d.users = []; changed = true; }
  // Lần đầu có nhóm ảnh quản lý được: đổi các nhóm mẫu cũ sang ba lễ chính.
  if (!Array.isArray(s.photoCategories)) {
    const map = { 'Phóng sự cưới': 'Đại lễ', 'Gia đình': 'Lễ ăn hỏi', 'Pre-wedding': 'Tiệc đón khách' };
    for (const p of d.photos || []) if (map[p.category]) p.category = map[p.category];
    changed = true;
  }
  d.settings = sanitizeSettings(s);
  return changed;
}

export const db = load();
if (migrate(db)) write(db);
export const save = () => write(db);
export const sorted = (arr) => [...arr].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
