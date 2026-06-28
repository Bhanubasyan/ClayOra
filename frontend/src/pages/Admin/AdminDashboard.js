import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Admin.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null
  });

  const fetchProducts = async () => {
    try {
      setError("");
      const res = await API.get("/products/admin/all");
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
      setError("Unable to load products. Make sure you are logged in as admin.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();

    if (!form.image) {
      alert("Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    formData.append("image", form.image);

    await API.post("/products", formData);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null
    });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const approveProduct = async (id) => {
    await API.put(`/products/${id}/approve`);
    fetchProducts();
  };

  const unapproveProduct = async (id) => {
    await API.put(`/products/${id}/unapprove`);
    fetchProducts();
  };

return (
  <div className="admin-container">

    <h2 className="admin-title">Admin Dashboard</h2>

    {/* CREATE PRODUCT */}
    <div className="admin-form-card">
      <h3>Add New Product</h3>

      <form className="admin-form" onSubmit={createProduct}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Pottery">Pottery</option>
          <option value="Wood">Wood</option>
        </select>
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <input name="image" type="file" accept="image/*" onChange={handleChange} />
        <button type="submit" className="primary-btn">
          Create Product
        </button>
      </form>
    </div>

    {/* PRODUCT LIST */}
    <div className="admin-products-section">
      <h3>All Products</h3>

      <div className="admin-products">
        {error ? (
          <p>{error}</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
          <div className="admin-product-card" key={product._id}>

            <img src={product.image} alt={product.name} />

            <div className="admin-product-info">
              <h4>{product.name}</h4>
              <p>Rs. {product.price}</p>
              <p>{product.isApproved ? "Approved" : "Pending approval"}</p>
            </div>

            {product.isApproved ? (
              <button
                className="primary-btn"
                onClick={() => unapproveProduct(product._id)}
              >
                Unapprove
              </button>
            ) : (
              <button
                className="primary-btn"
                onClick={() => approveProduct(product._id)}
              >
                Approve
              </button>
            )}

            <button
              className="delete-btn"
              onClick={() => deleteProduct(product._id)}
            >
              Delete
            </button>

          </div>
          ))
        )}
      </div>
    </div>

  </div>
);
}

export default AdminDashboard;
