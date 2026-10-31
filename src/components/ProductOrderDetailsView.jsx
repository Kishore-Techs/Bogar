import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Printer } from 'lucide-react';
import LotusLogo from './LotusLogo';
import { useBogar } from '../context/BogarContext';

export default function ProductOrderDetailsView({ order, onBack, onNavigate }) {
  const { cancelOrder } = useBogar();
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'Confirmed');

  if (!order) {
    return (
      <div className="bogar-ticket-page">
        <div className="bogar-ticket-page__container">
          <div className="bogar-empty-state">
            <p className="bogar-empty-state__title">No orders found.</p>
            <button
              type="button"
              className="bogar-btn-book bogar-btn-book--hero"
              onClick={() => onNavigate('home')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCancelOrder = () => {
    if (window.confirm(`Are you sure you want to cancel order ${order.orderId}?`)) {
      cancelOrder(order.orderId);
      setCurrentStatus('Cancelled');
    }
  };

  return (
    <div className="bogar-ticket-page">
      <div className="bogar-ticket-page__container">
        <div className="bogar-ticket-page__actions-top">
          <button
            type="button"
            className="bogar-cart-back-btn"
            onClick={onBack || (() => onNavigate('home'))}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        {/* The Exact Product Order Details Container - STRICTLY NO PRICE */}
        <div className="bogar-ticket-card" id="bogar-printable-order">
          <div className="bogar-ticket-card__header">
            <LotusLogo size={38} color="#D4B675" />
            <h1 className="bogar-ticket-card__brand">BOGAR</h1>
            <p className="bogar-ticket-card__title">Product Order Details</p>
            <div className="bogar-ticket-card__status-badge">
              <CheckCircle2 size={16} />
              <span>{order.status || 'Confirmed'}</span>
            </div>
          </div>

          <div className="bogar-ticket-card__divider" />

          {/* Details - STRICTLY NO PRICE */}
          <div className="bogar-ticket-card__details">
            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Order ID:</span>
              <strong className="bogar-ticket-value bogar-ticket-value--highlight">
                {order.orderId}
              </strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Product Name:</span>
              <strong className="bogar-ticket-value">{order.productName}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Quantity:</span>
              <strong className="bogar-ticket-value">{order.quantity}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Order Date:</span>
              <strong className="bogar-ticket-value">{order.orderDate}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Phone Number:</span>
              <strong className="bogar-ticket-value">{order.phone}</strong>
            </div>

            <div className="bogar-ticket-row">
              <span className="bogar-ticket-label">Email:</span>
              <strong className="bogar-ticket-value">{order.email}</strong>
            </div>

          {/* Status Display */}
          <div className="bogar-ticket-row">
            <span className="bogar-ticket-label">Order Status:</span>
            <strong className={`bogar-ticket-value ${currentStatus === 'Cancelled' ? 'bogar-order-status-badge--cancelled' : 'bogar-ticket-value--confirmed'}`}>
              {currentStatus}
            </strong>
          </div>
        </div>

        <div className="bogar-ticket-card__divider" />

        {/* Actions: Cancel Order / View Order */}
        <div className="bogar-ticket-card__actions">
          {currentStatus !== 'Cancelled' ? (
            <button
              type="button"
              className="bogar-btn-order-action bogar-btn-order-action--cancel"
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
              onClick={handleCancelOrder}
            >
              <XCircle size={16} />
              <span>Cancel Order</span>
            </button>
          ) : (
            <button
              type="button"
              className="bogar-btn-order-action bogar-btn-order-action--cancelled"
              disabled
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            >
              <XCircle size={16} />
              <span>Order Cancelled</span>
            </button>
          )}

          <button
            type="button"
            className="bogar-btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Print View</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
