import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: ""
  });

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setForm(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/products/${id}`, form);
      alert("Product Updated");
      navigate("/seller/products");
    } catch (error) {
      alert("Update Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Product</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
      />

      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
      />

      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
      />

      <input
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category"
      />

      <input
        name="stock"
        value={form.stock}
        onChange={handleChange}
        placeholder="Stock"
      />

      <input
        name="image"
        value={form.image}
        onChange={handleChange}
        placeholder="Image URL"
      />

      <button type="submit">Update</button>
    </form>
  );
}

export default EditProduct;
