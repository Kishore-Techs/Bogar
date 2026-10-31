import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import FoodProductCard from './FoodProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_BABY_PRODUCTS_INITIAL,
  fetchLiveDharaniBabyProducts
} from '../config/dharaniBabyProducts';

export default function BabyPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_BABY_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniBabyProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Baby page live fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bogar-category-page bogar-food-page">
      {/* Category Hero Banner matching BOGAR style */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/tea-powder.jpg"
            alt="Baby"
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
            <h1 className="bogar-category-hero__title">Baby</h1>
            <p className="bogar-category-hero__subtitle">
              Gentle herbal care and natural bath powders for babies
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
              Gentle Herbal Baby Care
            </h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* 3-Column Product Grid */}
          <div className="bogar-category-grid">
            {products.map((product) => (
              <FoodProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                categoryLabel="BABY"
                idPrefix="baby-product"
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="baby"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}

