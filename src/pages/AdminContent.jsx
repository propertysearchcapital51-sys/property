import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { AreaField, PdfField, RepeatField, StringList, TextField } from "../components/AdminFields";
import { useToast } from "../components/AdminToast";
import { DEFAULTS, useContent } from "../context/ContentContext";
import { api } from "../services/api";

/* One editable section: loads its current value, tracks edits, saves / resets via the API. */
function Section({ id, title, description, onDirty, children }) {
  const content = useContent();
  const toast = useToast();
  const [value, setValue] = useState(() => structuredClone(content[id]));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const custom = id in content.overrides;

  useEffect(() => onDirty?.(dirty), [dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (next) => { setValue(next); setDirty(true); };

  const save = async () => {
    setBusy("save");
    try {
      await api.put(`/admin/content/${id}`, { value });
      await content.refresh();
      setDirty(false);
      toast(`${title} saved. Changes are live on your website.`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    if (!window.confirm(`Restore "${title}" to the original text that shipped with the website? Your edits to this section will be lost.`)) return;
    setBusy("reset");
    try {
      await api.del(`/admin/content/${id}`);
      await content.refresh();
      setValue(structuredClone(DEFAULTS[id]));
      setDirty(false);
      toast("Restored to original content");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="adm-card">
      <div className="adm-card-head">
        <div><h2>{title}</h2><p className="adm-sub">{description}</p></div>
        {custom && <span className="adm-badge is-custom">customised</span>}
      </div>
      <div className="adm-form">{children(value, update)}</div>
      <div className="adm-save-bar">
        <button type="button" className="adm-btn adm-btn-ghost" onClick={reset} disabled={!!busy || (!custom && !dirty)}><RotateCcw size={15} /> Restore original</button>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={!!busy || !dirty}>
          {busy === "save" ? <Loader2 size={16} className="adm-spin" /> : <Save size={16} />} Save changes
        </button>
      </div>
    </section>
  );
}

const TABS = [
  {
    id: "company", label: "Company & contact",
    render: (onDirty) => (
      <Section id="company" title="Company & contact details" description="Used in the footer, contact page, enquiry forms and WhatsApp buttons." onDirty={onDirty}>
        {(v, set) => (
          <>
            <div className="adm-cols">
              <TextField label="Company name" value={v.name} onChange={(x) => set({ ...v, name: x })} />
              <TextField label="Office phone" value={v.phone} onChange={(x) => set({ ...v, phone: x })} placeholder="+91 99480 02024" />
              <TextField label="WhatsApp number" value={v.whatsapp} onChange={(x) => set({ ...v, whatsapp: x.replace(/\D/g, "") })} hint="Digits only, with country code. Example: 919948002024" />
              <TextField label="Email" value={v.email} onChange={(x) => set({ ...v, email: x })} type="email" />
            </div>
            <AreaField label="Full address" rows={2} value={v.address} onChange={(x) => set({ ...v, address: x })} />
            <TextField label="Short address" value={v.shortAddress} onChange={(x) => set({ ...v, shortAddress: x })} />
            <TextField label="Google Maps embed link" value={v.mapUrl} onChange={(x) => set({ ...v, mapUrl: x })} hint="The embed address shown in the map on the Contact page." />
            <PdfField label="Brochure (PDF)" value={v.brochure} onChange={(x) => set({ ...v, brochure: x })} hint="The file visitors get when they click “Download Brochure”." />
            <div className="adm-divider"><span>Social media links</span></div>
            <div className="adm-cols">
              {[["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["threads", "Threads"]].map(([key, label]) => (
                <TextField key={key} label={label} value={v.socials[key]} onChange={(x) => set({ ...v, socials: { ...v.socials, [key]: x } })} placeholder="https://" hint={key === "threads" ? "Leave empty to hide this icon." : undefined} />
              ))}
            </div>
          </>
        )}
      </Section>
    ),
  },
  {
    id: "hero", label: "Home hero",
    render: (onDirty) => (
      <Section id="hero" title="Home page hero" description="The large headline at the top of the home page. Applies to the English site; Telugu keeps its own translation." onDirty={onDirty}>
        {(v, set) => (
          <>
            <TextField label="Small heading above the title" value={v.eyebrow} onChange={(x) => set({ ...v, eyebrow: x })} max={80} />
            <TextField label="Main title" value={v.title} onChange={(x) => set({ ...v, title: x })} max={120} hint="The gold line “Secure plots. Stronger futures.” is part of the design." />
            <AreaField label="Supporting text" rows={3} value={v.text} onChange={(x) => set({ ...v, text: x })} max={300} />
          </>
        )}
      </Section>
    ),
  },
  {
    id: "faqs", label: "FAQs",
    render: (onDirty) => (
      <Section id="faqs" title="Frequently asked questions" description="Shown on the home page. Drag order with the arrows." onDirty={onDirty}>
        {(v, set) => (
          <RepeatField items={v} onChange={set} itemLabel="Question" addLabel="Add question" max={30} newItem={{ q: "", a: "" }}
            render={(item, up) => (
              <>
                <TextField label="Question" value={item.q} onChange={(x) => up({ ...item, q: x })} />
                <AreaField label="Answer" rows={3} value={item.a} onChange={(x) => up({ ...item, a: x })} />
              </>
            )} />
        )}
      </Section>
    ),
  },
  {
    id: "testimonials", label: "Testimonials",
    render: (onDirty) => (
      <Section id="testimonials" title="Customer testimonials" description="Shown on the home and About pages." onDirty={onDirty}>
        {(v, set) => (
          <RepeatField items={v} onChange={set} itemLabel="Testimonial" addLabel="Add testimonial" max={12} newItem={{ quote: "", name: "", role: "" }}
            render={(item, up) => (
              <>
                <AreaField label="What they said" rows={3} value={item.quote} onChange={(x) => up({ ...item, quote: x })} />
                <div className="adm-cols">
                  <TextField label="Name" value={item.name} onChange={(x) => up({ ...item, name: x })} />
                  <TextField label="Role" value={item.role} onChange={(x) => up({ ...item, role: x })} placeholder="e.g. Plot Buyer" />
                </div>
              </>
            )} />
        )}
      </Section>
    ),
  },
  {
    id: "amenities", label: "Amenities",
    render: (onDirty) => (
      <Section id="amenities" title="Project amenities" description="The “Thoughtfully planned” list on the home page and every project page." onDirty={onDirty}>
        {(v, set) => <StringList items={v} onChange={set} max={40} addLabel="Add amenity" />}
      </Section>
    ),
  },
  {
    id: "values", label: "Company values",
    render: (onDirty) => (
      <Section id="values" title="Company values" description="The numbered values on the About page." onDirty={onDirty}>
        {(v, set) => (
          <RepeatField items={v} onChange={set} itemLabel="Value" addLabel="Add value" max={8} newItem={() => ({ number: "", title: "", text: "" })}
            render={(item, up, i) => (
              <>
                <div className="adm-cols">
                  <TextField label="Number" value={item.number} onChange={(x) => up({ ...item, number: x })} placeholder={String(i + 1).padStart(2, "0")} />
                  <TextField label="Title" value={item.title} onChange={(x) => up({ ...item, title: x })} />
                </div>
                <AreaField label="Description" rows={2} value={item.text} onChange={(x) => up({ ...item, text: x })} />
              </>
            )} />
        )}
      </Section>
    ),
  },
  {
    id: "openLocations", label: "Location ticker",
    render: (onDirty) => (
      <Section id="openLocations" title="Scrolling location bar" description="The “Featured locations” ticker at the very top of every page." onDirty={onDirty}>
        {(v, set) => <StringList items={v} onChange={set} max={20} addLabel="Add location" />}
      </Section>
    ),
  },
];

export default function AdminContent() {
  const [tab, setTab] = useState(TABS[0].id);
  const [dirty, setDirty] = useState(false);
  const current = TABS.find((t) => t.id === tab);

  const switchTab = (id) => {
    if (id === tab) return;
    if (dirty && !window.confirm("You have unsaved changes in this section. Switch anyway?")) return;
    setDirty(false);
    setTab(id);
  };

  return (
    <>
      <div className="adm-page-head"><div><h1>Site content</h1><p>Edit the text and details shown across your website. Changes go live as soon as you save.</p></div></div>
      <div className="adm-tabs adm-tabs-scroll">
        {TABS.map((t) => <button type="button" key={t.id} className={tab === t.id ? "is-active" : ""} onClick={() => switchTab(t.id)}>{t.label}</button>)}
      </div>
      <div key={tab}>{current.render(setDirty)}</div>
    </>
  );
}
