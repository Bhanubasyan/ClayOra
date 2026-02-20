import { useEffect, useState } from "react";
import API from "../services/api";
import "./admin.css";
import potteryImg from "../assets/pottery1.jpg";
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: ""
  });

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createProduct = async (e) => {
    e.preventDefault();
    await API.post("/products", form);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: ""
    });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      {/* Create Product Form */}
      <form className="admin-form" onSubmit={createProduct}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
        <button type="submit">Create Product</button>
      </form>

      {/* Product List */}
      <div className="admin-products">
        {products.map((product) => (
          <div className="admin-product-card" key={product._id}>
            <img src={potteryImg} alt={product.name} />
            <div>
              <h4>{product.name}</h4>
              <p>₹ {product.price}</p>
            </div>
            <button onClick={() => deleteProduct(product._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
