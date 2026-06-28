import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./ProductDetails.css";
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const addToCart = async () => {
    try {
      await API.post("/cart", {
        productId: product._id,
        quantity,
      });

      alert("Added to Cart!");
      navigate("/cart");
    } catch (error) {
      alert("Please login first");
      navigate("/auth");
    }
  };

  if (!product) return <h2>Loading...</h2>;

 return (
  <div className="product-detail-container">
    <div className="product-detail-card">

      {/* IMAGE SECTION */}
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      {/* INFO SECTION */}
      <div className="product-info">
        <h2 className="product-title">{product.name}</h2>

        <p className="price">Rs. {product.price}</p>

        <p className="desc">{product.description}</p>

        {/* Quantity */}
        <div className="quantity-control">
          <button
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <button
          className="add-btn"
          onClick={addToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>

        {/* Stock Status */}
        <p
          className={
            product.stock > 0 ? "stock in-stock" : "stock out-stock"
          }
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

      </div>
    </div>
  </div>
);
}

export default ProductDetails;
