import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          <h3>Clayora</h3>
          <p>Crafted with love from earth.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="footer-right">
          <p>© {new Date().getFullYear()} Clayora</p>
          <p>All Rights Reserved</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;