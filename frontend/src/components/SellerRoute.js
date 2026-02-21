import { Navigate } from "react-router-dom";

const SellerRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "seller") {
    return <Navigate to="/" />;
  }

  return children;
};

export default SellerRoute;