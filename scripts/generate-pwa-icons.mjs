import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/pwa-icon-source.jpg");

async function renderIcon(size, safeWidthRatio) {
  const safeWidth = Math.round(size * safeWidthRatio);
  const mark = await sharp(source)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize({
      width: safeWidth,
      height: safeWidth,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ compressionLevel: 9 });
}

for (const size of [180, 192, 512]) {
  await (await renderIcon(size, 0.82))
    .toFile(path.join(root, `public/pwa-icon-${size}.png`));
}

await (await renderIcon(512, 0.68)).toFile(
  path.join(root, "public/pwa-icon-maskable-512.png"),
);

await (await renderIcon(512, 0.82)).toFile(
  path.join(root, "public/apple-touch-icon.png"),
);

await (await renderIcon(512, 0.82)).toFile(path.join(root, "public/favicon.png"));

console.log(
  "Generated ARCHIMEDES Live PWA icons: 180, 192, 512 and maskable 512 px.",
);
