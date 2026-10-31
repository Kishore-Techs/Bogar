import React from 'react';
import { ShoppingBag, Leaf } from 'lucide-react';
import ProductImage from './ProductImage';

export default function TeaProductCard({ product, onAddToCart }) {
  return (
    <div className="bogar-product-card" id={`tea-product-${product.id}`}>
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
          {/* Category Label: Beverages */}
          <span className="bogar-pooja-card__badge">BEVERAGES</span>
          <h3 className="bogar-product-card__name">{product.name}</h3>
          <div className="bogar-product-card__desc-wrap">
            <Leaf size={14} className="bogar-product-card__desc-icon" aria-hidden="true" />
            <p className="bogar-product-card__description">{product.shortDescription}</p>
          </div>
        </div>

        {/* Current Dharani Price */}
        <div className="bogar-pooja-card__price-wrap">
          <span className="bogar-pooja-card__price">
            <span className="bogar-pooja-card__currency">₹</span>
            <span className="bogar-pooja-card__amount">
              {parseFloat(product.price).toFixed(2)}
            </span>
          </span>
        </div>

        {/* Action Button: ONLY ADD TO CART */}
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
