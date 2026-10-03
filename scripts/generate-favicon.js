const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ultra-bold, edge-to-edge max-scale square SVG icon
// Fills 100% of the canvas padding so the icon appears significantly LARGER and crisp in browser tabs
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <!-- Solid deep purple background square -->
  <rect width="100" height="100" rx="14" fill="#3C2196"/>
  
  <!-- Thick bold white Eventrix E emblem spanning edge-to-edge -->
  <path d="M 10 10 L 90 10 L 90 28 L 30 28 L 30 38 L 78 38 L 78 54 L 30 54 L 30 64 L 90 64 L 90 90 L 10 90 Z" fill="#FFFFFF"/>
  
  <!-- High contrast neon accent dot -->
  <circle cx="86" cy="14" r="7" fill="#A78BFA"/>
</svg>`;

async function generateFavicons() {
  const appSvgPath = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
  const appPngPath = path.join(__dirname, '..', 'src', 'app', 'icon.png');
  const appIcoPath = path.join(__dirname, '..', 'src', 'app', 'favicon.ico');
  const publicSvgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  const publicPngPath = path.join(__dirname, '..', 'public', 'icon.png');
  const publicIcoPath = path.join(__dirname, '..', 'public', 'favicon.ico');

  // Save SVG
  fs.writeFileSync(appSvgPath, svgContent);
  fs.writeFileSync(publicSvgPath, svgContent);

  // Convert to high-res PNG using Sharp
  const svgBuffer = Buffer.from(svgContent);
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  const png64 = await sharp(svgBuffer).resize(64, 64).png().toBuffer();

  fs.writeFileSync(appPngPath, png512);
  fs.writeFileSync(publicPngPath, png512);
  fs.writeFileSync(appIcoPath, png64);
  fs.writeFileSync(publicIcoPath, png64);

  console.log('Successfully generated large high-res SVG, PNG, and ICO favicons!');
}

generateFavicons().catch(console.error);
