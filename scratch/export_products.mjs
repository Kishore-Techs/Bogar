import fs from 'fs';
import { DHARANI_POOJA_PRODUCTS_INITIAL } from '../src/config/dharaniPoojaProducts.js';
import { DHARANI_TEA_PRODUCTS_INITIAL } from '../src/config/dharaniTeaProducts.js';
import { BOGAR_CONFIG } from '../src/config/bogarConfig.js';
import { DHARANI_FOOD_PRODUCTS_INITIAL } from '../src/config/dharaniFoodProducts.js';
import { DHARANI_HAIR_PRODUCTS_INITIAL } from '../src/config/dharaniHairProducts.js';
import { DHARANI_SKIN_PRODUCTS_INITIAL } from '../src/config/dharaniSkinProducts.js';
import { DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL } from '../src/config/dharaniHealthWellnessProducts.js';

const allCategories = {
  poojas: DHARANI_POOJA_PRODUCTS_INITIAL,
  tea: DHARANI_TEA_PRODUCTS_INITIAL,
  thuni: BOGAR_CONFIG.categories.find(c => c.id === 'thuni')?.products || [],
  chains: BOGAR_CONFIG.categories.find(c => c.id === 'chains')?.products || [],
  food: DHARANI_FOOD_PRODUCTS_INITIAL,
  hair: DHARANI_HAIR_PRODUCTS_INITIAL,
  skin: DHARANI_SKIN_PRODUCTS_INITIAL,
  health_wellness: DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL
};

fs.writeFileSync('scratch/all_category_products.json', JSON.stringify(allCategories, null, 2));
console.log('Successfully dumped all_category_products.json');
