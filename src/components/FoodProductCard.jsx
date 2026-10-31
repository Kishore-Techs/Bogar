import React from 'react';
import { ShoppingBag, Leaf, Sparkles, Droplets, Heart } from 'lucide-react';
import ProductImage from './ProductImage';

function getDescIcon(categoryLabel) {
  const lbl = (categoryLabel || '').toLowerCase();
  if (lbl.includes('skin')) return <Sparkles size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (lbl.includes('hair')) return <Droplets size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (lbl.includes('health') || lbl.includes('well')) return <Heart size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  return <Leaf size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
}

export default function FoodProductCard({
  product,
  onAddToCart,
  onClick,
  categoryLabel = 'FOOD',
  idPrefix = 'food-product',
}) {

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className={`bogar-product-card ${onClick ? 'bogar-product-card--clickable' : ''}`}
      id={`${idPrefix}-${product.id}`}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(product);
              }
            }
          : undefined
      }
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {/* Product Image filling the complete container with its original background */}
      <div className="bogar-product-card__media">
        <ProductImage
          src={product.image}
          fallbackSrc={product.fallbackImage}
          alt={product.name}
        />
      </div>

      {/* Product Information */}
      <div className="bogar-product-card__body">
        <div className="bogar-product-card__details">
          <span className="bogar-pooja-card__badge">{categoryLabel}</span>
          <h3 className="bogar-product-card__name">{product.name}</h3>
          <div className="bogar-product-card__desc-wrap">
            {getDescIcon(categoryLabel)}
            <p className="bogar-product-card__description">{product.shortDescription}</p>
          </div>
        </div>

        {/* Current Price (if present) */}
        {product.price && !isNaN(parseFloat(product.price)) && (
          <div className="bogar-pooja-card__price-wrap">
            <span className="bogar-pooja-card__price">
              <span className="bogar-pooja-card__currency">₹</span>
              <span className="bogar-pooja-card__amount">
                {parseFloat(product.price).toFixed(2)}
              </span>
            </span>
          </div>
        )}

        {/* Action Button: ONLY ADD TO CART */}
        <div className="bogar-product-card__actions bogar-product-card__actions--single">
          <button
            type="button"
            className="bogar-btn-add-cart bogar-btn-add-cart--full"
            onClick={handleAddToCartClick}
            aria-label={`Add to Cart: ${product.name}`}
          >
            <ShoppingBag size={14} />
            <span>ADD TO CART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
