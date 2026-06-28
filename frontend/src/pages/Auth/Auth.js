import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Auth.css";

function Auth() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState("buyer");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "seller") navigate("/seller");
      else if (data.role === "admin") navigate("/admin");
      else navigate("/home");

    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "seller") navigate("/seller");
      else if (data.role === "admin") navigate("/admin");
      else navigate("/home");

    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
        <div className="flip-card-inner">

          {/* LOGIN SIDE */}
          <div className="flip-card-front">
            <h2>Login</h2>

            <div className="role-toggle">
              <button
                type="button"
                className={role === "buyer" ? "active" : ""}
                onClick={() => setRole("buyer")}
              >
                Buyer
              </button>
              <button
                type="button"
                className={role === "seller" ? "active" : ""}
                onClick={() => setRole("seller")}
              >
                Seller
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <input name="email" type="email" placeholder="Email" required />
              <input name="password" type="password" placeholder="Password" required />
              <button type="submit">Login</button>
            </form>

            <p>
              Don't have an account?{" "}
              <span className="switch-text" onClick={() => setIsFlipped(true)}>
                Register
              </span>
            </p>
          </div>

          {/* REGISTER SIDE */}
          <div className="flip-card-back">
            <h2>Register</h2>

            <div className="role-toggle">
              <button
                type="button"
                className={role === "buyer" ? "active" : ""}
                onClick={() => setRole("buyer")}
              >
                Buyer
              </button>
              <button
                type="button"
                className={role === "seller" ? "active" : ""}
                onClick={() => setRole("seller")}
              >
                Seller
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <input name="name" type="text" placeholder="Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="password" type="password" placeholder="Password" required />
              <button type="submit">Register</button>
            </form>

            <p>
              Already have an account?{" "}
              <span className="switch-text" onClick={() => setIsFlipped(false)}>
                Login
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Auth;
