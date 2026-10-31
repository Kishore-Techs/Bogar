import fs from 'fs';

const allProducts = JSON.parse(fs.readFileSync('scratch/all_parsed_products.json', 'utf8'));

const fallbackCounts = {};
allProducts.forEach(p => {
  const fb = p.fallbackImage || p.image;
  fallbackCounts[fb] = (fallbackCounts[fb] || 0) + 1;
});

console.log('Fallback image distribution:');
console.log(Object.entries(fallbackCounts).sort((a,b) => b[1] - a[1]));
