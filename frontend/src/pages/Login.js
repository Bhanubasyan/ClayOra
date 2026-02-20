import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      alert("Login Successful!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
