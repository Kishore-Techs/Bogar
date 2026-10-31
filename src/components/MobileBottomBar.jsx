import React from 'react';
import { Home, Coffee, Shirt, Disc } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function MobileBottomBar({ activePage, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'poojas', label: 'Poojas', isLotus: true },
    { id: 'tea-food', label: 'Beverages', icon: Coffee },
    { id: 'thuni', label: 'Clothes', icon: Shirt },
    { id: 'chains', label: 'Chains', icon: Disc },
  ];

  return (
    <nav className="bogar-mobile-bottom-bar" aria-label="Mobile Bottom Navigation">
      <div className="bogar-mobile-bottom-bar__inner">
        {items.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`bogar-mobile-bottom-bar__btn ${isActive ? 'bogar-mobile-bottom-bar__btn--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
            >
              <div className="bogar-mobile-bottom-bar__icon-wrapper">
                {item.isLotus ? (
                  <LotusLogo size={20} color={isActive ? '#D4B675' : '#8B6A3F'} />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span className="bogar-mobile-bottom-bar__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
