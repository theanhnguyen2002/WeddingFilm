import type { Photo } from '../types';

export const ALL_CATEGORY = 'Tất cả';

/**
 * Danh sách nút lọc ảnh: "Tất cả" rồi tới các nhóm do quản trị viên đặt, chỉ giữ nhóm đang có ảnh.
 * Nếu quản trị viên chưa đặt nhóm nào thì lấy theo ảnh hiện có.
 */
export function galleryCategories(managed: string[], photos: Photo[]): string[] {
  const used = new Set(photos.map((p) => p.category));
  const base = managed.length ? managed.filter((c) => used.has(c)) : Array.from(used);
  return [ALL_CATEGORY, ...base];
}

export const filterPhotos = (photos: Photo[], cat: string) => (cat === ALL_CATEGORY ? photos : photos.filter((p) => p.category === cat));
