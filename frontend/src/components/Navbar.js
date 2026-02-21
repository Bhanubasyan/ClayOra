import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="navbar">
      <h2>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          CraftRoots
        </Link>
      </h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>

        {/* 🔥 Role Based Links */}
        {user?.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {user?.role === "seller" && (
          <Link to="/seller">Seller</Link>
        )}

        {user?.role === "buyer" && (
          <Link to="/profile">Profile</Link>
        )}

        {/* 🔐 Auth Buttons */}
        {token ? (
          <button onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/auth">Login</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;