import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import API from "../../services/api";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartBump, setCartBump] = useState(false);

  // Read user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return undefined;
    API.get("/cart").then(({ data }) => setCartCount(data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)).catch(() => {});
    const added = () => {
      setCartCount((count) => count + 1);
      setCartBump(false);
      requestAnimationFrame(() => setCartBump(true));
      setTimeout(() => setCartBump(false), 550);
    };
    window.addEventListener("clayora:cart-added", added);
    return () => window.removeEventListener("clayora:cart-added", added);
  }, [user, location.pathname]);

  /* ===== Scroll Effect ===== */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">

        {/* Logo */}
        <div className="logo-section">
          <Link to="/">
            <img src={logo} alt="Clayora Logo" className="logo-img" />
          </Link>
        </div>

        {/* Hamburger */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Links */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>

          <Link
            onClick={() => setMenuOpen(false)}
            className={location.pathname === "/home" ? "active" : ""}
            to="/home"
          >
            Home
          </Link>
          <Link onClick={() => setMenuOpen(false)} className={location.pathname.startsWith("/festival/") ? "active" : ""} to="/festival/navratri">Navratri</Link>

          <Link
            onClick={() => setMenuOpen(false)}
            className={location.pathname === "/cart" ? "active" : ""}
            to="/cart"
            data-cart-link
          >
            Cart <span className={`nav-cart-count ${cartBump ? "bump" : ""}`}>{cartCount}</span>
          </Link>

          {user && (
            <Link
              onClick={() => setMenuOpen(false)}
              className={location.pathname === "/wishlist" ? "active" : ""}
              to="/wishlist"
            >
              Wishlist
            </Link>
          )}

          {user && (
            <Link
              onClick={() => setMenuOpen(false)}
              className={location.pathname === "/track-order" ? "active" : ""}
              to="/track-order"
            >
              Track Order
            </Link>
          )}

          {user?.role === "admin" && (
            <Link onClick={() => setMenuOpen(false)} to="/admin">
              Admin
            </Link>
          )}

          {user?.role === "seller" && (
            <Link onClick={() => setMenuOpen(false)} to="/seller">
              Seller
            </Link>
          )}

          {user?.role === "buyer" && (
            <Link onClick={() => setMenuOpen(false)} to="/profile">
              Profile
            </Link>
          )}

          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link
              onClick={() => setMenuOpen(false)}
              to="/auth"
              className="login-btn"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
