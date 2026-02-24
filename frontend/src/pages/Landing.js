import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true); // start fade out
    }, 5000);

    const timer2 = setTimeout(() => {
      navigate("/home");
    }, 5800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate]);

  return (
    <div className={`landing-container ${fadeOut ? "fade-out" : ""}`}>
      <h3 className="welcome">WELCOME TO</h3>

      <h1 className="brand">
        <span className="c">C</span>
        <span className="l">l</span>
        <span className="a">a</span>
        <span className="y">y</span>
        <span className="o">o</span>
        <span className="r">r</span>
        <span className="a2">a</span>
      </h1>

      <p className="tagline">Where clay meets elegance.</p>
    </div>
  );
}

export default Landing;