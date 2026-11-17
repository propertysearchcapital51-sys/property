import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Pencil, PenLine, Trash2 } from "lucide-react";
import { useToast } from "../components/AdminToast";
import { api } from "../services/api";
import { formatDate } from "../services/format";

export default function AdminPosts() {
  const toast = useToast();
  const [posts, setPosts] = useState(null);
  const [tab, setTab] = useState("all");

  const load = () => api.get("/admin/posts").then((d) => setPosts(d.posts)).catch((e) => { toast(e.message, "error"); setPosts([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => (posts || []).filter((p) => tab === "all" || p.status === tab), [posts, tab]);
  const count = (s) => (posts || []).filter((p) => p.status === s).length;

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/posts/${post.id}`);
      toast("Article deleted");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Blog posts</h1><p>Write, edit and publish articles for your website.</p></div>
        <Link to="/admin/posts/new" className="adm-btn adm-btn-primary"><PenLine size={16} /> New article</Link>
      </div>

      <div className="adm-tabs">
        {[["all", "All", (posts || []).length], ["published", "Published", count("published")], ["draft", "Drafts", count("draft")]].map(([key, label, n]) => (
          <button type="button" key={key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>{label} <span>{n}</span></button>
        ))}
      </div>

      <section className="adm-card adm-card-flush">
        {posts === null ? (
          <p className="adm-empty">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="adm-empty">{posts.length === 0 ? "No articles yet. Click “New article” to write your first one." : "Nothing in this view."}</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th /></tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Title"><Link to={`/admin/posts/${p.id}`} className="adm-row-title">{p.title}</Link><small>/blog/{p.slug}</small></td>
                    <td data-label="Category">{p.category}</td>
                    <td data-label="Status"><span className={`adm-badge is-${p.status}`}>{p.status}</span></td>
                    <td data-label="Date">{formatDate(p.status === "published" ? p.publishedAt : p.updatedAt?.slice(0, 10))}</td>
                    <td className="adm-row-actions">
                      <Link to={`/admin/posts/${p.id}`} aria-label="Edit" title="Edit"><Pencil size={16} /></Link>
                      {p.status === "published" && <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" aria-label="View" title="View on site"><ExternalLink size={16} /></a>}
                      <button type="button" onClick={() => remove(p)} aria-label="Delete" title="Delete" className="is-danger"><Trash2 size={16} /></button>
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
