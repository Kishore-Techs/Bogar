import React from 'react';
import ProductCard from './ProductCard';
import { BOGAR_CONFIG } from '../config/bogarConfig';

export default function ThuniSection({ onBuyNow, onAddToCart, _onViewAll }) {
  const thuniCategory = BOGAR_CONFIG.categories.find((c) => c.id === 'thuni');
  const products = thuniCategory ? thuniCategory.products : [];

  return (
    <section id="thuni-section" className="bogar-collection-showcase bogar-collection-showcase--dark" aria-label="Thuni">
      <div className="bogar-collection-showcase__container">
        <div className="bogar-collection-showcase__header">
          <p className="bogar-collection-showcase__eyebrow">THUNI</p>
          <h2 className="bogar-collection-showcase__heading">Traditional Buddhist Robes & Textiles</h2>
          <p className="bogar-collection-showcase__desc">
            Sacred Kasaya robes, handwoven meditation shawls, and pure organic temple textiles preserving contemplative dignity.
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
