export interface BrandCache { brand: string; logoUrl: string; logoLightUrl: string }
const KEY = 'hima-brand';

/** Nhớ logo ở lần tải trước để màn hình chờ của lần sau hiện đúng logo ngay. */
export function readBrand(): BrandCache | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return v && typeof v.brand === 'string' ? v : null;
  } catch {
    return null;
  }
}

export function saveBrand(b: BrandCache) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ brand: b.brand, logoUrl: b.logoUrl, logoLightUrl: b.logoLightUrl }));
  } catch {
    /* trình duyệt chặn lưu trữ thì bỏ qua */
  }
}
