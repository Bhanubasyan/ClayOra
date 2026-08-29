import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [isVerifying, setIsVerifying] = useState(true);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("This verification link is invalid.");
      setIsVerifying(false);
      return;
    }

    API.get(`/auth/verify-email/${token}`)
      .then((res) => setMessage(res.data.message || "Email verification completed."))
      .catch((err) => setMessage(err.response?.data?.message || "Unable to verify email. Please request a new link."))
      .finally(() => setIsVerifying(false));
  }, [token]);

  return (
    <main className="verify-email-page">
      <section className="verify-email-card">
        <h2>Email verification</h2>
        <p>{message}</p>
        {!isVerifying && <Link to="/auth">Go to login</Link>}
      </section>
    </main>
  );
}

export default VerifyEmail;
