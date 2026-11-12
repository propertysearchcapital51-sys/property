import { useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { company } from "../data/company";
import { projects } from "../data/projects";
import { useLanguage } from "../context/LanguageContext";

export default function EnquiryForm({ compact = false, defaultProperty = "" }) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", property: defaultProperty, message: "" });
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    const message = `Hello Property Search Capital,%0AName: ${encodeURIComponent(form.name)}%0AWhatsApp: ${encodeURIComponent(form.phone)}%0AProperty: ${encodeURIComponent(form.property || "Not selected")}%0AMessage: ${encodeURIComponent(form.message || "Please share more details.")}`;
    window.open(`https://wa.me/${company.whatsapp}?text=${message}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };
  return (
    <form className={`enquiry-form ${compact ? "form-compact" : ""}`} onSubmit={submit}>
      {submitted && <div className="form-success"><CheckCircle2 size={17}/> WhatsApp enquiry prepared. Please send the message in WhatsApp.</div>}
      <label>{t("name")} <span>*</span><input name="name" value={form.name} onChange={update} placeholder="Enter your full name" required minLength={2}/></label>
      <label>{t("phone")} <span>*</span><input name="phone" value={form.phone} onChange={update} placeholder="Enter 10-digit WhatsApp number" required inputMode="numeric" pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number"/></label>
      <label>{t("property")}<select name="property" value={form.property} onChange={update}><option value="">Select a project</option>{projects.map((project) => <option key={project.id} value={project.name}>{project.name}</option>)}</select></label>
      {!compact && <label>{t("message")}<textarea name="message" value={form.message} onChange={update} placeholder="Tell us what you're looking for..." rows="3"/></label>}
      <button className="button button-full" type="submit">{t("send")} <ArrowUpRight size={17}/></button>
      <small className="form-note">By submitting, you agree to be contacted about your enquiry.</small>
    </form>
  );
}
