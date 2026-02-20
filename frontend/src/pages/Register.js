import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      alert("Signup Successful!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="container">
      <h2>Signup</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

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

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
