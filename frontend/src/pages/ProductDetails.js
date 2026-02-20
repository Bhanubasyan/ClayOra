import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import potteryImg from "../assets/pottery1.jpg";
import "./productDetails.css";

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

        <div className="product-image">
        <img src={potteryImg} alt={product.name}
         />
        </div>

        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="price">₹ {product.price}</p>
          <p className="desc">{product.description}</p>

          <div className="quantity-control">
            <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
              -
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>

          <button className="add-btn" onClick={addToCart}>
            Add to Cart
          </button>

          <p className="stock">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;
