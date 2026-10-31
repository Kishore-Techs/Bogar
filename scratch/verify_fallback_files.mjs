import fs from 'fs';
import path from 'path';

const allProducts = JSON.parse(fs.readFileSync('scratch/all_parsed_products.json', 'utf8'));

let fbExistsCount = 0;
let fbMissing = [];

allProducts.forEach(p => {
  if (p.fallbackImage) {
    const cleanPath = p.fallbackImage.replace(/^\//, '');
    const fullPath = path.join('public', cleanPath);
    if (fs.existsSync(fullPath)) {
      fbExistsCount++;
    } else {
      fbMissing.push({ id: p.id, name: p.name, fallbackImage: p.fallbackImage });
    }
  }
});

console.log(`Fallback images found: ${fbExistsCount}`);
console.log(`Fallback images missing: ${fbMissing.length}`);
if (fbMissing.length > 0) {
  console.log('Sample missing:', fbMissing.slice(0, 5));
}
