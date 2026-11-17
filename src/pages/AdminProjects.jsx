import { useState } from "react";
import { ChevronDown, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { AreaField, ImageField, StringList, TextField } from "../components/AdminFields";
import { useToast } from "../components/AdminToast";
import { DEFAULTS, toStoredImage, useContent } from "../context/ContentContext";
import { api } from "../services/api";

const blank = () => ({
  id: "", slug: "", name: "", image: "", tagline: "", location: "", description: "", longDescription: "",
  highlights: [""],
});

export default function AdminProjects() {
  const content = useContent();
  const toast = useToast();
  const [projects, setProjects] = useState(() => structuredClone(content.projects));
  const [openIndex, setOpenIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const custom = "projects" in content.overrides;

  const change = (next) => { setProjects(next); setDirty(true); };
  const edit = (i, patch) => change(projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const copy = [...projects];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    change(copy);
    setOpenIndex(j);
  };

  const save = async () => {
    setBusy("save");
    try {
      const value = projects.map((p) => ({
        ...p, image: toStoredImage(p.image),
        highlights: p.highlights.map((h) => h.trim()).filter(Boolean),
      }));
      await api.put("/admin/content/projects", { value });
      await content.refresh();
      setDirty(false);
      toast("Projects saved. Changes are live on your website.");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    if (!window.confirm("Restore all projects to the original list that shipped with the website? Your edits will be lost.")) return;
    setBusy("reset");
    try {
      await api.del("/admin/content/projects");
      await content.refresh();
      setProjects(structuredClone(DEFAULTS.projects));
      setDirty(false);
      toast("Projects restored to original");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Projects</h1><p>Manage the plots and layouts shown on the Properties page and the home page.</p></div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => { change([...projects, blank()]); setOpenIndex(projects.length); }} disabled={projects.length >= 30}>
          <Plus size={16} /> Add project
        </button>
      </div>

      <div className="adm-accordion">
        {projects.map((p, i) => {
          const open = openIndex === i;
          return (
            <section className={`adm-card adm-acc ${open ? "is-open" : ""}`} key={i}>
              <button type="button" className="adm-acc-head" onClick={() => setOpenIndex(open ? -1 : i)} aria-expanded={open}>
                <span className="adm-acc-thumb">{p.image ? <img src={p.image} alt="" /> : null}</span>
                <span className="adm-acc-title"><strong>{p.name || "Untitled project"}</strong><small>{p.location || "No location yet"}</small></span>
                <ChevronDown size={20} className="adm-acc-chev" />
              </button>
              {open && (
                <div className="adm-acc-body adm-form">
                  <div className="adm-cols">
                    <TextField label="Project name" value={p.name} onChange={(x) => edit(i, { name: x })} />
                    <TextField label="Location" value={p.location} onChange={(x) => edit(i, { location: x })} placeholder="e.g. Near ORR, Uppal" />
                  </div>
                  <TextField label="Tagline" value={p.tagline} onChange={(x) => edit(i, { tagline: x })} />
                  <ImageField label="Project photo" value={p.image} onChange={(x) => edit(i, { image: x })} />
                  <AreaField label="Short description" rows={3} max={400} value={p.description} onChange={(x) => edit(i, { description: x })} hint="Shown on project cards." />
                  <AreaField label="Full description" rows={5} max={1500} value={p.longDescription} onChange={(x) => edit(i, { longDescription: x })} hint="Shown on the project's own page." />
                  <StringList label="Highlights" items={p.highlights} onChange={(x) => edit(i, { highlights: x })} max={12} addLabel="Add highlight" />
                  <div className="adm-acc-foot">
                    <div>
                      <button type="button" className="adm-btn adm-btn-ghost" onClick={() => move(i, -1)} disabled={i === 0}>Move up</button>
                      <button type="button" className="adm-btn adm-btn-ghost" onClick={() => move(i, 1)} disabled={i === projects.length - 1}>Move down</button>
                    </div>
                    <button type="button" className="adm-btn adm-btn-danger" onClick={() => { if (window.confirm(`Remove "${p.name || "this project"}" from the website?`)) { change(projects.filter((_, idx) => idx !== i)); setOpenIndex(-1); } }}>
                      <Trash2 size={15} /> Remove project
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
        {projects.length === 0 && <p className="adm-empty adm-card">No projects. Click “Add project” to create one.</p>}
      </div>

      <div className="adm-save-bar adm-save-sticky">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={reset} disabled={!!busy || (!custom && !dirty)}><RotateCcw size={15} /> Restore original</button>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={!!busy || !dirty}>
          {busy === "save" ? <Loader2 size={16} className="adm-spin" /> : <Save size={16} />} Save projects
        </button>
      </div>
    </>
  );
}
