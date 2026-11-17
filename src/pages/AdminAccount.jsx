import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { TextField } from "../components/AdminFields";
import { useToast } from "../components/AdminToast";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AdminAccount() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.next !== form.confirm) return setError("The new passwords don't match.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current: form.current, next: form.next });
      setForm({ current: "", next: "", confirm: "" });
      toast("Password updated");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="adm-page-head"><div><h1>My account</h1><p>Signed in as {user.email}</p></div></div>
      <section className="adm-card adm-narrow">
        <div className="adm-card-head"><h2><ShieldCheck size={19} /> Change password</h2></div>
        <form className="adm-form" onSubmit={submit}>
          {error && <div className="adm-alert" role="alert">{error}</div>}
          <TextField label="Current password" type="password" autoComplete="current-password" value={form.current} onChange={(v) => setForm({ ...form, current: v })} />
          <TextField label="New password" type="password" autoComplete="new-password" value={form.next} onChange={(v) => setForm({ ...form, next: v })} hint="At least 10 characters, with letters and numbers." />
          <TextField label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} />
          <div className="adm-save-bar">
            <span />
            <button className="adm-btn adm-btn-primary" type="submit" disabled={busy || !form.current || !form.next}>
              {busy ? <Loader2 size={16} className="adm-spin" /> : null} Update password
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
