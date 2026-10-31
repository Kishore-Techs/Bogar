import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import PoojaProductCard from './PoojaProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_POOJA_PRODUCTS_INITIAL,
  fetchLiveDharaniPoojaProducts
} from '../config/dharaniPoojaProducts';

export default function PoojasPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_POOJA_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniPoojaProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length === 7) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Poojas page live fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bogar-category-page">
      {/* Category Hero Banner matching Tea & Food with authentic Poojas spiritual image */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/card-poojas.jpg"
            alt="Poojas"
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
            <h1 className="bogar-category-hero__title">Poojas</h1>
            <p className="bogar-category-hero__subtitle">
              Sacred pooja items for your spiritual journey
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bogar-category-content">
        <div className="bogar-category-content__container">
          {/* Main Heading & Gold Underline */}
          <div className="bogar-category-content__header">
            <h2 className="bogar-category-content__heading">
              Sacred Pooja Items for Your Spiritual Journey
            </h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* 3-Column Product Grid (Row 1: 3, Row 2: 3, Row 3: 1) */}
          <div className="bogar-category-grid">
            {products.map((product) => (
              <PoojaProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="poojas"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}
