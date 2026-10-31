import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CollectionSection({ onSelectCategory }) {
  const cards = [
    {
      id: 'poojas',
      title: 'Poojas',
      description: 'Sacred rituals and Special Pooja Booking',
      image: '/assets/images/card-poojas.jpg',
      alt: 'Traditional Sacred Pooja Ritual with Oil Lamps and Flowers',
    },
    {
      id: 'tea-food',
      title: 'Beverages',
      description: 'Refreshing herbal beverages, traditional sherbets, and botanical teas',
      image: '/assets/images/card-tea-food.jpg',
      alt: 'Traditional herbal beverages, botanical teas, and refreshing sherbets',
    },
    {
      id: 'thuni',
      title: 'Clothes',
      description: 'Traditional Buddhist robes with timeless character',
      image: '/assets/images/card-thuni.jpg',
      alt: 'Folded traditional Buddhist robes and meditation textiles',
    },
    {
      id: 'chains',
      title: 'Chains',
      description: 'Traditional and Buddhist designed chains with elegance',
      image: '/assets/images/card-chains.jpg',
      alt: 'Traditional Tamil heritage chains and sacred temple ornaments',
    },
  ];

  return (
    <section id="collections" className="bogar-collections" aria-label="Collections">
      <div className="bogar-collections__container">
        {/* Section Header */}
        <div className="bogar-collections__header">
          <p className="bogar-collections__eyebrow">EXPLORE OUR COLLECTIONS</p>
          <h2 className="bogar-collections__heading">Discover the Essence of Bogar</h2>
        </div>

        {/* 4 Circular Cards Grid */}
        <div className="bogar-collections__grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bogar-circle-card"
              onClick={() => onSelectCategory(card.id)}
              role="button"
              tabIndex={0}
              aria-label={`Explore ${card.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(card.id);
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

        {/* View All Button below the four collection cards */}
        <div className="bogar-collections__view-all-wrap">
          <button
            type="button"
            className="bogar-btn-view-all"
            onClick={() => onSelectCategory('view-all')}
            aria-label="View All Categories"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
