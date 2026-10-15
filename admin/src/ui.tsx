import { useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner';

export const input =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-hidden transition placeholder:text-mute/60 focus:border-claret focus:ring-2 focus:ring-claret/15';

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

type Variant = 'primary' | 'ghost' | 'danger';
const variants: Record<Variant, string> = {
  primary: 'bg-claret text-white hover:bg-claret-deep',
  ghost: 'border border-line bg-white text-ink hover:border-ink',
  danger: 'border border-line bg-white text-claret hover:border-claret hover:bg-claret/5',
};

export function Btn({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export type Notify = (message: string, kind?: 'ok' | 'err') => void;

export function useToast(): { notify: Notify; node: ReactNode } {
  const notify = useCallback<Notify>((message, kind = 'ok') => {
    if (kind === 'err') toast.error(message);
    else toast.success(message);
  }, []);
  return { notify, node: <Toaster position="top-center" richColors closeButton /> };
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại.');

/** Thu nhỏ ảnh trước khi tải lên: cạnh dài tối đa 2400px, JPEG chất lượng 86%. Ảnh nhỏ sẵn thì giữ nguyên. alpha = true (dùng cho logo) giữ nền trong suốt bằng PNG. */
export async function prepareImage(file: File, maxDim = 2400, alpha = false): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) throw new Error(`Không đọc được ảnh "${file.name}".`);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const keep = file.type === 'image/gif' || (scale === 1 && file.size <= 1.8 * 1024 * 1024 && /^image\/(jpeg|png|webp|avif)$/.test(file.type));
  if (keep) {
    bmp.close();
    return { blob: file, w, h };
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')?.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => alpha ? canvas.toBlob(r, 'image/png') : canvas.toBlob(r, 'image/jpeg', 0.86));
  if (!blob) throw new Error(`Không xử lý được ảnh "${file.name}".`);
  return { blob, w, h };
}
