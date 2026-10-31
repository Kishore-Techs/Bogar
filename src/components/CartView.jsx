import React, { useState, useMemo } from 'react';
import { useBogar } from '../context/BogarContext';
import {
  ShoppingBag,
  Package,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  Calendar,
  Phone,
  Mail,
  FileText,
  Info,
  Sparkles,
} from 'lucide-react';
import LotusLogo from './LotusLogo';
import { getInitialImageBg } from '../config/imageBgHelper';

export default function CartView({ onNavigate, onOrderSuccess, initialTab = 'cart' }) {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    checkoutCart,
    currentUser,
    setPendingAction,
    orders,
    cancelOrder,
    addToCart,
  } = useBogar();

  const [activeTab, setActiveTab] = useState(initialTab); // 'cart' or 'orders'
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [devoteeName, setDevoteeName] = useState(currentUser?.name || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelNotice, setCancelNotice] = useState('');

  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel Order ${orderId}?`)) {
      cancelOrder(orderId);
      setCancelNotice(`Order ${orderId} has been successfully cancelled.`);
      if (selectedOrderForDetails && selectedOrderForDetails.orderId === orderId) {
        setSelectedOrderForDetails((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      }
      setTimeout(() => setCancelNotice(''), 4500);
    }
  };

  // Modals for "View Details"
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  // Filter ONLY current user's actual purchased orders
  const userOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const userEmail = (currentUser?.email || email || '').toLowerCase().trim();
    const userPhone = (currentUser?.phone || phone || '').trim();
    if (!userEmail && !userPhone) return [];
    return orders.filter((o) => {
      const oEmail = (o.email || '').toLowerCase().trim();
      const oPhone = (o.phone || '').trim();
      return (userEmail && oEmail === userEmail) || (userPhone && oPhone === userPhone);
    });
  }, [orders, currentUser, email, phone]);

  // Cart Totals calculation
  const { subtotal, totalItems } = useMemo(() => {
    let sum = 0;
    let count = 0;
    cart.forEach((item) => {
      const price = parseFloat(item.product.price) || 0;
      sum += price * item.quantity;
      count += item.quantity;
    });
    return { subtotal: sum, totalItems: count };
  }, [cart]);

  // Handle Checkout
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const formEl = e.currentTarget;
    const domName = formEl?.elements?.['cart-devotee-name']?.value || '';
    const domPhone = formEl?.elements?.['cart-phone']?.value || '';
    const checkoutName = domName || devoteeName || currentUser?.name || currentUser?.fullName || '';
    const checkoutPhone = domPhone || phone || currentUser?.phone || '';
    const checkoutEmail = email || currentUser?.email || '';

    if (!currentUser && !checkoutPhone) {
      setPendingAction({ type: 'cart_checkout' });
      onNavigate('login');
      return;
    }

    setIsProcessing(true);
    const res = checkoutCart({ phone: checkoutPhone, email: checkoutEmail, devoteeName: checkoutName });
    setIsProcessing(false);

    if (res.success) {
      if (checkoutPhone) setPhone(checkoutPhone);
      if (checkoutName) setDevoteeName(checkoutName);
      // Switch directly to "My Orders" tab on the same page so user sees their purchased orders
      setActiveTab('orders');
      if (res.orders && res.orders[0]) {
        setSelectedOrderForDetails(res.orders[0]);
      }
      if (onOrderSuccess) {
        onOrderSuccess(res.orders[0]);
      }
    }
  };

  const handlePrintReceipt = (order) => {
    setSelectedOrderForDetails(order);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="bogar-cart-page">
      <div className="bogar-cart-container">
        {/* Navigation & Header */}
        <div className="bogar-cart-header">
          <button
            type="button"
            className="bogar-cart-back-btn"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <div className="bogar-cart-title-wrapper">
            <LotusLogo size={32} color="#D4B675" />
            <h1 className="bogar-cart-title">Sacred Cart & Orders</h1>
          </div>
          <p className="bogar-cart-subtitle">
            Manage your sacred offerings and review your verified purchase records
          </p>

          {/* Unified Tabs on the SAME Page */}
          <div className="bogar-cart-tabs" role="tablist" aria-label="Cart and Orders Navigation">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'cart'}
              className={`bogar-cart-tab-btn ${
                activeTab === 'cart' ? 'bogar-cart-tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('cart')}
            >
              <ShoppingBag size={18} />
              <span>YOUR CART</span>
              {cart.length > 0 && (
                <span className="bogar-cart-tab-badge">{cart.length}</span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'orders'}
              className={`bogar-cart-tab-btn ${
                activeTab === 'orders' ? 'bogar-cart-tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              <span>MY ORDERS</span>
              {userOrders.length > 0 && (
                <span className="bogar-cart-tab-badge">{userOrders.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* ==========================================================
            TAB 1: YOUR CART
            ========================================================== */}
        {activeTab === 'cart' && (
          <div className="bogar-cart-tab-panel">
            {cart.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <ShoppingBag size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">Your cart is currently empty.</h2>
                <p className="bogar-empty-state__desc">
                  Explore our sacred temple collections of tea powders, wholesome foods, hair elixirs,
                  herbal skin remedies, and devotional adornments.
                </p>
                <button
                  type="button"
                  className="bogar-btn-book bogar-btn-book--hero"
                  onClick={() => onNavigate('home')}
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              <div className="bogar-cart-layout">
                {/* Cart Items List */}
                <div className="bogar-cart-items-column">
                  <div className="bogar-cart-items-header">
                    <h2 className="bogar-cart-section-title">
                      Your Selected Offerings ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </h2>
                    <span className="bogar-cart-items-note">Review items before dispatch</span>
                  </div>

                  <div className="bogar-cart-items-list">
                    {cart.map((item) => {
                      const unitPrice = parseFloat(item.product.price) || 0;
                      const itemTotal = unitPrice * item.quantity;
                      const category =
                        item.product.categoryLabel ||
                        item.product.category ||
                        item.product.categoryId ||
                        'Sacred Offering';

                      const itemBg = getInitialImageBg(
                        item.product.image,
                        item.product.fallbackImage
                      );

                      return (
                        <div key={item.id} className="bogar-cart-card">
                          {/* 1. Product Image */}
                          <div
                            className="bogar-cart-card__media"
                            style={{ backgroundColor: itemBg }}
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="bogar-cart-card__img"
                              onError={(e) => {
                                if (
                                  item.product.fallbackImage &&
                                  e.currentTarget.src !== item.product.fallbackImage
                                ) {
                                  e.currentTarget.src = item.product.fallbackImage;
                                }
                              }}
                            />
                          </div>

                          {/* 2. Product Details */}
                          <div className="bogar-cart-card__content">
                            <div className="bogar-cart-card__top">
                              <span className="bogar-cart-card__category">{category}</span>
                              <h3 className="bogar-cart-card__name">{item.product.name}</h3>
                              <p className="bogar-cart-card__desc">
                                {item.product.shortDescription || item.product.description}
                              </p>
                            </div>

                            {/* 3. Pricing: Individual & Total */}
                            <div className="bogar-cart-card__pricing">
                              <div className="bogar-cart-card__price-row">
                                <span className="bogar-cart-card__price-label">Price:</span>
                                <span className="bogar-cart-card__price-value">
                                  ₹{unitPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="bogar-cart-card__price-row bogar-cart-card__price-row--total">
                                <span className="bogar-cart-card__price-label">Item Total:</span>
                                <span className="bogar-cart-card__price-value bogar-cart-card__price-value--bold">
                                  ₹{itemTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* 4. Controls: Quantity - / +, View Details, Remove */}
                            <div className="bogar-cart-card__actions">
                              <div className="bogar-cart-card__qty-group">
                                <span className="bogar-cart-card__qty-label">Quantity:</span>
                                <div className="bogar-qty-box">
                                  <button
                                    type="button"
                                    className="bogar-qty-btn"
                                    onClick={() =>
                                      updateCartQuantity(item.product.id, item.quantity - 1)
                                    }
                                    aria-label={`Decrease quantity of ${item.product.name}`}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="bogar-qty-value">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="bogar-qty-btn"
                                    onClick={() =>
                                      updateCartQuantity(item.product.id, item.quantity + 1)
                                    }
                                    aria-label={`Increase quantity of ${item.product.name}`}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="bogar-cart-card__buttons">
                                <button
                                  type="button"
                                  className="bogar-cart-btn-details"
                                  onClick={() => setSelectedProductForDetails(item.product)}
                                  aria-label={`View Details for ${item.product.name}`}
                                >
                                  <Info size={14} />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  className="bogar-cart-btn-remove"
                                  onClick={() => removeFromCart(item.product.id)}
                                  aria-label={`Remove ${item.product.name} from cart`}
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Checkout Summary & Devotee Dispatch Form */}
                <div className="bogar-cart-summary-column">
                  <div className="bogar-cart-summary-card">
                    <h2 className="bogar-cart-summary__title">Dispatch & Order Summary</h2>
                    <div className="bogar-cart-summary__breakdown">
                      <div className="bogar-summary-row">
                        <span>Items Count</span>
                        <span>{totalItems} items</span>
                      </div>
                      <div className="bogar-summary-row">
                        <span>Items Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="bogar-summary-row">
                        <span>Temple Dispatch & Delivery</span>
                        <span className="bogar-summary-highlight">Included</span>
                      </div>
                      <div className="bogar-summary-divider" />
                      <div className="bogar-summary-row bogar-summary-row--total">
                        <strong>Total Amount</strong>
                        <strong className="bogar-summary-total-amt">₹{subtotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    <form onSubmit={handleCheckout} className="bogar-cart-summary__form">
                      <div className="bogar-form-group">
                        <label htmlFor="cart-devotee-name">Name</label>
                        <input
                          id="cart-devotee-name"
                          type="text"
                          required
                          placeholder="Enter name"
                          value={devoteeName}
                          onChange={(e) => setDevoteeName(e.target.value)}
                          className="bogar-form-input"
                        />
                      </div>

                      <div className="bogar-form-group">
                        <label htmlFor="cart-phone">Contact Phone Number</label>
                        <input
                          id="cart-phone"
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bogar-form-input"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="bogar-btn-book bogar-btn-book--full"
                      >
                        <CheckCircle2 size={16} />
                        <span>
                          {isProcessing
                            ? 'Processing Order...'
                            : 'Place Order & Request Sacred Delivery'}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================================
            TAB 2: MY ORDERS
            ========================================================== */}
        {activeTab === 'orders' && (
          <div className="bogar-cart-tab-panel">
            {!currentUser && userOrders.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <Package size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">Devotee Authentication Required</h2>
                <p className="bogar-empty-state__desc">
                  Please log in or create your devotee account to view your confirmed product orders
                  and receipt downloads.
                </p>
                <div className="bogar-empty-state__actions">
                  <button
                    type="button"
                    className="bogar-btn-book bogar-btn-book--hero"
                    onClick={() => onNavigate('login')}
                  >
                    Login / Sign Up
                  </button>
                </div>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="bogar-empty-state">
                <div className="bogar-empty-state__icon-wrap">
                  <Package size={48} color="#D4B675" />
                </div>
                <h2 className="bogar-empty-state__title">No Purchased Orders Found</h2>
                <p className="bogar-empty-state__desc">
                  You have not purchased any products yet. As soon as you complete an order from
                  your Sacred Cart, it will appear here with full receipt details.
                </p>
                <button
                  type="button"
                  className="bogar-btn-book bogar-btn-book--hero"
                  onClick={() => setActiveTab('cart')}
                >
                  Return to Your Cart
                </button>
              </div>
            ) : (
              <div className="bogar-orders-section">
                <div className="bogar-orders-header">
                  <h2 className="bogar-cart-section-title">
                    Your Purchased Orders ({userOrders.length}{' '}
                    {userOrders.length === 1 ? 'order' : 'orders'})
                  </h2>
                  <p className="bogar-orders-subtitle">
                    Official verified purchase records for devotee{' '}
                    <strong>{currentUser?.name || currentUser?.email || email}</strong>
                  </p>
                </div>

                {cancelNotice && (
                  <div className="bogar-auth-alert bogar-auth-alert--success" style={{ marginBottom: '1rem' }}>
                    {cancelNotice}
                  </div>
                )}

                <div className="bogar-orders-list">
                  {userOrders.map((order) => {
                    const orderProduct = order.product;
                    const orderImg =
                      orderProduct?.image ||
                      order.image ||
                      '/assets/images/temple_herbal_leaf.png';
                    const orderBg = getInitialImageBg(orderImg);

                    return (
                      <div key={order.orderId} className="bogar-order-card">
                        <div className="bogar-order-card__header">
                          <div className="bogar-order-card__id-badge">
                            <span className="bogar-order-label">ORDER ID:</span>
                            <strong className="bogar-order-id">{order.orderId}</strong>
                          </div>
                          <div
                            className={`bogar-order-status-badge ${order.status === 'Cancelled' ? 'bogar-order-status-badge--cancelled' : ''}`}
                          >
                            {order.status === 'Cancelled' ? (
                              <>
                                <XCircle size={14} color="#E63946" />
                                <span>Cancelled</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={14} />
                                <span>{order.status || 'Confirmed'}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bogar-order-card__body">
                          {/* Product Image */}
                          <div
                            className="bogar-order-card__media"
                            style={{ backgroundColor: orderBg }}
                          >
                            <img
                              src={orderImg}
                              alt={order.productName}
                              className="bogar-order-card__img"
                            />
                          </div>

                          {/* Order Details */}
                          <div className="bogar-order-card__info">
                            <h3 className="bogar-order-card__title">{order.productName}</h3>

                            <div className="bogar-order-meta-grid">
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Quantity:</span>
                                <strong className="bogar-order-meta-val">{order.quantity}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Order Date:</span>
                                <strong className="bogar-order-meta-val">{order.orderDate}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Phone:</span>
                                <strong className="bogar-order-meta-val">{order.phone}</strong>
                              </div>
                              <div className="bogar-order-meta-item">
                                <span className="bogar-order-meta-label">Email:</span>
                                <strong className="bogar-order-meta-val">{order.email}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="bogar-order-card__actions">
                          <button
                            type="button"
                            className="bogar-btn-order-action bogar-btn-order-action--view"
                            onClick={() => setSelectedOrderForDetails(order)}
                            aria-label={`View Details for ${order.orderId}`}
                          >
                            <Eye size={15} />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            className={`bogar-btn-order-action ${order.status === 'Cancelled' ? 'bogar-btn-order-action--cancelled' : 'bogar-btn-order-action--cancel'}`}
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={order.status === 'Cancelled'}
                            aria-label={`Cancel Order for ${order.orderId}`}
                          >
                            <XCircle size={15} />
                            <span>{order.status === 'Cancelled' ? 'Cancelled' : 'Cancel Order'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==========================================================
          MODAL 1: COMPLETE PRODUCT DETAILS ("View Details")
          ========================================================== */}
      {selectedProductForDetails && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => setSelectedProductForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--product-details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={24} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">Product Details</h3>
                  <p className="bogar-modal-card__tagline">
                    {selectedProductForDetails.categoryLabel ||
                      selectedProductForDetails.category ||
                      'Sacred Herbal Offering'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setSelectedProductForDetails(null)}
                aria-label="Close product details dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-product-modal-body">
              <div
                className="bogar-product-modal-media"
                style={{
                  backgroundColor: getInitialImageBg(
                    selectedProductForDetails.image,
                    selectedProductForDetails.fallbackImage
                  ),
                }}
              >
                <img
                  src={selectedProductForDetails.image}
                  alt={selectedProductForDetails.name}
                  className="bogar-product-modal-img"
                  onError={(e) => {
                    if (
                      selectedProductForDetails.fallbackImage &&
                      e.currentTarget.src !== selectedProductForDetails.fallbackImage
                    ) {
                      e.currentTarget.src = selectedProductForDetails.fallbackImage;
                    }
                  }}
                />
              </div>

              <div className="bogar-product-modal-info">
                <h2 className="bogar-product-modal-name">{selectedProductForDetails.name}</h2>

                <div className="bogar-product-modal-price-wrap">
                  <span className="bogar-product-modal-currency">₹</span>
                  <span className="bogar-product-modal-price">
                    {parseFloat(selectedProductForDetails.price || 0).toFixed(2)}
                  </span>
                </div>

                <div className="bogar-product-modal-section">
                  <h4 className="bogar-modal-subtitle">Description</h4>
                  <p className="bogar-product-modal-desc">
                    {selectedProductForDetails.fullDescription ||
                      selectedProductForDetails.description ||
                      selectedProductForDetails.shortDescription}
                  </p>
                </div>

                {selectedProductForDetails.shortDescription &&
                  selectedProductForDetails.fullDescription && (
                    <div className="bogar-product-modal-section">
                      <h4 className="bogar-modal-subtitle">Sacred Formulation</h4>
                      <p className="bogar-product-modal-subdesc">
                        {selectedProductForDetails.shortDescription}
                      </p>
                    </div>
                  )}

                <div className="bogar-product-modal-actions">
                  <button
                    type="button"
                    className="bogar-btn-book bogar-btn-book--hero"
                    onClick={() => {
                      addToCart(selectedProductForDetails, 1);
                      setSelectedProductForDetails(null);
                    }}
                  >
                    <ShoppingBag size={16} />
                    <span>Add Another to Cart</span>
                  </button>
                  <button
                    type="button"
                    className="bogar-btn-secondary"
                    onClick={() => setSelectedProductForDetails(null)}
                  >
                    <span>Back to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 2: COMPLETE ORDER DETAILS ("View Details")
          ========================================================== */}
      {selectedOrderForDetails && (
        <div
          className="bogar-modal-backdrop"
          onClick={() => setSelectedOrderForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bogar-modal-card bogar-modal-card--order-details"
            onClick={(e) => e.stopPropagation()}
            id="bogar-order-details-printable"
          >
            <div className="bogar-modal-card__header">
              <div className="bogar-modal-card__brand">
                <LotusLogo size={28} color="#D4B675" />
                <div>
                  <h3 className="bogar-modal-card__title">Order Details & Receipt</h3>
                  <p className="bogar-modal-card__tagline">BOGAR Sacred Heritage Delivery</p>
                </div>
              </div>
              <button
                type="button"
                className="bogar-modal-card__close"
                onClick={() => setSelectedOrderForDetails(null)}
                aria-label="Close order details dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bogar-modal-card__body bogar-order-modal-body">
              <div className="bogar-order-modal-receipt-header">
                <div className="bogar-order-badge-row">
                  <span className="bogar-order-pill">OFFICIAL DEVOTEE RECEIPT</span>
                  <div className="bogar-order-status-badge">
                    <CheckCircle2 size={14} />
                    <span>{selectedOrderForDetails.status || 'Confirmed'}</span>
                  </div>
                </div>
              </div>

              <div className="bogar-order-modal-rows">
                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Order ID:</span>
                  <strong className="bogar-order-row__val bogar-order-row__val--highlight">
                    {selectedOrderForDetails.orderId}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Product Name:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.productName}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Quantity:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.quantity}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Order Date:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.orderDate}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Contact Phone:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.phone}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Contact Email:</span>
                  <strong className="bogar-order-row__val">
                    {selectedOrderForDetails.email}
                  </strong>
                </div>

                <div className="bogar-order-row">
                  <span className="bogar-order-row__label">Dispatch Status:</span>
                  <strong className="bogar-order-row__val bogar-order-row__val--confirmed">
                    {selectedOrderForDetails.status || 'Confirmed'}
                  </strong>
                </div>
              </div>

              <div className="bogar-order-modal-actions">
                {selectedOrderForDetails.status !== 'Cancelled' ? (
                  <button
                    type="button"
                    className="bogar-btn-order-action bogar-btn-order-action--cancel"
                    style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                    onClick={() => handleCancelOrder(selectedOrderForDetails.orderId)}
                  >
                    <XCircle size={16} />
                    <span>Cancel Order</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bogar-btn-order-action bogar-btn-order-action--cancelled"
                    disabled
                    style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                  >
                    <XCircle size={16} />
                    <span>Order Cancelled</span>
                  </button>
                )}
                <button
                  type="button"
                  className="bogar-btn-secondary"
                  onClick={() => setSelectedOrderForDetails(null)}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
