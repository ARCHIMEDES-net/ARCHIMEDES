import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/apple-touch-icon.png");

for (const size of [180, 192, 512]) {
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(root, `public/pwa-icon-${size}.png`));
}

console.log("Generated ARCHIMEDES Live PWA icons: 180, 192 and 512 px.");
