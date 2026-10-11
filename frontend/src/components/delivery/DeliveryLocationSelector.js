import { useEffect, useState } from "react";
import API from "../../services/api";
import "./DeliveryLocationSelector.css";

export const LOCATION_KEY = "clayoraDeliveryLocation";
export const getSavedDeliveryLocation = () => {
  try { return JSON.parse(localStorage.getItem(LOCATION_KEY)); } catch { return null; }
};

function DeliveryLocationSelector({ compact = false, onChange }) {
  const [location, setLocation] = useState(getSavedDeliveryLocation());
  const [manual, setManual] = useState({ address: "", latitude: "", longitude: "" });
  const [open, setOpen] = useState(!location && !compact);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");

  const check = async (candidate) => {
    setStatus("Checking delivery availability...");
    try {
      const { data } = await API.post("/delivery-zones/check", candidate);
      const saved = { ...candidate, serviceable: data.serviceable, zone: data.zone || null, distanceKm: data.distanceKm };
      localStorage.setItem(LOCATION_KEY, JSON.stringify(saved));
      setLocation(saved);
      setStatus(data.serviceable ? `Delivering from ${data.zone.name}` : data.message);
      onChange?.(saved);
      if (data.serviceable) setOpen(false);
    } catch (error) { setStatus(error.response?.data?.message || "Unable to check this location"); }
  };

  const useGps = () => {
    if (!navigator.geolocation) return setStatus("Location access is not supported on this device.");
    setStatus("Waiting for location permission...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = Number(coords.latitude.toFixed(6));
        const longitude = Number(coords.longitude.toFixed(6));
        check({ latitude, longitude, address: `Current location (${latitude}, ${longitude})`, source: "gps" });
      },
      () => setStatus("Location permission was denied. Enter coordinates from your map pin instead."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const submitManual = (event) => {
    event.preventDefault();
    check({ ...manual, latitude: Number(manual.latitude), longitude: Number(manual.longitude) });
  };

  const notifyMe = async () => {
    try {
      await API.post("/delivery-zones/notify", { ...location, email });
      setStatus("Thanks — we will let you know when Clayora reaches your area.");
    } catch (error) { setStatus(error.response?.data?.message || "Please enter a valid email."); }
  };

  useEffect(() => { onChange?.(location); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`location-selector ${compact ? "compact" : ""}`}>
      <button className="location-trigger" type="button" onClick={() => setOpen(!open)}>
        <span aria-hidden="true">⌖</span> {location ? (location.serviceable ? `${location.zone.name} · ${location.address || "Selected location"}` : location.address || `${location.latitude}, ${location.longitude}`) : "Select delivery location"}
      </button>
      {open && (
        <div className="location-panel">
          <div className="location-panel-head"><strong>Where should we deliver?</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close">×</button></div>
          {location && <div className="selected-location-preview"><span aria-hidden="true">●</span><div><strong>{location.source === "gps" ? "Your current location" : "Selected location"}</strong><small>{location.address || `${location.latitude}, ${location.longitude}`}</small><small>Latitude {location.latitude} · Longitude {location.longitude}</small></div></div>}
          <button type="button" className="gps-button" onClick={useGps}>Use my current location</button>
          <div className="location-divider"><span>or enter a map pin</span></div>
          <form onSubmit={submitManual}>
            <input value={manual.address} onChange={(e) => setManual({ ...manual, address: e.target.value })} placeholder="Address label (optional)" />
            <div className="coordinate-row">
              <input type="number" step="any" required value={manual.latitude} onChange={(e) => setManual({ ...manual, latitude: e.target.value })} placeholder="Latitude" />
              <input type="number" step="any" required value={manual.longitude} onChange={(e) => setManual({ ...manual, longitude: e.target.value })} placeholder="Longitude" />
            </div>
            <button type="submit" className="check-location">Check availability</button>
          </form>
          {status && <p className={`location-status ${location && !location.serviceable ? "unavailable" : ""}`}>{status}</p>}
          {location && !location.serviceable && (
            <div className="notify-form"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for launch updates" /><button type="button" onClick={notifyMe}>Notify me</button></div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryLocationSelector;
