// BOGAR Configuration & Content Data
// STRICT RULE: ABSOLUTELY NO PRICE DATA ANYWHERE.

export const BOGAR_CONFIG = {
  brandName: "BOGAR",
  tagline: "Tradition • Heritage • Wisdom",
  contact: {
    phone: "+91 98765 43210",
    phoneDisplay: "+91 98765 43210",
    whatsapp: "+919876543210",
    email: "blessings@bogartradition.org",
    location: "Palani Hills & Ancient Heritage Sanctuaries, Tamil Nadu, India",
    timings: "Sacred Hours: 6:00 AM – 1:00 PM | 4:00 PM – 8:30 PM",
  },
  availableTimeSlots: [
    "06:30 AM - 08:00 AM (Morning Sanctum)",
    "09:00 AM - 10:30 AM (Uchikalam Ritual)",
    "11:30 AM - 01:00 PM (Midday Offering)",
    "04:30 PM - 06:00 PM (Sayarakshai Prayer)",
    "06:30 PM - 08:00 PM (Evening Deepam)",
  ],
  categories: [
    {
      id: "poojas",
      title: "Poojas",
      eyebrow: "Sacred Rituals",
      description: "Sacred rituals and Special Pooja Booking",
      heroDescription: "Experience authentic temple rituals, sacred homas, and timeless poojas performed in strict accordance with ancient Bogar tradition and Buddha-inspired meditative sanctity.",
      image: "/assets/images/card-poojas.jpg",
      products: [
        {
          id: "daily-pooja",
          name: "Daily Pooja",
          shortDescription: "Consecrated morning and evening lamp ritual with sacred mantras, bell chimes, and fresh temple blooms.",
          image: "/assets/images/card-poojas.jpg",
          isPoojaBooking: true,
        },
        {
          id: "special-bogar-pooja",
          name: "Special Pooja",
          shortDescription: "Consecrated family sankalpam performed by heritage temple priests for divine grace and peace.",
          image: "/assets/images/special-pooja.jpg",
          isPoojaBooking: true,
        },
        {
          id: "festival-sacred-pooja",
          name: "Festival Pooja",
          shortDescription: "Auspicious Pournami alignment ritual honoring timeless Bogar heritage and sacred energies.",
          image: "/assets/images/about-heritage.jpg",
          isPoojaBooking: true,
        }
      ]
    },
    {
      id: "tea-food",
      title: "Beverages",
      eyebrow: "Buddha-Inspired Offerings",
      description: "Refreshing herbal beverages, traditional sherbets, and botanical teas",
      heroDescription: "Nourish the physical vessel with pure botanical elixirs, traditional herbal beverages, and sacred teas prepared according to ancient Siddhic wisdom.",
      image: "/assets/images/card-tea-food.jpg",
      products: [
        {
          id: "bogar-tea-powder",
          name: "Tea Powder / Tea Thool",
          shortDescription: "Stone-ground heritage tea blended with mountain herbs, sun-dried ginger, and sacred tulsi.",
          image: "/assets/images/tea-powder.jpg",
        },
        {
          id: "traditional-tea",
          name: "Traditional Tea",
          shortDescription: "Aromatic hill tea infused with holy tulsi and warm spices for calm, meditative vitality.",
          image: "/assets/images/traditional-tea.jpg",
        },
        {
          id: "herbal-tea",
          name: "Herbal Tea",
          shortDescription: "Pure botanical infusion of holy tulsi, mountain lemongrass, and restorative forest herbs.",
          image: "/assets/images/herbal-tea.jpg",
        },
        {
          id: "sacred-offerings",
          name: "Sacred Offerings",
          shortDescription: "Sanctified temple prasadam prepared with organic hill grains and blessed forest honey.",
          image: "/assets/images/sacred-offerings.jpg",
        },
        {
          id: "traditional-heritage-food",
          name: "Traditional Heritage Food",
          shortDescription: "Wholesome sattvic ancient grains and pure sesame temple nutrition for mindful wellness.",
          image: "/assets/images/traditional-food.jpg",
        },
        {
          id: "sacred-forest-honey",
          name: "Pure Wild Forest Honey",
          shortDescription: "Raw wild honey ethically gathered from sacred Palani hills, rich in natural vitality.",
          image: "/assets/images/sacred-honey.jpg",
        }
      ]
    },
    {
      id: "thuni",
      title: "Clothes",
      eyebrow: "Sacred Clothing & Robes",
      description: "Traditional Buddhist robes with timeless character",
      heroDescription: "Hand-spun natural cottons, meditation shawls, and traditional robes woven by generational artisans in sacred temple clusters.",
      image: "/assets/images/card-thuni.jpg",
      products: [
        {
          id: "buddhist-monk-robes",
          name: "Traditional Buddhist Robes",
          shortDescription: "Handspun organic cotton Kasaya robes dyed with earth tones for serene meditation.",
          image: "/assets/images/thuni-robes.jpg",
        },
        {
          id: "meditation-shawl",
          name: "Meditation Shawls",
          shortDescription: "Soft terracotta and unbleached cotton shawls woven to maintain stillness in dhyana.",
          image: "/assets/images/thuni-shawl.jpg",
        },
        {
          id: "traditional-temple-cloth",
          name: "Traditional Temple Cloth",
          shortDescription: "Handwoven heritage cotton with consecrated zari borders for sacred ceremonies.",
          image: "/assets/images/thuni-temple-cloth.jpg",
        },
        {
          id: "sacred-devotee-angavastram",
          name: "Sacred Devotee Angavastram",
          shortDescription: "Pure unstitched cotton prayer drape infused with sandalwood essence and golden border.",
          image: "/assets/images/thuni-angavastram.jpg",
        }
      ]
    },
    {
      id: "chains",
      title: "Chains",
      eyebrow: "Spiritual Heritage Adornments",
      description: "Traditional and Buddhist designed chains with elegance",
      heroDescription: "Sacred jewelry fusing Buddhist iconography and South Indian temple artistry. Handcrafted antique gold pendants, carved prayer beads, and timeless chains.",
      image: "/assets/images/card-chains.jpg",
      products: [
        {
          id: "buddha-inspired-chain",
          name: "Buddha-Inspired Chain",
          shortDescription: "Handcrafted heritage chain with sacred Buddha motifs, inspiring peace and mindfulness.",
          image: "/assets/images/chain-buddha-chain.jpg",
        },
        {
          id: "buddha-inspired-pendant",
          name: "Buddha-Inspired Pendant",
          shortDescription: "Antique finish medallion featuring a meditative Buddha silhouette for quiet clarity.",
          image: "/assets/images/chain-buddha-pendant.jpg",
        },
        {
          id: "tibet-om-mani-padme-hum-mantra-amulet",
          name: "Tibet Om Mani Padme Hum Mantra Amulet",
          shortDescription: "Sacred amulet engraved with the six-syllable mantra for spiritual protection and calm.",
          image: "/assets/images/chain-tibet-mantra-amulet.jpg",
        },
        {
          id: "traditional-tamil-rudraksha-bracelet",
          name: "Traditional Tamil Rudraksha Bracelet",
          shortDescription: "Authentic Panchamukhi rudraksha beads strung with temple motifs for grounding energy.",
          image: "/assets/images/chain-tamil-rudraksha-bracelet.jpg",
        },
        {
          id: "traditional-tamil-temple-bracelet",
          name: "Traditional Tamil Temple Bracelet",
          shortDescription: "Traditional temple-motif bracelet handcrafted with generational craftsmanship.",
          image: "/assets/images/chain-tamil-temple-bracelet.jpg",
        },
        {
          id: "traditional-tamil-sandalwood-mala",
          name: "Traditional Tamil Sandalwood Mala",
          shortDescription: "Naturally fragrant sandalwood beads traditionally knotted for japa and meditative peace.",
          image: "/assets/images/chain-tamil-sandalwood-mala.jpg",
        }
      ]
    }
  ]
};
