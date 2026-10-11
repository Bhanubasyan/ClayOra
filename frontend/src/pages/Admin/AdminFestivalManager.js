import { useEffect, useState } from "react";
import API from "../../services/api";

const defaultCategories = [
  ["Sabudana", "sabudana", "vrat"], ["Kuttu ka Atta", "kuttu-atta", "vrat"], ["Singhare ka Atta", "singhare-atta", "vrat"], ["Samak ke Chawal", "samak-rice", "vrat"], ["Sendha Namak", "sendha-namak", "vrat"], ["Makhana", "makhana", "vrat"], ["Dry Fruits", "dry-fruits", "vrat"], ["Fasting Snacks", "fasting-snacks", "vrat"],
  ["Diya", "diya", "puja"], ["Cotton Batti", "cotton-batti", "puja"], ["Agarbatti & Dhoop", "incense", "puja"], ["Kapoor", "kapoor", "puja"], ["Kalash", "kalash", "puja"], ["Chunri", "chunri", "puja"], ["Puja Thali", "puja-thali", "puja"], ["Flowers & Garlands", "flowers", "puja"],
  ["Vrat Essentials Kit", "vrat-kit", "combo"], ["Navratri Puja Kit", "puja-kit", "combo"], ["Family Fasting Pack", "family-fasting-pack", "combo"],
].map(([name, slug, group]) => ({ name, slug, group }));

const emptyZone = { name: "Clayora Noida Zone 1", city: "Noida", latitude: "", longitude: "", radiusKm: 3, deliveryFee: 0, minimumOrderAmount: 0, estimatedDeliveryTime: "Same day", codEnabled: false, active: true };
const emptyCampaign = { name: "Sharad Navratri 2026", slug: "navratri", description: "Vrat essentials and puja samagri delivered locally.", heroTitle: "Navratri Special — Vrat Essentials & Puja Samagri Delivered Locally", heroBanner: "", startDate: "2026-10-11", endDate: "2026-10-20", timezone: "Asia/Kolkata", active: false, locationBased: false, targetZones: [], categories: defaultCategories, offerText: "", discountPercent: 0 };

