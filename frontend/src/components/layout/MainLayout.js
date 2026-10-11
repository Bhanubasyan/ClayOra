import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import "../animation/motion.css";

function MainLayout() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main key={location.pathname} className="motion-page"><Outlet /></main>
      <Footer />
    </>
  );
}

export default MainLayout;
