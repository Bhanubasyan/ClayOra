import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import potteryImg from "../assets/pottery1.jpg";
import "./Home.css";
function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

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
    <div className="container">
      <h1>Handmade Products</h1>

      {/* 🔍 SEARCH + FILTER SECTION */}
      <div className="filter-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
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

      {/* PRODUCTS */}
      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <Link to={`/product/${product._id}`} className="product-link">
              <img
                src={potteryImg}
                alt={product.name}
              />
              <h3>{product.name}</h3>
            </Link>

            <p>₹ {product.price}</p>

            <button onClick={() => addToCart(product._id)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
