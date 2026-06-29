import { useState } from "react";
import API from "../../services/api";
import "./seller.css";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    tags: [],
    stock: "",
    image: null,
  });

const tags = [
  "Home Decor",
  "Wall Decor",
  "Wooden Crafts",
  "Kitchen",
  "Planters",
  "Vases",
  "Candles",
  "Jewelry",
  "Furniture",
  "Artwork",
  "Textile",
  "Gifts",
  "Festival",
  "Spiritual",
  "Lighting",
];

  const handleTagChange = (tag) => {
  setForm((prev) => ({
    ...prev,
    tags: prev.tags.includes(tag)
      ? prev.tags.filter((t) => t !== tag)
      : [...prev.tags, tag],
  }));
};


  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
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
    formData.append("tags", JSON.stringify(form.tags));
    formData.append("stock", form.stock);
    formData.append("image", form.image);

    try {
      await API.post("/products", formData);
      alert("Product Added Successfully");

      // Reset form after success
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null,
      });

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error adding product");
    }
  };


  
  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2 className="add-title">Add New Product</h2>

        <form onSubmit={handleSubmit} className="add-product-form">

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

 {/*Tags dropdown*/}
          <div className="tags-container">
  <label>Select Tags</label>

  <div className="tags-grid">
    {tags.map((tag) => (
      <label
  key={tag}
  className={`tag-item ${form.tags.includes(tag) ? "active-tag" : ""}`}
>
        <input
          type="checkbox"
          checked={form.tags.includes(tag)}
          onChange={() => handleTagChange(tag)}
        />
        {tag}
      </label>
    ))}
  </div>
</div>

          {/* CATEGORY DROPDOWN (Matches Backend Enum) */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Pottery">Pottery</option>
            <option value="Wood">Wood</option>
          </select>

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <label className="file-label">
            Upload Product Image
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="primary-btn">
            Add Product
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddProduct;