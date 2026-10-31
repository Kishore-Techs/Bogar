import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import FoodProductCard from './FoodProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_SKIN_PRODUCTS_INITIAL,
  fetchLiveDharaniSkinProducts
} from '../config/dharaniSkinProducts';

export default function SkinPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_SKIN_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniSkinProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Skin page live fetch notice:', err);
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
            src="/assets/images/traditional-food.jpg"
            alt="Skin"
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
            <h1 className="bogar-category-hero__title">Skin</h1>
            <p className="bogar-category-hero__subtitle">
              Natural herbal skincare, botanical powders, and sacred radiant nourishment
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
              Traditional Skin & Herbal Essentials
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
                categoryLabel="SKIN"
                idPrefix="skin-product"
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="skin"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}
