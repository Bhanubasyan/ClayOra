import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

import image2 from "../assets/hero/image2.jpg";
import image3 from "../assets/hero/image3.jpg";
import image4 from "../assets/hero/image4.jpg";
import image5 from "../assets/hero/image5.jpg";

import image7 from "../assets/hero/image7.jpg";
import image8 from "../assets/hero/image8.jpg";
import image9 from "../assets/hero/image10.jpg";

import {
  FaHome,
  FaGift,
  FaLightbulb,
  FaCouch,
  FaPaintBrush,
} from "react-icons/fa";

import {
  GiFlowerPot,
  GiWoodPile,
  GiCandleHolder,
  GiAmphora,
} from "react-icons/gi";

import { MdKitchen } from "react-icons/md";
import { PiWallBold } from "react-icons/pi";
import { TbJewishStar } from "react-icons/tb";

function Home() {
  const heroImages = [
    image2,
    image3,
    image4,
    image5,
    image7,
    image8,
    image9,
  ];
const productsSectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const productRef = useRef([]);

  /* ================= HERO SLIDER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (keyword = "", selectedCategory = "") => {
    try {
      setLoading(true);
      setError("");

      let url = `/products?keyword=${keyword}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const res = await API.get(url);
      setProducts(res.data.products);

    } catch (err) {
      console.log(err);
      setError("Unable to load products. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

const categories = [
  { name: "Home Decor", icon: <FaHome /> },
  { name: "Wall Decor", icon: <PiWallBold /> },
  { name: "Pottery", icon: "🏺" },
  { name: "Wooden Crafts", icon: <GiWoodPile /> },
  { name: "Kitchen", icon: <MdKitchen /> },
  { name: "Planters", icon: <GiFlowerPot /> },
  { name: "Vases", icon: <GiAmphora /> },
  { name: "Candles", icon: <GiCandleHolder /> },
  { name: "Jewelry", icon: "💍" },
  { name: "Furniture", icon: <FaCouch /> },
  { name: "Artwork", icon: <FaPaintBrush /> },
  { name: "Textile", icon: "🧶" },
  { name: "Gifts", icon: <FaGift /> },
  { name: "Festival", icon: "🎉" },
  { name: "Spiritual", icon: "🪔" },
  { name: "Lighting", icon: <FaLightbulb /> },
];

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= SCROLL ANIMATION ================= */
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    productRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [products, loading]);

  /* ================= HANDLERS ================= */
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, category);
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    fetchProducts(search, selected);
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart", {
        productId,
        quantity: 1,
      });
      alert("Added to Cart!");
    } catch (error) {
      alert("Please login first");
      navigate("/login");
    }
  };


  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="home-hero">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`hero-slide ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Crafted from Earth, Made for You</h1>
          <p>Discover timeless handmade pottery by Clayora artisans.</p>
          <button
            onClick={() =>
              productsSectionRef.current?.scrollIntoView({
      behavior: "smooth"
    })
            }
          >
            Explore Collection
          </button>
        </div>
      </section>


{/* ================= Cateogory section ================= */}
<div className="category-section">
  <div className="category-list">

    {categories.map((item) => (
      <div className="category-item" key={item.name}>
        <div className="category-icon">
          {item.icon}
        </div>

        <span>{item.name}</span>
      </div>
    ))}

  </div>
</div>


      {/* ================= MAIN CONTENT ================= */}
     <div className="home-container" ref={productsSectionRef}>

        {/* SEARCH + FILTER */}
        <div className="filter-section">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search pottery..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-dropdown"
          >
            <option value="">All Categories</option>
            <option value="Pottery">Pottery</option>
            <option value="Wood">Wood</option>
          </select>
        </div>

        {/* PRODUCTS GRID */}
        <div className="products-grid">

          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
                <div className="product-card skeleton" key={index}>
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-btn"></div>
                </div>
              ))
          ) : error ? (
            <p className="products-message">{error}</p>
          ) : products.length === 0 ? (
            <p className="products-message">No approved products available yet.</p>
          ) : (
            products.map((product, index) => (
                <div
                  className="product-card show"
                  key={product._id}
                  ref={(el) => (productRef.current[index] = el)}
                >
                  <Link
                    to={`/product/${product._id}`}
                    className="product-link"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                    <h3>{product.name}</h3>
                  </Link>

                  <p className="price">Rs. {product.price}</p>

                  <button onClick={() => addToCart(product._id)}>
                    Add to Cart
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
