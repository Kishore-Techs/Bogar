import fs from 'fs';

function extractArray(content) {
  const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!match) return [];
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    return new Function('return ' + match[0])();
  }
}

const files = [
  { name: 'Food', file: 'src/config/dharaniFoodProducts.js' },
  { name: 'Pooja', file: 'src/config/dharaniPoojaProducts.js' },
  { name: 'Tea', file: 'src/config/dharaniTeaProducts.js' },
  { name: 'Hair', file: 'src/config/dharaniHairProducts.js' },
  { name: 'Skin', file: 'src/config/dharaniSkinProducts.js' },
  { name: 'Health', file: 'src/config/dharaniHealthWellnessProducts.js' }
];

const allProducts = [];

for (const f of files) {
  if (!fs.existsSync(f.file)) continue;
  const content = fs.readFileSync(f.file, 'utf8');
  try {
    const list = extractArray(content);
    console.log(`${f.name}: found ${list.length} products`);
    list.forEach(p => allProducts.push({ ...p, sourceCat: f.name }));
  } catch (err) {
    console.error(`Error parsing ${f.file}:`, err.message);
  }
}

// Also read bogarConfig.js
if (fs.existsSync('src/config/bogarConfig.js')) {
  const c = fs.readFileSync('src/config/bogarConfig.js', 'utf8');
  const catMatches = c.match(/products:\s*\[[\s\S]*?\]/g) || [];
  catMatches.forEach(cm => {
    const raw = cm.replace(/^products:\s*/, '');
    try {
      const prods = new Function('return ' + raw)();
      prods.forEach(p => allProducts.push({ ...p, sourceCat: 'BogarConfig' }));
    } catch(e){}
  });
}

console.log(`Total products parsed across all configs: ${allProducts.length}`);
fs.writeFileSync('scratch/all_parsed_products.json', JSON.stringify(allProducts, null, 2));
