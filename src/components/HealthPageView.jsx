import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import FoodProductCard from './FoodProductCard';
import ExploreOtherCollections from './ExploreOtherCollections';
import {
  DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL,
  fetchLiveDharaniHealthWellnessProducts
} from '../config/dharaniHealthWellnessProducts';

export default function HealthPageView({ onBack, onAddToCart, onSelectCategory }) {
  const [products, setProducts] = useState(DHARANI_HEALTH_WELLNESS_PRODUCTS_INITIAL);

  // Live dynamic fetch from official Dharani Herbbals API
  useEffect(() => {
    let isMounted = true;
    fetchLiveDharaniHealthWellnessProducts()
      .then((liveProducts) => {
        if (isMounted && liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
        }
      })
      .catch((err) => {
        console.warn('Health & Wellness page live fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bogar-category-page bogar-food-page">
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src="/assets/images/traditional-food.jpg"
            alt="Health & Wellness"
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
            <h1 className="bogar-category-hero__title">Health & Wellness</h1>
            <p className="bogar-category-hero__subtitle">
              Natural herbal powders, daily wellness blends, and mindful nourishment
            </p>
          </div>
        </div>
      </section>

      <section className="bogar-category-content">
        <div className="bogar-category-content__container">
          <div className="bogar-category-content__header">
            <h2 className="bogar-category-content__heading">
              Traditional Health & Herbal Essentials
            </h2>
            <div className="bogar-category-content__divider" />
          </div>

          <div className="bogar-category-grid">
            {products.map((product) => (
              <FoodProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                categoryLabel="HEALTH & WELLNESS"
                idPrefix="health-wellness-product"
              />
            ))}
          </div>

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId="health-wellness"
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}