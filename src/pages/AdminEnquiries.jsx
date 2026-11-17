import { useEffect, useMemo, useState } from "react";
import { Download, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useToast } from "../components/AdminToast";
import { api } from "../services/api";
import { formatDateTime } from "../services/format";

const waLink = (phone) => `https://wa.me/${phone.replace(/\D/g, "").length === 10 ? "91" : ""}${phone.replace(/\D/g, "")}`;

export default function AdminEnquiries() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = () => api.get("/admin/enquiries").then((d) => setRows(d.enquiries)).catch((e) => { toast(e.message, "error"); setRows([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => (rows || []).filter((r) => filter === "all" || r.status === filter), [rows, filter]);
  const count = (s) => (rows || []).filter((r) => r.status === s).length;

  const setStatus = async (row, status) => {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, status } : r)));
    try { await api.patch(`/admin/enquiries/${row.id}`, { status }); } catch (e) { toast(e.message, "error"); load(); }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete the enquiry from ${row.name}?`)) return;
    try { await api.del(`/admin/enquiries/${row.id}`); toast("Enquiry deleted"); load(); } catch (e) { toast(e.message, "error"); }
  };

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["Date", "Name", "Phone", "Property", "Message", "Status", "Page"].map(esc).join(",")]
      .concat(shown.map((r) => [r.created_at, r.name, r.phone, r.property, r.message, r.status, r.source].map(esc).join(",")));
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `enquiries-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Enquiries</h1><p>Leads submitted through the forms on your website.</p></div>
        <button type="button" className="adm-btn adm-btn-light" onClick={exportCsv} disabled={!shown.length}><Download size={16} /> Export CSV</button>
      </div>

      <div className="adm-tabs">
        {[["all", "All", (rows || []).length], ["new", "New", count("new")], ["contacted", "Contacted", count("contacted")], ["closed", "Closed", count("closed")]].map(([key, label, n]) => (
          <button type="button" key={key} className={filter === key ? "is-active" : ""} onClick={() => setFilter(key)}>{label} <span>{n}</span></button>
        ))}
      </div>

      <section className="adm-card adm-card-flush">
        {rows === null ? <p className="adm-empty">Loading...</p> : shown.length === 0 ? (
          <p className="adm-empty">No enquiries here yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Contact</th><th>Interested in</th><th>Message</th><th>Received</th><th>Status</th><th /></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Contact"><strong>{r.name}</strong><small>{r.phone}</small></td>
                    <td data-label="Interested in">{r.property || "·"}</td>
                    <td data-label="Message" className="adm-msg">{r.message || "·"}</td>
                    <td data-label="Received">{formatDateTime(r.created_at)}</td>
                    <td data-label="Status">
                      <select className={`adm-select is-${r.status}`} value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                        <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="adm-row-actions">
                      <a href={`tel:${r.phone}`} aria-label="Call" title="Call"><Phone size={16} /></a>
                      <a href={waLink(r.phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp"><MessageCircle size={16} /></a>
                      <button type="button" onClick={() => remove(r)} aria-label="Delete" title="Delete" className="is-danger"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
