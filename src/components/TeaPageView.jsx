import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import TeaProductCard from './TeaProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_TEA_PRODUCTS_INITIAL,
  fetchLiveDharaniTeaProducts
} from '../config/dharaniTeaProducts';

export default function TeaPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_TEA_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniTeaProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length === 13) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Tea page live fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bogar-category-page">
      {/* Category Hero Banner matching existing Tea page hero exactly */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/card-tea-food.jpg"
            alt="Beverages"
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
            <h1 className="bogar-category-hero__title">Beverages</h1>
            <p className="bogar-category-hero__subtitle">
              Refreshing herbal beverages, traditional sherbets, and botanical teas
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
              Authentic Herbal Beverages & Teas
            </h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* 3-Column Product Grid */}
          <div className="bogar-category-grid">
            {products.map((product) => (
              <TeaProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="tea-food"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}
