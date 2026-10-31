import React from 'react';
import { ArrowLeft, Calendar, ArrowRight, Flame } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductImage from './ProductImage';
import LotusLogo from './LotusLogo';
import PoojasPageView from './PoojasPageView';
import TeaPageView from './TeaPageView';
import { BOGAR_CONFIG } from '../config/bogarConfig';
import { getInitialImageBg, getInitialFitMode } from '../config/imageBgHelper';
import ExploreOtherCollections from './ExploreOtherCollections';

export default function CategoryPageView({
  categoryId,
  onBack,
  onBookPooja,
  onBuyNow,
  onAddToCart,
  onSelectCategory,
}) {
  if (categoryId === 'poojas') {
    return <PoojasPageView onBack={onBack} onAddToCart={onAddToCart} onSelectCategory={onSelectCategory} />;
  }

  if (categoryId === 'tea-food') {
    return <TeaPageView onBack={onBack} onAddToCart={onAddToCart} onSelectCategory={onSelectCategory} />;
  }

  const category = BOGAR_CONFIG.categories.find((c) => c.id === categoryId) || BOGAR_CONFIG.categories[0];

  const getSectionTitle = () => {
    if (categoryId === 'poojas') return 'Sacred Poojas & Rituals';
    if (categoryId === 'tea-food') return 'Traditional Herbal Beverages & Sacred Teas';
    if (categoryId === 'thuni') return 'Traditional Buddhist Robes & Sacred Textiles';
    if (categoryId === 'chains') return 'Traditional & Buddha-Inspired Chains';
    return 'Our Collections';
  };

  return (
    <div className="bogar-category-page">
      {/* Category Hero Banner matching reference thumbnails */}
      <section className="bogar-category-hero">
        <div className="bogar-category-hero__bg">
          <img
            src={category.image}
            alt={category.title}
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
            <h1 className="bogar-category-hero__title">{category.title}</h1>
            <p className="bogar-category-hero__subtitle">{category.description}</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bogar-category-content">
        <div className="bogar-category-content__container">
          <div className="bogar-category-content__header">
            <h2 className="bogar-category-content__heading">{getSectionTitle()}</h2>
            <div className="bogar-category-content__divider" />
          </div>

          {/* Product Cards Grid: Product Image, Name, Description, BUY NOW, ADD TO CART */}
          {category.products && category.products.length > 0 ? (
            <div className="bogar-category-grid">
              {category.products.map((product) =>
                product.isPoojaBooking ? (
                  <div key={product.id} className="bogar-cat-card">
                    <div className="bogar-cat-card__media">
                      <ProductImage
                        src={product.image}
                        fallbackSrc={product.fallbackImage}
                        alt={product.name}
                      />
                    </div>
                    <div className="bogar-cat-card__body">
                      <h3 className="bogar-cat-card__title">{product.name}</h3>
                      <div className="bogar-product-card__desc-wrap">
                        <Flame size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />
                        <p className="bogar-cat-card__desc">{product.shortDescription}</p>
                      </div>
                      <div className="bogar-cat-card__action">
                        <button
                          type="button"
                          className="bogar-btn-book bogar-btn-book--card"
                          onClick={() => onBookPooja(product.name)}
                        >
                          <Calendar size={14} />
                          <span>Book This Pooja</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, category: product.category || category.id }}
                    onBuyNow={onBuyNow}
                    onAddToCart={onAddToCart}
                  />
                )
              )}
            </div>
          ) : (
            <div className="bogar-empty-state">
              <p>No products available in this collection.</p>
            </div>
          )}

          {/* Special Pooja CTA Banner if on Poojas page */}
          {categoryId === 'poojas' && (
            <div className="bogar-poojas-page-cta">
              <div className="bogar-poojas-page-cta__content">
                <div className="bogar-poojas-page-cta__icon">
                  <LotusLogo size={36} color="#D4B675" />
                </div>
                <h3 className="bogar-poojas-page-cta__title">Special Pooja Booking</h3>
                <p className="bogar-poojas-page-cta__text">
                  Experience traditional rituals in the sacred Bogar tradition. Book your special pooja and receive blessings.
                </p>
                <button
                  type="button"
                  className="bogar-btn-book bogar-btn-book--hero"
                  onClick={() => onBookPooja('Special Bogar Pooja')}
                >
                  <Calendar size={16} />
                  <span>Book Special Pooja Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Explore Other Collections */}
          <ExploreOtherCollections
            currentCategoryId={categoryId}
            onSelectCategory={onSelectCategory}
          />
        </div>
      </section>
    </div>
  );
}
