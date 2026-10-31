import fs from 'fs';
import path from 'path';

const allProducts = JSON.parse(fs.readFileSync('scratch/all_parsed_products.json', 'utf8'));

console.log(`Analyzing ${allProducts.length} products...`);

let missingFallback = 0;
let hasFallback = 0;
let hasRemoteUrl = 0;
let missingBoth = 0;

const missingFallbackList = [];

for (const p of allProducts) {
  const remote = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'));
  if (remote) hasRemoteUrl++;

  let fallbackExists = false;
  if (p.fallbackImage) {
    // Check public directory
    const cleanPath = p.fallbackImage.replace(/^\//, '');
    const fullPath = path.join('public', cleanPath);
    if (fs.existsSync(fullPath)) {
      fallbackExists = true;
    }
  }

  // Also check if p.image points to a local file
  let localImageExists = false;
  if (p.image && !remote) {
    const cleanPath = p.image.replace(/^\//, '');
    if (fs.existsSync(path.join('public', cleanPath))) {
      localImageExists = true;
    }
  }

  if (fallbackExists || localImageExists) {
    hasFallback++;
  } else {
    missingFallback++;
    missingFallbackList.push({
      id: p.id,
      name: p.name,
      category: p.category || p.sourceCat,
      image: p.image,
      fallbackImage: p.fallbackImage
    });
  }
}

console.log(`\n--- Product Image Audit ---`);
console.log(`Total Products: ${allProducts.length}`);
console.log(`With Valid Local Fallback/Image: ${hasFallback}`);
console.log(`Missing Local Fallback: ${missingFallback}`);
console.log(`\nSample missing fallback products (first 15):`);
console.log(JSON.stringify(missingFallbackList.slice(0, 15), null, 2));

fs.writeFileSync('scratch/missing_images.json', JSON.stringify(missingFallbackList, null, 2));
