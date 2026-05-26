import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface NavProps {
  cartCount: number;
  cartOpen: boolean;
  onCartClick: () => void;
}

function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <span className="v">v</span>
      <span className="dash">--</span>
      <span className="v">v</span>
    </span>
  );
}

function ProductLockup() {
  return (
    <div className="wordmark-lockup">
      <Wordmark size={28} />
      <div className="divider" />
      <div className="lockup-text">
        <span className="lockup-product">Vitals</span>
        <span className="lockup-sub">Health &amp; Nutrition</span>
      </div>
    </div>
  );
}

export function Nav({ cartCount, cartOpen, onCartClick }: NavProps) {
  const cartRef = useRef<HTMLButtonElement>(null);

  // Expose pulse trigger for App to call after adding items
  useEffect(() => {
    const el = cartRef.current;
    if (!el) return;
    el.classList.remove('pulse-once');
    void el.offsetWidth;
    el.classList.add('pulse-once');
  }, [cartCount]);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <ProductLockup />
        <div className="nav-right">
          <button className="nav-profile" aria-label="Profile" type="button">
            <Icon.User size={17} />
          </button>
          <button
            ref={cartRef}
            className={`nav-cart${cartOpen ? ' is-open' : ''}`}
            aria-label={`Cart — ${cartCount} item${cartCount === 1 ? '' : 's'}, ${cartOpen ? 'open' : 'closed'}`}
            aria-pressed={cartOpen}
            onClick={onCartClick}
          >
            <Icon.Cart size={17} />
            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
