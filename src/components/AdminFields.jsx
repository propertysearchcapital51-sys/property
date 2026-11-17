import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "./AdminToast";

export function Field({ label, hint, counter, children, className = "" }) {
  return (
    <div className={`adm-field ${className}`}>
      {label && (
        <span className="adm-label">
          {label}
          {counter}
        </span>
      )}
      {children}
      {hint && <small className="adm-hint">{hint}</small>}
    </div>
  );
}

const Counter = ({ value, max }) => (
  <em className={`adm-counter ${value.length > max ? "is-over" : ""}`}>{value.length}/{max}</em>
);

export function TextField({ label, value, onChange, hint, max, ...rest }) {
  return (
    <Field label={label} hint={hint} counter={max ? <Counter value={value || ""} max={max} /> : null}>
      <input className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} maxLength={max ? max + 40 : undefined} {...rest} />
    </Field>
  );
}

export function AreaField({ label, value, onChange, hint, max, rows = 4, ...rest }) {
  return (
    <Field label={label} hint={hint} counter={max ? <Counter value={value || ""} max={max} /> : null}>
      <textarea className="adm-input adm-area" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
    </Field>
  );
}

/* Upload helper shared by the image + file fields. */
function useUpload(onDone) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      onDone(await api.upload(file));
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return [busy, run];
}

export function ImageField({ label, value, onChange, hint }) {
  const input = useRef(null);
  const [busy, upload] = useUpload((result) => onChange(result.url));
  return (
    <Field label={label} hint={hint}>
      <div className={`adm-image ${value ? "has-image" : ""}`}>
        {value ? <img src={value} alt="" /> : <div className="adm-image-empty"><ImagePlus size={26} /><span>No image selected</span></div>}
        <div className="adm-image-actions">
          <button type="button" className="adm-btn adm-btn-light" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={15} className="adm-spin" /> : <Upload size={15} />}
            {value ? "Replace" : "Upload image"}
          </button>
          {value && <button type="button" className="adm-btn adm-btn-ghost" onClick={() => onChange("")}>Remove</button>}
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </Field>
  );
}

export function PdfField({ label, value, onChange, hint }) {
  const input = useRef(null);
  const [busy, upload] = useUpload((result) => onChange(result.url));
  return (
    <Field label={label} hint={hint}>
      <div className="adm-file">
        <FileText size={20} />
        <a href={value || "#"} target="_blank" rel="noreferrer" className="adm-file-name">{value || "No file"}</a>
        <button type="button" className="adm-btn adm-btn-light" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 size={15} className="adm-spin" /> : <Upload size={15} />} Upload PDF
        </button>
        <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </Field>
  );
}

/* Add / remove / reorder rows of anything. */
export function RepeatField({ label, hint, items, onChange, newItem, max = 30, addLabel = "Add item", render, itemLabel = "Item" }) {
  const update = (i, next) => onChange(items.map((it, idx) => (idx === i ? next : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <Field label={label} hint={hint}>
      <div className="adm-repeat">
        {items.map((item, i) => (
          <div className="adm-repeat-row" key={i}>
            <div className="adm-repeat-head">
              <strong>{itemLabel} {i + 1}</strong>
              <div>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => remove(i)} aria-label="Remove" className="is-danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="adm-repeat-body">{render(item, (next) => update(i, next), i)}</div>
          </div>
        ))}
        {items.length < max && (
          <button type="button" className="adm-btn adm-btn-light adm-add" onClick={() => onChange([...items, typeof newItem === "function" ? newItem() : newItem])}>
            <Plus size={15} /> {addLabel}
          </button>
        )}
      </div>
    </Field>
  );
}

/* A simple list of single-line strings (amenities, highlights, locations ...). */
export function StringList({ label, hint, items, onChange, max = 30, addLabel = "Add", placeholder }) {
  return (
    <Field label={label} hint={hint}>
      <div className="adm-strings">
        {items.map((value, i) => (
          <div className="adm-string-row" key={i}>
            <input className="adm-input" value={value} placeholder={placeholder} onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))} />
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => { const c = [...items]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; onChange(c); }}><ArrowUp size={15} /></button>
            <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => { const c = [...items]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; onChange(c); }}><ArrowDown size={15} /></button>
            <button type="button" aria-label="Remove" className="is-danger" onClick={() => onChange(items.filter((_, idx) => idx !== i))}><Trash2 size={15} /></button>
          </div>
        ))}
        {items.length < max && (
          <button type="button" className="adm-btn adm-btn-light adm-add" onClick={() => onChange([...items, ""])}><Plus size={15} /> {addLabel}</button>
        )}
      </div>
    </Field>
  );
}
