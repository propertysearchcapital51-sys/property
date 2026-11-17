import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { user, checking, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!checking && user) return <Navigate to={location.state?.from || "/admin"} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login-art" aria-hidden="true">
        <img src="/logo.webp" alt="" />
        <h2>Manage your website<br /><em>with confidence.</em></h2>
        <p>Publish articles, update project details and respond to enquiries, all in one place.</p>
      </div>
      <div className="adm-login-panel">
        <form className="adm-login-card" onSubmit={submit} noValidate>
          <span className="adm-lock"><Lock size={20} /></span>
          <h1>Admin sign in</h1>
          <p>Use the account created for you by the site owner.</p>

          {error && <div className="adm-alert" role="alert">{error}</div>}

          <label className="adm-field">
            <span className="adm-label">Email</span>
            <input className="adm-input" type="email" autoComplete="username" autoFocus required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="adm-field">
            <span className="adm-label">Password</span>
            <span className="adm-password">
              <input className="adm-input" type={show ? "text" : "password"} autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
          </label>

          <button className="adm-btn adm-btn-primary adm-btn-block" type="submit" disabled={busy || !form.email || !form.password}>
            {busy ? <><Loader2 size={17} className="adm-spin" /> Signing in...</> : "Sign in"}
          </button>
          <a className="adm-back-link" href="/">Back to website</a>
        </form>
      </div>
    </div>
  );
}
