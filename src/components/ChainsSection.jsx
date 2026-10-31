import React from 'react';
import ProductCard from './ProductCard';
import { BOGAR_CONFIG } from '../config/bogarConfig';

export default function ChainsSection({ onBuyNow, onAddToCart, _onViewAll }) {
  const chainsCategory = BOGAR_CONFIG.categories.find((c) => c.id === 'chains');
  const products = chainsCategory ? chainsCategory.products : [];

  return (
    <section id="chains-section" className="bogar-collection-showcase" aria-label="Chains">
      <div className="bogar-collection-showcase__container">
        <div className="bogar-collection-showcase__header">
          <p className="bogar-collection-showcase__eyebrow">CHAINS</p>
          <h2 className="bogar-collection-showcase__heading">Traditional & Buddha-Inspired Chains</h2>
          <p className="bogar-collection-showcase__desc">
            Sacred antique gold Buddha pendants, 108 prayer beads, and heritage handcrafted chains forged with spiritual artistry.
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