function AdminFestivalManager() {
  const [zones, setZones] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [zone, setZone] = useState(emptyZone);
  const [campaign, setCampaign] = useState(emptyCampaign);
  const [message, setMessage] = useState("");
  const [participation, setParticipation] = useState([]);
  const [zoneRequests, setZoneRequests] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [editingCampaignId, setEditingCampaignId] = useState("");

  const load = async () => {
    try {
      const [zoneResult, campaignResult, participationResult, zoneRequestResult] = await Promise.all([API.get("/delivery-zones/admin/all"), API.get("/festivals/admin/all"), API.get("/festivals/admin/participation"), API.get("/seller/admin/zone-requests")]);
      setZones(zoneResult.data); setCampaigns(campaignResult.data); setParticipation(participationResult.data); setZoneRequests(zoneRequestResult.data);
    } catch (error) { setMessage(error.response?.data?.message || "Unable to load campaign settings"); }
  };
  useEffect(() => { load(); }, []);

  const createZone = async (event) => {
    event.preventDefault();
    try { await API.post("/delivery-zones", zone); setZone(emptyZone); setMessage("Delivery zone created."); load(); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to create zone"); }
  };
  const createCampaign = async (event) => {
    event.preventDefault();
    try { if (editingCampaignId) await API.patch(`/festivals/admin/${editingCampaignId}`, campaign); else await API.post("/festivals/admin", campaign); setCampaign(emptyCampaign); setEditingCampaignId(""); setMessage(editingCampaignId ? "Festival campaign updated." : "Festival campaign created."); load(); }
    catch (error) { setMessage(error.response?.data?.message || "Unable to create campaign"); }
  };
  const toggleCampaign = async (item) => { await API.patch(`/festivals/admin/${item._id}`, { active: !item.active }); load(); };
  const toggleZone = async (item) => { await API.patch(`/delivery-zones/${item._id}`, { active: !item.active }); load(); };
  const uploadBanner = async (file) => { const data = new FormData(); data.append("image", file); try { const result = await API.post("/festivals/admin/banner", data); setCampaign((current) => ({ ...current, heroBanner: result.data.url })); setMessage("Banner uploaded."); } catch (error) { setMessage(error.response?.data?.message || "Banner upload failed"); } };
  const reviewCampaign = async (sellerId, campaignId, status) => { await API.patch(`/festivals/admin/${campaignId}/sellers/${sellerId}`, { status }); load(); };
  const reviewZone = async (sellerId, zoneId, approved) => { await API.patch(`/seller/admin/${sellerId}/delivery-zones/${zoneId}`, { approved }); load(); };
  const loadAnalytics = async (campaignId) => { const { data } = await API.get(`/festivals/admin/${campaignId}/analytics`); setAnalytics((current) => ({ ...current, [campaignId]: data })); };
  const editCampaign = (item) => { setEditingCampaignId(item._id); setCampaign({ ...emptyCampaign, ...item, startDate: new Date(item.startDate).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }), endDate: new Date(item.endDate).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }), targetZones: item.targetZones.map((zone) => zone._id || zone), categories: item.categories || [] }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <section className="campaign-manager">
    <div className="campaign-manager-head"><div><span>OPERATIONS</span><h2>Festival Campaign Management</h2><p>Configure locations and seasonal collections without a code release.</p></div></div>
    {message && <p className="admin-message">{message}</p>}
    {editingCampaignId && <p className="admin-message">Editing an existing campaign. Submitting the campaign form will save changes. <button type="button" onClick={() => { setEditingCampaignId(""); setCampaign(emptyCampaign); }}>Cancel edit</button></p>}
    <label className="campaign-category-editor">Campaign categories (one per line: group | display name | slug)<textarea rows="8" value={campaign.categories.map((item) => `${item.group} | ${item.name} | ${item.slug}`).join("\n")} onChange={(event) => setCampaign({ ...campaign, categories: event.target.value.split("\n").map((line) => { const [group, name, slug] = line.split("|").map((part) => part.trim()); return group && name && slug ? { group, name, slug } : null; }).filter(Boolean) })}/></label>
    <label className="admin-checkbox sale-location-toggle"><input type="checkbox" checked={campaign.locationBased} onChange={(event) => setCampaign({ ...campaign, locationBased: event.target.checked, targetZones: event.target.checked ? campaign.targetZones : [] })}/> Make this sale location-based</label>
    <p className="field-note">Off: sale is available everywhere and location selection is optional. On: select one or more delivery zones in the campaign form.</p>
    <div className="campaign-admin-grid">
      <form className="admin-form-card campaign-form" onSubmit={createZone}><h3>Create delivery zone</h3><input required placeholder="Zone name" value={zone.name} onChange={(e) => setZone({ ...zone, name: e.target.value })}/><input required placeholder="City" value={zone.city} onChange={(e) => setZone({ ...zone, city: e.target.value })}/><div className="admin-form-row"><input required type="number" step="any" placeholder="Latitude" value={zone.latitude} onChange={(e) => setZone({ ...zone, latitude: e.target.value })}/><input required type="number" step="any" placeholder="Longitude" value={zone.longitude} onChange={(e) => setZone({ ...zone, longitude: e.target.value })}/></div><div className="admin-form-row"><input required type="number" step="0.1" placeholder="Radius km" value={zone.radiusKm} onChange={(e) => setZone({ ...zone, radiusKm: e.target.value })}/><input type="number" placeholder="Delivery fee" value={zone.deliveryFee} onChange={(e) => setZone({ ...zone, deliveryFee: e.target.value })}/></div><input type="number" placeholder="Minimum order" value={zone.minimumOrderAmount} onChange={(e) => setZone({ ...zone, minimumOrderAmount: e.target.value })}/><input placeholder="Estimated delivery time" value={zone.estimatedDeliveryTime} onChange={(e) => setZone({ ...zone, estimatedDeliveryTime: e.target.value })}/><label className="admin-checkbox"><input type="checkbox" checked={zone.codEnabled} onChange={(e) => setZone({ ...zone, codEnabled: e.target.checked })}/> Enable COD</label><button className="primary-btn">Create zone</button></form>
      <form className="admin-form-card campaign-form" onSubmit={createCampaign}><h3>Create campaign</h3><input required placeholder="Campaign name" value={campaign.name} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}/><input required placeholder="URL slug" value={campaign.slug} onChange={(e) => setCampaign({ ...campaign, slug: e.target.value })}/><textarea placeholder="Description" value={campaign.description} onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}/><input placeholder="Hero title" value={campaign.heroTitle} onChange={(e) => setCampaign({ ...campaign, heroTitle: e.target.value })}/><input placeholder="Hero banner image URL" value={campaign.heroBanner} onChange={(e) => setCampaign({ ...campaign, heroBanner: e.target.value })}/><label>Or upload with existing image storage<input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadBanner(e.target.files[0])}/></label><div className="admin-form-row"><label>Starts<input required type="date" value={campaign.startDate} onChange={(e) => setCampaign({ ...campaign, startDate: e.target.value })}/></label><label>Ends<input required type="date" value={campaign.endDate} onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}/></label></div><select multiple value={campaign.targetZones} onChange={(e) => setCampaign({ ...campaign, targetZones: [...e.target.selectedOptions].map((o) => o.value) })}>{zones.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><input placeholder="Offer text" value={campaign.offerText} onChange={(e) => setCampaign({ ...campaign, offerText: e.target.value })}/><label className="admin-checkbox"><input type="checkbox" checked={campaign.active} onChange={(e) => setCampaign({ ...campaign, active: e.target.checked })}/> Activate now</label><p className="field-note">Includes {campaign.categories.length} database-backed starter categories. You can edit them later through the campaign API.</p><button className="primary-btn">Create campaign</button></form>
    </div>
    <div className="admin-config-list"><h3>Configured delivery zones</h3>{zones.map((item) => <div key={item._id}><span><strong>{item.name}</strong><small>{item.city} · {item.radiusKm} km · ₹{item.deliveryFee} delivery</small></span><button onClick={() => toggleZone(item)}>{item.active ? "Deactivate" : "Activate"}</button></div>)}</div>
    <div className="admin-config-list"><h3>Festival campaigns</h3>{campaigns.map((item) => <div key={item._id}><span><strong>{item.name}</strong><small>{new Date(item.startDate).toLocaleDateString("en-IN")} – {new Date(item.endDate).toLocaleDateString("en-IN")} · {item.timezone}</small><small>{item.locationBased ? `Location sale · ${item.targetZones.map((zone) => zone.name || zone).join(", ")}` : "All locations"}</small>{analytics[item._id] && <small>{analytics[item._id].orders} orders · {analytics[item._id].unitsSold} units · ₹{analytics[item._id].sales} sales</small>}</span><span className="admin-actions"><button onClick={() => loadAnalytics(item._id)}>Analytics</button><button onClick={() => toggleCampaign(item)}>{item.active ? "Deactivate" : "Activate"}</button></span></div>)}</div>
    <div className="admin-config-list"><h3>Seller zone requests</h3>{zoneRequests.flatMap((seller) => seller.requestedDeliveryZones.map((item) => <div key={`${seller._id}-${item._id}`}><span><strong>{seller.businessName || seller.name}</strong><small>{item.name}</small></span><span className="admin-actions"><button onClick={() => reviewZone(seller._id, item._id, true)}>Approve</button><button onClick={() => reviewZone(seller._id, item._id, false)}>Reject</button></span></div>))}</div>
    <div className="admin-config-list"><h3>Festival participation requests</h3>{participation.flatMap((seller) => seller.festivalParticipation.filter((item) => item.status === "pending" && item.campaign).map((item) => <div key={`${seller._id}-${item.campaign._id}`}><span><strong>{seller.businessName || seller.name}</strong><small>{item.campaign.name}</small></span><span className="admin-actions"><button onClick={() => reviewCampaign(seller._id, item.campaign._id, "approved")}>Approve</button><button onClick={() => reviewCampaign(seller._id, item.campaign._id, "rejected")}>Reject</button></span></div>))}</div>
    <div className="admin-config-list"><h3>Edit campaign settings</h3>{campaigns.map((item) => <div key={`edit-${item._id}`}><span><strong>{item.name}</strong><small>Dates, banner, zones, offer and active status are editable.</small></span><button onClick={() => editCampaign(item)}>Edit</button></div>)}</div>
  </section>;
}

export default AdminFestivalManager;
