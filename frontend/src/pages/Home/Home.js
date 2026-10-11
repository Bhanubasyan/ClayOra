import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import API from "../../services/api";
import "./Home.css";

import image2 from "../../assets/hero/image2.jpg";
import image3 from "../../assets/hero/image3.jpg";
import image4 from "../../assets/hero/image4.jpg";
import image5 from "../../assets/hero/image5.jpg";
import image7 from "../../assets/hero/image7.jpg";
import image8 from "../../assets/hero/image8.jpg";
import image10 from "../../assets/hero/image10.jpg";
import earthEmberBanner from "../../assets/banners/clayora-earth-ember.png";
import festiveGiftingBanner from "../../assets/banners/clayora-festive-gifting.png";

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

function Home() {
  const heroImages = [
    image2,
    image3,
    image4,
    image5,
    image7,
    image8,
    image10,
  ];
const productsSectionRef = useRef(null);
const location = useLocation();
const tag = new URLSearchParams(location.search).get("tag");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  // Interview feature: catalogue filter state provides a richer buying experience without changing existing search.
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", minRating: "", availability: "", sort: "newest" });
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [festivalCampaigns, setFestivalCampaigns] = useState([]);

  const navigate = useNavigate();
  const productRef = useRef([]);

  useEffect(() => {
    API.get("/festivals/active").then(({ data }) => setFestivalCampaigns(data)).catch(() => {});
  }, []);

  /* ================= HERO SLIDER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  /* ================= FETCH PRODUCTS ================= */
  // Previous simple fetch signature: const fetchProducts = useCallback(async (keyword = "", selectedCategory = "") => {
  const fetchProducts = useCallback(async (keyword = "", selectedCategory = "", nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      // Previous simple URL: let url = `/products?keyword=${keyword}`;
      let url = `/products?keyword=${encodeURIComponent(keyword)}&sort=${nextFilters.sort}`;

if (selectedCategory) {
  url += `&category=${selectedCategory}`;
}

if (tag) {
  url += `&tag=${encodeURIComponent(tag)}`;
}

// Interview feature: only include selected filters, preserving the original simple search URL when unused.
if (nextFilters.minPrice) url += `&minPrice=${nextFilters.minPrice}`;
if (nextFilters.maxPrice) url += `&maxPrice=${nextFilters.maxPrice}`;
if (nextFilters.minRating) url += `&minRating=${nextFilters.minRating}`;
if (nextFilters.availability) url += `&availability=${nextFilters.availability}`;

console.log("TAG =", tag);
console.log("URL =", url);

const res = await API.get(url);

console.log("Returned:", res.data.products.length);
setProducts(res.data.products);

    } catch (err) {
      console.log(err);
      setError("Unable to load products. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [tag, filters]);

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
}, [fetchProducts]);

  useEffect(() => {
    API.get("/wishlist")
      .then((res) => setWishlistIds(res.data.map((product) => product._id)))
      .catch(() => setWishlistIds([]));
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

  // Interview feature: applies price, rating, stock, and sorting options in a single customer-friendly control.
  const handleFilterChange = (event) => {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
    fetchProducts(search, category, nextFilters);
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart", {
        productId,
        quantity: 1,
      });
      alert("Added to Cart!");
    } catch (error) {
      // Wishlist feature: distinguish a real expired-login response from an API or server error.
      if (error.response?.status === 401) {
        alert("Please login first");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Unable to update wishlist. Please try again.");
      }
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      if (wishlistIds.includes(productId)) {
        const res = await API.delete(`/wishlist/${productId}`);
        setWishlistIds(res.data.map((product) => product._id));
      } else {
        const res = await API.post("/wishlist", { productId });
        setWishlistIds(res.data.map((product) => product._id));
      }
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

      <section className="clayora-promises" aria-label="ClayOra shopping benefits">
        <div className="promise-item"><span className="promise-icon" aria-hidden="true">&#10022;</span><span><strong>Artisan made</strong><small>Every piece has a maker</small></span></div>
        <div className="promise-divider" aria-hidden="true"></div>
        <div className="promise-item"><span className="promise-icon" aria-hidden="true">&#9671;</span><span><strong>Thoughtfully curated</strong><small>Quality you can feel</small></span></div>
        <div className="promise-divider" aria-hidden="true"></div>
        <div className="promise-item"><span className="promise-icon" aria-hidden="true">&#10227;</span><span><strong>Secure delivery</strong><small>Packed carefully, sent safely</small></span></div>
      </section>

      {festivalCampaigns.map((festivalCampaign) => <section key={festivalCampaign._id} className="home-festival-promo" style={festivalCampaign.heroBanner ? { backgroundImage: `linear-gradient(90deg,rgba(83,27,6,.92),rgba(137,55,8,.52)),url(${festivalCampaign.heroBanner})` } : undefined}><div><span>{festivalCampaign.locationBased ? `LOCATION SALE · ${festivalCampaign.targetZones.map((zone) => zone.city || zone.name).join(", ")}` : "ALL LOCATIONS · SEASONAL SALE"}</span><h2>{festivalCampaign.heroTitle || festivalCampaign.name}</h2><p>{festivalCampaign.description}</p><Link to={`/festival/${festivalCampaign.slug}`}>Explore this sale</Link></div></section>)}


{/* ================= Cateogory section ================= */}
<div className="category-section">
  <div className="category-list">

    {categories.map((item) => (
<Link
  to={`/home?tag=${encodeURIComponent(item.name)}`}
  className="category-item"
  key={item.name}
>
        <div className="category-icon">
          {item.icon}
        </div>

        <span>{item.name}</span>
      </Link>
    ))}

  </div>
</div>


      {/* ================= EDITORIAL COLLECTION BANNERS ================= */}
      <section className="editorial-banners" aria-label="Featured ClayOra collections">
        <article
          className="editorial-banner editorial-banner-earth"
          style={{ backgroundImage: `url(${earthEmberBanner})` }}
        >
          <div className="editorial-copy">
            <span className="editorial-kicker">The artisan edit</span>
            <h2>Earth &amp; Ember</h2>
            <p>Hand-finished forms, natural textures and objects made slowly for soulful spaces.</p>
            <Link to="/home?tag=Pottery">Explore pottery <span aria-hidden="true">&#8594;</span></Link>
          </div>
          <span className="editorial-orbit editorial-orbit-one" aria-hidden="true"></span>
          <span className="editorial-orbit editorial-orbit-two" aria-hidden="true"></span>
        </article>

        <article
          className="editorial-banner editorial-banner-festive"
          style={{ backgroundImage: `url(${festiveGiftingBanner})` }}
        >
          <div className="editorial-copy">
            <span className="editorial-kicker">Celebrate beautifully</span>
            <h2>Gifts with a story</h2>
            <p>Thoughtful keepsakes, festive warmth and handcrafted details for every celebration.</p>
            <Link to="/home?tag=Gifts">Shop festive gifts <span aria-hidden="true">&#8594;</span></Link>
          </div>
          <span className="editorial-spark editorial-spark-one" aria-hidden="true"></span>
          <span className="editorial-spark editorial-spark-two" aria-hidden="true"></span>
          <span className="editorial-spark editorial-spark-three" aria-hidden="true"></span>
        </article>
      </section>


      {/* ================= MAIN CONTENT ================= */}
     <div className="home-container" ref={productsSectionRef}>

        <header className="collection-heading">
          <div><span>Curated for your home</span><h2>Objects with soul</h2></div>
          <p>Discover pieces shaped by skilled hands, honest materials and generations of craft.</p>
        </header>

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
            <option value="">Categories</option>
            <option value="Pottery">Pottery</option>
            <option value="Wood">Wood</option>
          </select>
          <input name="minPrice" type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={handleFilterChange} className="advanced-filter" />
          <input name="maxPrice" type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={handleFilterChange} className="advanced-filter" />
          <select name="minRating" value={filters.minRating} onChange={handleFilterChange} className="advanced-filter">
            <option value="">Any rating</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
          </select>
          <select name="availability" value={filters.availability} onChange={handleFilterChange} className="advanced-filter">
            <option value="">All availability</option>
            <option value="in-stock">In stock</option>
          </select>
          <select name="sort" value={filters.sort} onChange={handleFilterChange} className="advanced-filter">
            <option value="newest">Newest</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="rating">Top rated</option>
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
                  <button
                    className={`wishlist-toggle ${
                      wishlistIds.includes(product._id) ? "saved" : ""
                    }`}
                    onClick={() => toggleWishlist(product._id)}
                    aria-label="Toggle wishlist"
                  >
                    ♥
                  </button>
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
                  <p className="rating-line">
                    ★ {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0})
                  </p>

                  <button onClick={() => addToCart(product._id)}>
                    Add to Cart
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      <section className="craft-story" aria-label="Our craft story">
        <div className="craft-story-pattern" aria-hidden="true">
          <span className="craft-ring craft-ring-one"></span><span className="craft-ring craft-ring-two"></span><span className="craft-vessel">&#9813;</span>
        </div>
        <div className="craft-story-copy">
          <span className="craft-eyebrow">Made by human hands</span>
          <h2>From raw earth<br />to a lasting story.</h2>
          <p>ClayOra celebrates the beautiful irregularities of handmade work—the maker's touch, the natural grain and the small details that make no two pieces exactly alike.</p>
          <div className="craft-numbers"><span><strong>100%</strong><small>handpicked</small></span><span><strong>Local</strong><small>craft stories</small></span><span><strong>Slow</strong><small>made with care</small></span></div>
        </div>
      </section>
    </>
  );
}

export default Home;
