import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Inbox, PenLine, Settings2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { formatDateTime } from "../services/format";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const isAdmin = user.role === "admin";

  useEffect(() => {
    api.get("/admin/stats").then(setStats).catch(() => setStats({}));
  }, []);

  const cards = [
    { label: "Published articles", value: stats?.published, icon: FileText, to: "/admin/posts" },
    { label: "Draft articles", value: stats?.drafts, icon: PenLine, to: "/admin/posts" },
    ...(isAdmin
      ? [
          { label: "New enquiries", value: stats?.newEnquiries, icon: Inbox, to: "/admin/enquiries", hot: stats?.newEnquiries > 0 },
          { label: "Total enquiries", value: stats?.totalEnquiries, icon: Inbox, to: "/admin/enquiries" },
        ]
      : []),
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Here is what is happening on your website.</p>
        </div>
        <Link to="/admin/posts/new" className="adm-btn adm-btn-primary"><PenLine size={16} /> Write new article</Link>
      </div>

      <div className="adm-stats">
        {cards.map(({ label, value, icon: Icon, to, hot }) => (
          <Link to={to} key={label} className={`adm-stat ${hot ? "is-hot" : ""}`}>
            <span className="adm-stat-icon"><Icon size={20} /></span>
            <strong>{value ?? "·"}</strong>
            <small>{label}</small>
          </Link>
        ))}
      </div>

      <div className="adm-grid-2">
        {isAdmin && (
          <section className="adm-card">
            <div className="adm-card-head"><h2>Latest enquiries</h2><Link to="/admin/enquiries">View all <ArrowUpRight size={14} /></Link></div>
            {stats?.recent?.length ? (
              <ul className="adm-list">
                {stats.recent.map((e) => (
                  <li key={e.id}>
                    <div><strong>{e.name}</strong><small>{e.property || "General enquiry"} · {e.phone}</small></div>
                    <span className={`adm-badge is-${e.status}`}>{e.status}</span>
                    <time>{formatDateTime(e.created_at)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="adm-empty">Enquiries from your website forms will appear here.</p>
            )}
          </section>
        )}

        <section className="adm-card">
          <div className="adm-card-head"><h2>Quick actions</h2></div>
          <div className="adm-actions-grid">
            <Link to="/admin/posts/new" className="adm-action"><PenLine size={20} /><strong>Write an article</strong><small>Create a new blog post</small></Link>
            {isAdmin && <Link to="/admin/content" className="adm-action"><Settings2 size={20} /><strong>Edit site content</strong><small>Contact details, hero, FAQs and more</small></Link>}
            {isAdmin && <Link to="/admin/projects" className="adm-action"><FileText size={20} /><strong>Manage projects</strong><small>Photos, locations and highlights</small></Link>}
          </div>
        </section>
      </div>
    </>
  );
}
