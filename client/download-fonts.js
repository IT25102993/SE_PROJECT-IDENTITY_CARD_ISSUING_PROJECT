import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONTS_DIR = path.join(__dirname, 'public', 'fonts');
const OUTPUT_CSS = path.join(__dirname, 'src', 'fonts.css');

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+Sinhala:wght@400;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap';

async function main() {
  console.log('Fetching Google Fonts stylesheet...');
  const res = await fetch(GOOGLE_FONTS_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch CSS: ${res.status} ${res.statusText}`);
  }

  const cssText = await res.text();

  // Parse font blocks to name them cleanly
  const fontUrlRegex = /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.woff2)\)\s*format\('woff2'\);/g;
  let match;
  const urls = new Set();
  while ((match = fontUrlRegex.exec(cssText)) !== null) {
    urls.add(match[1]);
  }

  console.log(`Found ${urls.size} unique font files to download.`);

  let index = 1;
  const urlToLocalMap = new Map();

  for (const url of urls) {
    // Generate clean file name from URL or sequence
    const urlParts = url.split('/');
    const rawName = urlParts[urlParts.length - 1];
    const familyDir = urlParts[urlParts.length - 3] || 'font';
    const localFileName = `${familyDir}-${rawName}`;
    const localFilePath = path.join(FONTS_DIR, localFileName);

    console.log(`[${index}/${urls.size}] Downloading ${localFileName}...`);
    const fontRes = await fetch(url);
    if (!fontRes.ok) {
      throw new Error(`Failed to download ${url}: ${fontRes.status}`);
    }
    const buffer = Buffer.from(await fontRes.arrayBuffer());
    fs.writeFileSync(localFilePath, buffer);

    urlToLocalMap.set(url, `/fonts/${localFileName}`);
    index++;
  }

  // Replace all URLs in CSS
  let localCss = cssText;
  for (const [remoteUrl, localPath] of urlToLocalMap.entries()) {
    localCss = localCss.replaceAll(remoteUrl, localPath);
  }

  // Add header to local CSS
  const finalCss = `/* =====================================================
   NexusGov - 100% Local Fonts & Typography System
   Includes Poppins, JetBrains Mono, Noto Sans Sinhala
   Downloaded & served locally without external CDN dependencies
   ===================================================== */

${localCss}
`;

  fs.writeFileSync(OUTPUT_CSS, finalCss, 'utf-8');
  console.log(`\nSuccessfully created local fonts CSS at: ${OUTPUT_CSS}`);
  console.log(`Downloaded ${urls.size} woff2 files into: ${FONTS_DIR}`);
}

main().catch(err => {
  console.error('Error downloading fonts:', err);
  process.exit(1);
});
