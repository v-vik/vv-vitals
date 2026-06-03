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
        <span className="lockup-sub">Day Plan</span>
      </div>
    </div>
  );
}

function todayLabel() {
  return new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <ProductLockup />
        <span className="nav-date">{todayLabel()}</span>
        <div className="nav-right" />
      </div>
    </nav>
  );
}

export default Nav;
