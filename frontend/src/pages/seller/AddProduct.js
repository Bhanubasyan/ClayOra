import { useState } from "react";
import API from "../../services/api";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/products", form);
    alert("Product Added");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="price" placeholder="Price" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="stock" placeholder="Stock" onChange={handleChange} />
      <input name="image" placeholder="Image URL" onChange={handleChange} />

      <button type="submit">Add</button>
    </form>
  );
}

export default AddProduct;
