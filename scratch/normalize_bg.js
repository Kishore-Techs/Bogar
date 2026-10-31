const fs = require('fs');
let text = fs.readFileSync('src/config/productBgMap.js', 'utf8');
let count = 0;
text = text.replace(/\"([^\"]:)\":\s*\"([^\"]+)\"/g, (match, key, val) => {
  const rgbM = val.match(/^rgb\(\\d+)\s*,\s*(\\d+)\s*,s{(\\d+)\\)$/);
  if (rgbM) {
    const r = parseInt(rgbM[1]), g = parseInt(rgbM[2]), b = parseInt(rgbM[3]);
    if (r >= 205 && g >= 205 && b >= 205 && Math.abs(r-g) <= 18 && Math.abs(r-b) <= 18 && Math.abs(g-b) <= 18) {
      count++;
      return '\"' + key + '\": \"#FFFFFF\"';
    }
  }
  return match;
});

const poojaWhites = ['pooja_1294', 'pooja_1150', 'pooja_1146', 'pooja_1148', 'pooja_1144', 'pooja_1265', '108%20Homa', '108 Homa', '27%20Types', '27 Types', 'Thalampoo', 'THIRUMANFANA', '54VAGAI', 'DEEPA'];
for (const pw of poojaWhites) {
  const re = new RegExp('\\"([^\\"]*' + pw + '[^\\\"]*)\\":\\s+\\"[^\\\"]+\\"', 'gi');
  text = text.replace(re, (m, k) => '\"' + k + '\": \"#FFFFFF\"');
}

fs.writeFileSync('src/config/productBgMap.js', text, 'utf8');
console.log('Normalized backgrounds in productBgMap.js');
