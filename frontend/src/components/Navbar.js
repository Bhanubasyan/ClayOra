import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  return (
    <div className="navbar">
      <h2>CraftRoots</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>

        {token ? (
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </button>
        ) : (
           <>
   <Link to="/auth">Login</Link>
   <Link to="/profile">Profile</Link>

  </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
