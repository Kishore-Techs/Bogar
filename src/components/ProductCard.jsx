import React from 'react';
import { ShoppingBag, Sparkles, Flame, Leaf, Droplets, Heart } from 'lucide-react';
import ProductImage from './ProductImage';

function getCategoryIcon(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pooja')) return <Flame size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (cat.includes('tea')) return <Leaf size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (cat.includes('hair')) return <Droplets size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (cat.includes('skin')) return <Sparkles size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (cat.includes('food')) return <Leaf size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  if (cat.includes('health') || cat.includes('well')) return <Heart size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
  return <Sparkles size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />;
}

function getCategoryLabel(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pooja')) return 'POOJAS';
  if (cat.includes('tea')) return 'TEA';
  if (cat.includes('hair')) return 'HAIR';
  if (cat.includes('skin')) return 'SKIN';
  if (cat.includes('food')) return 'FOOD';
  if (cat.includes('health') || cat.includes('well')) return 'HEALTH & WELLNESS';
  if (cat.includes('thuni') || cat.includes('cloth')) return 'CLOTHES';
  if (cat.includes('chain')) return 'CHAINS';
  return (category || '').toUpperCase();
}

export default function ProductCard({
  product,
  onAddToCart,
}) {
  return (
    <div className="bogar-product-card" id={`product-${product.id}`}>
      {/* Product Image — neutral beige background, contain so full product is visible */}
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
          <span className="bogar-pooja-card__badge">{getCategoryLabel(product.category)}</span>
          <h3 className="bogar-product-card__name">{product.name}</h3>
          <div className="bogar-product-card__desc-wrap">
            {getCategoryIcon(product.category)}
            <p className="bogar-product-card__description">{product.shortDescription}</p>
          </div>
        </div>

        {/* Price (if present) */}
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

        {/* Action Button: ADD TO CART */}
        <div className="bogar-product-card__actions bogar-product-card__actions--single">
          <button
            type="button"
            className="bogar-btn-add-cart bogar-btn-add-cart--full"
            onClick={() => onAddToCart && onAddToCart(product)}
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
