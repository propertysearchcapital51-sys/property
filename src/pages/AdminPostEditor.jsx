import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Save, Send } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import { AreaField, Field, ImageField, TextField } from "../components/AdminFields";
import { useToast } from "../components/AdminToast";
import { api } from "../services/api";

const EMPTY = {
  title: "", slug: "", excerpt: "", contentHtml: "", coverImage: "", category: "General",
  tagsText: "", author: "Property Search Capital", status: "draft", seoTitle: "", seoDescription: "",
};

const slugify = (v) => v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function AdminPostEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState("");
  const [dirty, setDirty] = useState(false);
  const [categories, setCategories] = useState([]);
  const slugTouched = useRef(!isNew);

  useEffect(() => {
    api.get("/admin/posts").then((d) => setCategories([...new Set(d.posts.map((p) => p.category))])).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/admin/posts/${id}`)
      .then(({ post }) => {
        setForm({ ...EMPTY, ...post, tagsText: post.tags.join(", ") });
        setLoading(false);
      })
      .catch((e) => { toast(e.message, "error"); navigate("/admin/posts", { replace: true }); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (value) => {
    setDirty(true);
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !slugTouched.current) next.slug = slugify(value);
      return next;
    });
  };

  /* Warn before closing / reloading the tab with unsaved work. */
  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (status) => {
    setSaving(status);
    const payload = {
      ...form,
      status,
      tags: form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      const result = isNew ? await api.post("/admin/posts", payload) : await api.put(`/admin/posts/${id}`, payload);
      setDirty(false);
      setForm({ ...EMPTY, ...result.post, tagsText: result.post.tags.join(", ") });
      toast(status === "published" ? "Article published" : "Draft saved");
      if (isNew) navigate(`/admin/posts/${result.post.id}`, { replace: true });
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving("");
    }
  };

  const isPublished = form.status === "published" && !isNew;
  const tags = useMemo(() => form.tagsText.split(",").map((t) => t.trim()).filter(Boolean), [form.tagsText]);

  if (loading) return <div className="adm-boot adm-boot-inline"><span className="adm-spinner" /></div>;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <Link to="/admin/posts" className="adm-crumb" onClick={(e) => { if (dirty && !window.confirm("You have unsaved changes. Leave this page anyway?")) e.preventDefault(); }}><ArrowLeft size={15} /> All posts</Link>
          <h1>{isNew ? "New article" : "Edit article"} {isPublished && <span className="adm-badge is-published">published</span>}</h1>
        </div>
        <div className="adm-head-actions">
          {isPublished && <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost"><ExternalLink size={16} /> View</a>}
          <button type="button" className="adm-btn adm-btn-light" onClick={() => save("draft")} disabled={!!saving || !form.title}>
            {saving === "draft" ? <Loader2 size={16} className="adm-spin" /> : <Save size={16} />} {isPublished ? "Unpublish" : "Save draft"}
          </button>
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => save("published")} disabled={!!saving || !form.title}>
            {saving === "published" ? <Loader2 size={16} className="adm-spin" /> : <Send size={16} />} {isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="adm-editor-layout">
        <div className="adm-editor-main">
          <section className="adm-card">
            <TextField label="Title" value={form.title} onChange={set("title")} placeholder="e.g. 5 things to check before buying an open plot" max={160} />
            <AreaField label="Short summary" value={form.excerpt} onChange={set("excerpt")} rows={3} max={320} hint="Shown on blog cards and as the intro at the top of the article." />
            <Field label="Article content">
              <RichTextEditor value={form.contentHtml} onChange={set("contentHtml")} />
            </Field>
          </section>
        </div>

        <aside className="adm-editor-side">
          <section className="adm-card">
            <h2 className="adm-card-title">Cover image</h2>
            <ImageField value={form.coverImage} onChange={set("coverImage")} hint="Wide photos (16:10) look best. Large files are resized automatically." />
          </section>

          <section className="adm-card">
            <h2 className="adm-card-title">Details</h2>
            <Field label="Category">
              <input className="adm-input" list="adm-categories" value={form.category} onChange={(e) => set("category")(e.target.value)} />
              <datalist id="adm-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <TextField label="Tags" value={form.tagsText} onChange={set("tagsText")} placeholder="plots, hyderabad, investment" hint={tags.length ? `${tags.length} tag${tags.length > 1 ? "s" : ""}` : "Separate with commas"} />
            <TextField label="Author" value={form.author} onChange={set("author")} max={80} />
            <TextField label="Web address (slug)" value={form.slug} onChange={(v) => { slugTouched.current = true; set("slug")(slugify(v)); }} hint={`/blog/${form.slug || "your-article"}`} />
          </section>

          <section className="adm-card">
            <h2 className="adm-card-title">Search engines (SEO)</h2>
            <TextField label="SEO title" value={form.seoTitle} onChange={set("seoTitle")} max={70} hint="Leave empty to use the article title." />
            <AreaField label="SEO description" value={form.seoDescription} onChange={set("seoDescription")} rows={3} max={170} hint="Leave empty to use the short summary." />
          </section>
        </aside>
      </div>
    </>
  );
}
