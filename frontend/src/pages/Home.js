import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Home.css";

const heroImages = [
  "https://images.unsplash.com/photo-1605210052777-4f4c9c9c56c3",
  "https://images.unsplash.com/photo-1586864387789-628af9feed72",
  "https://images.unsplash.com/photo-1576020799627-aeac74d58064",
  "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e",
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
  "https://images.unsplash.com/photo-1603787081207-362bcef7c144",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
  "https://images.unsplash.com/photo-1581783898377-1c85bf937427"
];

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [current, setCurrent] = useState(0);

  const navigate = useNavigate();

  // ✅ STEP 2 — IMAGE PRELOAD YAHAN LIKH
  
   // slider interval wala useEffect neeche rahega
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((prev) => (prev + 1) % heroImages.length);
  }, 5000); // thoda slow for luxury feel

  return () => clearInterval(interval);
}, []);


  const fetchProducts = async (keyword = "", selectedCategory = "") => {
    try {
      let url = `/products?keyword=${keyword}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      const res = await API.get(url);
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      {/* HERO SECTION FULL WIDTH */}
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
        window.scrollTo({ top: 800, behavior: "smooth" })
      }
    >
      Explore Collection
    </button>
  </div>
</section>
      {/* MAIN CONTENT */}
      <div className="home-container">
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
          {products.map((product) => (
            <div className="product-card" key={product._id}>
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

              <p className="price">₹ {product.price}</p>

              <button onClick={() => addToCart(product._id)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;