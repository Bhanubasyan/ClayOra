import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DeliveryLocationSelector, { getSavedDeliveryLocation } from "../../components/delivery/DeliveryLocationSelector";
import "./Checkout.css";

const emptyDeliveryAddress = { recipientName: "", phone: "", alternatePhone: "", addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", postalCode: "", country: "India" };

function Checkout() {
  const [cart, setCart] = useState(null);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [addressMode, setAddressMode] = useState("saved");
  const [deliveryAddress, setDeliveryAddress] = useState(emptyDeliveryAddress);
  const [deliveryLocation, setDeliveryLocation] = useState(getSavedDeliveryLocation());
  const navigate = useNavigate();

  const cartFestivalTags = new Set(cart?.items?.flatMap((item) => item.product.festivalTags || []) || []);
  const locationRequired = activeCampaigns.some((campaign) => campaign.locationBased && cartFestivalTags.has(campaign.slug));

  useEffect(() => {
    API.get("/cart").then((response) => setCart(response.data)).catch(() => {});
    API.get("/festivals/active").then((response) => setActiveCampaigns(response.data)).catch(() => {});
    API.get("/auth/profile").then(({ data }) => setDeliveryAddress({ recipientName: data.name || "", phone: data.phone || "", alternatePhone: data.alternatePhone || "", addressLine1: data.addressLine1 || data.address || "", addressLine2: data.addressLine2 || "", landmark: data.landmark || "", city: data.city || "", state: data.state || "", postalCode: data.postalCode || "", country: data.country || "India" })).catch(() => {});
  }, []);

  useEffect(() => {
    if (locationRequired && deliveryLocation?.zone && !deliveryLocation.zone.codEnabled && paymentMethod === "COD") setPaymentMethod("Razorpay");
  }, [deliveryLocation, locationRequired, paymentMethod]);

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const locationPayload = locationRequired ? { latitude: deliveryLocation?.latitude, longitude: deliveryLocation?.longitude, zoneId: deliveryLocation?.zone?._id } : undefined;
  const placeCodOrder = async () => {
    const { data } = await API.post("/orders", { paymentMethod: "COD", deliveryAddress, deliveryLocation: locationPayload });
    navigate("/success", { state: { orderId: data._id } });
  };
  const placeRazorpayOrder = async () => {
    if (!await loadRazorpay()) throw new Error("Unable to load Razorpay checkout");
    const { data } = await API.post("/payments/razorpay-order", { deliveryAddress, deliveryLocation: locationPayload });
    const user = JSON.parse(localStorage.getItem("user")) || {};
    new window.Razorpay({ key: data.key, amount: data.razorpayOrder.amount, currency: data.razorpayOrder.currency, name: "Clayora", description: "Marketplace order", order_id: data.razorpayOrder.id, prefill: { name: user.name, email: user.email }, handler: async (response) => { try { await API.post("/payments/verify", response); navigate("/success"); } catch (error) { alert(error.response?.data?.message || "Payment verification failed. Contact support before retrying."); } }, modal: { ondismiss: () => alert("Payment was not completed. Your cart is unchanged.") }, theme: { color: "#a94817" } }).open();
  };
  const placeOrder = async () => {
    if (locationRequired && !deliveryLocation?.serviceable) return alert("This sale is location-based. Select a supported delivery location first.");
    try {
      setPlacing(true);
      if (paymentMethod === "Razorpay") await placeRazorpayOrder(); else await placeCodOrder();
    } catch (error) { alert(error.response?.data?.message || error.message || "Order failed"); }
    finally { setPlacing(false); }
  };

  if (!cart?.items?.length) return <div className="checkout-container"><h2>Your cart is empty</h2></div>;
  const itemPrice = (item) => (item.variantId ? item.product.variants?.find((entry) => entry._id === item.variantId)?.price : null) ?? item.product.discountPrice ?? item.product.price;
  const subtotal = cart.items.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  const deliveryFee = locationRequired ? deliveryLocation?.zone?.deliveryFee || 0 : 0;

  return <div className="checkout-container">
    <h2 className="checkout-title">Secure checkout</h2>
    {locationRequired && <div className="checkout-location"><h3>Confirm sale delivery area</h3><DeliveryLocationSelector onChange={setDeliveryLocation}/><p>This cart contains a location-based sale product. Availability is verified again when the order is placed.</p></div>}
    <div className="checkout-layout">
      <div className="checkout-items">{cart.items.map((item) => <div className="checkout-item" key={item.product._id}><div className="checkout-item-left"><img src={item.product.image} alt={item.product.name}/></div><div className="checkout-item-middle"><h4>{item.product.name}</h4>{item.variantName && <small>{item.variantName}</small>}<p>{item.quantity} × ₹{itemPrice(item)}</p></div><div className="checkout-item-right">₹{itemPrice(item) * item.quantity}</div></div>)}</div>
      <div className="checkout-summary"><h3>Order Summary</h3><p>Subtotal <strong>₹{subtotal}</strong></p><p>Delivery <strong>₹{deliveryFee}</strong></p><p className="summary-total">Total: ₹{subtotal + deliveryFee}</p>{locationRequired && <p className="delivery-estimate">Estimated delivery: {deliveryLocation?.zone?.estimatedDeliveryTime || "Select a location"}</p>}
        <div className="delivery-address-section"><h3>Delivery address</h3><label><input type="radio" name="addressMode" checked={addressMode === "saved"} onChange={() => setAddressMode("saved")}/> Use saved profile address</label><label><input type="radio" name="addressMode" checked={addressMode === "new"} onChange={() => setAddressMode("new")}/> Enter a different address</label>{addressMode === "saved" ? <p className="saved-address">{deliveryAddress.recipientName}<br/>{deliveryAddress.phone}<br/>{deliveryAddress.addressLine1}, {deliveryAddress.addressLine2}<br/>{deliveryAddress.city}, {deliveryAddress.state} – {deliveryAddress.postalCode}</p> : <div className="delivery-address-form">{Object.keys(emptyDeliveryAddress).map((field) => <input key={field} name={field} value={deliveryAddress[field]} onChange={(event) => setDeliveryAddress((current) => ({ ...current, [event.target.name]: event.target.value }))} placeholder={field.replace(/([A-Z])/g, " $1")} required={["recipientName", "phone", "addressLine1", "city", "state", "postalCode", "country"].includes(field)}/>)}</div>}</div>
        <div className="payment-options">{(!locationRequired || deliveryLocation?.zone?.codEnabled) && <label><input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={(event) => setPaymentMethod(event.target.value)}/> Cash on Delivery</label>}<label><input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === "Razorpay"} onChange={(event) => setPaymentMethod(event.target.value)}/> Razorpay</label></div>
        <button className="place-order-btn" onClick={placeOrder} disabled={placing || (locationRequired && !deliveryLocation?.serviceable)}>{placing ? "Processing..." : "Place Order"}</button>
      </div>
    </div>
  </div>;
}

export default Checkout;
