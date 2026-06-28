import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
     role,
      });

      // Correct storage key
      localStorage.setItem("user", JSON.stringify(data));

      alert("Login Successful!");

      if (data.role === "admin") {
  window.location.href = "/admin";
} else if (data.role === "seller") {
  window.location.href = "/seller";
} else {
  window.location.href = "/home";
}

    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="container">

      <div style={{ marginBottom: "15px" }}>
        <button
          type="button"
          onClick={() => setRole("buyer")}
          style={{
            background: role === "buyer" ? "green" : "gray",
            color: "white",
            marginRight: "10px",
            padding: "8px 12px"
          }}
        >
          Login as Buyer
        </button>

        <button
          type="button"
          onClick={() => setRole("seller")}
          style={{
            background: role === "seller" ? "green" : "gray",
            color: "white",
            padding: "8px 12px"
          }}
        >
          Login as Seller
        </button>
      </div>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
