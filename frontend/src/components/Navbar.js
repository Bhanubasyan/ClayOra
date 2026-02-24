import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Logo */}
        <div className="logo-section">
  <Link to="/">
    <img src={logo} alt="Clayora Logo" className="logo-img" />
  </Link>
</div>

        {/* Links */}
        <div className="nav-links">
          <Link className={location.pathname === "/" ? "active" : ""} to="/">Home</Link>
          <Link className={location.pathname === "/cart" ? "active" : ""} to="/cart">Cart</Link>

          {user?.role === "admin" && (
            <Link to="/admin">Admin</Link>
          )}

          {user?.role === "seller" && (
            <Link to="/seller">Seller</Link>
          )}

          {user?.role === "buyer" && (
            <Link to="/profile">Profile</Link>
          )}

          {token ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/auth" className="login-btn">Login</Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;