import React from 'react';
import { ArrowRight } from 'lucide-react';

const ALL_COLLECTIONS = [
  { id: 'poojas', title: 'Poojas' },
  { id: 'tea-food', title: 'Beverages' },
  { id: 'thuni', title: 'Clothes' },
  { id: 'chains', title: 'Chains' },
  { id: 'food', title: 'Food' },
  { id: 'hair', title: 'Hair' },
  { id: 'skin', title: 'Skin' },
  { id: 'health-wellness', title: 'Health & Wellness' },
  { id: 'baby', title: 'Baby' },
];

export default function ExploreOtherCollections({ currentCategoryId, onSelectCategory }) {
  const otherCollections = ALL_COLLECTIONS.filter((c) => c.id !== currentCategoryId);

  return (
    <div className="bogar-category-switch">
      <h3 className="bogar-category-switch__title">Explore Other Collections</h3>
      <div className="bogar-category-switch__list">
        {otherCollections.map((other) => (
          <button
            key={other.id}
            type="button"
            className="bogar-category-switch__btn"
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(other.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            aria-label={`Explore ${other.title}`}
          >
            <span>{other.title}</span>
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
