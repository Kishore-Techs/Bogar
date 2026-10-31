import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import HairProductCard from './HairProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_HAIR_PRODUCTS_INITIAL,
  fetchLiveDharaniHairProducts
} from '../config/dharaniHairProducts';

export default function HairPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_HAIR_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniHairProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Hair page live fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bogar-category-page bogar-hair-page">
      {/* Category Hero Banner matching BOGAR style */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/about-heritage.jpg"
            alt="Hair"
            className="bogar-category-hero__img"
          />
          <div className="bogar-category-hero__overlay" />
        </div>

        <div className="bogar-category-hero__content">
          <button
            type="button"
            className="bogar-category-hero__back-btn"
            onClick={onBack}
            aria-label="Back to View All"
          >
            <ArrowLeft size={16} />
            <span>Back to View All</span>
          </button>

          <div className="bogar-category-hero__title-box">
            <h1 className="bogar-category-hero__title">Hair</h1>
            <p className="bogar-category-hero__subtitle">
              Pure herbal hair oils, natural shampoos, and Ayurvedic scalp nutrition
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
              Traditional Herbal Hair Care & Oils
            </h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* 3-Column Product Grid */}
          <div className="bogar-category-grid">
            {products.map((product) => (
              <HairProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="hair"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}
