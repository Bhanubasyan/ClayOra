import { useState } from "react";
import API from "../../services/api";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,   // 👈 image file
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] }); // 👈 file store
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("description", form.description);
  formData.append("price", form.price);
  formData.append("category", form.category);
  formData.append("stock", form.stock);

  if (form.image) {
    formData.append("image", form.image);
  }

  try {
    await API.post("/products", formData);   // ❌ NO HEADERS HERE
    alert("Product Added");
  } catch (error) {
    console.log(error.response?.data);
    alert("Error adding product");
  }
};
  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="price" placeholder="Price" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="stock" placeholder="Stock" onChange={handleChange} />

      {/* 🔥 FILE INPUT */}
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
      />

      <button type="submit">Add</button>
    </form>
  );
}

export default AddProduct;