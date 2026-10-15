// Đọc file .env (nếu có) vào process.env, không cần thư viện ngoài. Biến đã đặt sẵn trong hệ thống được ưu tiên.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
for (const file of [path.join(here, '.env'), path.join(here, '..', '.env')]) {
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || line.trim().startsWith('#')) continue;
    const v = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
