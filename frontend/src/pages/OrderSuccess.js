import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./success.css";

function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-container">
      <div className="success-card">
        <h1>🎉 Order Placed Successfully!</h1>
        <p>Thank you for shopping with us.</p>
        <p>You will be redirected to homepage shortly.</p>

        <button onClick={() => navigate("/")}>
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
