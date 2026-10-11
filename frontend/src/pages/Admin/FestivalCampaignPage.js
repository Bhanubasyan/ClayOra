import { Link } from "react-router-dom";
import AdminFestivalManager from "./AdminFestivalManager";
import "./Admin.css";

function FestivalCampaignPage() {
  return <main className="festival-admin-page">
    <div className="festival-admin-toolbar">
      <Link to="/admin" className="admin-back-link"><span aria-hidden="true">←</span> Admin Dashboard</Link>
      <div className="festival-admin-status"><span></span> Campaign controls</div>
    </div>
    <AdminFestivalManager />
  </main>;
}

export default FestivalCampaignPage;
