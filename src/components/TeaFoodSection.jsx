import React from 'react';
import ProductCard from './ProductCard';
import { BOGAR_CONFIG } from '../config/bogarConfig';

export default function TeaFoodSection({ onBuyNow, onAddToCart, _onViewAll }) {
  const teaCategory = BOGAR_CONFIG.categories.find((c) => c.id === 'tea-food');
  const products = teaCategory ? teaCategory.products : [];

  return (
    <section id="tea-food-section" className="bogar-collection-showcase" aria-label="Tea">
      <div className="bogar-collection-showcase__container">
        <div className="bogar-collection-showcase__header">
          <p className="bogar-collection-showcase__eyebrow">TEA</p>
          <h2 className="bogar-collection-showcase__heading">Traditional Tea Powder & Sacred Offerings</h2>
          <p className="bogar-collection-showcase__desc">
            Authentic stone-ground traditional tea powder (Tea thool), rare hill botanicals, and sacred offerings prepared with meditative reverence.
          </p>
        </div>

        <div className="bogar-collection-showcase__grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuyNow={onBuyNow}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
