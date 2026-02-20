import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api";

function SellerProducts() {
  

  const [products, setProducts] = useState([]);
const navigate = useNavigate();
  const fetchProducts = async () => {
    const res = await API.get("/products/my-products");
    setProducts(res.data);
  };

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>My Products</h2>

      {products.map((p) => (
        <div key={p._id}>
          <h4>{p.name}</h4>
          <p>₹ {p.price}</p>
           <button onClick={() => navigate(`/seller/edit-product/${p._id}`)}>
      Edit
    </button>

          <button onClick={() => deleteProduct(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default SellerProducts;
