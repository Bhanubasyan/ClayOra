import { useEffect, useState } from "react";
import API from "../../services/api";

const emptyProfile = {
  name: "",
  email: "",
  businessName: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function SellerProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/auth/profile")
      .then(({ data }) => setProfile({ ...emptyProfile, ...data, addressLine1: data.addressLine1 || data.address || "" }))
      .catch(() => alert("Unable to load seller profile"))
      .finally(() => setLoading(false));
  }, []);

  const changeField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const { data } = await API.put("/auth/profile", profile);
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...data }));
      setProfile((current) => ({ ...current, ...data }));
      alert("Seller profile saved successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save seller profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading seller profile...</p>;

  return (
    <section className="seller-profile-card">
      <div className="seller-profile-heading">
        <div>
          <p>Seller Account</p>
          <h2>Store Profile</h2>
          <span>Keep your business and pickup contact details up to date.</span>
        </div>
        <div className="seller-profile-avatar">{profile.name?.charAt(0)?.toUpperCase()}</div>
      </div>

      <form className="seller-profile-form" onSubmit={saveProfile}>
        <label>
          Your name
          <input name="name" value={profile.name} disabled />
        </label>
        <label>
          Email address
          <input name="email" value={profile.email} disabled />
        </label>
        <label className="seller-profile-full">
          Business / store name
          <input name="businessName" value={profile.businessName} onChange={changeField} placeholder="Your store name" />
        </label>
        <label>
          Mobile number *
          <input name="phone" value={profile.phone} onChange={changeField} required />
        </label>
        <label>
          Alternate mobile
          <input name="alternatePhone" value={profile.alternatePhone} onChange={changeField} />
        </label>
        <label className="seller-profile-full">
          Address line 1 *
          <input name="addressLine1" value={profile.addressLine1} onChange={changeField} required />
        </label>
        <label className="seller-profile-full">
          Address line 2
          <input name="addressLine2" value={profile.addressLine2} onChange={changeField} />
        </label>
        <label>
          Landmark
          <input name="landmark" value={profile.landmark} onChange={changeField} />
        </label>
        <label>
          City *
          <input name="city" value={profile.city} onChange={changeField} required />
        </label>
        <label>
          State *
          <input name="state" value={profile.state} onChange={changeField} required />
        </label>
        <label>
          PIN code *
          <input name="postalCode" value={profile.postalCode} onChange={changeField} required />
        </label>
        <label className="seller-profile-full">
          Country *
          <input name="country" value={profile.country} onChange={changeField} required />
        </label>
        <div className="seller-profile-full">
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SellerProfile;
