import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ViewAllPageView({ onBack, onSelectCategory }) {
  const categories = [
    // Row 1: Poojas | Tea | Clothes | Chains
    {
      id: 'poojas',
      route: 'poojas',
      title: 'Poojas',
      description: 'Sacred rituals and Special Pooja Booking',
      image: '/assets/images/card-poojas.jpg',
      alt: 'Traditional Sacred Pooja Ritual with Oil Lamps and Flowers',
    },
    {
      id: 'tea-food',
      route: 'tea-food',
      title: 'Beverages',
      description: 'Refreshing herbal beverages, traditional sherbets, and botanical teas',
      image: '/assets/images/card-tea-food.jpg',
      alt: 'Traditional herbal beverages, botanical teas, and refreshing sherbets',
    },
    {
      id: 'thuni',
      route: 'thuni',
      title: 'Clothes',
      description: 'Traditional Buddhist robes with timeless character',
      image: '/assets/images/card-thuni.jpg',
      alt: 'Folded traditional Buddhist robes and meditation textiles',
    },
    {
      id: 'chains',
      route: 'chains',
      title: 'Chains',
      description: 'Traditional and Buddhist designed chains with elegance',
      image: '/assets/images/card-chains.jpg',
      alt: 'Traditional Tamil heritage chains and sacred temple ornaments',
    },

    // Row 2: Food | Hair | Skin | Health & Wellness
    {
      id: 'food',
      route: 'food',
      title: 'Food',
      description: 'Traditional sattvic grains, healthy mixes, and pantry essentials',
      image: '/assets/images/traditional-food.jpg',
      alt: 'Traditional South Indian sattvic food and wholesome temple nutrition',
    },
    {
      id: 'hair',
      route: 'hair',
      title: 'Hair',
      description: 'Pure herbal hair oils, natural shampoos, and scalp nutrition',
      image: '/assets/images/card-hair.jpg',
      alt: 'Traditional Ayurvedic herbal hair care, botanical oils and natural shampoos',
    },
    {
      id: 'skin',
      route: 'skin',
      title: 'Skin',
      description: 'Natural herbal skincare, botanical powders, and radiant nourishment',
      image: '/assets/images/skin/skin_1263.png',
      alt: 'Traditional Ayurvedic herbal skin care, cucumber gels and botanical powders',
    },
    {
      id: 'health-wellness',
      route: 'health-wellness',
      title: 'Health & Wellness',
      description: 'Natural herbal powders, daily wellness blends, and mindful nourishment',
      image: '/assets/images/health-wellness/hw_1270.jfif',
      alt: 'Traditional Ayurvedic herbal powders and wellness ingredients',
    },

    // Row 3: Baby
    {
      id: 'baby',
      route: 'baby',
      title: 'Baby',
      description: 'Gentle herbal care and natural bath powders for babies',
      image: '/assets/images/baby/bath_powder_jar.jpg',
      alt: 'Gentle herbal baby care powders and natural bath products',
    },
  ];

  return (
    <div className="bogar-category-page bogar-view-all-page">
      {/* Category Hero Banner matching BOGAR style */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/about-heritage.jpg"
            alt="All Collections"
            className="bogar-category-hero__img"
          />
          <div className="bogar-category-hero__overlay" />
        </div>

        <div className="bogar-category-hero__content">
          <button
            type="button"
            className="bogar-category-hero__back-btn"
            onClick={onBack}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div className="bogar-category-hero__title-box">
            <h1 className="bogar-category-hero__title">All Collections</h1>
            <p className="bogar-category-hero__subtitle">
              Explore our complete range of authentic, traditional, and sacred offerings
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bogar-category-content">
        <div className="bogar-category-content__container">
          <div className="bogar-category-content__header">
            <h2 className="bogar-category-content__heading">Explore All Categories</h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* 8 Category Circular Cards (Desktop: 4 per row, Tablet: 2 per row, Mobile: 2 per row) */}
          <div className="bogar-collections__grid bogar-view-all__grid" style={{ marginBottom: '3.5rem' }}>
            {categories.map((card) => (
              <div
                key={card.id}
                className="bogar-circle-card"
                onClick={() => onSelectCategory(card.route)}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${card.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCategory(card.route);
                  }
                }}
              >
                {/* Circular Image */}
                <div className="bogar-circle-card__ring">
                  <div className="bogar-circle-card__image-wrap">
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="bogar-circle-card__image"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Text Below Circle */}
                <div className="bogar-circle-card__body">
                  <h3 className="bogar-circle-card__title">{card.title}</h3>
                  <p className="bogar-circle-card__desc">{card.description}</p>
                  <span className="bogar-circle-card__explore">
                    EXPLORE <ArrowRight size={13} strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
