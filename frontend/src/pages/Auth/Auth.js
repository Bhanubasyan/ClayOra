import { useState } from "react";
import API from "../../services/api";
import "./Auth.css";

function Auth() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [role, setRole] = useState("buyer");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const { data } = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      localStorage.removeItem("token");
      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "seller") window.location.assign("/seller");
      else if (data.role === "admin") window.location.assign("/admin");
      else window.location.assign("/home");

    } catch (error) {
      const response = error.response?.data;
      if (response?.needsEmailVerification && window.confirm("Your email is not verified. Send a new verification link?")) {
        try {
          const { data } = await API.post("/auth/resend-verification", { email });
          alert(data.message);
        } catch (resendError) {
          alert(resendError.response?.data?.message || "Unable to resend verification email");
        }
        return;
      }
      alert(response?.message || "Login Failed");
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

      alert(data.message || "Registration successful. Please verify your email.");
      setIsFlipped(false);

    } catch (error) {
      alert(error.response?.data?.message || "Signup Failed");
    }
  };

  const handleForgotPassword = async (e) =>{
 e.preventDefault();
 const email = e.target.email.value;
 try{
  setForgotLoading(true);
  setForgotMessage("");
  const {data} = await API.post("/auth/forgot-password", {email});
  setForgotMessage(data.message || "If an account exists, a reset link has been sent.");
 }catch(error){
  setForgotMessage(error.response?.data?.message || "Unable to send the reset link. Please try again.");
 }finally{
  setForgotLoading(false);
 }
  };
  return (
    <div className="auth-container">
      <div className={`flip-card ${isFlipped ? "flipped" : ""} ${isForgot ? "forgot" : ""}`}>
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

            <p
              className="switch-text"
              onClick={() => {
                setIsForgot(true);
                setIsFlipped(false);
              }}
            >
              Forgot Password?
            </p>

            <p>
              Don't have an account?{" "}
              <span className="switch-text" onClick={() => setIsFlipped(true)}>
                Register
              </span>
            </p>
          </div>

          {/* Forgot Password*/}
             <div className="flip-card-upward">
              <h2>Forgot Password</h2>

            <form onSubmit={handleForgotPassword}>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />

            <button type="submit" disabled={forgotLoading}>{forgotLoading ? "Sending..." : "Send Reset Link"}</button>
            </form>

            {forgotMessage && <p className="forgot-message" role="status">{forgotMessage}</p>}

            <p className="switch-text" onClick={() => setIsForgot(false)}>
              Back to Login
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
