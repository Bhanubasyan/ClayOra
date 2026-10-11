import { useEffect, useState } from "react";
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
    festivalTags: [], festivalCategory: "", vratFriendly: false, ingredients: "", brand: "", quantity: "", unit: "", discountPrice: "", expiryDate: "", applicableDeliveryZones: [], isFestivalCombo: false, variantsText: "",
  });
  const [campaigns, setCampaigns] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    Promise.all([API.get("/festivals/seller/catalog"), API.get("/delivery-zones")]).then(([campaignResult, zoneResult]) => { setCampaigns(campaignResult.data); setZones(zoneResult.data); }).catch(() => {});
  }, []);

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
    ["festivalTags", "applicableDeliveryZones"].forEach((field) => formData.append(field, JSON.stringify(form[field])));
    formData.append("ingredients", JSON.stringify(form.ingredients.split(",").map((item) => item.trim()).filter(Boolean)));
    const variants = form.variantsText.split("\n").map((line) => { const [name, price, stock, sku = ""] = line.split("|").map((part) => part.trim()); return name ? { name, price: Number(price), stock: Number(stock), sku } : null; }).filter(Boolean);
    formData.append("variants", JSON.stringify(variants));
    ["festivalCategory", "vratFriendly", "brand", "quantity", "unit", "discountPrice", "expiryDate", "isFestivalCombo"].forEach((field) => formData.append(field, form[field]));

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
        festivalTags: [], festivalCategory: "", vratFriendly: false, ingredients: "", brand: "", quantity: "", unit: "", discountPrice: "", expiryDate: "", applicableDeliveryZones: [], isFestivalCombo: false, variantsText: "",
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

          <fieldset className="festival-product-fields"><legend>Festival & local delivery</legend>
            <label>Festival campaigns<select multiple value={form.festivalTags} onChange={(e) => setForm({ ...form, festivalTags: [...e.target.selectedOptions].map((o) => o.value) })}>{campaigns.map((campaign) => <option key={campaign._id} value={campaign.slug}>{campaign.name}</option>)}</select></label>
            <label>Festival category<select value={form.festivalCategory} onChange={(e) => setForm({ ...form, festivalCategory: e.target.value })}><option value="">Not a festival product</option>{campaigns.flatMap((campaign) => campaign.categories || []).map((category) => <option key={`${category.group}-${category.slug}`} value={category.slug}>{category.name}</option>)}</select></label>
            <label>Delivery zones<select multiple value={form.applicableDeliveryZones} onChange={(e) => setForm({ ...form, applicableDeliveryZones: [...e.target.selectedOptions].map((o) => o.value) })}>{zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select></label>
            <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange}/><input name="ingredients" placeholder="Ingredients, comma separated" value={form.ingredients} onChange={handleChange}/>
            <div className="seller-coordinate-row"><input name="quantity" type="number" step="any" placeholder="Pack quantity" value={form.quantity} onChange={handleChange}/><input name="unit" placeholder="Unit (g, kg, ml, pcs)" value={form.unit} onChange={handleChange}/></div>
            <input name="discountPrice" type="number" min="0" placeholder="Seasonal price (optional)" value={form.discountPrice} onChange={handleChange}/><input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange}/>
            <label>Variants (one per line: Name | Price | Stock | SKU)<textarea name="variantsText" rows="4" value={form.variantsText} onChange={handleChange} placeholder={"500 g | 120 | 20 | SAB-500\n1 kg | 220 | 10 | SAB-1KG"}/></label>
            <label className="seller-check"><input type="checkbox" checked={form.vratFriendly} onChange={(e) => setForm({ ...form, vratFriendly: e.target.checked })}/> I explicitly declare this product vrat-friendly based on its ingredients</label>
            <label className="seller-check"><input type="checkbox" checked={form.isFestivalCombo} onChange={(e) => setForm({ ...form, isFestivalCombo: e.target.checked })}/> This is a seller-created combo pack</label>
            <p className="field-note">Customers are reminded that fasting practices vary and to verify ingredients.</p>
          </fieldset>

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
            <option value="Vrat Food Essentials">Vrat Food Essentials</option>
            <option value="Puja Samagri">Puja Samagri</option>
            <option value="Festival Combo">Festival Combo</option>
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
