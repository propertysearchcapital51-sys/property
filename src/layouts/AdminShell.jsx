import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, ExternalLink, FileText, Inbox, KeyRound, LayoutDashboard, LogOut, Menu, Settings2, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/posts", label: "Blog posts", icon: FileText },
  { to: "/admin/content", label: "Site content", icon: Settings2, admin: true },
  { to: "/admin/projects", label: "Projects", icon: Building2, admin: true },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, admin: true },
  { to: "/admin/account", label: "My account", icon: KeyRound },
];

/* Signed-in frame: sidebar + top bar. Redirects to the login page when there is no session. */
export default function AdminShell() {
  const { user, checking, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  if (checking) return <div className="adm-boot"><span className="adm-spinner" /></div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  const items = NAV.filter((n) => !n.admin || user.role === "admin");
  const signOut = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="adm-app">
      <aside className={`adm-sidebar ${open ? "is-open" : ""}`}>
        <Link to="/admin" className="adm-brand">
          <img src="/logo.webp" alt="" />
          <span><strong>PROPERTY SEARCH</strong><small>ADMIN PANEL</small></span>
        </Link>
        <nav aria-label="Admin navigation">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `adm-nav ${isActive ? "is-active" : ""}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer" className="adm-nav"><ExternalLink size={18} /> View website</a>
          <button type="button" className="adm-nav" onClick={signOut}><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      {open && <button type="button" className="adm-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="adm-user">
            <span className="adm-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <div><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrator" : "Editor"}</small></div>
          </div>
        </header>
        <main className="adm-content"><Outlet /></main>
      </div>
    </div>
  );
}
