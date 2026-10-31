async function run() {
  const poojas = (await import('../src/config/dharaniPoojaProducts.js')).DHARANI_POOJA_PRODUCTS_INITIAL;
  const teas = (await import('../src/config/dharaniTeaProducts.js')).DHARANI_TEA_PRODUCTS_INITIAL;
  const bogar = (await import('../src/config/bogarConfig.js')).BOGAR_CONFIG;
  const food = (await import('../src/config/dharaniFoodProducts.js')).DHARANI_FOOD_PRODUCTS_INITIAL;
  const hair = (await import('../src/config/dharaniHairProducts.js')).DHARANI_HAIR_PRODUCTS_INITIAL;
  const skin = (await import('../src/config/dharaniSkinProducts.js')).DHARANI_SKIN_PRODUCTS_INITIAL;
  const hw = (await import('../src/config/dharaniHealthWellnessProducts.js')).DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL;

  console.log('=== POOJAS ===', poojas.length);
  poojas.forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== TEAS ===', teas.length);
  teas.forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== CLOTHES (THUNI) ===');
  const thuni = bogar.categories.find(c => c.id === 'thuni').products;
  thuni.forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== CHAINS ===');
  const chains = bogar.categories.find(c => c.id === 'chains').products;
  chains.forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== FOOD ===', food.length);
  food.slice(0, 10).forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== HAIR ===', hair.length);
  hair.slice(0, 10).forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== SKIN ===', skin.length);
  skin.slice(0, 10).forEach(p => console.log(' ', p.name, '::', p.shortDescription));

  console.log('\n=== HEALTH & WELLNESS ===', hw.length);
  hw.slice(0, 10).forEach(p => console.log(' ', p.name, '::', p.shortDescription));
}
run();
