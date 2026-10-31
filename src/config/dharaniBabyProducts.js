/**
 * Authentic Dharani Herbbals Baby Products
 * Source: dharaniherbbals.in/shop?category=Baby
 * Products from user screenshot:
 * 1. Thuvalai Powder (₹40, 50g)
 * 2. Nalangu Powder Jar (₹60, 100g)
 * 3. Green Gram Flour (₹40, 100g)
 * 4. Bath Powder Jar (₹55, 100g)
 */

export const DHARANI_BABY_PRODUCTS_INITIAL = [
  {
    "id": 1163,
    "dharaniId": 1163,
    "name": "Thuvalai Powder",
    "tamilName": "துவளை பொடி",
    "category": "Baby",
    "price": "40.00",
    "image": "/assets/images/baby/thuvalai_powder.png",
    "fallbackImage": "https://vedanmart.com/images/Baby/Thuvalai%20powder.png",
    "shortDescription": "It will help to relieve inflammation, to feel fresh and soft, and provide a better complexion.",
    "description": "It will help to relieve inflammation, to feel fresh and soft, and provide a better complexion.",
    "stock": 500,
    "productType": "powder"
  },
  {
    "id": 1158,
    "dharaniId": 1158,
    "name": "Nalangu Powder Jar",
    "tamilName": "நலங்கு மாவு ஜார்",
    "category": "Baby",
    "price": "60.00",
    "image": "/assets/images/baby/nalangu_powder_jar.jpg",
    "fallbackImage": "https://vedanmart.com/images/Baby/NALANGU%20POWDER%20JAR.jpg",
    "shortDescription": "Nalangu maavu can make skin look better and have a natural glow when used regularly.",
    "description": "Nalangu maavu can make skin look better and have a natural glow when used regularly. Exfoliation: have a coarse texture that can work as a mild exfoliator to help remove dead skin cells and encourage softer, smoother skin.",
    "stock": 100,
    "productType": "powder"
  },
  {
    "id": 1156,
    "dharaniId": 1156,
    "name": "Green Gram Flour",
    "tamilName": "பாசி பயறு மாவு",
    "category": "Baby",
    "price": "40.00",
    "image": "/assets/images/baby/green_gram_flour.jpg",
    "fallbackImage": "https://vedanmart.com/images/Baby/Green%20Gram.jpg",
    "shortDescription": "Its gentle exfoliating properties help to remove dead skin cells, unclog pores, and reveal a brighter complexion.",
    "description": "Its gentle exfoliating properties help to remove dead skin cells, unclog pores, and reveal a brighter complexion. It is frequently mixed with other natural ingredients like water or honey.",
    "stock": 500,
    "productType": "powder"
  },
  {
    "id": 1154,
    "dharaniId": 1154,
    "name": "Bath Powder Jar",
    "tamilName": "குளியல் பொடி ஜார்",
    "category": "Baby",
    "price": "55.00",
    "image": "/assets/images/baby/bath_powder_jar.jpg",
    "fallbackImage": "https://vedanmart.com/images/Baby/BATH%20POWDER%20JAR.jpg",
    "shortDescription": "The skin becomes soft, free of dryness, free of dark patches, and without any added additives.",
    "description": "The skin becomes soft, free of dryness, free of dark patches around the neck, free of odors, and without any added additives or preservatives.",
    "stock": 500,
    "productType": "powder"
  },
];

/**
 * Fetches live baby products from official API with reliable fallback
 */
export async function fetchLiveDharaniBabyProducts() {
  try {
    const response = await fetch('https://api.codingboss.in/vandanmart/products/', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return DHARANI_BABY_PRODUCTS_INITIAL;
    }
    const data = await response.json();
    const prods = Array.isArray(data) ? data : (data.products || data.results || []);

    return DHARANI_BABY_PRODUCTS_INITIAL.map((initial) => {
      const match = prods.find(
        (live) => live.id === initial.id || live.id === initial.dharaniId || (live.name && live.name.toLowerCase().includes(initial.name.toLowerCase().slice(0, 10)))
      );
      if (match) {
        return {
          ...initial,
          price: match.price ? parseFloat(match.price).toFixed(2) : initial.price,
          // Always keep the attached screenshot product image as primary
          image: initial.image,
          fallbackImage: match.image || initial.fallbackImage,
          shortDescription: initial.shortDescription,
        };
      }
      return initial;
    });
  } catch (err) {
    console.warn('Live Dharani Baby products fetch fallback:', err);
    return DHARANI_BABY_PRODUCTS_INITIAL;
  }
}
