import fs from 'fs';

const allProducts = JSON.parse(fs.readFileSync('scratch/all_parsed_products.json', 'utf8'));

let withFallback = 0;
let withoutFallback = 0;
const noFallbackSample = [];

allProducts.forEach(p => {
  if (p.fallbackImage) {
    withFallback++;
  } else {
    withoutFallback++;
    if (noFallbackSample.length < 5) noFallbackSample.push(p);
  }
});

console.log(`With fallbackImage field: ${withFallback}`);
console.log(`Without fallbackImage field: ${withoutFallback}`);
console.log('Sample without:', noFallbackSample);
