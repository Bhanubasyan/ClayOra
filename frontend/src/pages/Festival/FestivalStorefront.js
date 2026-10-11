import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";
import DeliveryLocationSelector, { getSavedDeliveryLocation } from "../../components/delivery/DeliveryLocationSelector";
import { animateToCart } from "../../components/animation/cartMotion";
import "./FestivalStorefront.css";

function FestivalProductCard({ product, addToCart }) {
  const price = product.discountPrice ?? product.price;
  return <article className="festival-product-card">
    <Link to={`/product/${product._id}`}><img src={product.image} alt={product.name} loading="lazy" /></Link>
    <div className="festival-product-content">
      <span className="festival-product-category">{product.festivalCategory}</span>
      <Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link>
      <p className="festival-seller">{product.seller?.businessName || product.seller?.name || "Local seller"}</p>
      {product.vratFriendly && <span className="vrat-badge">Seller-declared vrat friendly</span>}
      <div className="festival-product-bottom"><strong>₹{product.variants?.[0]?.price ?? price}</strong>{product.discountPrice != null && <del>₹{product.price}</del>}<button onClick={(event) => addToCart(product._id, product.variants?.[0]?._id, event.currentTarget)}>Add</button></div>
    </div>
  </article>;
}

function FestivalStorefront() {
  const { slug = "navratri" } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [location, setLocation] = useState(getSavedDeliveryLocation());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saleAreaUnavailable, setSaleAreaUnavailable] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const campaignResponse = await API.get(`/festivals/${slug}`);
        setCampaign(campaignResponse.data);
        const targetZoneIds = campaignResponse.data.targetZones.map((zone) => zone._id);
        const outsideSaleArea = campaignResponse.data.locationBased && location?.serviceable && !targetZoneIds.includes(location.zone._id);
        setSaleAreaUnavailable(outsideSaleArea);
        if (outsideSaleArea) { setProducts([]); return; }
        const params = { festival: slug, availability: "in-stock", limit: 60 };
        if (campaignResponse.data.locationBased && location?.serviceable) params.zoneId = location.zone._id;
        if (selectedCategory) params.festivalCategory = selectedCategory;
        const productResponse = await API.get("/products", { params });
        setProducts(productResponse.data.products);
      } catch (requestError) { setError(requestError.response?.data?.message || "Unable to load this festival store"); }
      finally { setLoading(false); }
    };
    load();
  }, [slug, location?.serviceable, location?.zone?._id, selectedCategory]);

  const grouped = useMemo(() => ({
    vrat: products.filter((product) => product.festivalCategory && campaign?.categories.find((c) => c.slug === product.festivalCategory)?.group === "vrat"),
    puja: products.filter((product) => campaign?.categories.find((c) => c.slug === product.festivalCategory)?.group === "puja"),
    combo: products.filter((product) => product.isFestivalCombo || campaign?.categories.find((c) => c.slug === product.festivalCategory)?.group === "combo"),
  }), [products, campaign]);

  const addToCart = async (productId, variantId, source) => {
    try { await API.post("/cart", { productId, quantity: 1, variantId }); animateToCart(source); }
    catch (requestError) { alert(requestError.response?.data?.message || "Please log in to add this product"); }
  };

  if (error) return <main className="festival-empty"><h1>Festival store unavailable</h1><p>{error}</p><Link to="/home">Return to Clayora</Link></main>;

  const section = (title, subtitle, items) => items.length > 0 && <section className="festival-section"><div className="festival-heading"><div><span>CURATED LOCALLY</span><h2>{title}</h2><p>{subtitle}</p></div></div><div className="festival-products">{items.map((product) => <FestivalProductCard key={product._id} product={product} addToCart={addToCart} />)}</div></section>;

  return <main className="festival-store">
    <section className="festival-hero" style={campaign?.heroBanner ? { backgroundImage: `linear-gradient(90deg,rgba(60,22,3,.88),rgba(120,51,8,.38)),url(${campaign.heroBanner})` } : undefined}>
      <div className="festival-hero-content"><p className="festival-kicker">A CLAYORA FESTIVAL EDIT</p><h1>{campaign?.heroTitle || campaign?.name || "Navratri Special"}</h1><p>{campaign?.description || "Vrat essentials and puja samagri, delivered by approved local sellers."}</p><div className="festival-actions"><button onClick={() => setSelectedCategory(campaign?.categories.find((c) => c.group === "vrat")?.slug || "")}>Shop Vrat Essentials</button><button className="outline" onClick={() => setSelectedCategory(campaign?.categories.find((c) => c.group === "puja")?.slug || "")}>Shop Puja Samagri</button></div>{campaign?.offerText && <div className="festival-offer">{campaign.offerText}</div>}</div>
    </section>
    {campaign?.locationBased ? <div className="festival-location"><DeliveryLocationSelector onChange={setLocation} />{location && !location.serviceable && <p>This sale is available only in its selected delivery areas.</p>}</div> : <div className="festival-location"><strong>Available in all locations</strong><p>This sale does not require a delivery-zone selection.</p></div>}
    {campaign?.categories?.length > 0 && <section className="festival-categories"><button className={!selectedCategory ? "active" : ""} onClick={() => setSelectedCategory("")}>All</button>{campaign.categories.map((category) => <button className={selectedCategory === category.slug ? "active" : ""} key={category.slug} onClick={() => setSelectedCategory(category.slug)}><span>{category.group === "vrat" ? "◌" : category.group === "puja" ? "✦" : "❖"}</span>{category.name}</button>)}</section>}
    {loading ? <div className="festival-products festival-loading">{Array.from({ length: 8 }).map((_, i) => <div key={i} />)}</div> : saleAreaUnavailable ? <section className="festival-notice"><h2>This sale is not running in your area</h2><p>Select one of the areas assigned to this sale by the administrator.</p></section> : campaign?.locationBased && !location?.serviceable ? <section className="festival-notice"><h2>Tell us where to deliver</h2><p>Products are shown after a sale delivery area is confirmed.</p></section> : products.length === 0 ? <section className="festival-notice"><h2>No eligible products yet</h2><p>Approved sellers are still preparing this collection.</p></section> : <>{section("Vrat Essentials", "Ingredients vary by tradition. Please verify every label for your fasting practice.", grouped.vrat)}{section("Puja Samagri", "Everything for a thoughtful celebration, sourced from approved sellers.", grouped.puja)}{section("Festival Combo Kits", "Convenient bundles assembled and priced by real Clayora sellers.", grouped.combo)}{selectedCategory && section("Selected collection", "Products included in this sale.", products.filter((p) => ![...grouped.vrat,...grouped.puja,...grouped.combo].some((x) => x._id === p._id)))}</>}
    {campaign?.featuredSellers?.length > 0 && <section className="festival-sellers"><span>MEET YOUR MAKERS & MERCHANTS</span><h2>Featured local sellers</h2><div>{campaign.featuredSellers.map((seller) => <article key={seller._id}><div>{(seller.businessName || seller.name).charAt(0)}</div><h3>{seller.businessName || seller.name}</h3><p>Approved Clayora seller</p></article>)}</div></section>}
  </main>;
}

export default FestivalStorefront;
