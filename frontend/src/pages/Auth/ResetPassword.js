import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";
import API from "../../services/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get("token");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill both password fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!token) {
      alert("Invalid reset link");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post(`/auth/reset-password/${token}`, {
        token,
        password,
      });

      alert(data.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Reset failed");
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2>Reset Password</h2>

        <form className="reset-password-form" onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;