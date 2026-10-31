import React from 'react';
import { useBogar } from '../context/BogarContext';
import { ArrowLeft, Eye, Calendar, Package } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function MyBookingsOrdersView({
  onNavigate,
  onViewTicket,
  onViewOrder,
}) {
  const { bookings, orders } = useBogar();

  const hasBookings = bookings && bookings.length > 0;
  const hasOrders = orders && orders.length > 0;

  return (
    <div className="bogar-bookings-page">
      <div className="bogar-bookings-page__container">
        <button
          type="button"
          className="bogar-cart-back-btn"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="bogar-bookings-page__header">
          <LotusLogo size={32} color="#D4B675" />
          <h1 className="bogar-bookings-page__title">My Bookings / Orders</h1>
          <p className="bogar-bookings-page__subtitle">
            View your separate Special Pooja tickets and Product orders
          </p>
        </div>

        {!hasBookings && !hasOrders ? (
          <div className="bogar-empty-state">
            <p className="bogar-empty-state__title">No bookings or orders found.</p>
            <p className="bogar-empty-state__desc">
              You haven't made any Special Pooja bookings or product orders yet.
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
          <div className="bogar-bookings-grid">
            {/* 1. Special Pooja Section (Shown only if user has bookings) */}
            {hasBookings && (
              <div className="bogar-records-card">
                <div className="bogar-records-card__header">
                  <Calendar size={20} color="#D4B675" />
                  <h2 className="bogar-records-card__title">Special Pooja</h2>
                </div>

                <div className="bogar-records-list">
                  {bookings.map((booking) => (
                    <div key={booking.ticketId} className="bogar-record-item">
                      <div className="bogar-record-item__info">
                        <span className="bogar-record-id">{booking.ticketId}</span>
                        <h3 className="bogar-record-name">{booking.poojaName}</h3>
                        <p className="bogar-record-detail">Devotee: {booking.devoteeName}</p>
                        <p className="bogar-record-detail">Date: {booking.date} ({booking.timeSlot})</p>
                      </div>

                      <button
                        type="button"
                        className="bogar-btn-record"
                        onClick={() => onViewTicket(booking)}
                        aria-label={`View Ticket ${booking.ticketId}`}
                      >
                        <Eye size={14} />
                        <span>View Ticket</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Product Orders Section (Shown only if user has orders) */}
            {hasOrders && (
              <div className="bogar-records-card">
                <div className="bogar-records-card__header">
                  <Package size={20} color="#D4B675" />
                  <h2 className="bogar-records-card__title">Product Orders</h2>
                </div>

                <div className="bogar-records-list">
                  {orders.map((order) => (
                    <div key={order.orderId} className="bogar-record-item">
                      <div className="bogar-record-item__info">
                        <span className="bogar-record-id">{order.orderId}</span>
                        <h3 className="bogar-record-name">{order.productName}</h3>
                        <p className="bogar-record-detail">Quantity: {order.quantity}</p>
                        <p className="bogar-record-detail">Ordered: {order.orderDate}</p>
                      </div>

                      <button
                        type="button"
                        className="bogar-btn-record"
                        onClick={() => onViewOrder(order)}
                        aria-label={`View Order ${order.orderId}`}
                      >
                        <Eye size={14} />
                        <span>View Order</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
