// Official Dharani Herbbals Poojas Products Data & Live Sync
// Source: https://dharaniherbbals.in/ (API: https://api.codingboss.in/herbal/products/)

export const DHARANI_POOJA_PRODUCTS_INITIAL = [
  {
    id: 1294,
    dharaniId: 1294,
    name: "108 Homa Dravyangal",
    officialName: "108 Homa Draviyangal",
    tamilName: "108 வகை ஹோம திரவியங்கள்",
    category: "Poojas",
    price: "600.00",
    image: "https://vedanmart.com/images/Poojas%20Gallery/108%20Homa%20Draviyangal.jpeg",
    fallbackImage: "/assets/images/poojas/pooja_1294.jpeg",
    shortDescription: "Sacred assembly of 108 authentic herbs, aromatic woods, and purifying resins for auspicious homas.",
    description: "Sacred assembly of 108 authentic herbs, aromatic woods, and purifying resins for auspicious homas."
  },
  {
    id: 1265,
    dharaniId: 1265,
    name: "Deepa Oil",
    officialName: "Deepa Oil",
    tamilName: "தீபா எண்ணெய்",
    category: "Poojas",
    price: "95.00",
    image: "https://vedanmart.com/images/Poojas/DEEPA%20OIL.jpg",
    fallbackImage: "/assets/images/poojas/pooja_1265.jpg",
    shortDescription: "Pure botanical lamp oil prepared for a steady, soot-free flame and tranquil devotional sanctum.",
    description: "Pure botanical lamp oil prepared for a steady, soot-free flame and tranquil devotional sanctum."
  },
  {
    id: 1264,
    dharaniId: 1264,
    name: "Herbal Dhoopa Powder (PO)",
    officialName: "Herbbal Dhoopa Powder (PO)",
    tamilName: "மூலிகை தூப தூள் (PO)",
    category: "Poojas",
    price: "50.00",
    image: "https://vedanmart.com/images/Poojas/Herbal%20Incense%20Powder%20(PO).jpg",
    fallbackImage: "/assets/images/poojas/pooja_1264.jpg",
    shortDescription: "Natural aromatic herbs and resins hand-blended to diffuse serene, purifying temple fragrance.",
    description: "Natural aromatic herbs and resins hand-blended to diffuse serene, purifying temple fragrance."
  },
  {
    id: 1150,
    dharaniId: 1150,
    name: "27 Types of Homa Offerings",
    officialName: "27 Types of Homa Offerings",
    tamilName: "27 வகையான ஹோம பிரசாதங்கள்",
    category: "Poojas",
    price: "85.00",
    image: "https://vedanmart.com/images/Poojas/27%20Types%20of%20Homa%20Offerings.jpg",
    fallbackImage: "/assets/images/poojas/pooja_1150.jpg",
    shortDescription: "Traditional 27-herb offering formulated according to sacred Vedic rituals for positive spiritual energy.",
    description: "Traditional 27-herb offering formulated according to sacred Vedic rituals for positive spiritual energy."
  },
  {
    id: 1148,
    dharaniId: 1148,
    name: "Thirumanjal Powder (PO)",
    officialName: "Thirumanjal Powder (PO)",
    tamilName: "திருமஞ்சள் தூள் (PO)",
    category: "Poojas",
    price: "20.00",
    image: "https://vedanmart.com/images/Poojas/THIRUMANJANA%20POWDER%20(PO).jpg",
    fallbackImage: "/assets/images/poojas/pooja_1148.jpg",
    shortDescription: "Auspicious pure yellow turmeric ground from heritage roots for devotional poojas and temple sanctification.",
    description: "Auspicious pure yellow turmeric ground from heritage roots for devotional poojas and temple sanctification."
  },
  {
    id: 1146,
    dharaniId: 1146,
    name: "Thalampoo Kunkumam",
    officialName: "Thalampoo Kunkumam",
    tamilName: "தாழம் பூ குங்குமம்",
    category: "Poojas",
    price: "35.00",
    image: "https://vedanmart.com/images/Poojas/Screw%20Pine%20Kumkum.png",
    fallbackImage: "/assets/images/poojas/pooja_1146.png",
    shortDescription: "Divinely fragrant sacred vermilion infused with natural screw pine essence for auspicious blessings.",
    description: "Divinely fragrant sacred vermilion infused with natural screw pine essence for auspicious blessings."
  },
  {
    id: 1144,
    dharaniId: 1144,
    name: "54 Vagai Homa Thiraviyangal",
    officialName: "54 Vagai HomaThiraviyangal",
    tamilName: "54 வாகை ஹோம திரவியங்கள்",
    category: "Poojas",
    price: "220.00",
    image: "https://vedanmart.com/images/Poojas/54VAGAI%20HOMA%20THIRAVIYANGAL.jpg",
    fallbackImage: "/assets/images/poojas/pooja_1144.jpg",
    shortDescription: "Consecrated 54-herb blend crafted for spiritual homams, purifying the atmosphere and restoring harmony.",
    description: "Consecrated 54-herb blend crafted for spiritual homams, purifying the atmosphere and restoring harmony."
  }
];

export async function fetchLiveDharaniPoojaProducts() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch('https://api.codingboss.in/herbal/products/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const allProducts = await response.json();
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      return DHARANI_POOJA_PRODUCTS_INITIAL;
    }

    // Map each of the exact 7 products with live Dharani pricing and images
    return DHARANI_POOJA_PRODUCTS_INITIAL.map((initial) => {
      const match = allProducts.find(
        (p) =>
          p.id === initial.dharaniId ||
          (p.name && initial.officialName && p.name.trim().toLowerCase() === initial.officialName.trim().toLowerCase())
      );

      if (match) {
        return {
          ...initial,
          price: match.price ? parseFloat(match.price).toFixed(2) : initial.price,
          image: match.image || initial.image,
          stock: match.stock !== undefined ? match.stock : 500,
        };
      }
      return initial;
    });
  } catch (err) {
    console.warn('Live Dharani fetch note:', err.message);
    return DHARANI_POOJA_PRODUCTS_INITIAL;
  }
}
