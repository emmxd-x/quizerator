import sharp from 'sharp';

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#1d4ed8"/>
  <text x="256" y="330" font-size="300" text-anchor="middle" fill="white" font-family="Arial">Q</text>
</svg>
`);

await sharp(svgBuffer).resize(192, 192).png().toFile('./public/icon-192.png');
await sharp(svgBuffer).resize(512, 512).png().toFile('./public/icon-512.png');

console.log('Icons generated!');